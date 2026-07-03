const pool = require('../config/database');

const Like = {
  async create(userId, postId) {
    const query = `
      INSERT IGNORE INTO likes (userId, postId)
      VALUES (?, ?)
    `;
    const [result] = await pool.execute(query, [userId, postId]);
    return result.affectedRows > 0;
  },

  async delete(userId, postId) {
    const query = `
      DELETE FROM likes
      WHERE userId = ? AND postId = ?
    `;
    const [result] = await pool.execute(query, [userId, postId]);
    return result.affectedRows > 0;
  },

  async exists(userId, postId) {
    const query = `
      SELECT 1 FROM likes
      WHERE userId = ? AND postId = ?
    `;
    const [rows] = await pool.execute(query, [userId, postId]);
    return rows.length > 0;
  },

  async countByPostId(postId) {
    const query = `
      SELECT COUNT(*) AS count
      FROM likes
      WHERE postId = ?
    `;
    const [rows] = await pool.execute(query, [postId]);
    return rows[0].count;
  }
};

module.exports = Like;
