const pool = require('../config/database');

const PasswordResetToken = {
  async create({ userId, tokenHash, expiresAt }) {
    // Delete any existing tokens for this user first
    await this.deleteByUserId(userId);

    const query = `
      INSERT INTO password_reset_tokens (userId, tokenHash, expiresAt)
      VALUES (?, ?, ?)
    `;
    const [result] = await pool.execute(query, [userId, tokenHash, expiresAt]);
    return result.insertId;
  },

  async findByTokenHash(tokenHash) {
    const query = `
      SELECT id, userId, tokenHash, expiresAt, createdAt
      FROM password_reset_tokens
      WHERE tokenHash = ? AND expiresAt > CURRENT_TIMESTAMP
    `;
    const [rows] = await pool.execute(query, [tokenHash]);
    return rows[0] || null;
  },

  async deleteByUserId(userId) {
    const query = 'DELETE FROM password_reset_tokens WHERE userId = ?';
    const [result] = await pool.execute(query, [userId]);
    return result.affectedRows > 0;
  },

  async deleteExpired() {
    const query = 'DELETE FROM password_reset_tokens WHERE expiresAt <= CURRENT_TIMESTAMP';
    const [result] = await pool.execute(query);
    return result.affectedRows;
  }
};

module.exports = PasswordResetToken;
