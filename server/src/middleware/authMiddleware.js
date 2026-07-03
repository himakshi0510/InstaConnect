const jwt = require('jsonwebtoken');
const { errorResponse } = require('../utils/apiResponse');
require('dotenv').config();

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return errorResponse(res, 'Authorization token is missing or invalid', 401);
  }

  const token = authHeader.split(' ')[1];
  const secret = process.env.JWT_SECRET || 'instaconnect_super_secret_jwt_key_at_least_32_characters_long_12345';

  try {
    const decoded = jwt.verify(token, secret);
    req.user = decoded; // Attach { userId, username, email }
    next();
  } catch (error) {
    console.error('JWT Verification Error:', error.message);
    return errorResponse(res, 'Invalid or expired token', 401);
  }
};

module.exports = authMiddleware;
