const authenticateToken = (req, res, next) => {
  if (!req.auth || !req.auth.userId) {
    return res.status(401).json({ error: 'Unauthenticated' });
  }
  req.user = { id: req.auth.userId };
  next();
};

const requirePermission = (permission) => {
  return async (req, res, next) => {
    // Ensure the user is authenticated first
    if (!req.auth || !req.auth.userId) {
      return res.status(401).json({ error: 'Unauthenticated' });
    }
    
    req.user = { id: req.auth.userId };

    const hasPermission = req.auth.has({ permission });

    if (!hasPermission) {
      return res.status(403).json({
        error: "Forbidden"
      });
    }

    next();
  };
};

module.exports = {
  authenticateToken,
  requirePermission
};
