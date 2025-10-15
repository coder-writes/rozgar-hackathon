# Troubleshooting: Save Changes Not Working

## ✅ Changes Made

### Frontend (`frontend/src/pages/RecruiterProfile.tsx`)
- ✅ Added authentication token check
- ✅ Added detailed console logging
- ✅ Added better error handling
- ✅ Verified redirect to /feed after save

### Backend (`backend/controllers/recruiterController.js`)
- ✅ Added detailed console logging
- ✅ Logs when profile is being created/updated
- ✅ Logs request data
- ✅ Logs success/failure

## 🔍 How to Debug

### Step 1: Check Backend is Running

Open a terminal and run:
```powershell
cd backend
npm run dev
```

You should see:
```
🚀 Server is running on http://localhost:3000
MongoDB connected successfully
```

### Step 2: Check Frontend Console

1. Open browser DevTools (F12)
2. Go to Console tab
3. Fill in the recruiter profile form
4. Click "Save Changes" or "Create Profile"

**Look for these logs:**
```
Saving profile data: {companyName: "...", ...}
Is new profile: true/false
API Endpoint: POST/PUT http://localhost:3000/api/recruiter/profile
API Response: {success: true, data: {...}}
```

### Step 3: Check Backend Console

In the terminal where backend is running, you should see:
```
Creating recruiter profile for user: 507f1f77bcf86cd799439011
Request body: { companyName: '...', ... }
Creating recruiter with data: { user: '...', companyName: '...' }
Recruiter profile created successfully: 507f1f77bcf86cd799439012
```

### Step 4: Check Network Tab

1. Open DevTools → Network tab
2. Click "Save Changes"
3. Look for a request to `/api/recruiter/profile`

**Check:**
- Request Method: POST or PUT
- Status Code: 201 (created) or 200 (updated)
- Request Headers: Authorization: Bearer [token]
- Request Payload: Your form data
- Response: {success: true, data: {...}}

## 🚨 Common Issues & Solutions

### Issue 1: "Authentication Error - Please login again"
**Cause:** JWT token is missing or invalid

**Solution:**
1. Logout and login again
2. Check localStorage in DevTools → Application → Local Storage
3. Verify `rozgar_token` exists
4. If missing, login again

### Issue 2: Backend returns 401 Unauthorized
**Cause:** Token validation failed

**Solution:**
```javascript
// Check middleware in backend/middleware/userAuth.js
// Verify token is being decoded correctly
```

### Issue 3: Backend returns 404 "Recruiter profile not found"
**Cause:** Trying to update a profile that doesn't exist

**Solution:**
- Frontend should detect if profile exists (isNewProfile state)
- If 404, use POST instead of PUT
- Create profile first, then update

### Issue 4: Backend returns 400 "Recruiter profile already exists"
**Cause:** Trying to create when profile already exists

**Solution:**
- Use PUT to update instead of POST
- Check `isNewProfile` state in frontend
- Fetch profile on component mount

### Issue 5: No request sent at all
**Cause:** Form validation failing or preventDefault not working

**Check:**
1. Form has `onSubmit={handleSubmit}`
2. Button is type="submit"
3. Required fields are filled
4. No JavaScript errors in console

### Issue 6: Request sent but no response
**Cause:** Backend error or database connection issue

**Check:**
1. Backend console for errors
2. MongoDB is running and connected
3. Database URL is correct in .env
4. Network connectivity

### Issue 7: "Failed to save profile" generic error
**Check backend logs for specific error:**
- Validation errors
- Database connection errors
- Schema mismatches

## 🧪 Manual Test

### Test API Directly with cURL:

```powershell
# Replace YOUR_TOKEN with actual JWT token from localStorage

# Create Profile (POST)
curl -X POST http://localhost:3000/api/recruiter/profile `
  -H "Content-Type: application/json" `
  -H "Authorization: Bearer YOUR_TOKEN" `
  -d '{
    "companyName": "Test Company",
    "establishedYear": 2020,
    "numberOfEmployees": 50,
    "industry": "Technology",
    "location": {
      "city": "Bangalore",
      "state": "Karnataka",
      "country": "India"
    }
  }'

