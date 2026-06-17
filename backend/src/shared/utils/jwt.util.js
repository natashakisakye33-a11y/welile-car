const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_for_development_only';

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, phone: user.phone, role: user.role }, 
    JWT_SECRET, 
    { expiresIn: '24h' }
  );
};

module.exports = {
  generateToken,
  JWT_SECRET
};
