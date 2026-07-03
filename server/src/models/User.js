const pool = require('../config/database');

const User = {
  async create({ username, fullName, email, passwordHash }) {
    const query = `
      INSERT INTO users (username, fullName, email, passwordHash)
      VALUES (?, ?, ?, ?)
    `;
    const [result] = await pool.execute(query, [username, fullName, email, passwordHash]);
    return result.insertId;
  },

  async findById(id) {
    const query = 'SELECT id, username, fullName, email, passwordHash, profilePicture, profilePicturePublicId, bio, website, role, isPrivate, createdAt, updatedAt FROM users WHERE id = ?';
    const [rows] = await pool.execute(query, [id]);
    return rows[0] || null;
  },

  async findByUsername(username) {
    const query = 'SELECT id, username, fullName, email, passwordHash, profilePicture, profilePicturePublicId, bio, website, role, isPrivate, createdAt, updatedAt FROM users WHERE username = ?';
    const [rows] = await pool.execute(query, [username]);
    return rows[0] || null;
  },

  async findByEmail(email) {
    const query = 'SELECT id, username, fullName, email, passwordHash, profilePicture, profilePicturePublicId, bio, website, role, isPrivate, createdAt, updatedAt FROM users WHERE email = ?';
    const [rows] = await pool.execute(query, [email]);
    return rows[0] || null;
  },

  async getProfile(username, currentUserId) {
    const query = `
      SELECT 
        u.id, 
        u.username, 
        u.fullName, 
        u.bio, 
        u.website, 
        u.profilePicture, 
        u.isPrivate,
        (SELECT COUNT(*) FROM posts p WHERE p.userId = u.id) AS postCount,
        (SELECT COUNT(*) FROM follows f WHERE f.followeeId = u.id) AS followerCount,
        (SELECT COUNT(*) FROM follows f WHERE f.followerId = u.id) AS followingCount,
        IF(? IS NULL, 0, EXISTS(SELECT 1 FROM follows f WHERE f.followerId = ? AND f.followeeId = u.id)) AS isFollowing
      FROM users u
      WHERE u.username = ?
    `;
    const [rows] = await pool.execute(query, [currentUserId, currentUserId, username]);
    return rows[0] || null;
  },

  async update(id, updates) {
    const fields = [];
    const values = [];
    
    // Dynamic updates mapping
    const allowedFields = ['fullName', 'username', 'bio', 'website', 'profilePicture', 'profilePicturePublicId', 'isPrivate'];
    for (const key of allowedFields) {
      if (updates[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(updates[key]);
      }
    }

    if (fields.length === 0) return false;

    values.push(id);
    const query = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;
    const [result] = await pool.execute(query, values);
    return result.affectedRows > 0;
  },

  async changePassword(id, hashedPassword) {
    const query = 'UPDATE users SET passwordHash = ? WHERE id = ?';
    const [result] = await pool.execute(query, [hashedPassword, id]);
    return result.affectedRows > 0;
  },

  async changeEmail(id, newEmail) {
    const query = 'UPDATE users SET email = ? WHERE id = ?';
    const [result] = await pool.execute(query, [newEmail, id]);
    return result.affectedRows > 0;
  },

  async search(searchQuery, limit = 10) {
    // Return matching users, ordering by username
    const formattedQuery = `%${searchQuery}%`;
    const query = `
      SELECT 
        id, 
        username, 
        fullName, 
        profilePicture,
        (SELECT COUNT(*) FROM follows f WHERE f.followeeId = users.id) AS followerCount
      FROM users
      WHERE username LIKE ? OR fullName LIKE ?
      LIMIT ?
    `;
    const [rows] = await pool.query(query, [formattedQuery, formattedQuery, limit]);
    return rows;
  }
};

module.exports = User;
