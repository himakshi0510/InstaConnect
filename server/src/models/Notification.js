const pool = require('../config/database');

const Notification = {
  async create({ recipientUserId, senderUserId, type, postId = null, commentId = null }) {
    // Avoid notifying oneself
    if (recipientUserId === senderUserId) return null;

    const query = `
      INSERT INTO notifications (recipientUserId, senderUserId, type, postId, commentId)
      VALUES (?, ?, ?, ?, ?)
    `;
    const [result] = await pool.execute(query, [
      recipientUserId,
      senderUserId,
      type,
      postId || null,
      commentId || null
    ]);
    return result.insertId;
  },

  async getNotifications(recipientUserId, limit = 20, offset = 0) {
    const query = `
      SELECT 
        n.id, 
        n.recipientUserId, 
        n.senderUserId, 
        n.type, 
        n.postId, 
        n.commentId, 
        n.isRead, 
        n.createdAt,
        u.username AS senderUsername, 
        u.profilePicture AS senderProfilePicture,
        p.imageUrl AS postThumbnail,
        c.body AS commentBody
      FROM notifications n
      INNER JOIN users u ON n.senderUserId = u.id
      LEFT JOIN posts p ON n.postId = p.id
      LEFT JOIN comments c ON n.commentId = c.id
      WHERE n.recipientUserId = ?
      ORDER BY n.createdAt DESC
      LIMIT ? OFFSET ?
    `;
    const [rows] = await pool.execute(query, [recipientUserId, limit, offset]);
    return rows;
  },

  async countNotifications(recipientUserId) {
    const query = 'SELECT COUNT(*) AS total FROM notifications WHERE recipientUserId = ?';
    const [rows] = await pool.execute(query, [recipientUserId]);
    return rows[0].total;
  },

  async getUnreadCount(recipientUserId) {
    const query = 'SELECT COUNT(*) AS count FROM notifications WHERE recipientUserId = ? AND isRead = 0';
    const [rows] = await pool.execute(query, [recipientUserId]);
    return rows[0].count;
  },

  async markAllAsRead(recipientUserId) {
    const query = 'UPDATE notifications SET isRead = 1 WHERE recipientUserId = ? AND isRead = 0';
    const [result] = await pool.execute(query, [recipientUserId]);
    return result.affectedRows;
  },

  async deleteLikeNotification(senderUserId, postId) {
    // Helper to clear notifications when a post is un-liked
    const query = 'DELETE FROM notifications WHERE senderUserId = ? AND postId = ? AND type = \'LIKE\'';
    const [result] = await pool.execute(query, [senderUserId, postId]);
    return result.affectedRows > 0;
  },

  async deleteFollowNotification(senderUserId, recipientUserId) {
    // Helper to clear notifications when a user is un-followed
    const query = 'DELETE FROM notifications WHERE senderUserId = ? AND recipientUserId = ? AND type = \'FOLLOW\'';
    const [result] = await pool.execute(query, [senderUserId, recipientUserId]);
    return result.affectedRows > 0;
  }
};

module.exports = Notification;
