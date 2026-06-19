import { verifyAccessToken } from "../config/jwt.js";

const getBearerToken = (req) => {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");

  if (scheme?.toLowerCase() !== "bearer" || !token) {
    return null;
  }

  return token;
};

export const requireAuth = (req, res, next) => {
  try {
    const token = getBearerToken(req);

    if (!token) {
      return res.status(401).json({ message: "Missing bearer token" });
    }

    req.user = verifyAccessToken(token);
    return next();
  } catch (error) {
    return res.status(401).json({
      message: "Authentication failed",
      error: error.message,
    });
  }
};
