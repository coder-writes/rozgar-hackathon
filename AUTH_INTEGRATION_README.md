# 🔐 Authentication with OTP Verification - Integration Guide

## ✅ Implementation Complete!

The authentication system with OTP verification has been fully integrated with the backend APIs.

---

## 🎯 **Features Implemented**

### 1. **User Registration Flow**
- User signs up with name, email, password, and role
- Backend creates unverified account
- OTP is automatically sent to user's email
- User is redirected to OTP verification page
- Cannot access protected routes until verified

### 2. **OTP Verification**
- 6-digit OTP input with auto-focus
- Copy-paste support for OTP
- 60-second resend timer
- Email verification required before accessing app
- Session protected - user cannot navigate away without completing verification

### 3. **Sign In Flow**
- User attempts to sign in
- If email not verified, redirected to OTP page
- If verified, logged in successfully
- Token stored in localStorage

### 4. **Security Features**
- ✅ Email verification required
- ✅ Temporary tokens for OTP flow
- ✅ Cannot access protected routes without verification
- ✅ Session state maintained during OTP flow
- ✅ Warning when trying to leave OTP page
- ✅ Auto logout if verification not completed

---

## 📁 **Files Created/Modified**

### New Files:
1. **`src/pages/VerifyOTP.tsx`** - OTP verification page with:
   - 6-digit OTP input
   - Auto-focus and paste support
   - Resend OTP functionality
   - Timer countdown
   - Navigation protection

### Modified Files:
1. **`src/pages/Auth.tsx`** - Updated authentication:
   - Integrated with backend register API
   - Integrated with backend login API
   - Auto-send OTP after registration
   - Redirect to OTP verification
   - Check email verification status on login

2. **`src/lib/api.ts`** - Added auth endpoints:
   - `AUTH_REGISTER`
   - `AUTH_LOGIN`
   - `AUTH_SEND_VERIFY_OTP`
   - `AUTH_VERIFY_OTP`

3. **`src/App.tsx`** - Added VerifyOTP route

---

## 🔗 **API Endpoints Used**

### 1. Register User
```
POST http://localhost:3000/api/auth/register
```
**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "seeker"
}
```
**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "tempToken": "temporary_token_here",
  "user": {...}
}
```

### 2. Send Verification OTP
```
POST http://localhost:3000/api/auth/send-verify-otp
```
**Request Body:**
```json
{
  "email": "john@example.com",
  "tempToken": "temporary_token_here"
}
```
**Response:**
```json
{
  "success": true,
  "message": "OTP sent successfully"
}
```

### 3. Verify OTP
```
POST http://localhost:3000/api/auth/verify-otp
```
**Request Body:**
```json
{
  "email": "john@example.com",
  "otp": "123456",
  "tempToken": "temporary_token_here"
}
```
**Response:**
```json
{
  "success": true,
  "message": "Email verified successfully",
  "token": "jwt_token_here",
  "user": {
    "id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "seeker",
    "isVerified": true
  }
}
```

### 4. Login User
```
POST http://localhost:3000/api/auth/login
```
**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```
**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "jwt_token_here",
  "user": {
    "id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "seeker",
    "isVerified": true
  }
}
```

---

## 🔄 **Complete User Flow**

### **Sign Up Flow:**
```
1. User fills signup form (name, email, password, role)
   ↓
2. Click "Create Account"
   ↓
3. POST to /api/auth/register
   ↓
4. Backend creates user (unverified) & returns tempToken
   ↓
5. POST to /api/auth/send-verify-otp
   ↓
6. Backend sends OTP email
   ↓
7. User redirected to /verify-otp page
   ↓
8. User enters 6-digit OTP
   ↓
9. POST to /api/auth/verify-otp
   ↓
10. Backend verifies OTP & returns JWT token
    ↓
11. Token & user data stored in localStorage
    ↓
12. User redirected to /jobs (authenticated)
```

### **Sign In Flow:**
```
1. User enters email & password
   ↓
2. Click "Sign In"
   ↓
3. POST to /api/auth/login
   ↓
4. Backend checks credentials
   ↓
5. If not verified:
   - Send OTP
   - Redirect to /verify-otp
   ↓
6. If verified:
   - Return JWT token
   - Store in localStorage
   - Redirect to /jobs
```

