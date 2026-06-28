const getRoleName = (user) => {
  if (!user?.role) return null;
  if (typeof user.role === "string") return user.role;
  return user.role.name || null;
};

export const requireAdmin = (req, res, next) => {
  const roleName = getRoleName(req.user);

  if (roleName !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }

  return next();
};
