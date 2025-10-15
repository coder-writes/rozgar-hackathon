# Global Profile State Architecture

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND APP                             │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │              AuthContext (Global State)                │    │
│  │                                                         │    │
│  │  States:                                               │    │
│  │  • user: User | null                                   │    │
│  │  • profile: ProfileData | null ◄────────┐            │    │
│  │  • isProfileLoading: boolean             │            │    │
│  │                                           │            │    │
│  │  Methods:                                 │            │    │
│  │  • fetchProfile() ──────────┐           │            │    │
│  │  • updateProfile(data) ─────┼───────────┘            │    │
│  │  • clearProfile()           │                         │    │
│  └────────────┬────────────────┼──────────────────────┘    │
│               │                 │                            │
│               │ useAuth()       │ API Call                   │
│               │                 │                            │
│  ┌────────────▼─────────────────▼──────────────────────┐   │
│  │              Any Component Can Access                │   │
│  │                                                       │   │
│  │  • Profile.tsx (Edit & Save)                        │   │
│  │  • Navbar.tsx (Display Completion)                  │   │
│  │  • Dashboard.tsx (Show Stats)                       │   │
│  │  • Jobs.tsx (Pre-fill Applications)                 │   │
│  │  • Skills.tsx (Display & Edit Skills)               │   │
│  │  • Community.tsx (User Info)                        │   │
│  │  • Any Other Component!                             │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
└──────────────────────────────────┬───────────────────────────┘
                                   │
                              API Calls
                                   │
                         ┌─────────▼──────────┐
                         │   Backend Server   │
                         │   Port: 4000       │
                         │                    │
                         │  Endpoints:        │
                         │  • GET /api/profile/:email │
                         │  • POST /api/profile       │
                         │  • PUT /api/profile        │
                         └─────────┬──────────┘
                                   │
                         ┌─────────▼──────────┐
                         │   MongoDB          │
                         │   (Profile Data)   │
                         └────────────────────┘
```

## Data Flow Diagram

```
┌──────────────────────────────────────────────────────────────┐
│                    USER JOURNEY                               │
└──────────────────────────────────────────────────────────────┘

1. USER LOGS IN
   ↓
   [Auth.tsx] → login() → Set user in context
   ↓
   Auto-trigger: fetchProfile()
   ↓
   [Backend API] → GET /api/profile/:email
   ↓
   [AuthContext] → setProfile(data)
   ↓
   [localStorage] → Save "rozgar_profile"

2. USER NAVIGATES TO ANY PAGE
   ↓
   [Any Component] → useAuth()
   ↓
   Access: { profile, isProfileLoading }
   ↓
   Display: profile.name, profile.skills, profile.completion, etc.

3. USER UPDATES PROFILE
   ↓
   [Profile.tsx] → Submit form
   ↓
   [Backend API] → POST /api/profile
   ↓
   On Success:
   ↓
   [AuthContext] → updateProfile(newData)
   ↓
   [localStorage] → Update "rozgar_profile"
   ↓
   ALL COMPONENTS → See updated data instantly!

4. USER LOGS OUT
   ↓
   [Navbar.tsx] → logout()
   ↓
   [AuthContext] → clearProfile()
   ↓
   [localStorage] → Remove "rozgar_user" & "rozgar_profile"
```

## Component Integration Map

```
┌─────────────────────────────────────────────────────────┐
│                     App.tsx                              │
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │         <AuthProvider>                         │    │
│  │                                                 │    │
│  │  ┌──────────────────────────────────────┐     │    │
│  │  │        <BrowserRouter>               │     │    │
│  │  │                                       │     │    │
│  │  │  ┌─────────────────────────────┐    │     │    │
│  │  │  │      <Navbar />              │    │     │    │
│  │  │  │  Uses: profile completion    │    │     │    │
│  │  │  └─────────────────────────────┘    │     │    │
│  │  │                                       │     │    │
│  │  │  ┌─────────────────────────────┐    │     │    │
│  │  │  │      <Routes />              │    │     │    │
│  │  │  │                              │    │     │    │
│  │  │  │  • /profile → Profile.tsx   │    │     │    │
│  │  │  │    (Edit & fetch profile)   │    │     │    │
│  │  │  │                              │    │     │    │
│  │  │  │  • /jobs → Jobs.tsx          │    │     │    │
│  │  │  │    (Access profile data)     │    │     │    │
│  │  │  │                              │    │     │    │
│  │  │  │  • /dashboard → Dashboard    │    │     │    │
│  │  │  │    (Show profile stats)      │    │     │    │
│  │  │  │                              │    │     │    │
│  │  │  │  • /skills → Skills.tsx      │    │     │    │
│  │  │  │    (Display skills)          │    │     │    │
│  │  │  └─────────────────────────────┘    │     │    │
│  │  │                                       │     │    │
│  │  │  All components use:                 │     │    │
│  │  │  const { profile } = useAuth();      │     │    │
│  │  └───────────────────────────────────────┘     │    │
│  └─────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────┘
```

## State Update Flow

```
┌──────────────────────────────────────────────────────────┐
│              PROFILE UPDATE SEQUENCE                      │
└──────────────────────────────────────────────────────────┘

User fills form in Profile.tsx
        ↓
[Submit Button] → handleSubmit()
        ↓
