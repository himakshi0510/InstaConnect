const app = require('./src/app');
const pool = require('./src/config/database');
require('dotenv').config();

const PORT = process.env.PORT || 5000;

// Test DB Connection before starting
async function startServer() {
  try {
    // Attempt database query to verify connection
    const [rows] = await pool.query('SELECT 1');
    console.log('Database connection pool verified successfully.');
    
    const server = app.listen(PORT, () => {
      console.log(`Server is running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    });

    // Handle graceful shutdown
    const shutdown = async () => {
      console.log('Shutting down server...');
      server.close(async () => {
        console.log('Server stopped.');
        await pool.end();
        console.log('Database pool closed.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);

  } catch (error) {
    console.error('Failed to start server due to database connectivity issue:', error);
    process.exit(1);
  }
}

// Global Exception Handler
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

startServer();
