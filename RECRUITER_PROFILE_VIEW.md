# Recruiter Profile View Implementation

## Overview
The Profile page (`/profile`) now intelligently detects if the logged-in user is a recruiter and displays their company profile instead of the job seeker profile.

## Changes Made

### 1. Updated `frontend/src/pages/Profile.tsx`

#### Added Recruiter Detection
```typescript
// Check if user is a recruiter
const isRecruiter = user?.role === "recruiter";

// Recruiter profile state
const [recruiterProfile, setRecruiterProfile] = useState<any>(null);
const [loadingRecruiterProfile, setLoadingRecruiterProfile] = useState(false);
```

#### Added Recruiter Profile Fetching
```typescript
useEffect(() => {
  const fetchRecruiterProfile = async () => {
    if (isRecruiter) {
      // Fetch recruiter profile from API
      const response = await axios.get(API_ENDPOINTS.RECRUITER_PROFILE, {...});
      if (response.data.success) {
        setRecruiterProfile(response.data.data);
        setProfileCompletion(response.data.data.profileCompletion || 0);
      }
    }
  };
  fetchRecruiterProfile();
}, [isRecruiter]);
```

#### Added Conditional Rendering
The page now shows different views based on user role:
- **Recruiters** → Company profile view
- **Job Seekers** → Personal profile view (existing)

### 2. Recruiter Profile View Components

#### Profile Completion Card
- Visual progress bar showing profile completion percentage
- Matches the recruiter schema calculation

#### Company Information Card
Displays:
- Company Name
- Industry
- Company Size
- Company Type
- Established Year
- Number of Employees
- Company Description
- Website (with link)
- Email

#### Location Card
Shows complete address:
- Street Address
- City, State, Country, Pincode

#### Currently Hiring For Card
Lists all active hiring positions with:
- Role name
- Number of positions
- Experience required
- Required skills (as badges)

#### Company Benefits Card
Displays all benefits as badges with checkmark icons

#### Social Media Card
Shows links to:
- LinkedIn
- Twitter
- Facebook
- Instagram

#### Edit Button
- Prominent "Edit Profile" button in the company information card
- Redirects to `/recruiter/profile` for editing

#### Empty State
If no profile exists:
- Shows friendly message
- "Create Company Profile" button
- Redirects to `/recruiter/profile`

### 3. Updated `frontend/src/pages/RecruiterProfile.tsx`

Changed the redirect after saving:
```typescript
// Redirect to profile view page after successful save
setTimeout(() => {
  navigate("/profile");
}, 1500);
```

**Before:** Redirected to `/dashboard`
**After:** Redirects to `/profile` (view mode)

## User Flow

### Creating a Profile
```
1. Recruiter logs in
2. Clicks "Profile" in navigation
3. Sees "Create Company Profile" prompt
4. Clicks button → Redirected to /recruiter/profile
5. Fills in company information
6. Clicks "Create Profile"
7. ✅ Success toast appears
8. 🔄 Auto-redirected to /profile (view mode)
9. Sees their completed profile
```

### Viewing Existing Profile
```
1. Recruiter logs in
2. Clicks "Profile" in navigation
3. 📊 Sees complete company profile
4. Can view all sections:
   - Company info
   - Location
   - Hiring positions
   - Benefits
   - Social links
```

### Editing Profile
```
1. On profile page
2. Clicks "Edit Profile" button
3. Redirected to /recruiter/profile
4. Makes changes
5. Clicks "Save Changes"
6. ✅ Success toast
7. 🔄 Redirected back to /profile (view mode)
8. Sees updated information
```

## Routes Summary

| Route | Purpose | Access |
|-------|---------|--------|
| `/profile` | View profile (smart detection) | All authenticated users |
| `/recruiter/profile` | Edit/Create company profile | Recruiters only |

## Features

### Smart Role Detection
- Automatically detects user role on page load
- No manual switching needed
- Seamless experience for both user types

