/**
 * OAuth Controller - HTTP layer, chỉ nhận req/res và gọi service
 */
import {
  generateGoogleAuthUrl,
  loginWithCredential,
  handleCallback,
  getOAuthResultByState,
} from "../../services/auth/index.js";

export const googleLogin = (req, res) => {
  try {
    const authUrl = generateGoogleAuthUrl();
    return res.redirect(authUrl);
  } catch (err) {
    return res.status(err.status || 500).json({
      message: "Failed to start Google login",
      error: err.message,
    });
  }
};

export const googleLoginCredential = async (req, res) => {
  try {
    const { credential } = req.body;
    const authResponse = await loginWithCredential(req, credential);

    return res.json({
      message: "Google login successful",
      ...authResponse,
    });
  } catch (err) {
    return res.status(err.status || 500).json({
      message: "Google login failed",
      error: err.message,
    });
  }
};

export const googleCallback = async (req, res) => {
  try {
    const { code } = req.query;
    const googleError = typeof req.query.error === "string" ? req.query.error : null;
    const googleErrorDescription =
      typeof req.query.error_description === "string"
        ? req.query.error_description
        : null;

    const result = await handleCallback(req, code, googleError, googleErrorDescription);
    return res.redirect(result.redirect);
  } catch (err) {
    if (err.redirect) {
      return res.redirect(err.redirect);
    }
    return res.redirect(
      `${err.redirect || ''}/oauth/google/callback?error=callback_error&message=${encodeURIComponent(err.message)}`
    );
  }
};

export const googleResult = async (req, res) => {
  try {
    const { state } = req.query;
    const result = await getOAuthResultByState(state);

    return res.json(result);
  } catch (err) {
    return res.status(err.status || 500).json({
      success: false,
      message: "Failed to get Google OAuth result",
      error: err.message,
    });
  }
};
