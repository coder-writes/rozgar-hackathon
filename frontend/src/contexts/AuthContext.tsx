import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_ENDPOINTS } from "@/lib/api";

interface User {
  id: string;
  name: string;
  email: string;
  role: "seeker" | "recruiter";
  isVerified?: boolean;
}

interface Resume {
  filename: string | null;
  path: string | null;
  mimetype: string | null;
  size: number | null;
  uploadedAt: Date | null;
}

interface ProfileData {
  name: string;
  email: string;
  location: string;
  skills: string[];
  workExperience: string;
  resume: Resume | null;
  profileCompletion: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface AuthContextType {
  user: User | null;
  profile: ProfileData | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isProfileLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string, role: "seeker" | "recruiter") => Promise<void>;
  logout: () => void;
  fetchProfile: () => Promise<void>;
  updateProfile: (profileData: Partial<ProfileData>) => void;
  clearProfile: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProfileLoading, setIsProfileLoading] = useState(false);

  // Check for existing session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("rozgar_user");
    const storedProfile = localStorage.getItem("rozgar_profile");
    
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
        
        // Load stored profile if available
        if (storedProfile) {
          setProfile(JSON.parse(storedProfile));
        }
      } catch (error) {
        console.error("Failed to parse stored user/profile:", error);
        localStorage.removeItem("rozgar_user");
        localStorage.removeItem("rozgar_profile");
      }
    }
    setIsLoading(false);
  }, []);

  // Fetch profile data from backend
  const fetchProfile = async () => {
    if (!user?.email) {
      console.warn("Cannot fetch profile: user email not available");
      return;
    }

    setIsProfileLoading(true);
    try {
      const response = await axios.get(
        API_ENDPOINTS.PROFILE_BY_EMAIL(user.email),
        { withCredentials: true }
      );

      if (response.data.success && response.data.data) {
        const profileData = response.data.data;
        setProfile(profileData);
        localStorage.setItem("rozgar_profile", JSON.stringify(profileData));
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
      // Don't throw error, profile might not exist yet
    } finally {
      setIsProfileLoading(false);
    }
  };

  // Update profile in context (optimistic update)
  const updateProfile = (profileData: Partial<ProfileData>) => {
    setProfile(prev => {
      if (!prev) return null;
      const updated = { ...prev, ...profileData };
      localStorage.setItem("rozgar_profile", JSON.stringify(updated));
      return updated;
    });
  };

  // Clear profile data
  const clearProfile = () => {
    setProfile(null);
    localStorage.removeItem("rozgar_profile");
  };

  const login = async (email: string, password: string) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    // Mock authentication - in production, this would validate against a backend
    const mockUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      name: email.split("@")[0],
      email,
      role: "seeker",
    };
    
    setUser(mockUser);
    localStorage.setItem("rozgar_user", JSON.stringify(mockUser));
    
    // Fetch profile after login
    setTimeout(() => fetchProfile(), 100);
  };

  const signup = async (name: string, email: string, password: string, role: "seeker" | "recruiter") => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    // Mock registration - in production, this would create a user in the backend
    const mockUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      email,
      role,
    };
    
    setUser(mockUser);
    localStorage.setItem("rozgar_user", JSON.stringify(mockUser));
  };

  const logout = () => {
    setUser(null);
    clearProfile();
    localStorage.removeItem("rozgar_user");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isAuthenticated: !!user,
        isLoading,
        isProfileLoading,
        login,
        signup,
        logout,
        fetchProfile,
        updateProfile,
        clearProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
