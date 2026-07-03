const express = require('express');
const authController = require('../controllers/authController');
const {
  registerValidator,
  loginValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
  usernameCheckValidator
} = require('../validators/authValidators');
const {
  loginLimiter,
  registerLimiter,
  forgotPasswordLimiter
} = require('../middleware/rateLimiter');

const router = express.Router();

// After (Temporary for local testing)
router.post('/register', registerValidator, authController.register);
router.post('/login', loginLimiter, loginValidator, authController.login);
router.post('/logout', authController.logout);
router.post('/forgot-password', forgotPasswordLimiter, forgotPasswordValidator, authController.forgotPassword);
router.post('/reset-password', resetPasswordValidator, authController.resetPassword);
router.get('/check-username', usernameCheckValidator, authController.checkUsername);

module.exports = router;
