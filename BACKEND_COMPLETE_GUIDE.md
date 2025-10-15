# Backend Implementation - Complete Guide

## Overview
This document provides a complete guide to the backend implementation for the Rozgar application. All missing backend endpoints have been implemented to match the frontend requirements.

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (running locally or connection string)
- npm or yarn

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create .env file:**
   Create a `.env` file in the `backend` directory with the following variables:
   ```env
   PORT=4000
   MONGODB_URI=mongodb://localhost:27017/rozgar
   JWT_SECRET=your_jwt_secret_key_here
   SESSION_SECRET=your_session_secret_key_here
   
   # Email configuration (for OTP)
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_password
   ```

4. **Start the backend server:**
   ```bash
   npm start
   ```
   
   The server will start on `http://localhost:4000`

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   bun install
   ```

3. **Environment configuration:**
   A `.env` file has been created in the frontend directory with:
   ```env
   VITE_API_BASE_URL=http://localhost:4000
   ```

4. **Start the frontend:**
   ```bash
   npm run dev
   # or
   bun run dev
   ```
   
   The frontend will start on `http://localhost:5173`

## Implemented Endpoints

### Applications API (`/api/applications`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/applications` | Get all applications for user | Yes |
| GET | `/api/applications/:id` | Get single application details | Yes |
| POST | `/api/applications` | Create new job application | Yes |
| PUT | `/api/applications/:id/status` | Update application status | Yes |
| GET | `/api/applications/:id/interviews` | **NEW** Get all interviews | Yes |
| POST | `/api/applications/:id/interviews` | Add interview to application | Yes |
| GET | `/api/applications/:id/followups` | **NEW** Get all follow-ups | Yes |
| POST | `/api/applications/:id/followups` | Add follow-up to application | Yes |
| GET | `/api/applications/:id/notes` | **NEW** Get application notes | Yes |
| PUT | `/api/applications/:id/notes` | Update application notes | Yes |
| POST | `/api/applications/:id/deadlines` | Add deadline to application | Yes |
| PUT | `/api/applications/:id/archive` | Archive/unarchive application | Yes |
| DELETE | `/api/applications/:id` | Delete application | Yes |
| GET | `/api/applications/stats/overview` | Get application statistics | Yes |

### Feed API (`/api/feed`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/feed` | Get personalized feed | Yes |
| POST | `/api/feed/posts` | **NEW** Create new post | Yes |
| GET | `/api/feed/community/:communityId` | Get posts from specific community | Yes |
| POST | `/api/feed/posts/:postId/like` | Like/unlike a post | Yes |
| POST | `/api/feed/posts/:postId/comments` | Add comment to post | Yes |
| GET | `/api/feed/posts/:postId/comments` | Get comments for post | Yes |
| POST | `/api/feed/posts/:postId/share` | Share a post | Yes |
| POST | `/api/feed/posts/:postId/view` | Record post view | Yes |

### Communities API (`/api/communities`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/communities` | Get all communities with filters | Yes |
| GET | `/api/communities/my` | Get user's joined communities | Yes |
| GET | `/api/communities/featured` | Get featured communities | Yes |
| GET | `/api/communities/trending` | Get trending communities | Yes |
| GET | `/api/communities/:id` | Get community details | Yes |
| POST | `/api/communities` | Create new community | Yes |
| POST | `/api/communities/:id/join` | Join a community | Yes |
| POST | `/api/communities/:id/leave` | Leave a community | Yes |
| GET | `/api/communities/:id/posts` | **NEW** Get community posts | Yes |
| POST | `/api/communities/:id/posts` | **NEW** Create post in community | Yes |
| POST | `/api/communities/:id/posts/:postId/like` | **NEW** Like community post | Yes |
| GET | `/api/communities/:id/posts/:postId/comments` | **NEW** Get post comments | Yes |
| POST | `/api/communities/:id/posts/:postId/comments` | **NEW** Add comment to post | Yes |
| GET | `/api/communities/:id/members` | Get community members | Yes |

### Dashboard API (`/api/dashboard`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/dashboard/overview` | Get dashboard overview stats | Yes |
| GET | `/api/dashboard/applications` | Get recent applications | Yes |
| GET | `/api/dashboard/recommendations` | Get job recommendations | Yes |
| GET | `/api/dashboard/courses` | Get ongoing courses | Yes |
| GET | `/api/dashboard/applications/stats` | Get application statistics by status | Yes |
| PUT | `/api/dashboard/recommendations/:id/view` | Mark recommendation as viewed | Yes |
| PUT | `/api/dashboard/recommendations/:id/click` | Mark recommendation as clicked | Yes |

