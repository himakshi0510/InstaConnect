const jwt = require('jsonwebtoken');
require('dotenv').config();

const generateToken = (user) => {
  const payload = {
    userId: user.id,
    username: user.username,
    email: user.email
  };

  const secret = process.env.JWT_SECRET || 'instaconnect_super_secret_jwt_key_at_least_32_characters_long_12345';
  const expiry = process.env.JWT_EXPIRES_IN || '7d';

  return jwt.sign(payload, secret, { expiresIn: expiry });
};

module.exports = generateToken;
