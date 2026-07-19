/**
 * Auth Controller - HTTP layer, chỉ nhận req/res và gọi service
 */
import {
  register as registerUser,
  login as loginUser,
  refreshTokens,
  logout as logoutUser,
  getMe,
  issueAuthResponse,
  getApprovalStatusForRole,
  toPublicUser,
  requestPasswordReset,
  verifyResetToken,
  resetPassword,
} from "../../services/auth/index.js";

export const register = async (req, res) => {
  try {
    const result = await registerUser(req.body);

    if (result.approvalStatus !== "approved") {
      return res.status(201).json({
        message: "Account registered and pending admin approval",
        user: toPublicUser(result.user, result.userRole),
      });
    }

    const authResponse = await issueAuthResponse(req, result.user);

    return res.status(201).json({
      message: "User registered successfully",
      ...authResponse,
    });
  } catch (err) {
    return res.status(err.status || 500).json({
      message: "Registration failed",
      error: err.message,
      code: err.code,
    });
  }
};

export const login = async (req, res) => {
  try {
    const { user } = await loginUser(req.body);
    const authResponse = await issueAuthResponse(req, user);

    return res.json({
      message: "Login successful",
      ...authResponse,
    });
  } catch (err) {
    return res.status(err.status || 500).json({
      message: "Login failed",
      error: err.message,
      code: err.code,
      stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });
  }
};

export const refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    const result = await refreshTokens(refreshToken);

    return res.json({
      message: "Token refreshed",
      ...result.tokens,
      token: result.tokens.accessToken,
      user: toPublicUser(result.user, result.role),
    });
  } catch (err) {
    return res.status(err.status || 401).json({
      message: "Refresh token failed",
      error: err.message,
      code: err.code,
    });
  }
};

export const logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    await logoutUser(refreshToken);

    return res.json({ message: "Logged out" });
  } catch (err) {
    return res.status(500).json({
      message: "Logout failed",
      error: err.message,
    });
  }
};

export const me = async (req, res) => {
  try {
    const result = await getMe(req);

    return res.json({
      user: result.user,
    });
  } catch (err) {
    return res.status(err.status || 401).json({
      message: "Authentication failed",
      error: err.message,
      code: err.code,
    });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const result = await requestPasswordReset(req.body);

    return res.json({
      message: "If an account exists, a password reset link has been sent to your email.",
      success: true,
    });
  } catch (err) {
    if (err.code === "oauth_only_reset") {
      return res.status(400).json({
        message: "oauth_only_reset",
        code: "OAUTH_ONLY_RESET",
        userId: err.userId,
        email: err.email,
      });
    }

    return res.status(err.status || 500).json({
      message: "Failed to request password reset",
      error: err.message,
      code: err.code,
    });
  }
};

export const verifyToken = async (req, res) => {
  try {
    const result = await verifyResetToken(req.body);

    return res.json({
      valid: result.valid,
      user: result.user,
      expiresAt: result.expiresAt,
    });
  } catch (err) {
    return res.status(err.status || 400).json({
      valid: false,
      message: err.message || "Invalid or expired reset token",
      code: err.code,
    });
  }
};

export const doResetPassword = async (req, res) => {
  try {
    const result = await resetPassword(req.body);

    return res.json({
      message: "Password has been reset successfully",
      success: result.success,
    });
  } catch (err) {
    return res.status(err.status || 400).json({
      message: err.message || "Failed to reset password",
      code: err.code,
    });
  }
};
