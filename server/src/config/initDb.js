const mysql = require('mysql2/promise');
require('dotenv').config();

const queries = [
  `CREATE TABLE IF NOT EXISTS users (
    id                    INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    username              VARCHAR(30) UNIQUE NOT NULL,
    fullName              VARCHAR(50) NOT NULL,
    email                 VARCHAR(255) UNIQUE NOT NULL,
    passwordHash          VARCHAR(255) NOT NULL,
    profilePicture        VARCHAR(500) DEFAULT NULL,
    profilePicturePublicId VARCHAR(255) DEFAULT NULL,
    bio                   VARCHAR(150) DEFAULT NULL,
    website               VARCHAR(255) DEFAULT NULL,
    role                  ENUM('USER','ADMIN') NOT NULL DEFAULT 'USER',
    isPrivate             TINYINT(1) NOT NULL DEFAULT 0,
    createdAt             TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt             TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_users_createdAt (createdAt)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

  `CREATE TABLE IF NOT EXISTS posts (
    id              INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    userId          INT UNSIGNED NOT NULL,
    imageUrl        VARCHAR(500) NOT NULL,
    imagePublicId   VARCHAR(255) NOT NULL,
    caption         TEXT DEFAULT NULL,
    location        VARCHAR(100) DEFAULT NULL,
    createdAt       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_posts_userId (userId),
    INDEX idx_posts_createdAt (createdAt),
    INDEX idx_posts_userId_createdAt (userId, createdAt),
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

  `CREATE TABLE IF NOT EXISTS likes (
    id        INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    userId    INT UNSIGNED NOT NULL,
    postId    INT UNSIGNED NOT NULL,
    createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE INDEX idx_likes_user_post (userId, postId),
    INDEX idx_likes_postId (postId),
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (postId) REFERENCES posts(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

  `CREATE TABLE IF NOT EXISTS comments (
    id              INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    postId          INT UNSIGNED NOT NULL,
    userId          INT UNSIGNED NOT NULL,
    parentCommentId INT UNSIGNED DEFAULT NULL,
    body            TEXT NOT NULL,
    createdAt       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_comments_postId (postId),
    INDEX idx_comments_userId (userId),
    INDEX idx_comments_postId_createdAt (postId, createdAt),
    FOREIGN KEY (postId) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (parentCommentId) REFERENCES comments(id) ON DELETE SET NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

  `CREATE TABLE IF NOT EXISTS follows (
    id          INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    followerId  INT UNSIGNED NOT NULL,
    followeeId  INT UNSIGNED NOT NULL,
    createdAt   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE INDEX idx_follows_pair (followerId, followeeId),
    INDEX idx_follows_followeeId (followeeId),
    INDEX idx_follows_followerId (followerId),
    FOREIGN KEY (followerId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (followeeId) REFERENCES users(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

  `CREATE TABLE IF NOT EXISTS notifications (
    id              INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    recipientUserId INT UNSIGNED NOT NULL,
    senderUserId    INT UNSIGNED NOT NULL,
    type            ENUM('LIKE','COMMENT','FOLLOW') NOT NULL,
    postId          INT UNSIGNED DEFAULT NULL,
    commentId       INT UNSIGNED DEFAULT NULL,
    isRead          TINYINT(1) NOT NULL DEFAULT 0,
    createdAt       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_notif_recipient (recipientUserId),
    INDEX idx_notif_recipient_read (recipientUserId, isRead),
    FOREIGN KEY (recipientUserId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (senderUserId)    REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (postId)          REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (commentId)       REFERENCES comments(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

  `CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id        INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    userId    INT UNSIGNED NOT NULL,
    tokenHash VARCHAR(255) NOT NULL,
    expiresAt TIMESTAMP NOT NULL,
    createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_prt_userId (userId),
    INDEX idx_prt_expiresAt (expiresAt),
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`
];

async function initializeDatabase() {
  const host = process.env.DB_HOST || 'localhost';
  const port = parseInt(process.env.DB_PORT || '3306');
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';
  const database = process.env.DB_NAME || 'instaconnect';

  console.log(`Connecting to MySQL at ${host}:${port} as ${user}...`);
  let connection;
  try {
    connection = await mysql.createConnection({ host, port, user, password });
    
    console.log(`Creating database "${database}" if it doesn't exist...`);
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\`;`);
    await connection.query(`USE \`${database}\`;`);

    console.log('Creating database tables...');
    for (const query of queries) {
      await connection.query(query);
    }

    console.log('Database tables verified/created successfully!');
  } catch (error) {
    console.error('Database initialization failed:', error);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
}

if (require.main === module) {
  initializeDatabase();
}

module.exports = initializeDatabase;