# Update Profile (PUT)
curl -X PUT http://localhost:3000/api/recruiter/profile `
  -H "Content-Type: application/json" `
  -H "Authorization: Bearer YOUR_TOKEN" `
  -d '{
    "companyName": "Updated Company Name",
    "companyDescription": "We are a tech company"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Recruiter profile created/updated successfully",
  "data": {
    "_id": "...",
    "companyName": "Test Company",
    "user": "...",
    "profileCompletion": 45,
    ...
  }
}
```

## 📋 Checklist

Before clicking "Save Changes", verify:

- [ ] Backend server is running (http://localhost:3000)
- [ ] MongoDB is connected
- [ ] Frontend dev server is running (http://localhost:5173)
- [ ] User is logged in as recruiter
- [ ] JWT token exists in localStorage
- [ ] Required fields are filled:
  - [ ] Company Name
  - [ ] Established Year
  - [ ] Number of Employees
- [ ] No console errors in browser
- [ ] No errors in backend terminal

## 🎯 Expected Behavior

When everything works correctly:

1. Fill in form
2. Click "Create Profile" or "Save Changes"
3. **Frontend Console:** See logs with profile data
4. **Backend Console:** See "Creating/Updating recruiter profile..."
5. **Backend Console:** See "Recruiter profile created/updated successfully"
6. **Browser:** Success toast appears
7. **Wait 1.5 seconds**
8. **Browser:** Redirected to /feed page
9. **Database:** Profile saved in MongoDB

## 🔧 Quick Fix Commands

```powershell
# Restart backend
cd backend
npm run dev

# Clear localStorage (in browser console)
localStorage.clear()
# Then login again

# Check MongoDB connection
# In backend/.env
DATABASE_URL=mongodb://localhost:27017/rozgar

# Test API health
curl http://localhost:3000

# Check if API endpoint exists
curl http://localhost:3000/api/recruiter
```

## 📊 Verify Data in MongoDB

```javascript
// MongoDB shell
use rozgar

// Check if profile was created
db.recruiters.find().pretty()

// Check specific recruiter
db.recruiters.findOne({companyName: "Test Company"})

// Check user association
db.recruiters.findOne({user: ObjectId("YOUR_USER_ID")})

// Check latest created
db.recruiters.find().sort({createdAt: -1}).limit(1)
```

## 💡 Still Not Working?

1. **Check browser console** - Any red errors?
2. **Check backend console** - Any errors or logs?
3. **Check Network tab** - Is request being sent?
4. **Check MongoDB** - Is database connected?
5. **Try logging out and back in** - Fresh JWT token
6. **Clear browser cache and localStorage**
7. **Restart both frontend and backend servers**

## 📝 Test Scenario

1. **Logout** if already logged in
2. **Login as recruiter** (role: "recruiter")
3. Navigate to `/recruiter/profile`
4. Fill in ONLY required fields:
   - Company Name: "Test Company"
   - Established Year: 2020
   - Number of Employees: 10
5. Click "Create Profile"
6. Watch console logs
7. Should redirect to /feed
8. Navigate to `/profile` to verify data was saved

If this basic test works, add more fields gradually.

## ✉️ Error Messages Reference

| Error Message | Status Code | Meaning | Solution |
|--------------|-------------|---------|----------|
| Authentication Error | - | No token | Login again |
| Unauthorized | 401 | Invalid token | Login again |
| Recruiter profile already exists | 400 | Duplicate create | Use update instead |
| Recruiter profile not found | 404 | Profile doesn't exist | Create first |
| Server error | 500 | Backend crash | Check backend logs |
| Failed to save profile | - | Generic error | Check console |

Remember: Look at both **browser console** and **backend terminal** for full picture!
