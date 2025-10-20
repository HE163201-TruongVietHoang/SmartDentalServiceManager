function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.roleName)) {
      return res.status(403).json({ error: "Bạn không có quyền truy cập" });
    }
    next();
  };
}

module.exports = authorizeRoles;