### View/Edit Separation
- **View Mode** (`/profile`) - Read-only display with edit button
- **Edit Mode** (`/recruiter/profile`) - Full form for editing

### Profile Completion
- Shows completion percentage
- Visual progress bar
- Calculated by backend based on filled fields

### Responsive Design
- Works on all screen sizes
- Mobile-friendly cards and layout
- Consistent with design system

### Loading States
- Spinner while fetching profile
- Prevents layout shift
- Better UX

### Empty States
- Friendly message when no profile exists
- Clear call-to-action button
- Guides user to create profile

### Data Display
- Clean, organized sections
- Icons for visual clarity
- Badges for skills and benefits
- Clickable links for external URLs

## Benefits

1. **Single Profile Route**: Users don't need to remember different URLs
2. **Consistent Navigation**: "Profile" link works for everyone
3. **Better UX**: View and edit modes are separated
4. **Visual Feedback**: See the final result after saving
5. **Easy Editing**: One-click access to edit mode
6. **Professional Display**: Company info displayed in an organized, attractive manner

## Technical Implementation

### Role-Based Rendering
```typescript
if (isRecruiter) {
  return <RecruiterProfileView />;
}
return <JobSeekerProfileView />;
```

### API Integration
- Uses existing `RECRUITER_PROFILE` endpoint
- Handles 404 (no profile) gracefully
- JWT authentication via localStorage

### State Management
- Separate state for recruiter and job seeker profiles
- Loading states for each
- Profile completion tracking

### Navigation
- Uses React Router's `navigate` for redirects
- Proper use of protected routes
- Breadcrumb-like navigation flow

## Testing Checklist

### As a Recruiter
- [ ] Login as recruiter
- [ ] Navigate to /profile
- [ ] See company profile (if exists) or create prompt
- [ ] Click "Create Company Profile" (if new)
- [ ] Fill in company details at /recruiter/profile
- [ ] Click "Create Profile"
- [ ] See success message
- [ ] Auto-redirected to /profile
- [ ] Verify all information displays correctly
- [ ] Click "Edit Profile"
- [ ] Make changes
- [ ] Click "Save Changes"
- [ ] Redirected back to view mode
- [ ] Changes are reflected

### As a Job Seeker
- [ ] Login as job seeker
- [ ] Navigate to /profile
- [ ] See personal profile (not recruiter view)
- [ ] No company information shown
- [ ] Can edit personal details

### Edge Cases
- [ ] Profile page loads correctly without profile (shows create button)
- [ ] Edit button navigates correctly
- [ ] Profile completion percentage displays
- [ ] All social links work
- [ ] Empty fields handled gracefully
- [ ] Loading states show appropriately

## Related Files

### Modified
- ✅ `frontend/src/pages/Profile.tsx` - Added recruiter view logic
- ✅ `frontend/src/pages/RecruiterProfile.tsx` - Updated redirect

### Dependencies
- `frontend/src/lib/api.ts` - API endpoints
- `frontend/src/contexts/AuthContext.tsx` - User role detection
- `backend/routes/recruiter.js` - API routes
- `backend/controllers/recruiterController.js` - Backend logic
- `backend/models/recruiter.js` - Data schema

## Future Enhancements

1. **Public Profile View**: `/recruiter/:id` for public viewing
2. **Profile Analytics**: View count, applications received
3. **Profile Verification Badge**: For verified companies
4. **Logo Upload**: Direct image upload from profile page
5. **Quick Stats**: Job postings count, applications count
6. **Activity Feed**: Recent actions on profile
7. **Profile Sharing**: Generate shareable link
8. **PDF Export**: Download profile as PDF
9. **Profile Preview**: See how others see your profile
10. **Comparison Mode**: Compare with similar companies

## Notes

- The profile page is **role-aware** and adapts automatically
- No need for separate routes for different user types
- Maintains consistency with the existing job seeker profile UI
- Uses the same design tokens and components
- Fully integrated with the authentication system
