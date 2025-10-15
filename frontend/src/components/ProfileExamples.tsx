// Example: How to access global profile data in any component

import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Loader2 } from "lucide-react";

/**
 * Example 1: Display User Skills
 * This component can be used anywhere in your app
 */
export const UserSkillsWidget = () => {
  const { profile, isProfileLoading, fetchProfile } = useAuth();

  useEffect(() => {
    // Fetch profile if not already loaded
    if (!profile && !isProfileLoading) {
      fetchProfile();
    }
  }, [profile, isProfileLoading, fetchProfile]);

  if (isProfileLoading) {
    return <Loader2 className="h-6 w-6 animate-spin" />;
  }

  if (!profile) {
    return <p className="text-sm text-muted-foreground">No profile data available</p>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {profile.skills.map((skill, index) => (
        <Badge key={index} variant="secondary">
          {skill}
        </Badge>
      ))}
    </div>
  );
};

/**
 * Example 2: Profile Completion Card
 * Shows profile completion status
 */
export const ProfileCompletionCard = () => {
  const { profile } = useAuth();

  if (!profile) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Profile Completion</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <Progress value={profile.profileCompletion} className="h-2" />
        <p className="text-sm text-muted-foreground">
          {profile.profileCompletion}% Complete
        </p>
        {profile.profileCompletion < 100 && (
          <p className="text-xs text-muted-foreground">
            Complete your profile to unlock all features!
          </p>
        )}
      </CardContent>
    </Card>
  );
};

/**
 * Example 3: User Info Display
 * Shows basic user information
 */
export const UserInfoDisplay = () => {
  const { user, profile } = useAuth();

  return (
    <div className="space-y-2">
      <h2 className="text-2xl font-bold">{user?.name}</h2>
      {profile && (
        <>
          <p className="text-muted-foreground">{profile.location}</p>
          <p className="text-sm">{profile.workExperience}</p>
        </>
      )}
    </div>
  );
};

/**
 * Example 4: Conditional Rendering Based on Profile
 * Show different content based on profile completion
 */
export const ProfileGatedFeature = ({ children }: { children: React.ReactNode }) => {
  const { profile } = useAuth();

  if (!profile || profile.profileCompletion < 80) {
    return (
      <Card className="border-yellow-500">
        <CardContent className="p-6">
          <p className="text-sm">
            Complete your profile to at least 80% to access this feature.
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Current: {profile?.profileCompletion || 0}%
          </p>
        </CardContent>
      </Card>
    );
  }

  return <>{children}</>;
};

/**
 * Example 5: Resume Status Indicator
 */
export const ResumeStatusBadge = () => {
  const { profile } = useAuth();

  if (!profile) return null;

  return (
    <Badge variant={profile.resume ? "default" : "outline"}>
      {profile.resume ? "✓ Resume Uploaded" : "⚠ Resume Missing"}
    </Badge>
  );
};

/**
 * Example 6: Update Profile from Any Component
 */
export const QuickLocationUpdate = () => {
  const { profile, updateProfile, fetchProfile } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdateLocation = async (newLocation: string) => {
    // Optimistic update
    updateProfile({ location: newLocation });
    
    setIsUpdating(true);
    try {
      // Make API call
      await axios.put(API_ENDPOINTS.PROFILE, { location: newLocation });
      // Refetch to ensure sync
      await fetchProfile();
    } catch (error) {
      console.error("Failed to update location:", error);
      // Revert on error
      await fetchProfile();
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div>
      <p>Current Location: {profile?.location || "Not set"}</p>
      <button 
        onClick={() => handleUpdateLocation("New York")}
        disabled={isUpdating}
      >
        {isUpdating ? "Updating..." : "Update Location"}
      </button>
    </div>
  );
};

// Import this to use useState and axios
import { useState } from "react";
import axios from "axios";
import { API_ENDPOINTS } from "@/lib/api";
