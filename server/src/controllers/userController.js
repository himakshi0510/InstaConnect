const fs = require('fs');
const User = require('../models/User');
const Post = require('../models/Post');      
const Follow = require('../models/Follow');
const Notification = require('../models/Notification');
const uploadToCloudinary = require('../utils/cloudinaryUpload');
const deleteFromCloudinary = require('../utils/cloudinaryDelete');
const { comparePassword, hashPassword } = require('../utils/hashPassword');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const { getPaginationParams, getPaginationData } = require('../utils/paginationHelper');
const userController = {
  async getProfile(req, res, next) {
    const { username } = req.params;
    const currentUserId = req.user ? req.user.userId : null;

    try {
      const profile = await User.getProfile(username, currentUserId);
      if (!profile) {
        return errorResponse(res, 'User profile not found', 404);
      }

      profile.isOwnProfile = currentUserId === profile.id;
      profile.isFollowing = !!profile.isFollowing;

      return successResponse(res, { user: profile });
    } catch (error) {
      next(error);
    }
  },

  // Add inside userController object, after getProfile
async getUserPosts(req, res, next) {
  const { username } = req.params;
  const currentUserId = req.user ? req.user.userId : null;

  try {
    // Step 1: Resolve username → userId
    const profile = await User.getProfile(username, currentUserId);
    if (!profile) {
      return errorResponse(res, 'User not found', 404);
    }

    // Step 2: Fetch posts using the CORRECT method name
    const posts = await Post.getUserPosts(profile.id); // ✅ correct name

    return successResponse(res, { posts, total: posts.length });
  } catch (error) {
    next(error);
  }
},

  async updateProfile(req, res, next) {
    const userId = req.user.userId;
    const { fullName, username, bio, website } = req.body;

    let tempFilePath = null;
    if (req.file) {
      tempFilePath = req.file.path;
    }

    try {
      const user = await User.findById(userId);
      if (!user) {
        return errorResponse(res, 'User not found', 404);
      }

      const updates = {};

      // Handle username update checks
      if (username && username !== user.username) {
        const usernameTaken = await User.findByUsername(username);
        if (usernameTaken) {
          return errorResponse(res, 'Username is already taken', 409);
        }
        updates.username = username;
      }

      if (fullName !== undefined) updates.fullName = fullName;
      if (bio !== undefined) updates.bio = bio;
      if (website !== undefined) updates.website = website;

      // Handle profile picture update
      if (tempFilePath) {
        // Enforce avatar file size limit (max 5MB)
        const stats = fs.statSync(tempFilePath);
        const fileSizeInBytes = stats.size;
        if (fileSizeInBytes > 5 * 1024 * 1024) {
          return errorResponse(res, 'Avatar image file must be smaller than 5MB', 400);
        }

        // Upload new avatar image
        const uploadResult = await uploadToCloudinary(tempFilePath, 'instaconnect/avatars', [
          { width: 400, height: 400, crop: 'fill' },
          { quality: 'auto' }
        ]);

        updates.profilePicture = uploadResult.secure_url;
        updates.profilePicturePublicId = uploadResult.public_id;

        // Delete old avatar from Cloudinary
        if (user.profilePicturePublicId) {
          await deleteFromCloudinary(user.profilePicturePublicId);
        }
      }

      // Save changes
      if (Object.keys(updates).length > 0) {
        await User.update(userId, updates);
      }

      // Fetch fresh details
      const updatedUser = await User.findById(userId);

      return successResponse(res, {
        user: {
          id: updatedUser.id,
          username: updatedUser.username,
          fullName: updatedUser.fullName,
          email: updatedUser.email,
          profilePicture: updatedUser.profilePicture,
          bio: updatedUser.bio,
          website: updatedUser.website,
          role: updatedUser.role
        }
      }, 'Profile updated successfully.');

    } catch (error) {
      next(error);
    } finally {
      // Clean up uploaded temp file
      if (tempFilePath && fs.existsSync(tempFilePath)) {
        try {
          fs.unlinkSync(tempFilePath);
        } catch (unlinkErr) {
          console.error('Error cleaning up temp file:', unlinkErr);
        }
      }
    }
  },

  async changePassword(req, res, next) {
    const userId = req.user.userId;
    const { currentPassword, newPassword } = req.body;

    try {
      const user = await User.findById(userId);
      if (!user) {
        return errorResponse(res, 'User not found', 404);
      }

      // Verify current password
      const isMatch = await comparePassword(currentPassword, user.passwordHash);
      if (!isMatch) {
        return errorResponse(res, 'Current password was incorrect.', 401);
      }

      // Hash and update password
      const hashedPass = await hashPassword(newPassword);
      await User.changePassword(userId, hashedPass);

      return successResponse(res, {}, 'Password changed successfully.');
    } catch (error) {
      next(error);
    }
  },

  async changeEmail(req, res, next) {
    const userId = req.user.userId;
    const { newEmail, currentPassword } = req.body;

    try {
      const user = await User.findById(userId);
      if (!user) {
        return errorResponse(res, 'User not found', 404);
      }

      // Verify current password
      const isMatch = await comparePassword(currentPassword, user.passwordHash);
      if (!isMatch) {
        return errorResponse(res, 'Incorrect password. Cannot verify identity.', 401);
      }

      // Check if new email is in use
      if (newEmail !== user.email) {
        const emailTaken = await User.findByEmail(newEmail);
        if (emailTaken) {
          return errorResponse(res, 'Email is already registered by another account', 409);
        }
        await User.changeEmail(userId, newEmail);
      }

      return successResponse(res, {}, 'Email updated successfully.');
    } catch (error) {
      next(error);
    }
  },

  async search(req, res, next) {
    const { q, limit } = req.query;
    const searchQuery = q || '';
    const searchLimit = parseInt(limit || '10', 10);

    try {
      const users = await User.search(searchQuery, searchLimit);
      return successResponse(res, { users });
    } catch (error) {
      next(error);
    }
  },

  async follow(req, res, next) {
    const followerId = req.user.userId;
    const followeeId = parseInt(req.params.userId, 10);

    if (followerId === followeeId) {
      return errorResponse(res, 'You cannot follow yourself', 400);
    }

    try {
      const followee = await User.findById(followeeId);
      if (!followee) {
        return errorResponse(res, 'Target user not found', 404);
      }

      const isFollowing = await Follow.exists(followerId, followeeId);
      if (isFollowing) {
        return errorResponse(res, 'You are already following this user', 400);
      }

      // Create record
      await Follow.create(followerId, followeeId);

      // Create notification
      await Notification.create({
        recipientUserId: followeeId,
        senderUserId: followerId,
        type: 'FOLLOW'
      });

      return successResponse(res, {}, 'User followed successfully');
    } catch (error) {
      next(error);
    }
  },

  async unfollow(req, res, next) {
    const followerId = req.user.userId;
    const followeeId = parseInt(req.params.userId, 10);

    try {
      const isFollowing = await Follow.exists(followerId, followeeId);
      if (!isFollowing) {
        return errorResponse(res, 'You are not following this user', 400);
      }

      // Delete record
      await Follow.delete(followerId, followeeId);

      // Delete notification
      await Notification.deleteFollowNotification(followerId, followeeId);

      return successResponse(res, {}, 'User unfollowed successfully');
    } catch (error) {
      next(error);
    }
  },

  async getFollowers(req, res, next) {
    const targetUserId = parseInt(req.params.userId, 10);
    const currentUserId = req.user ? req.user.userId : null;
    const { page, limit, offset } = getPaginationParams(req.query, 20);

    try {
      const followers = await Follow.getFollowers(targetUserId, currentUserId, limit, offset);
      const totalFollowers = await Follow.countFollowers(targetUserId);
      const paginatedData = getPaginationData(followers, page, limit, totalFollowers);
      
      return successResponse(res, paginatedData);
    } catch (error) {
      next(error);
    }
  },

  async getFollowing(req, res, next) {
    const targetUserId = parseInt(req.params.userId, 10);
    const currentUserId = req.user ? req.user.userId : null;
    const { page, limit, offset } = getPaginationParams(req.query, 20);

    try {
      const following = await Follow.getFollowing(targetUserId, currentUserId, limit, offset);
      const totalFollowing = await Follow.countFollowing(targetUserId);
      const paginatedData = getPaginationData(following, page, limit, totalFollowing);

      return successResponse(res, paginatedData);
    } catch (error) {
      next(error);
    }
  }
};

module.exports = userController;
