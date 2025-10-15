# Profile API Integration

## ✅ Integration Complete!

The frontend Profile page is now fully integrated with the backend API at `http://localhost:3000/api/profile`.

## 🔗 What's Connected:

### 1. **Profile Data Loading**
- When the page loads, it fetches existing profile data using the user's email
- If profile exists, it displays the data in view mode
- If no profile exists, it shows an empty form in edit mode

### 2. **Profile Data Saving**
- Form submits to `POST /api/profile` endpoint
- Sends all form data including:
  - Name
  - Email
  - Location
  - Work Experience
  - Skills (as JSON array)
  - Resume file (if selected)

### 3. **Features Implemented**

#### Loading States
- ✅ Loading spinner while fetching profile data
- ✅ Loading button state during form submission
- ✅ Disabled buttons while submitting

#### User Feedback
- ✅ Success toast notifications
- ✅ Error toast notifications with details
- ✅ File upload validation (max 5MB)

#### Data Synchronization
- ✅ Profile completion percentage synced from backend
- ✅ Form data populated from database
- ✅ Edit/View mode toggle

## 🚀 How to Test:

### 1. Start Backend Server
```bash
cd backend
npm start
```
Backend should run on `http://localhost:3000`

### 2. Start Frontend Development Server
```bash
cd frontend
npm run dev
```

### 3. Test the Flow
1. Navigate to `/profile` page (must be logged in)
2. Fill in the form:
   - Name (required)
   - Email (required)
   - Location (required)
   - Skills (add multiple)
   - Work Experience (required)
   - Resume (optional - upload PDF, DOC, or DOCX)
3. Click "Save Profile"
4. See success message
5. Refresh page - data should persist!

## 📝 API Configuration

The API endpoint is configured in `src/lib/api.ts`:

```typescript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
```

To change the API URL for production, create a `.env` file in the frontend directory:

```env
VITE_API_BASE_URL=https://your-production-api.com
```

## 🔍 Data Flow

```
User fills form → Submit → 
  → Create FormData object
  → Append all fields
  → POST to /api/profile
  → Backend validates & saves to MongoDB
  → Returns success with profile data
  → Update UI with profile completion %
  → Show success toast
  → Switch to view mode
```

## 🐛 Troubleshooting

### CORS Issues
If you see CORS errors, make sure the backend has CORS enabled (already configured in `server.js`).

### MongoDB Connection
Make sure MongoDB is running and the connection string in `.env` is correct.

### File Upload Errors
- Check file size (max 5MB)
- Verify file type (PDF, DOC, DOCX only)
- Ensure `uploads/resumes` directory exists

### Profile Not Loading
- Check browser console for errors
- Verify backend is running on port 3000
- Test API endpoint directly: `http://localhost:3000/api/profile/your-email@example.com`

## 📊 API Response Format

### Success Response
```json
{
  "success": true,
  "message": "Profile created successfully",
  "data": {
    "_id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "location": "New York, USA",
    "skills": ["JavaScript", "React"],
    "workExperience": "...",
    "resume": {
      "filename": "resume-123.pdf",
      "path": "/uploads/resumes/resume-123.pdf",
      "mimetype": "application/pdf",
      "size": 245680,
      "uploadedAt": "2025-10-14T10:30:00.000Z"
    },
    "profileCompletion": 100,
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "errors": { ... }
}
```

## 🎯 Next Steps

1. ✅ Test profile creation
2. ✅ Test profile update
3. ✅ Test file upload
4. ⚠️ Add authentication to protect routes
5. ⚠️ Add email validation
6. ⚠️ Deploy to production
7. ⚠️ Update API_BASE_URL for production

---

**Status**: ✅ **FULLY INTEGRATED & READY TO USE!**
