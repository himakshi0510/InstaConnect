const Notification = require('../models/Notification');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const { getPaginationParams, getPaginationData } = require('../utils/paginationHelper');

const notificationController = {
  async getNotifications(req, res, next) {
    const userId = req.user.userId;
    const { page, limit, offset } = getPaginationParams(req.query, 20);

    try {
      const notifications = await Notification.getNotifications(userId, limit, offset);
      const totalNotifications = await Notification.countNotifications(userId);
      const paginatedData = getPaginationData(notifications, page, limit, totalNotifications);

      return successResponse(res, paginatedData);
    } catch (error) {
      next(error);
    }
  },

  async getUnreadCount(req, res, next) {
    const userId = req.user.userId;

    try {
      const count = await Notification.getUnreadCount(userId);
      return successResponse(res, { count }, 'Unread count fetched');
    } catch (error) {
      next(error);
    }
  },

  async markAllRead(req, res, next) {
    const userId = req.user.userId;

    try {
      await Notification.markAllAsRead(userId);
      return successResponse(res, {}, 'All notifications marked as read');
    } catch (error) {
      next(error);
    }
  }
};

module.exports = notificationController;
