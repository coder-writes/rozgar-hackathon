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
import recruiterRoutes from './routes/recruiter.js';

// Load environment variables
// dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

connectDB();

const allowedOrigins = [
  'http://localhost:5173', 
  'http://localhost:8080', 
  'http://localhost:3000',
  'https://rozgar-hackathon.vercel.app',
  'https://rozgar-hackathon.onrender.com'
];

// Middleware - CORS must be before routes
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
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['set-cookie'],
  preflightContinue: false,
  optionsSuccessStatus: 204
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

// Handle preflight requests explicitly
app.options('*', cors());

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
      recruiter: '/api/recruiter',
    },
  });
});
app.use('/api/auth', authRouter);
app.use('/api/profile', profileRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/communities', communitiesRoutes);
app.use('/api/feed', feedRoutes);
app.use('/api/applications', applicationsRoutes);
app.use('/api/recruiter', recruiterRoutes);

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