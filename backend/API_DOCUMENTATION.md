# Rozgar Backend API

## 📋 User Profile API Documentation

### Setup

1. **Install Dependencies**
```bash
npm install
```

2. **Configure Environment Variables**
Copy `.env_example` to `.env` and update the values:
```bash
cp .env_example .env
```

3. **Start MongoDB**
Make sure MongoDB is running locally or update `MONGODB_URI` in `.env`

4. **Start Server**
```bash
npm start
```

The server will run on `http://localhost:3000`

---

## 🔗 API Endpoints

### 1. Create/Update User Profile
**POST** `/api/profile`

Creates a new user profile or updates existing one based on email.

**Content-Type:** `multipart/form-data`

**Request Body:**
- `name` (string, required): User's full name
- `email` (string, required): User's email address
- `location` (string, required): User's location
- `skills` (array or string, required): Array of skills or comma-separated string
- `workExperience` (string, required): User's work experience description
- `resume` (file, optional): Resume file (PDF, DOC, or DOCX, max 5MB)

**Example using cURL:**
```bash
curl -X POST http://localhost:3000/api/profile \
  -F "name=John Doe" \
  -F "email=john.doe@example.com" \
  -F "location=New York, USA" \
  -F "skills=[\"JavaScript\",\"React\",\"Node.js\"]" \
  -F "workExperience=5 years of experience in web development..." \
  -F "resume=@/path/to/resume.pdf"
```

**Success Response (201/200):**
```json
{
  "success": true,
  "message": "Profile created successfully",
  "data": {
    "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "location": "New York, USA",
    "skills": ["JavaScript", "React", "Node.js"],
    "workExperience": "5 years of experience...",
    "resume": {
      "filename": "resume-1234567890.pdf",
      "path": "/uploads/resumes/resume-1234567890.pdf",
      "mimetype": "application/pdf",
      "size": 245680,
      "uploadedAt": "2025-10-14T10:30:00.000Z"
    },
    "profileCompletion": 100,
    "isActive": true,
    "createdAt": "2025-10-14T10:30:00.000Z",
    "updatedAt": "2025-10-14T10:30:00.000Z"
  }
}
```

---

### 2. Get User Profile by Email
**GET** `/api/profile/:email`

Retrieves a specific user's profile by email.

**Example:**
```bash
curl http://localhost:3000/api/profile/john.doe@example.com
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "location": "New York, USA",
    "skills": ["JavaScript", "React", "Node.js"],
    "workExperience": "5 years of experience...",
    "profileCompletion": 100,
    "skillsCount": 3
  }
}
```

---

### 3. Get All User Profiles
**GET** `/api/profile`

Retrieves all user profiles with optional filtering and pagination.

**Query Parameters:**
- `skill` (optional): Filter by skill
- `location` (optional): Filter by location (case-insensitive partial match)
- `page` (optional, default: 1): Page number
- `limit` (optional, default: 10): Number of results per page

**Examples:**
```bash
# Get all profiles
curl http://localhost:3000/api/profile

# Filter by skill
curl http://localhost:3000/api/profile?skill=JavaScript

# Filter by location
curl http://localhost:3000/api/profile?location=New York

# Pagination
curl http://localhost:3000/api/profile?page=2&limit=20
```

**Success Response (200):**
```json
{
  "success": true,
  "data": [...],
  "totalPages": 5,
  "currentPage": 1,
  "totalUsers": 50
}
```

---

### 4. Download Resume
**GET** `/api/profile/resume/:email`

Downloads the resume file for a specific user.

**Example:**
```bash
curl -O http://localhost:3000/api/profile/resume/john.doe@example.com
```

**Success Response:** File download

---

### 5. Delete Resume
**DELETE** `/api/profile/resume/:email`

Deletes the resume file for a specific user.

**Example:**
```bash
curl -X DELETE http://localhost:3000/api/profile/resume/john.doe@example.com
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Resume deleted successfully",
  "data": {...}
}
```

---

### 6. Delete User Profile (Soft Delete)
**DELETE** `/api/profile/:email`

Soft deletes a user profile (sets `isActive` to false).

**Example:**
```bash
curl -X DELETE http://localhost:3000/api/profile/john.doe@example.com
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Profile deleted successfully"
}
```

---

## 📊 User Model Schema

```javascript
{
  name: String (required, 2-100 chars),
  email: String (required, unique, valid email),
  location: String (required, max 200 chars),
  skills: [String] (required, at least 1 skill),
  workExperience: String (required, 10-2000 chars),
  resume: {
    filename: String,
    path: String,
    mimetype: String,
    size: Number,
    uploadedAt: Date
  },
  profileCompletion: Number (0-100, auto-calculated),
  isActive: Boolean (default: true),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

---

## 🎯 Profile Completion Calculation

The `profileCompletion` field is automatically calculated:
- **Name**: 20%
- **Email**: 20%
- **Location**: 15%
- **Work Experience**: 15%
- **Skills**: 20%
- **Resume**: 10%

**Total**: 100%

---

## 🚀 Testing with Postman/Thunder Client

### Create Profile with Resume

1. Set method to **POST**
2. URL: `http://localhost:3000/api/profile`
3. Select **Body** → **form-data**
4. Add fields:
   - `name`: John Doe
   - `email`: john.doe@example.com
   - `location`: New York, USA
   - `skills`: ["JavaScript","React","Node.js"]
   - `workExperience`: 5 years of experience in web development...
   - `resume`: [Select File] → Choose your resume file

---

## 📁 File Upload Details

- **Allowed formats**: PDF, DOC, DOCX
- **Max file size**: 5MB
- **Storage location**: `backend/uploads/resumes/`
- **File naming**: `resume-{timestamp}-{random}.{ext}`

---

## ⚠️ Error Responses

**400 Bad Request:**
```json
{
  "success": false,
  "message": "Validation error message",
  "errors": {...}
}
```

**404 Not Found:**
```json
{
  "success": false,
  "message": "User not found"
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error"
}
```

---

## 🔒 Security Notes

⚠️ **Important**: The current implementation does not include authentication. In production:

1. Add JWT authentication middleware
2. Protect routes with auth checks
3. Validate user ownership before updates/deletes
4. Add rate limiting
5. Sanitize file uploads
6. Use environment variables for sensitive data
7. Enable HTTPS in production

---

## 📝 Next Steps

1. Install new dependencies: `npm install`
2. Start MongoDB server
3. Configure `.env` file
4. Run the server: `npm start`
5. Test endpoints using Postman or cURL

---

## 🐛 Troubleshooting

**MongoDB Connection Error:**
- Make sure MongoDB is running
- Check `MONGODB_URI` in `.env`

**File Upload Error:**
- Verify file size is under 5MB
- Ensure file type is PDF, DOC, or DOCX
- Check `uploads/resumes` directory exists and has write permissions

**Port Already in Use:**
- Change `PORT` in `.env`
- Kill existing process: `lsof -ti:3000 | xargs kill -9` (Mac/Linux)
