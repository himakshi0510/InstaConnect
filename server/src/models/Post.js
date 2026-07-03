const pool = require('../config/database');

const Post = {
  async create({ userId, imageUrl, imagePublicId, caption, location }) {
    const query = `
      INSERT INTO posts (userId, imageUrl, imagePublicId, caption, location)
      VALUES (?, ?, ?, ?, ?)
    `;
    const [result] = await pool.execute(query, [userId, imageUrl, imagePublicId, caption || null, location || null]);
    return result.insertId;
  },

  async findById(postId, currentUserId) {
    const query = `
      SELECT 
        p.id, 
        p.userId, 
        p.imageUrl, 
        p.imagePublicId,
        p.caption, 
        p.location, 
        p.createdAt, 
        p.updatedAt,
        u.username, 
        u.fullName, 
        u.profilePicture,
        (SELECT COUNT(*) FROM likes l WHERE l.postId = p.id) AS likesCount,    
        (SELECT COUNT(*) FROM comments c WHERE c.postId = p.id) AS commentsCount, 
        IF(? IS NULL, 0, EXISTS(SELECT 1 FROM likes l WHERE l.userId = ? AND l.postId = p.id)) AS isLiked,
        IF(? IS NULL, 0, p.userId = ?) AS isOwnPost
      FROM posts p
      INNER JOIN users u ON p.userId = u.id
      WHERE p.id = ?
    `;
    const [rows] = await pool.execute(query, [currentUserId, currentUserId, currentUserId, currentUserId, postId]);
    return rows[0] || null;
  },

  async getFeed(currentUserId, cursor, limit = 10) {
    let query = `
      SELECT 
        p.id, 
        p.userId, 
        p.imageUrl, 
        p.imagePublicId,
        p.caption, 
        p.location, 
        p.createdAt, 
        p.updatedAt,
        u.username, 
        u.fullName, 
        u.profilePicture,
        (SELECT COUNT(*) FROM likes l WHERE l.postId = p.id) AS likesCount,    
        (SELECT COUNT(*) FROM comments c WHERE c.postId = p.id) AS commentsCount, 
        IF(? IS NULL, 0, EXISTS(SELECT 1 FROM likes l WHERE l.userId = ? AND l.postId = p.id)) AS isLiked
         ,IF(? IS NULL, 0, p.userId = ?) AS isOwnPost
      FROM posts p
      INNER JOIN users u ON p.userId = u.id
      WHERE (p.userId = ? OR p.userId IN (SELECT followeeId FROM follows WHERE followerId = ?))
    `;
    
    const params = [currentUserId, currentUserId, currentUserId, currentUserId, currentUserId, currentUserId];

    if (cursor) {
      // cursor is a MySQL DATETIME string: 'YYYY-MM-DD HH:MM:SS'
      query += ` AND p.createdAt < ?`;
      params.push(cursor);
    }

    query += ` ORDER BY p.createdAt DESC LIMIT ?`;
    params.push(limit + 1); // Fetch 1 extra to check if there is more

    const [rows] = await pool.query(query, params);
    
    const hasMore = rows.length > limit;
    const posts = hasMore ? rows.slice(0, limit) : rows;
    const toMySQLDate = (d) =>
    new Date(d).toISOString().slice(0, 19).replace('T', ' ');

    return {
      posts,
      hasMore,
      nextCursor: hasMore && posts.length > 0 ? toMySQLDate(posts[posts.length - 1].createdAt) : null,
    };
  },

  async getExplore(limit = 18, offset = 0) {
    const query = `
      SELECT 
        p.id, 
        p.imageUrl,
        (SELECT COUNT(*) FROM likes l WHERE l.postId = p.id) AS likesCount,    
        (SELECT COUNT(*) FROM comments c WHERE c.postId = p.id) AS commentsCount 
      FROM posts p
      INNER JOIN users u ON p.userId = u.id
      WHERE u.isPrivate = 0
      ORDER BY p.createdAt DESC
      LIMIT ? OFFSET ?
    `;
    const [rows] = await pool.query(query, [limit, offset]);
    return rows;
  },

  async countExplore() {
    const query = `
      SELECT COUNT(*) as total 
      FROM posts p 
      INNER JOIN users u ON p.userId = u.id 
      WHERE u.isPrivate = 0
    `;
    const [rows] = await pool.execute(query);
    return rows[0].total;
  },

  async getUserPosts(userId) {
    const query = `
      SELECT 
        p.id, 
        p.imageUrl,
        (SELECT COUNT(*) FROM likes l WHERE l.postId = p.id) AS likesCount,    
        (SELECT COUNT(*) FROM comments c WHERE c.postId = p.id) AS commentsCount 
      FROM posts p
      WHERE p.userId = ?
      ORDER BY p.createdAt DESC
    `;
    const [rows] = await pool.execute(query, [userId]);
    return rows;
  },

  async update(postId, updates) {
    const fields = [];
    const values = [];
    
    if (updates.caption !== undefined) {
      fields.push('caption = ?');
      values.push(updates.caption);
    }

    // ✅ ADD THIS
    if (updates.location !== undefined) {
      fields.push('location = ?');
      values.push(updates.location);
    }
    
    if (fields.length === 0) return false;

     
    values.push(postId);
    const query = `UPDATE posts SET ${fields.join(', ')} WHERE id = ?`;
    const [result] = await pool.execute(query, values);
    return result.affectedRows > 0;
  },

  async delete(postId) {
    const query = 'DELETE FROM posts WHERE id = ?';
    const [result] = await pool.execute(query, [postId]);
    return result.affectedRows > 0;
  }
};

module.exports = Post;
