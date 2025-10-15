# Quick Reference: Global Profile State

## 🚀 Import & Use

```tsx
import { useAuth } from "@/contexts/AuthContext";

const MyComponent = () => {
  const { profile, isProfileLoading, fetchProfile, updateProfile } = useAuth();
  
  // Your code here
};
```

## 📊 Available Data

```tsx
const { 
  // State
  profile,           // ProfileData | null
  isProfileLoading,  // boolean
  
  // Methods
  fetchProfile,      // () => Promise<void>
  updateProfile,     // (data: Partial<ProfileData>) => void
  clearProfile,      // () => void
} = useAuth();
```

## 🎯 Profile Object Structure

```typescript
profile = {
  name: string;
  email: string;
  location: string;
  skills: string[];                    // Array of skill names
  workExperience: string;
  resume: {                            // Resume metadata
    filename: string | null;
    path: string | null;
    mimetype: string | null;
    size: number | null;
    uploadedAt: Date | null;
  } | null;
  profileCompletion: number;           // 0-100
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}
```

## 📖 Common Patterns

### 1. Display Profile Data
```tsx
const Dashboard = () => {
  const { profile } = useAuth();
  
  return (
    <div>
      <h1>{profile?.name}</h1>
      <p>{profile?.location}</p>
    </div>
  );
};
```

### 2. Fetch Profile on Mount
```tsx
useEffect(() => {
  if (!profile && !isProfileLoading) {
    fetchProfile();
  }
}, [profile, isProfileLoading, fetchProfile]);
```

### 3. Show Loading State
```tsx
if (isProfileLoading) {
  return <Loader2 className="animate-spin" />;
}

if (!profile) {
  return <p>No profile data</p>;
}

return <div>{profile.name}</div>;
```

### 4. Display Skills
```tsx
{profile?.skills.map((skill, i) => (
  <Badge key={i}>{skill}</Badge>
))}
```

### 5. Check Profile Completion
```tsx
const canApply = profile && profile.profileCompletion >= 80;

if (!canApply) {
  return <p>Complete your profile to apply</p>;
}
```

### 6. Update Profile (Optimistic)
```tsx
const handleUpdate = async (newData) => {
  // Update UI immediately
  updateProfile(newData);
  
  try {
    // Save to backend
    await axios.put(API_ENDPOINTS.PROFILE, newData);
  } catch (error) {
    // Revert on error
    await fetchProfile();
  }
};
```

### 7. Access Resume Info
```tsx
{profile?.resume ? (
  <a href={profile.resume.path}>
    Download {profile.resume.filename}
  </a>
) : (
  <p>No resume uploaded</p>
)}
```

## ⚠️ Important Rules

1. **Always check for null**: `profile?.name` not `profile.name`
2. **Check loading state**: Use `isProfileLoading` before rendering
3. **Fetch when needed**: Call `fetchProfile()` if profile is null
4. **Update after save**: Call `updateProfile()` or `fetchProfile()` after API success
5. **Handle errors**: Refetch profile if backend update fails

## 🎨 UI Examples

### Profile Completion Bar
```tsx
<Progress value={profile?.profileCompletion || 0} />
<p>{profile?.profileCompletion}% Complete</p>
```

### Skills List
```tsx
<div className="flex flex-wrap gap-2">
  {profile?.skills.map((skill, i) => (
    <Badge key={i} variant="secondary">{skill}</Badge>
  ))}
</div>
```

### User Card
```tsx
<Card>
  <CardHeader>
    <Avatar>
      <AvatarFallback>{user?.name[0]}</AvatarFallback>
    </Avatar>
    <h3>{profile?.name}</h3>
    <p>{profile?.location}</p>
  </CardHeader>
  <CardContent>
    <p>Experience: {profile?.workExperience}</p>
    <Progress value={profile?.profileCompletion} />
  </CardContent>
</Card>
```

## 🔄 Data Flow

```
Login → Auto-fetch profile → Available everywhere
  ↓
Any Component → Access via useAuth()
  ↓
Update Form → Save to API → Update global state
  ↓
All Components see changes instantly
```

## ✅ Checklist

- [ ] Import `useAuth` from `@/contexts/AuthContext`
- [ ] Destructure needed values: `{ profile, isProfileLoading }`
- [ ] Check `isProfileLoading` before rendering
- [ ] Use optional chaining: `profile?.name`
- [ ] Fetch profile if null: `fetchProfile()`
- [ ] Update global state after API success: `updateProfile(data)`

## 🎯 Real-World Usage

**Navbar**: Show completion percentage
**Dashboard**: Display user stats and skills
**Job Application**: Pre-fill forms with profile data
**Settings**: Edit profile information
**Skills Page**: Show and manage skills
**Community**: Display user info in posts

## 💡 Pro Tips

1. Profile auto-fetches after login
2. Data persists in localStorage
3. Use optimistic updates for smooth UX
4. Always handle null cases
5. Refetch after backend updates to stay in sync

---

**Need more examples?** Check:
- `GLOBAL_STATE_USAGE.md` - Detailed guide
- `ProfileExamples.tsx` - Ready-to-use components
- `GLOBAL_STATE_IMPLEMENTATION_SUMMARY.md` - Complete overview
