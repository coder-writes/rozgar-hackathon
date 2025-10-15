# Global State Management - Profile Data

## Overview

The `AuthContext` has been enhanced to include global profile data management. This allows you to access and update user profile data from anywhere in your application.

## Available Data & Methods

### State Variables

```typescript
const { 
  user,              // User authentication data (id, name, email, role, isVerified)
  profile,           // Complete profile data (location, skills, workExperience, resume, etc.)
  isAuthenticated,   // Boolean - user logged in status
  isLoading,         // Boolean - initial auth loading state
  isProfileLoading,  // Boolean - profile fetching state
  
  // Methods
  login,             // Login function
  signup,            // Signup function
  logout,            // Logout function (also clears profile)
  fetchProfile,      // Fetch profile from backend
  updateProfile,     // Update profile in global state (optimistic update)
  clearProfile       // Clear profile data
} = useAuth();
```

### Profile Data Structure

```typescript
interface ProfileData {
  name: string;
  email: string;
  location: string;
  skills: string[];
  workExperience: string;
  resume: Resume | null;  // { filename, path, mimetype, size, uploadedAt }
  profileCompletion: number;  // 0-100
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}
```

## Usage Examples

### 1. Display Profile Data in Any Component

```tsx
import { useAuth } from "@/contexts/AuthContext";

const MyComponent = () => {
  const { profile, isProfileLoading } = useAuth();

  if (isProfileLoading) {
    return <div>Loading profile...</div>;
  }

  if (!profile) {
    return <div>No profile found</div>;
  }

  return (
    <div>
      <h2>{profile.name}</h2>
      <p>Location: {profile.location}</p>
      <p>Skills: {profile.skills.join(", ")}</p>
      <p>Profile Completion: {profile.profileCompletion}%</p>
    </div>
  );
};
```

### 2. Fetch Profile Data

```tsx
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

const Dashboard = () => {
  const { fetchProfile, profile } = useAuth();

  useEffect(() => {
    // Fetch profile when component mounts
    fetchProfile();
  }, []);

  return <div>Welcome, {profile?.name}</div>;
};
```

### 3. Update Profile (Optimistic Update)

```tsx
import { useAuth } from "@/contexts/AuthContext";

const EditProfile = () => {
  const { updateProfile, profile } = useAuth();

  const handleSave = async (newData) => {
    // Optimistically update UI immediately
    updateProfile(newData);
    
    // Then save to backend
    try {
      await axios.put(API_ENDPOINTS.PROFILE, newData);
      // Profile already updated in UI!
    } catch (error) {
      // If API fails, refetch to get correct data
      fetchProfile();
    }
  };

  return (
    <button onClick={() => handleSave({ location: "New York" })}>
      Update Location
    </button>
  );
};
```

### 4. Access Profile Data in Navbar

```tsx
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";

const Navbar = () => {
  const { user, profile } = useAuth();

  return (
    <nav>
      <div>
        <Avatar>
          <AvatarFallback>
            {user?.name?.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <span>{user?.name}</span>
      </div>
      
      {profile && (
        <div>
          <Progress value={profile.profileCompletion} />
          <span>{profile.profileCompletion}% Complete</span>
        </div>
      )}
    </nav>
  );
};
```

### 5. Check Profile Completion Anywhere

```tsx
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const JobApplicationButton = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();

  const handleApply = () => {
    if (!profile || profile.profileCompletion < 80) {
      toast({
        title: "Complete your profile",
        description: "You need at least 80% profile completion to apply",
        variant: "destructive",
      });
      navigate("/profile");
      return;
    }
    
    // Proceed with application
  };

  return <button onClick={handleApply}>Apply Now</button>;
};
```

### 6. Display Skills Anywhere

```tsx
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";

const SkillsDisplay = () => {
  const { profile } = useAuth();

  return (
    <div className="flex flex-wrap gap-2">
      {profile?.skills.map((skill, index) => (
        <Badge key={index} variant="secondary">
          {skill}
        </Badge>
      ))}
    </div>
  );
};
```

## Data Persistence

- Profile data is stored in `localStorage` under the key `rozgar_profile`
- Data persists across page refreshes
- Automatically cleared on logout
- Automatically loaded on app initialization

## Best Practices

1. **Fetch on Login**: Profile is automatically fetched after login
2. **Optimistic Updates**: Use `updateProfile()` for instant UI feedback before API calls
3. **Error Handling**: If backend update fails, call `fetchProfile()` to sync state
4. **Loading States**: Always check `isProfileLoading` before displaying profile data
5. **Null Checks**: Always check if `profile` exists before accessing its properties

## When to Use

✅ **Use Global State** when:
- Displaying user info in Navbar/Header
- Checking profile completion across pages
- Accessing user skills/experience in multiple components
- Showing profile data in dashboard/sidebar
- Validating profile requirements before actions

❌ **Don't Use Global State** when:
- Only one component needs the data
- Working with temporary/draft form data
- Need real-time updates from other users

## Triggering Profile Refresh

```tsx
// After updating profile via API
const handleUpdateProfile = async (data) => {
  try {
    await axios.put(API_ENDPOINTS.PROFILE, data);
    // Refresh profile from backend
    await fetchProfile();
  } catch (error) {
    console.error(error);
  }
};
```

## Example: Complete Profile Flow

```tsx
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

const App = () => {
  const { user, profile, fetchProfile, isProfileLoading } = useAuth();

  // Fetch profile when user is authenticated
  useEffect(() => {
    if (user && !profile && !isProfileLoading) {
      fetchProfile();
    }
  }, [user, profile, isProfileLoading]);

  return <YourAppContent />;
};
```
