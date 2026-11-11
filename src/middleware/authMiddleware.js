export function requireAuth(req, res, next) {
  if (!req.session?.user) {
    return res
      .status(401)
      .json({ success: false, message: "Please log in to continue" });
  }
  next();
}

export function requireRole(role) {
  return (req, res, next) => {
    if (!req.session?.user) {
      return res
        .status(401)
        .json({ success: false, message: "Please log in to continue" });
    }

    if (req.session.user.role !== role) {
      return res
        .status(403)
        .json({
          success: false,
          message: "You do not have permission to access this resource",
        });
    }
    next();
  };
}
