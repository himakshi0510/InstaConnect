const crypto = require('crypto');
const User = require('../models/User');
const PasswordResetToken = require('../models/PasswordResetToken');
const { hashPassword, comparePassword } = require('../utils/hashPassword');
const generateToken = require('../utils/generateToken');
const sendEmail = require('../utils/sendEmail');
const { successResponse, errorResponse } = require('../utils/apiResponse');
require('dotenv').config();

const authController = {
  async register(req, res, next) {
    const { fullName, username, email, password } = req.body;

    try {
      // Check username availability
      const existingUser = await User.findByUsername(username);
      if (existingUser) {
        return errorResponse(res, 'Username is already taken', 409);
      }

      // Check email availability
      const existingEmail = await User.findByEmail(email);
      if (existingEmail) {
        return errorResponse(res, 'Email is already registered', 409);
      }

      // Hash password
      const passwordHash = await hashPassword(password);

      // Create user
      const userId = await User.create({ username, fullName, email, passwordHash });

      // Fetch user details for token
      const newUser = await User.findById(userId);

      // Generate JWT
      const token = generateToken(newUser);

      // Return credentials
      return successResponse(res, {
        token,
        user: {
          id: newUser.id,
          username: newUser.username,
          fullName: newUser.fullName,
          email: newUser.email,
          profilePicture: newUser.profilePicture,
          bio: newUser.bio,
          website: newUser.website,
          role: newUser.role
        }
      }, 'Registration successful', 201);

    } catch (error) {
      next(error);
    }
  },

  async login(req, res, next) {
    const { email, password } = req.body;

    try {
      // Find user
      const user = await User.findByEmail(email);
      if (!user) {
        return errorResponse(res, 'Invalid email or password', 401);
      }

      // Compare password
      const isMatch = await comparePassword(password, user.passwordHash);
      if (!isMatch) {
        return errorResponse(res, 'Invalid email or password', 401);
      }

      // Generate Token
      const token = generateToken(user);

      return successResponse(res, {
        token,
        user: {
          id: user.id,
          username: user.username,
          fullName: user.fullName,
          email: user.email,
          profilePicture: user.profilePicture,
          bio: user.bio,
          website: user.website,
          role: user.role
        }
      }, 'Logged in successfully');

    } catch (error) {
      next(error);
    }
  },

  async logout(req, res) {
    // Client-side handles clearing localStorage, server just acknowledges
    return successResponse(res, {}, 'Logged out successfully');
  },

  async forgotPassword(req, res, next) {
    const { email } = req.body;

    try {
      const user = await User.findByEmail(email);
      
      // Standard message to prevent account enumeration
      const standardMsg = 'If an account exists, we sent a reset link.';
      
      if (!user) {
        // Return success even if email is not in db
        return successResponse(res, {}, standardMsg);
      }

      // Generate 32-byte raw token
      const rawToken = crypto.randomBytes(32).toString('hex');
      
      // Hash it (SHA-256)
      const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

      // Expires in 1 hour
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 1);

      // Save token in DB
      await PasswordResetToken.create({
        userId: user.id,
        tokenHash,
        expiresAt
      });

      // Construct reset URL
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const resetUrl = `${frontendUrl}/reset-password?token=${rawToken}`;

      // Email template
      const emailText = `Hello,\n\nYou requested a password reset for your InstaConnect account. Please use the following link to reset your password:\n\n${resetUrl}\n\nThis link is valid for 1 hour.\n\nIf you did not request this, please ignore this email.`;
      const emailHtml = `<p>Hello,</p><p>You requested a password reset for your InstaConnect account. Please click the link below to reset your password:</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>This link is valid for 1 hour.</p><p>If you did not request this, please ignore this email.</p>`;

      // Send email
      await sendEmail({
        to: user.email,
        subject: 'InstaConnect - Reset Password Request',
        text: emailText,
        html: emailHtml
      });

      return successResponse(res, {}, standardMsg);

    } catch (error) {
      next(error);
    }
  },

  async resetPassword(req, res, next) {
    const { token, newPassword } = req.body;

    try {
      // Hash incoming raw token (SHA-256) to match DB
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

      // Check DB
      const resetToken = await PasswordResetToken.findByTokenHash(tokenHash);
      if (!resetToken) {
        return errorResponse(res, 'Invalid or expired password reset link.', 400);
      }

      // Hash new password
      const newHash = await hashPassword(newPassword);

      // Update User
      await User.changePassword(resetToken.userId, newHash);

      // Delete token so it cannot be reused
      await PasswordResetToken.deleteByUserId(resetToken.userId);

      return successResponse(res, {}, 'Password reset successfully!');

    } catch (error) {
      next(error);
    }
  },

  async checkUsername(req, res, next) {
    const { username } = req.query;

    try {
      const user = await User.findByUsername(username);
      return successResponse(res, { available: !user }, 'Username availability checked');
    } catch (error) {
      next(error);
    }
  }
};

module.exports = authController;
