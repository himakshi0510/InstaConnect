const { errorResponse } = require('../utils/apiResponse');

const errorHandler = (err, req, res, next) => {
  console.error('Error details:', err);

  // Default error properties
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errors = null;

  // Handle express-validator errors attached to the request/error object
  if (err.errors && Array.isArray(err.errors)) {
    statusCode = 400;
    message = 'Validation Error';
    errors = err.errors;
  }

  // Handle MySQL Errors
  if (err.code) {
    if (err.code === 'ER_DUP_ENTRY' || err.errno === 1062) {
      statusCode = 409;
      // Extract field info if possible
      const match = err.sqlMessage ? err.sqlMessage.match(/key '(.+?)'/) : null;
      const field = match ? match[1] : 'field';
      message = `Conflict: A record with this ${field.includes('email') ? 'email' : field.includes('username') ? 'username' : 'value'} already exists.`;
    } else if (err.code === 'ECONNREFUSED' || err.code === 'PROTOCOL_CONNECTION_LOST') {
      statusCode = 503;
      message = 'Database Service Unavailable';
    }
  }

  // Handle Multer upload errors
  if (err.name === 'MulterError') {
    statusCode = 400;
    if (err.code === 'LIMIT_FILE_SIZE') {
      message = 'File size limit exceeded. Max limit is 10MB for posts and 5MB for avatars.';
    } else {
      message = `Upload Error: ${err.message}`;
    }
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token. Please log in again.';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Your session has expired. Please log in again.';
  }

  return errorResponse(res, message, statusCode, errors);
};

module.exports = errorHandler;
