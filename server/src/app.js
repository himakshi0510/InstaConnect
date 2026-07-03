const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const path = require('path');
const { generalLimiter } = require('./middleware/rateLimiter');
const errorHandler = require('./middleware/errorHandler');
const notFoundHandler = require('./middleware/notFoundHandler');
const routes = require('./routes');
require('dotenv').config();

const app = express();

// Security Headers
app.use(helmet());

// Inside your backend src/app.js file:

// Updated CORS configuration to support dynamic development requests safely
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:3000',
  'http://127.0.0.1:3000'
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Compression
app.use(compression());

// Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve local fallback uploads
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// General Rate Limiter
app.use('/api', generalLimiter);

// API Routes
app.use('/api', routes);

// 404 Route Not Found
app.use(notFoundHandler);

// Global Error Handler
app.use(errorHandler);

module.exports = app;