### Profile API (`/api/profile`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/profile` | Get user profile | No |
| POST | `/api/profile` | Create/update profile | No |
| GET | `/api/profile/:email` | Get profile by email | No |
| GET | `/api/profile/resume/:email` | Download resume | No |

### Auth API (`/api/auth`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login user | No |
| POST | `/api/auth/send-verify-otp` | Send OTP for verification | No |
| POST | `/api/auth/verify-otp` | Verify OTP | No |

## Key Features Implemented

### 1. Complete CRUD Operations
- All routes now support full CRUD operations where applicable
- Consistent error handling across all endpoints
- Proper input validation

### 2. Authentication & Authorization
- All protected routes use `authMiddleware`
- Community membership validation
- Owner-based access control for applications

### 3. Pagination Support
- All list endpoints support pagination
- Query parameters: `page`, `limit`
- Returns pagination metadata

### 4. Engagement Features
- Like/unlike functionality
- Comment system with pagination
- Share and view tracking
- Post engagement metrics

### 5. Data Population
- Proper use of Mongoose `.populate()` for related data
- Author, community, and user details included in responses
- Optimized queries for better performance

## Testing the Implementation

### Using cURL

1. **Create a post:**
```bash
curl -X POST http://localhost:4000/api/feed/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "communityId": "COMMUNITY_ID",
    "title": "Test Post",
    "content": "This is a test post content",
    "type": "post"
  }'
```

2. **Get interviews for an application:**
```bash
curl -X GET http://localhost:4000/api/applications/APPLICATION_ID/interviews \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

3. **Like a community post:**
```bash
curl -X POST http://localhost:4000/api/communities/COMMUNITY_ID/posts/POST_ID/like \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Using Postman

1. Import the collection (create one with all endpoints)
2. Set up environment variables:
   - `baseUrl`: `http://localhost:4000`
   - `token`: Your JWT token after login
3. Test each endpoint individually

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message (in development)"
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `403` - Forbidden (authorization errors)
- `404` - Not Found
- `500` - Internal Server Error

## Database Models

### Key Models Used:
1. **User** - User authentication and profile
2. **Community** - Community management
3. **Post** - Posts in communities and feed
4. **JobApplication** - Job application tracking
5. **JobRecommendation** - AI-powered job recommendations
6. **Course/CourseProgress** - Learning management

### Virtual Fields:
- `Post.likeCount`, `Post.commentCount`, `Post.shareCount`, `Post.viewCount`
- `Community.memberCount`
- `JobApplication.daysSinceApplication`

### Instance Methods:
- `Post.isLikedBy(userId)`
- `Community.isMember(userId)`, `Community.isAdmin(userId)`
- `JobApplication.getNextInterview()`, `JobApplication.getUpcomingDeadlines()`

## CORS Configuration

The backend allows requests from:
- `http://localhost:5173` (Vite dev server)
- `http://localhost:8080`
- `http://localhost:3000`

Credentials are enabled for cookie-based authentication.

## Next Steps

1. **Start both servers:**
   ```bash
   # Terminal 1 - Backend
   cd backend && npm start
   
   # Terminal 2 - Frontend
   cd frontend && npm run dev
   ```

2. **Test the application:**
   - Register a new user
   - Join communities
   - Create posts
   - Apply for jobs
   - Track applications

3. **Monitor logs:**
   - Backend logs will show API requests
   - Check for any errors in the console

## Troubleshooting

### Port Already in Use
If port 4000 is already in use, change the `PORT` in backend `.env`:
```env
PORT=5000
```

And update frontend `.env`:
```env
VITE_API_BASE_URL=http://localhost:5000
```

### CORS Errors
Make sure the frontend origin is added to `allowedOrigins` in `backend/server.js`

### MongoDB Connection Issues
- Ensure MongoDB is running
- Check connection string in `.env`
- Verify network connectivity

### Authentication Errors
- Check JWT token is being sent in Authorization header
- Verify token hasn't expired
- Ensure user session is active

## Production Deployment

### Environment Variables for Production:
```env
NODE_ENV=production
PORT=4000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/dbname
JWT_SECRET=strong_random_secret
SESSION_SECRET=strong_random_secret
CORS_ORIGIN=https://your-frontend-domain.com
```

### Security Considerations:
1. Use HTTPS in production
2. Set secure cookies
3. Implement rate limiting
4. Add input sanitization
5. Enable CORS only for trusted origins
6. Use environment-specific configurations

## Support

For issues or questions:
1. Check the console logs for errors
2. Verify all environment variables are set
3. Ensure MongoDB is running
4. Check network connectivity
5. Review the API documentation in `backend/API_DOCUMENTATION.md`

---

**Last Updated:** October 15, 2025
**Version:** 1.0.0
**Status:** ✅ Complete Implementation
