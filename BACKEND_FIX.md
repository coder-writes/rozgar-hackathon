# Quick Fix: Backend Server Not Starting

## The Issue
The backend server is crashing. Based on the error history, it was due to the authentication middleware import.

## ✅ Already Fixed

The following has been corrected:

### File: `backend/routes/recruiter.js`

**Was (WRONG):**
```javascript
import { authenticateToken } from '../middleware/userAuth.js';
```

**Now (CORRECT):**
```javascript
import { authMiddleware } from '../middleware/userAuth.js';
```

## 🚀 How to Start the Backend Server

### Option 1: Using npm script
```powershell
cd backend
npm run dev
```

### Option 2: Using node directly
```powershell
cd backend
node server.js
```

## ✅ Verify Backend is Running

You should see:
```
🚀 Server is running on http://localhost:3000
MongoDB connected successfully
```

## 🔍 If Server Still Won't Start

### 1. Check for other errors
Look at the terminal output carefully for any error messages.

### 2. Verify all imports in recruiter.js
```javascript
// File: backend/routes/recruiter.js
import express from 'express';
import {
    getRecruiterProfile,
    createRecruiterProfile,
    updateRecruiterProfile,
    getAllRecruiters,
    getRecruiterById,
    deleteRecruiterProfile,
} from '../controllers/recruiterController.js';
import { authMiddleware } from '../middleware/userAuth.js';  // ← This must be correct

const router = express.Router();

// Protected routes (require authentication)
router.get('/profile', authMiddleware, getRecruiterProfile);
router.post('/profile', authMiddleware, createRecruiterProfile);
router.put('/profile', authMiddleware, updateRecruiterProfile);
router.delete('/profile', authMiddleware, deleteRecruiterProfile);

// Public routes
router.get('/', getAllRecruiters);
router.get('/:id', getRecruiterById);

export default router;
```

### 3. Verify MongoDB Connection
Check if MongoDB URI is correct in `.env`:
```
DATABASE_URL=mongodb://localhost:27017/rozgar
# OR
DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/rozgar
```

### 4. Check if port 3000 is already in use
```powershell
# Kill process on port 3000 (if needed)
netstat -ano | findstr :3000
taskkill /PID <process_id> /F
```

### 5. Check Node.js version
```powershell
node --version
# Should be v16 or higher
```

## 🧪 Test the Backend

Once server is running, test the API:

### Test 1: Server Health
```powershell
curl http://localhost:3000
```

Expected response:
```json
{
  "message": "Rozgar API is running",
  "version": "1.0.0",
  "endpoints": {
    "auth": "/api/auth",
    "profile": "/api/profile",
    "dashboard": "/api/dashboard",
    "communities": "/api/communities",
    "feed": "/api/feed",
    "applications": "/api/applications",
    "recruiter": "/api/recruiter"
  }
}
```

### Test 2: Recruiter Profile Endpoint (requires auth)
```powershell
# Get all recruiters (public)
curl http://localhost:3000/api/recruiter
```

## 📝 Complete Startup Checklist

- [ ] Backend server is running on port 3000
- [ ] MongoDB is connected
- [ ] Frontend dev server is running (port 5173)
- [ ] No console errors in browser
- [ ] Can access http://localhost:5173
- [ ] Can login as recruiter
- [ ] Can access /recruiter/profile page

## 🎯 Once Backend is Running

The save functionality will work automatically:

1. Login as recruiter
2. Go to `/recruiter/profile`
3. Fill in company information
4. Click "Create Profile" or "Save Changes"
5. ✅ Data saves to MongoDB
6. Redirects to `/profile` to view

## 💡 Pro Tip

Keep both terminals open:
- **Terminal 1:** Backend (`cd backend && npm run dev`)
- **Terminal 2:** Frontend (`cd frontend && npm run dev`)

This way you can see logs from both servers simultaneously.
