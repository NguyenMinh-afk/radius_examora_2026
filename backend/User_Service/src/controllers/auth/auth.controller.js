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
