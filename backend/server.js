import 'dotenv/config';
import express from 'express';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import connectDB from './config/mongodb.js';
import authRouter from './routes/authRoutes.js';
import mongoose from 'mongoose';
import cors from 'cors';
import profileRoutes from './routes/profile.js';
import dashboardRoutes from './routes/dashboard.js';
import communitiesRoutes from './routes/communities.js';
import feedRoutes from './routes/feed.js';
import applicationsRoutes from './routes/applications.js';

// Load environment variables
// dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

connectDB();

const allowedOrigins = ['http://localhost:5173', 'http://localhost:8080' , "http://localhost:3000"];

// Middleware - CORS must be before routes
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: process.env.NODE_ENV === 'production' }
}));

//  API EndPoints
app.get('/', (req, res) => { 
  res.json({
    message: 'Rozgar API is running',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      profile: '/api/profile',
      dashboard: '/api/dashboard',
      communities: '/api/communities',
      feed: '/api/feed',
      applications: '/api/applications',
    },
  });
});
app.use('/api/auth', authRouter);
app.use('/api/profile', profileRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/communities', communitiesRoutes);
app.use('/api/feed', feedRoutes);
app.use('/api/applications', applicationsRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: err.message || 'Something went wrong!',
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});