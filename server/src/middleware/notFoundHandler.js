const { errorResponse } = require('../utils/apiResponse');

const notFoundHandler = (req, res, next) => {
  return errorResponse(res, `Route not found: ${req.originalUrl}`, 404);
};

module.exports = notFoundHandler;
