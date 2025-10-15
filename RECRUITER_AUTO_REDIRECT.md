# Recruiter Auto-Redirect Feature

## Overview
When a user signs up or logs in as a recruiter, they are automatically redirected to the recruiter profile page (`/recruiter/profile`) instead of the default pages.

## Implementation Details

### 1. Updated Files

#### `frontend/src/pages/VerifyOTP.tsx`
**Change:** Modified the post-verification redirect logic to check user role.

**Before:**
```typescript
// Redirect to jobs page
setTimeout(() => {
  navigate("/jobs", { replace: true });
  window.location.reload();
}, 500);
```

**After:**
```typescript
// Redirect based on user role
const redirectPath = data.user?.role === "recruiter" ? "/recruiter/profile" : "/jobs";
setTimeout(() => {
  navigate(redirectPath, { replace: true });
  window.location.reload();
}, 500);
```

**When it triggers:**
- After a user successfully verifies their OTP during signup
- Recruiters → `/recruiter/profile`
- Job seekers → `/jobs`

---

#### `frontend/src/pages/Auth.tsx`
**Changes:** Updated two redirect locations to check user role.

##### A. Login Redirect (handleSignIn function)

**Before:**
```typescript
// Update auth context
await login(email, password);
navigate("/dashboard");
```

**After:**
```typescript
// Update auth context and redirect based on role
await login(email, password);
const redirectPath = data.user?.role === "recruiter" ? "/recruiter/profile" : "/dashboard";
navigate(redirectPath);
```

**When it triggers:**
- After successful login with verified email
- Recruiters → `/recruiter/profile`
- Job seekers → `/dashboard`

##### B. Already Authenticated Redirect (useEffect)

**Before:**
```typescript
useEffect(() => {
  if (isAuthenticated) {
    navigate("/dashboard");
  }
}, [isAuthenticated, navigate]);
```

**After:**
```typescript
useEffect(() => {
  if (isAuthenticated) {
    // Redirect based on user role
    const userRole = user?.role;
    const redirectPath = userRole === "recruiter" ? "/recruiter/profile" : "/dashboard";
    navigate(redirectPath);
  }
}, [isAuthenticated, user, navigate]);
```

**When it triggers:**
- When an already authenticated user tries to access the auth page
- Recruiters → `/recruiter/profile`
- Job seekers → `/dashboard`

**Additional change:** Added `user` to the destructured values from `useAuth()` hook.

---

## User Flow Diagrams

### Recruiter Signup Flow
```
1. User goes to /auth?tab=signup
2. Fills form with role="recruiter"
3. Submits signup form
4. Redirected to /verify-otp
5. Enters OTP code
6. ✅ Verification successful
7. 🎯 Automatically redirected to /recruiter/profile
8. Can complete company profile
```

### Recruiter Login Flow
```
1. User goes to /auth (or /auth?tab=signin)
2. Enters email and password
3. System checks if email is verified
4. ✅ Login successful
5. 🎯 Automatically redirected to /recruiter/profile
```

### Job Seeker Flow (Unchanged except OTP redirect)
```
Signup:
1. /auth?tab=signup with role="seeker"
2. /verify-otp
3. ✅ Verification
4. 🎯 Redirected to /jobs

Login:
1. /auth
2. ✅ Login
3. 🎯 Redirected to /dashboard
```

---

## Role-Based Redirect Table

| User Type    | After Signup (OTP Verified) | After Login | Already Authenticated |
|-------------|----------------------------|-------------|----------------------|
| **Recruiter** | `/recruiter/profile` | `/recruiter/profile` | `/recruiter/profile` |
| **Seeker**    | `/jobs`              | `/dashboard`         | `/dashboard`         |

---

## Benefits

1. **Improved Onboarding:** Recruiters immediately see their profile page where they can complete company information
2. **Role-Specific Experience:** Each user type gets directed to their most relevant page
3. **Reduced Friction:** No need to manually navigate to profile page after signup
4. **Consistent Experience:** Works for both new signups and returning users

---

## Testing Scenarios

### Test Case 1: New Recruiter Signup
- [ ] Go to `/auth?tab=signup`
- [ ] Select role: "Recruiter"
- [ ] Fill in details and submit
- [ ] Verify OTP
- [ ] ✅ Should redirect to `/recruiter/profile`
- [ ] Page should show "Create Profile" form

### Test Case 2: Recruiter Login
- [ ] Go to `/auth`
- [ ] Login with recruiter credentials
- [ ] ✅ Should redirect to `/recruiter/profile`
- [ ] Page should show existing profile or create form

### Test Case 3: Authenticated Recruiter on Auth Page
- [ ] Login as recruiter
- [ ] Try to access `/auth` directly
- [ ] ✅ Should auto-redirect to `/recruiter/profile`

### Test Case 4: Job Seeker Signup (Verify no regression)
- [ ] Go to `/auth?tab=signup`
- [ ] Select role: "Job Seeker"
- [ ] Fill in details and submit
- [ ] Verify OTP
- [ ] ✅ Should redirect to `/jobs`

### Test Case 5: Job Seeker Login (Verify no regression)
- [ ] Go to `/auth`
- [ ] Login with seeker credentials
- [ ] ✅ Should redirect to `/dashboard`

---

## Technical Notes

### Role Detection
The user role is detected from:
1. **Response data:** `data.user?.role` after login/verification
2. **Auth context:** `user?.role` from `useAuth()` hook

### Role Values
- `"recruiter"` - For company recruiters
- `"seeker"` - For job seekers (default)

### Safe Navigation
Uses optional chaining (`?.`) to safely access user role, preventing errors if user data is undefined.

---

## Future Enhancements

1. **Profile Completion Check:**
   - Redirect to profile page if profile is incomplete
   - Show completion percentage
   - Guide users through required fields

2. **Different First-Time vs Returning:**
   - First-time recruiters → Profile creation page
   - Returning recruiters with complete profile → Dashboard
   
3. **Query Parameters:**
   - Support `?redirect=/custom-path` for custom redirects
   - Preserve original destination after authentication

4. **Analytics:**
   - Track successful recruiter profile completions
   - Monitor drop-off rates at profile creation

---

## Related Files
- `frontend/src/pages/VerifyOTP.tsx` - OTP verification redirect
- `frontend/src/pages/Auth.tsx` - Login/signup redirects
- `frontend/src/pages/RecruiterProfile.tsx` - Recruiter profile page
- `frontend/src/contexts/AuthContext.tsx` - Auth state management
- `frontend/src/App.tsx` - Route definitions
