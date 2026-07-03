const rateLimit = require('express-rate-limit');
const { errorResponse } = require('../utils/apiResponse');

const messageCreator = (message) => (req, res) => {
  return errorResponse(res, message, 429);
};

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: 'Too many login attempts. Please try again after 15 minutes.',
  handler: (req, res, next, options) => {
    return errorResponse(res, options.message, 429);
  },
  standardHeaders: true,
  legacyHeaders: false
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  message: 'Too many registration requests from this IP. Please try again after an hour.',
  handler: (req, res, next, options) => {
    return errorResponse(res, options.message, 429);
  },
  standardHeaders: true,
  legacyHeaders: false
});

const forgotPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  message: 'Too many password reset requests from this IP. Please try again after an hour.',
  handler: (req, res, next, options) => {
    return errorResponse(res, options.message, 429);
  },
  standardHeaders: true,
  legacyHeaders: false
});

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: 'Too many requests. Please slow down.',
  handler: (req, res, next, options) => {
    return errorResponse(res, options.message, 429);
  },
  standardHeaders: true,
  legacyHeaders: false
});

module.exports = {
  loginLimiter,
  registerLimiter,
  forgotPasswordLimiter,
  generalLimiter
};
