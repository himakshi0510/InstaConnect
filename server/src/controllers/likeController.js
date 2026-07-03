const Like = require('../models/Like');
const Post = require('../models/Post');
const Notification = require('../models/Notification');
const { successResponse, errorResponse } = require('../utils/apiResponse');

const likeController = {
  async like(req, res, next) {
    const postId = parseInt(req.params.postId, 10);
    const userId = req.user.userId;

    try {
      const post = await Post.findById(postId, userId);
      if (!post) {
        return errorResponse(res, 'Post not found', 404);
      }

      const alreadyLiked = await Like.exists(userId, postId);
      if (alreadyLiked) {
        // Safe check, return existing like count
        const likeCount = await Like.countByPostId(postId);
        return successResponse(res, { likeCount }, 'Post already liked');
      }

      // Record like
      const created = await Like.create(userId, postId);
      if (created) {
        // Trigger notification to post owner (skip if liking own post)
        if (post.userId !== userId) {
          await Notification.create({
            recipientUserId: post.userId,
            senderUserId: userId,
            type: 'LIKE',
            postId: postId
          });
        }
      }

      const likeCount = await Like.countByPostId(postId);
      return successResponse(res, { likeCount }, 'Post liked successfully');

    } catch (error) {
      next(error);
    }
  },

  async unlike(req, res, next) {
    const postId = parseInt(req.params.postId, 10);
    const userId = req.user.userId;

    try {
      const post = await Post.findById(postId, userId);
      if (!post) {
        return errorResponse(res, 'Post not found', 404);
      }

      const isLiked = await Like.exists(userId, postId);
      if (!isLiked) {
        const likeCount = await Like.countByPostId(postId);
        return successResponse(res, { likeCount }, 'Post not liked');
      }

      // Delete like
      await Like.delete(userId, postId);

      // Clean up like notification
      await Notification.deleteLikeNotification(userId, postId);

      const likeCount = await Like.countByPostId(postId);
      return successResponse(res, { likeCount }, 'Post unliked successfully');

    } catch (error) {
      next(error);
    }
  }
};

module.exports = likeController;