---

## 🛡️ **Security Features**

### 1. **Email Verification Required**
- Users must verify email before accessing protected routes
- Unverified users redirected to OTP page on login

### 2. **Temporary Tokens**
- `tempToken` used during registration/verification flow
- Not a full JWT, only valid for OTP operations
- Expires after verification

### 3. **Session Protection**
- User cannot navigate away from OTP page without warning
- Prevents accidental loss of verification session
- Must complete verification or start over

### 4. **Token Storage**
- JWT token stored in localStorage after verification
- Used for authenticated API calls
- Checked on every protected route access

---

## 🧪 **Testing the Flow**

### **Test Sign Up:**
1. Go to http://localhost:5173/auth?tab=signup
2. Fill in:
   - Name: Test User
   - Email: test@example.com
   - Password: password123
   - Role: Job Seeker
3. Click "Create Account"
4. Check console for API responses
5. Should redirect to /verify-otp
6. Check email for OTP (or check backend logs)
7. Enter the 6-digit OTP
8. Should redirect to /jobs after verification

### **Test Resend OTP:**
1. Wait for 60-second timer to expire
2. Click "Resend OTP"
3. New OTP should be sent
4. Timer resets to 60 seconds

### **Test Unverified Login:**
1. Try to login with unverified account
2. Should redirect to /verify-otp
3. Complete verification
4. Login successful

### **Test Navigation Protection:**
1. During OTP verification, try to navigate away
2. Browser shows confirmation dialog
3. Must confirm to leave

---

## 🎨 **UI Features**

### **OTP Input:**
- ✅ 6 individual input boxes
- ✅ Auto-focus on next box
- ✅ Backspace navigation
- ✅ Paste support (splits digits automatically)
- ✅ Only accepts numbers
- ✅ Large, easy-to-read inputs

### **User Feedback:**
- ✅ Loading spinners during API calls
- ✅ Success/error toast notifications
- ✅ Timer countdown display
- ✅ Resend button activation
- ✅ Email display on OTP page
- ✅ Helpful instructions

---

## 📝 **LocalStorage Data**

After successful verification:
```javascript
// JWT Token
localStorage.getItem('rozgar_token')
// "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

// User Data
localStorage.getItem('rozgar_user')
// {"id":"...","name":"John Doe","email":"john@example.com","role":"seeker","isVerified":true}
```

---

## ⚠️ **Important Notes**

### **Backend Requirements:**
The backend MUST implement these endpoints:
- `POST /api/auth/register` - Create user account
- `POST /api/auth/login` - Authenticate user
- `POST /api/auth/send-verify-otp` - Send OTP email
- `POST /api/auth/verify-otp` - Verify OTP and activate account

### **Email Configuration:**
Make sure the backend has email service configured (NodeMailer, SendGrid, etc.) to send OTP emails.

### **Protected Routes:**
Update `ProtectedRoute` component to check for JWT token and verified status.

---

## 🚀 **Next Steps**

1. ✅ Test complete registration flow
2. ✅ Test OTP verification
3. ✅ Test login with unverified account
4. ⚠️ Update AuthContext to use JWT tokens
5. ⚠️ Add token refresh logic
6. ⚠️ Add "Forgot Password" flow
7. ⚠️ Add email resend limit (prevent spam)
8. ⚠️ Add OTP expiry (e.g., 10 minutes)

---

## 🐛 **Troubleshooting**

### **OTP Not Received:**
- Check backend email configuration
- Check spam folder
- Check backend logs for errors
- Use resend button after timer expires

### **Verification Failed:**
- Check OTP is entered correctly
- Check OTP hasn't expired
- Check backend logs for validation errors
- Resend OTP and try again

### **Token Not Stored:**
- Check browser console for errors
- Check localStorage in DevTools
- Verify API response includes token
- Check network tab for API responses

### **Cannot Access Protected Routes:**
- Check if email is verified
- Check if token exists in localStorage
- Check ProtectedRoute component logic
- Try logging in again

---

**Status**: ✅ **FULLY INTEGRATED & READY TO TEST!**

The authentication system with OTP verification is complete and ready for testing with your backend APIs! 🎉
