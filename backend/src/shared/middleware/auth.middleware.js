const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../utils/jwt.util');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Unauthenticated: No token provided' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Forbidden: Invalid token' });
    }
    
    // Attach decoded user info to request (e.g. { id, role, email, phone })
    req.user = user;
    next();
  });
};

const requirePermission = (permission) => {
  // Since we replaced Clerk RBAC with custom roles (ADMIN, CFO, etc)
  // We can just check the role attached to the JWT payload
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthenticated' });
    }

    // Example mapping for backwards compatibility if needed, 
    // or just require ADMIN if permission is provided.
    // In our new flow, we use requireAdmin on frontend, but some backend routes
    // might still use requirePermission('org:system:manage'). We will treat
    // any permission requirement as requiring ADMIN role for now.
    
    if (req.user.role !== 'ADMIN' && req.user.role !== 'CFO') {
      return res.status(403).json({ error: 'Forbidden: Insufficient role' });
    }

    next();
  };
};

module.exports = {
  authenticateToken,
  requirePermission
};
