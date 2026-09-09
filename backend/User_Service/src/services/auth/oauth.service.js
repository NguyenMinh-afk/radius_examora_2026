import { randomUUID } from 'crypto';
import bcrypt from 'bcrypt';
import { OAuth2Client } from 'google-auth-library';

import {
  setOAuthResult,
  getOAuthResult,
  deleteOAuthResult,
} from '../../services/oauthTempStore.js';
import {
  getRoleByName,
  toPublicUser,
  assertUserCanLogin,
  issueAuthResponse,
} from './shared.service.js';
import sequelize from '../../config/sequelize.js';
import { enqueueUserCreated } from '../../config/outbox.js';

const GOOGLE_PROVIDER = 'google';
const DEFAULT_FRONTEND_URL = 'http://localhost:5173';

export const getFrontendUrl = () => process.env.FRONTEND_URL || DEFAULT_FRONTEND_URL;

export const validateGoogleConfig = () => {
  const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } = process.env;
  return Boolean(GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET);
};

export const getGoogleClient = () =>
  new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_CALLBACK_URL
  );

export const getGoogleUserFromCode = async (code, redirectUri) => {
  const client = getGoogleClient();
  const { tokens } = await client.getToken(
    redirectUri ? { code, redirect_uri: redirectUri } : code
  );

  if (!tokens.id_token) {
    const error = new Error('Google did not return an id_token');
    error.status = 401;
    throw error;
  }

  const ticket = await client.verifyIdToken({
    idToken: tokens.id_token,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();
  if (!payload?.email || !payload?.sub) {
    const error = new Error('Google account payload is missing email or subject');
    error.status = 401;
    throw error;
  }

  if (payload.email_verified === false) {
    const error = new Error('Google email is not verified');
    error.status = 403;
    throw error;
  }

  return {
    providerUserId: payload.sub,
    email: payload.email,
    fullName: payload.name || payload.email,
    avatarUrl: payload.picture || null,
    accessToken: tokens.access_token || null,
    refreshToken: tokens.refresh_token || null,
    tokenExpiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
  };
};

export const getGoogleUserFromCredential = async (credential) => {
  const client = getGoogleClient();
  const ticket = await client.verifyIdToken({
    idToken: credential,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();
  if (!payload?.email || !payload?.sub) {
    const error = new Error('Google account payload is missing email or subject');
    error.status = 401;
    throw error;
  }

  if (payload.email_verified === false) {
    const error = new Error('Google email is not verified');
    error.status = 403;
    throw error;
  }

  return {
    providerUserId: payload.sub,
    email: payload.email,
    fullName: payload.name || payload.email,
    avatarUrl: payload.picture || null,
    accessToken: null,
    refreshToken: null,
    tokenExpiresAt: null,
  };
};

export const findOrCreateGoogleUser = async (googleUser, eventContext = {}) => {
  const OAuthProvider = (await import('../../models/user/OAuthProvider.js')).default;
  const User = (await import('../../models/User.js')).default;

  return sequelize.transaction(async (transaction) => {
    const provider = await OAuthProvider.findOne({
      where: {
        provider: GOOGLE_PROVIDER,
        provider_user_id: googleUser.providerUserId,
      },
      transaction,
    });

    if (provider) {
      const existingUser = await User.findByPk(provider.user_id, { transaction });
      if (!existingUser) {
        const error = new Error('Linked Google account has no user');
        error.status = 500;
        throw error;
      }

      await provider.update(
        {
          access_token: googleUser.accessToken,
          refresh_token: googleUser.refreshToken || provider.refresh_token,
          token_expires_at: googleUser.tokenExpiresAt,
        },
        { transaction }
      );

      return existingUser;
    }

    let user = await User.findOne({
      where: { email: googleUser.email },
      transaction,
    });
    let userCreated = false;

    if (!user) {
      const studentRole = await getRoleByName('student', { transaction });

      user = await User.create(
        {
          email: googleUser.email,
          password_hash: await bcrypt.hash(randomUUID(), 10),
          full_name: googleUser.fullName,
          avatar_url: googleUser.avatarUrl,
          role_id: studentRole.id,
          is_active: true,
          email_verified: true,
          approval_status: 'approved',
          approved_at: new Date(),
        },
        { transaction }
      );
      userCreated = true;
    }

    await OAuthProvider.create(
      {
        user_id: user.id,
        provider: GOOGLE_PROVIDER,
        provider_user_id: googleUser.providerUserId,
        access_token: googleUser.accessToken,
        refresh_token: googleUser.refreshToken,
        token_expires_at: googleUser.tokenExpiresAt,
      },
      { transaction }
    );

    if (userCreated) {
      await enqueueUserCreated(
        {
          id: user.id,
          role: 'student',
          approvalStatus: user.approval_status,
          emailVerified: user.email_verified,
          registrationMethod: GOOGLE_PROVIDER,
        },
        eventContext,
        transaction
      );
    }

    return user;
  });
};

export const generateGoogleAuthUrl = () => {
  if (!validateGoogleConfig() || !process.env.GOOGLE_CALLBACK_URL) {
    const error = new Error('Missing Google OAuth configuration');
    error.status = 500;
    throw error;
  }

  const client = getGoogleClient();
  return client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'select_account',
    scope: ['openid', 'email', 'profile'],
  });
};

export const loginWithCredential = async (req, credential) => {
  if (!credential) {
    const error = new Error('Google credential is required');
    error.status = 400;
    throw error;
  }

  if (!validateGoogleConfig()) {
    const error = new Error('Missing Google OAuth configuration');
    error.status = 500;
    throw error;
  }

  const googleUser = await getGoogleUserFromCredential(credential);
  const user = await findOrCreateGoogleUser(googleUser, {
    traceId: req.correlationId,
    requestId: req.requestId,
  });
  assertUserCanLogin(user);

  return issueAuthResponse(req, user);
};

export const handleCallback = async (req, code, queryError, queryErrorDescription) => {
  if (queryError) {
    const error = new Error(queryErrorDescription || queryError);
    error.status = 400;
    error.redirect = `${getFrontendUrl()}/oauth/google/callback?error=${encodeURIComponent(queryError)}&message=${encodeURIComponent(queryErrorDescription || queryError)}`;
    throw error;
  }

  if (!code) {
    const error = new Error('Google did not return an authorization code');
    error.status = 400;
    error.redirect = `${getFrontendUrl()}/oauth/google/callback?error=missing_code&message=Google+did+not+return+an+authorization+code`;
    throw error;
  }

  if (!validateGoogleConfig()) {
    const error = new Error('Missing Google OAuth configuration');
    error.status = 500;
    error.redirect = `${getFrontendUrl()}/oauth/google/callback?error=missing_google_config&message=Missing+Google+OAuth+configuration`;
    throw error;
  }

  const redirectUri =
    typeof req.query.redirectUri === 'string'
      ? req.query.redirectUri
      : process.env.GOOGLE_CALLBACK_URL;

  if (!redirectUri) {
    const error = new Error('Missing Google OAuth redirect URI');
    error.status = 500;
    error.redirect = `${getFrontendUrl()}/oauth/google/callback?error=missing_redirect_uri&message=Missing+Google+OAuth+redirect+URI`;
    throw error;
  }

  const googleUser = await getGoogleUserFromCode(code, redirectUri);
  const user = await findOrCreateGoogleUser(googleUser, {
    traceId: req.correlationId,
    requestId: req.requestId,
  });

  try {
    assertUserCanLogin(user);
  } catch (err) {
    if (err.code === 'ACCOUNT_PENDING_APPROVAL') {
      err.redirect = `${getFrontendUrl()}/oauth/google/callback?error=pending_approval&message=Account+is+pending+admin+approval`;
    }
    throw err;
  }

  const authResponse = await issueAuthResponse(req, user);

  const oauthStateId = randomUUID();
  setOAuthResult(oauthStateId, {
    accessToken: authResponse.accessToken,
    refreshToken: authResponse.refreshToken,
    user: authResponse.user,
  });

  return {
    redirect: `${getFrontendUrl()}/oauth/google/callback?state=${encodeURIComponent(oauthStateId)}`,
  };
};

export const getOAuthResultByState = (state) => {
  if (!state || typeof state !== 'string') {
    const error = new Error('Missing OAuth state');
    error.status = 400;
    throw error;
  }

  const authResult = getOAuthResult(state);

  if (!authResult) {
    const error = new Error('OAuth result expired or not found. Please try logging in again.');
    error.status = 404;
    throw error;
  }

  deleteOAuthResult(state);

  return {
    success: true,
    accessToken: authResult.accessToken,
    refreshToken: authResult.refreshToken,
    user: authResult.user,
  };
};
