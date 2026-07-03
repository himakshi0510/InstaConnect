const pool = require('../config/database');

const Follow = {
  async create(followerId, followeeId) {
    if (followerId === followeeId) {
      throw new Error('You cannot follow yourself');
    }

    const query = `
      INSERT IGNORE INTO follows (followerId, followeeId)
      VALUES (?, ?)
    `;
    const [result] = await pool.execute(query, [followerId, followeeId]);
    return result.affectedRows > 0;
  },

  async delete(followerId, followeeId) {
    const query = `
      DELETE FROM follows
      WHERE followerId = ? AND followeeId = ?
    `;
    const [result] = await pool.execute(query, [followerId, followeeId]);
    return result.affectedRows > 0;
  },

  async exists(followerId, followeeId) {
    const query = `
      SELECT 1 FROM follows
      WHERE followerId = ? AND followeeId = ?
    `;
    const [rows] = await pool.execute(query, [followerId, followeeId]);
    return rows.length > 0;
  },

  async getFollowers(userId, currentUserId, limit = 20, offset = 0) {
    const query = `
      SELECT u.id, u.username, u.fullName, u.profilePicture,
             IF(? IS NULL, 0, EXISTS(SELECT 1 FROM follows f2 WHERE f2.followerId = ? AND f2.followeeId = u.id)) AS isFollowing
      FROM follows f
      INNER JOIN users u ON f.followerId = u.id
      WHERE f.followeeId = ?
      LIMIT ? OFFSET ?
    `;
    const [rows] = await pool.execute(query, [currentUserId, currentUserId, userId, limit, offset]);
    return rows;
  },

  async countFollowers(userId) {
    const query = 'SELECT COUNT(*) AS total FROM follows WHERE followeeId = ?';
    const [rows] = await pool.execute(query, [userId]);
    return rows[0].total;
  },

  async getFollowing(userId, currentUserId, limit = 20, offset = 0) {
    const query = `
      SELECT u.id, u.username, u.fullName, u.profilePicture,
             IF(? IS NULL, 0, EXISTS(SELECT 1 FROM follows f2 WHERE f2.followerId = ? AND f2.followeeId = u.id)) AS isFollowing
      FROM follows f
      INNER JOIN users u ON f.followeeId = u.id
      WHERE f.followerId = ?
      LIMIT ? OFFSET ?
    `;
    const [rows] = await pool.execute(query, [currentUserId, currentUserId, userId, limit, offset]);
    return rows;
  },

  async countFollowing(userId) {
    const query = 'SELECT COUNT(*) AS total FROM follows WHERE followerId = ?';
    const [rows] = await pool.execute(query, [userId]);
    return rows[0].total;
  },

  async getSuggestions(userId, limit = 5) {
    // Users that the target user is NOT following yet and is not themselves
    const query = `
      SELECT u.id, u.username, u.fullName, u.profilePicture
      FROM users u
      WHERE u.id != ?
        AND u.id NOT IN (SELECT followeeId FROM follows WHERE followerId = ?)
      ORDER BY RAND()
      LIMIT ?
    `;
    const [rows] = await pool.execute(query, [userId, userId, limit]);
    return rows;
  }
};

module.exports = Follow;
