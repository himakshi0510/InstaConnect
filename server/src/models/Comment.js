const pool = require('../config/database');

const Comment = {
  async create({ postId, userId, body, parentCommentId = null }) {
    const query = `
      INSERT INTO comments (postId, userId, body, parentCommentId)
      VALUES (?, ?, ?, ?)
    `;
    const [result] = await pool.execute(query, [postId, userId, body, parentCommentId]);
    return result.insertId;
  },

  async findById(commentId) {
    const query = `
      SELECT c.id, c.postId, c.userId, c.parentCommentId, c.body, c.createdAt, c.updatedAt,
             u.username, u.profilePicture, p.userId AS postOwnerId
      FROM comments c
      INNER JOIN users u ON c.userId = u.id
      INNER JOIN posts p ON c.postId = p.id
      WHERE c.id = ?
    `;
    const [rows] = await pool.execute(query, [commentId]);
    return rows[0] || null;
  },

  async getCommentsByPostId(postId, limit = 20, offset = 0) {
    const query = `
      SELECT c.id, c.postId, c.userId, c.parentCommentId, c.body, c.createdAt, c.updatedAt,
             u.username, u.profilePicture
      FROM comments c
      INNER JOIN users u ON c.userId = u.id
      WHERE c.postId = ?
      ORDER BY c.createdAt ASC
      LIMIT ? OFFSET ?
    `;
    // pool.query used instead of pool.execute to avoid prepared-statement
    // type-mismatch errors with LIMIT/OFFSET integer parameters.
    const [rows] = await pool.query(query, [postId, limit, offset]);
    return rows;
  },

  async countByPostId(postId) {
    const query = `
      SELECT COUNT(*) AS total
      FROM comments
      WHERE postId = ?
    `;
    const [rows] = await pool.execute(query, [postId]);
    return rows[0].total;
  },

  async delete(commentId) {
    const query = 'DELETE FROM comments WHERE id = ?';
    const [result] = await pool.execute(query, [commentId]);
    return result.affectedRows > 0;
  }
};

module.exports = Comment;
