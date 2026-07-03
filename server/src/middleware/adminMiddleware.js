const pool = require('../config/database');
const { errorResponse } = require('../utils/apiResponse');

const adminMiddleware = async (req, res, next) => {
  if (!req.user || !req.user.userId) {
    return errorResponse(res, 'Unauthorized access', 401);
  }

  try {
    const [rows] = await pool.query('SELECT role FROM users WHERE id = ?', [req.user.userId]);
    if (rows.length === 0 || rows[0].role !== 'ADMIN') {
      return errorResponse(res, 'Forbidden: Administrator privileges required', 403);
    }
    next();
  } catch (error) {
    console.error('Admin verification error:', error);
    return errorResponse(res, 'Internal Server Error during authorization verification', 500);
  }
};

module.exports = adminMiddleware;