Create FormData with profile info
        ↓
POST /api/profile (with credentials)
        ↓
┌───────────────────┐
│ Backend Response  │
│ {                 │
│   success: true,  │
│   data: {         │
│     profileData   │
│   }               │
│ }                 │
└────────┬──────────┘
         ↓
updateProfile(data)  ← Optimistic update
         ↓
Context state updates
         ↓
localStorage updates
         ↓
┌────────────────────────────────────────┐
│   ALL Components Re-render             │
│                                        │
│   • Navbar sees new completion %      │
│   • Dashboard sees new stats          │
│   • Any component with useAuth()      │
│     gets updated profile data         │
└────────────────────────────────────────┘
```

## localStorage Integration

```
┌────────────────────────────────────────────┐
│          localStorage Structure            │
└────────────────────────────────────────────┘

Key: "rozgar_user"
Value: {
  id: "abc123",
  name: "John Doe",
  email: "john@example.com",
  role: "seeker"
}

Key: "rozgar_profile"
Value: {
  name: "John Doe",
  email: "john@example.com",
  location: "San Francisco",
  skills: ["React", "Node.js", "TypeScript"],
  workExperience: "5 years...",
  resume: { filename: "resume.pdf", path: "..." },
  profileCompletion: 85,
  isActive: true
}

┌─────────────────────────────────────┐
│  Persistence Behavior               │
├─────────────────────────────────────┤
│  • Saved on profile fetch/update   │
│  • Loaded on app initialization     │
│  • Survives page refresh            │
│  • Cleared on logout                │
└─────────────────────────────────────┘
```

## Hook Usage Pattern

```typescript
// In any component:

import { useAuth } from "@/contexts/AuthContext";

const MyComponent = () => {
  // Destructure what you need
  const { 
    user,              // Basic user info
    profile,           // Full profile data
    isProfileLoading,  // Loading state
    fetchProfile,      // Fetch from backend
    updateProfile      // Update in context
  } = useAuth();
  
  // Check loading
  if (isProfileLoading) {
    return <Loader />;
  }
  
  // Check if profile exists
  if (!profile) {
    return <p>No profile</p>;
  }
  
  // Use the data!
  return (
    <div>
      <h1>{profile.name}</h1>
      <p>{profile.location}</p>
      <div>
        {profile.skills.map(skill => (
          <Badge>{skill}</Badge>
        ))}
      </div>
      <Progress value={profile.profileCompletion} />
    </div>
  );
};
```

## Benefits Visualization

```
┌───────────────────────────────────────────────────────────┐
│             BEFORE (Without Global State)                  │
├───────────────────────────────────────────────────────────┤
│                                                            │
│  Profile.tsx ──→ Fetch Profile ──→ Local State           │
│  Navbar.tsx  ──→ Fetch Profile ──→ Local State           │
│  Dashboard   ──→ Fetch Profile ──→ Local State           │
│  Jobs.tsx    ──→ Fetch Profile ──→ Local State           │
│                                                            │
│  ❌ Multiple API calls                                     │
│  ❌ Data inconsistency                                     │
│  ❌ Prop drilling nightmare                                │
│  ❌ State management complexity                            │
└───────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────┐
│              AFTER (With Global State)                     │
├───────────────────────────────────────────────────────────┤
│                                                            │
│  Login ──→ Fetch Once ──→ Global State                   │
│                              ↓                             │
│  Profile.tsx  ──→ useAuth() ─┤                           │
│  Navbar.tsx   ──→ useAuth() ─┤                           │
│  Dashboard    ──→ useAuth() ─┤                           │
│  Jobs.tsx     ──→ useAuth() ─┘                           │
│                                                            │
│  ✅ Single API call                                        │
│  ✅ Consistent data everywhere                             │
│  ✅ No prop drilling                                       │
│  ✅ Simple state management                                │
└───────────────────────────────────────────────────────────┘
```

## Real-World Example Flow

```
USER SCENARIO: Apply for a Job
─────────────────────────────────

1. User clicks "Apply" on a job listing
   ↓
2. Jobs.tsx checks profile completion
   const { profile } = useAuth();
   if (profile.profileCompletion < 80) {
     show "Complete profile first" message
   }
   ↓
3. If complete, pre-fill application form
   Name: profile.name
   Email: profile.email
   Skills: profile.skills
   Experience: profile.workExperience
   Resume: profile.resume.filename
   ↓
4. User submits application
   ↓
5. Application sent with profile data
   ↓
6. Success! ✅

──────────────────────────────────

No need to:
❌ Fetch profile in Jobs.tsx
❌ Pass profile as props
❌ Make duplicate API calls
❌ Manage local state

Just use:
✅ const { profile } = useAuth();
✅ Access any profile field
✅ Data always in sync
```

## Summary

The global profile state system provides:

1. **Single Source of Truth**: One place for all profile data
2. **Automatic Loading**: Fetched after login
3. **Persistence**: Survives page refreshes
4. **Easy Access**: Available in any component via `useAuth()`
5. **Real-time Updates**: Changes propagate instantly
6. **Type Safety**: Full TypeScript support
7. **Clean Code**: No prop drilling or duplicate fetches

Use it anywhere with just:
```tsx
const { profile } = useAuth();
```

That's it! 🎉
