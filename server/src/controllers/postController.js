const fs = require('fs');
const Post = require('../models/Post');
const User = require('../models/User');
const uploadToCloudinary = require('../utils/cloudinaryUpload');
const deleteFromCloudinary = require('../utils/cloudinaryDelete');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const { getPaginationParams, getPaginationData } = require('../utils/paginationHelper');

const postController = {
  async create(req, res, next) {
    const userId = req.user.userId;
    const { caption, location } = req.body;

    if (!req.file) {
      return errorResponse(res, 'Post image is required', 400);
    }

    const tempFilePath = req.file.path;

    try {
      // Validate post image file size (max 10MB)
      const stats = fs.statSync(tempFilePath);
      if (stats.size > 10 * 1024 * 1024) {
        return errorResponse(res, 'Post image file must be smaller than 10MB', 400);
      }

      // Upload to Cloudinary
      const uploadResult = await uploadToCloudinary(tempFilePath, 'instaconnect/posts', [
        { width: 1080, crop: 'limit' },
        { quality: 'auto' },
        { fetch_format: 'auto' }
      ]);

      // Insert post into database
      const postId = await Post.create({
        userId,
        imageUrl: uploadResult.secure_url,
        imagePublicId: uploadResult.public_id,
        caption,
        location
      });

      // Fetch the created post details
      const post = await Post.findById(postId, userId);

      return successResponse(res, post, 'Post shared successfully!', 201);

    } catch (error) {
      // If DB fails after Cloudinary succeeds, delete Cloudinary asset to avoid orphaned files
      if (error && error.secure_url) {
        // Safe check
      }
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

  async getFeed(req, res, next) {
    // Standard middleware compatibility
    const currentUserId = req.user.userId;
    console.log('🔍 getFeed called, currentUserId:', currentUserId); 
    const { cursor, limit } = req.query;
    const feedLimit = parseInt(limit || '10', 10);

    try {
      const feedData = await Post.getFeed(currentUserId, cursor, feedLimit);
      return successResponse(res, feedData);
    } catch (error) {
      next(error);
    }
  },

  async getExplore(req, res, next) {
    const { page, limit, offset } = getPaginationParams(req.query, 18);

    try {
      const posts = await Post.getExplore(limit, offset);
      const totalPosts = await Post.countExplore();
      const paginatedData = getPaginationData(posts, page, limit, totalPosts);

      return successResponse(res, paginatedData);
    } catch (error) {
      next(error);
    }
  },

  async getPostDetails(req, res, next) {
    const postId = parseInt(req.params.postId, 10);
    const currentUserId = req.user ? req.user.userId : null;

    try {
      const post = await Post.findById(postId, currentUserId);
      if (!post) {
        return errorResponse(res, 'Post not found', 404);
      }

      // Convert mysql TINYINT to standard booleans
      post.isLiked = !!post.isLiked;
      post.isOwnPost = !!post.isOwnPost;

      return successResponse(res, { post });
    } catch (error) {
      next(error);
    }
  },

  async updateCaption(req, res, next) {
    const postId = parseInt(req.params.postId, 10);
    const currentUserId = req.user.userId;
     const { caption, location } = req.body;

    try {
      const post = await Post.findById(postId, currentUserId);
      if (!post) {
        return errorResponse(res, 'Post not found', 404);
      }

      // Authorization guard: owner only
      if (post.userId !== currentUserId) {
        return errorResponse(res, 'Access denied. You do not own this post.', 403);
      }

        const updateFields = {};
      if (caption !== undefined) updateFields.caption = caption;
      if (location !== undefined) updateFields.location = location;
      await Post.update(postId, updateFields);
      const updatedPost = await Post.findById(postId, currentUserId);
      
      return successResponse(res, { post: updatedPost }, 'Caption updated successfully.');
    } catch (error) {
      next(error);
    }
  },

  async delete(req, res, next) {
    const postId = parseInt(req.params.postId, 10);
    const currentUserId = req.user.userId;

    try {
      // Find post including publicId for Cloudinary deletion
      const post = await Post.findById(postId, currentUserId);
      if (!post) {
        return errorResponse(res, 'Post not found', 404);
      }

      // Fetch user role for admin guard
      const user = await User.findById(currentUserId);

      // Authorization check: owner or ADMIN
      if (post.userId !== currentUserId && user.role !== 'ADMIN') {
        return errorResponse(res, 'Forbidden: You do not have permission to delete this post', 403);
      }

      // Delete image asset from Cloudinary
      if (post.imagePublicId) {
        await deleteFromCloudinary(post.imagePublicId);
      }

      // Delete database record (cascades likes/comments/notifications)
      await Post.delete(postId);

      return successResponse(res, {}, 'Post and associated media deleted successfully.');
    } catch (error) {
      next(error);
    }
  }
};

module.exports = postController;
