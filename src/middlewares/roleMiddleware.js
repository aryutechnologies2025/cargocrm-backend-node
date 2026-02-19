 const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.json({
        message: "Access denied: insufficient permissions"
      });
    }
    next();
  };
};
export default authorizeRoles;