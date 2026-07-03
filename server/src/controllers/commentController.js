const Comment = require('../models/Comment');
const Post = require('../models/Post');
const Notification = require('../models/Notification');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const { getPaginationParams, getPaginationData } = require('../utils/paginationHelper');

const commentController = {
  async getComments(req, res, next) {
    const postId = parseInt(req.params.postId, 10);
    const { page, limit, offset } = getPaginationParams(req.query, 20);

    try {
      const comments = await Comment.getCommentsByPostId(postId, limit, offset);
      const totalComments = await Comment.countByPostId(postId);
      const paginatedData = getPaginationData(comments, page, limit, totalComments);

      return successResponse(res, paginatedData);
    } catch (error) {
      next(error);
    }
  },

  async create(req, res, next) {
    const postId = parseInt(req.params.postId, 10);
    const userId = req.user.userId;
    const { body } = req.body;

    try {
      const post = await Post.findById(postId, userId);
      if (!post) {
        return errorResponse(res, 'Post not found', 404);
      }

      // Add comment record
      const commentId = await Comment.create({
        postId,
        userId,
        body
      });

      const newComment = await Comment.findById(commentId);

      // Trigger comment notification to post owner (skip if commenting on own post)
      if (post.userId !== userId) {
        await Notification.create({
          recipientUserId: post.userId,
          senderUserId: userId,
          type: 'COMMENT',
          postId: postId,
          commentId: commentId
        });
      }

      return successResponse(res, newComment, 'Comment added successfully', 201);
    } catch (error) {
      next(error);
    }
  },

  async delete(req, res, next) {
    const postId = parseInt(req.params.postId, 10);
    const commentId = parseInt(req.params.cid, 10);
    const userId = req.user.userId;

    try {
      const comment = await Comment.findById(commentId);
      if (!comment) {
        return errorResponse(res, 'Comment not found', 404);
      }

      if (comment.postId !== postId) {
        return errorResponse(res, 'Comment does not belong to this post', 400);
      }

      // Authorization: Comment owner OR Post owner
      if (comment.userId !== userId && comment.postOwnerId !== userId) {
        return errorResponse(res, 'Forbidden: You do not have permission to delete this comment', 403);
      }

      await Comment.delete(commentId);

      return successResponse(res, {}, 'Comment deleted successfully');
    } catch (error) {
      next(error);
    }
  }
};

module.exports = commentController;
