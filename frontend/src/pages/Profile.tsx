import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { API_ENDPOINTS } from "@/lib/api";
import {
  User,
  Mail,
  MapPin,
  Briefcase,
  FileText,
  Sparkles,
  CheckCircle2,
  Upload,
  X,
  Plus,
  Loader2,
  Building2,
  Users as UsersIcon,
  Globe,
  Calendar,
  Edit,
} from "lucide-react";
import axios from "axios";

const Profile = () => {
  const { toast } = useToast();
  const { user, profile, fetchProfile, updateProfile, isProfileLoading } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(true);
  const [profileCompletion, setProfileCompletion] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Check if user is a recruiter
  const isRecruiter = user?.role === "recruiter";
  
  // Recruiter profile state
  const [recruiterProfile, setRecruiterProfile] = useState<any>(null);
  const [loadingRecruiterProfile, setLoadingRecruiterProfile] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    location: "",
    experience: "",
    skills: [] as string[],
    resume: null as File | null,
    resumeInfo: null as { filename: string; path: string } | null, // Store resume metadata separately
  });
  
  const [currentSkill, setCurrentSkill] = useState("");
  
  // Fetch recruiter profile if user is a recruiter
  useEffect(() => {
    const fetchRecruiterProfile = async () => {
      if (isRecruiter) {
        setLoadingRecruiterProfile(true);
        try {
          const token = localStorage.getItem("rozgar_token");
          const response = await axios.get(API_ENDPOINTS.RECRUITER_PROFILE, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (response.data.success) {
            setRecruiterProfile(response.data.data);
            setProfileCompletion(response.data.data.profileCompletion || 0);
          }
        } catch (error: any) {
          if (error.response?.status === 404) {
            // No profile exists yet
            setRecruiterProfile(null);
          } else {
            console.error("Error fetching recruiter profile:", error);
          }
        } finally {
          setLoadingRecruiterProfile(false);
        }
      }
    };

    fetchRecruiterProfile();
  }, [isRecruiter]);
  
  // Load existing profile data from global state when component mounts
  useEffect(() => {
    const loadProfile = async () => {
      if (user?.email && !isRecruiter) {
        // Fetch profile if not already loaded
        if (!profile) {
          await fetchProfile();
        } else {
          // Use profile from global state
          setFormData({
            name: profile.name || "",
            email: profile.email || "",
            location: profile.location || "",
            experience: profile.workExperience || "",
            skills: profile.skills || [],
            resume: null, // File object not stored
            resumeInfo: profile.resume ? { 
              filename: profile.resume.filename || "", 
              path: profile.resume.path || "" 
            } : null,
          });

          setProfileCompletion(profile.profileCompletion || 0);
          setIsEditing(false); // Start in view mode if profile exists
        }
      }
    };
    
    loadProfile();
  }, [user, profile, fetchProfile, isRecruiter]);

  // Update form when profile is loaded
  useEffect(() => {
    if (profile && !isRecruiter) {
      setFormData({
        name: profile.name || "",
        email: profile.email || "",
        location: profile.location || "",
        experience: profile.workExperience || "",
        skills: profile.skills || [],
        resume: null, // File object not stored
        resumeInfo: profile.resume ? { 
          filename: profile.resume.filename || "", 
          path: profile.resume.path || "" 
        } : null,
      });
      setProfileCompletion(profile.profileCompletion || 0);
      setIsEditing(false);
    } else if (user && !isProfileLoading && !isRecruiter) {
      // No profile exists, use user data
      setFormData(prev => ({
        ...prev,
        name: user.name || "",
        email: user.email || "",
      }));
    }
  }, [profile, user, isProfileLoading, isRecruiter]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    updateProfileCompletion();
  };
  
  const handleAddSkill = () => {
    if (currentSkill.trim() && !formData.skills.includes(currentSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, currentSkill.trim()]
      }));
      setCurrentSkill("");
      updateProfileCompletion();
    }
  };
  
  const handleRemoveSkill = (skillToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
    updateProfileCompletion();
  };
  
  const handleResumeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5000000) { // 5MB limit
        toast({
          title: "File too large",
          description: "Please upload a file smaller than 5MB",
          variant: "destructive",
        });
        return;
      }
      setFormData(prev => ({ ...prev, resume: file }));
      updateProfileCompletion();
      toast({
        title: "Resume uploaded",
        description: `${file.name} has been uploaded successfully`,
      });
    }
  };
  
  const updateProfileCompletion = () => {
    let completion = 0;
    if (formData.name) completion += 20;
    if (formData.email) completion += 20;
    if (formData.location) completion += 15;
    if (formData.experience) completion += 15;
    if (formData.skills.length > 0) completion += 20;
    if (formData.resume) completion += 10;
    setProfileCompletion(completion);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Create FormData object for file upload
      const apiFormData = new FormData();
      apiFormData.append('name', formData.name);
      apiFormData.append('email', formData.email);
      apiFormData.append('location', formData.location);
      apiFormData.append('workExperience', formData.experience);
      apiFormData.append('skills', JSON.stringify(formData.skills));
      
      // Append resume file if exists
      if (formData.resume) {
        apiFormData.append('resume', formData.resume.name);
      }

      // Make API call
      const response = await fetch(API_ENDPOINTS.PROFILE, {
        method: 'POST',
        body: apiFormData,
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast({
          title: "Profile saved successfully!",
          description: data.message || "Your profile information has been saved to the database.",
        });
        
        // Update profile completion from server response
        if (data.data && data.data.profileCompletion) {
          setProfileCompletion(data.data.profileCompletion);
        }
        
        // Update global state with new profile data
        if (data.data) {
          updateProfile(data.data);
        } else {
          // Refetch profile to ensure global state is in sync
          await fetchProfile();
        }
        
        setIsEditing(false);
      } else {
        throw new Error(data.message || 'Failed to save profile');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: "Error saving profile",
        description: error instanceof Error ? error.message : "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };
  
  // Show loading state
  if (isProfileLoading || (isRecruiter && loadingRecruiterProfile)) {
    return (
      <div className="min-h-screen bg-gradient-subtle">
        <Navbar />
        <div className="container mx-auto px-4 py-24 flex items-center justify-center">
          <Card className="p-8 text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-lg text-muted-foreground">Loading your profile...</p>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }
  
  // Recruiter Profile View
  if (isRecruiter) {
    return (
      <div className="min-h-screen bg-gradient-subtle">
        <Navbar />
        
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-hero">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-10 right-20 w-64 h-64 bg-primary-foreground/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-10 left-20 w-80 h-80 bg-accent/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          </div>
          
          <div className="relative container mx-auto px-4 py-16">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20">
                <Building2 className="h-4 w-4 text-primary-foreground" />
                <span className="text-sm font-medium text-primary-foreground">Recruiter Profile</span>
              </div>
              
              <h1 className="text-4xl md:text-6xl font-bold text-primary-foreground">
                Company Profile
              </h1>
              
              <p className="text-lg text-primary-foreground/90 max-w-2xl">
                Manage your company information and connect with talented professionals
              </p>
            </div>
          </div>
        </section>

        {/* Profile Content */}
        <section className="container mx-auto px-4 py-12">
          {recruiterProfile ? (
            <div className="max-w-5xl mx-auto space-y-6">
              {/* Profile Completion */}
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Profile Completion</span>
                      <span className="font-semibold text-primary">{profileCompletion}%</span>
                    </div>
                    <Progress value={profileCompletion} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              {/* Company Information */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-primary" />
                      <CardTitle>Company Information</CardTitle>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate("/recruiter/profile")}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label className="text-muted-foreground">Company Name</Label>
                      <p className="text-lg font-semibold mt-1">{recruiterProfile.companyName}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Industry</Label>
                      <p className="text-lg font-semibold mt-1">{recruiterProfile.industry || "Not specified"}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Company Size</Label>
                      <p className="text-lg font-semibold mt-1">{recruiterProfile.companySize || "Not specified"}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Company Type</Label>
                      <p className="text-lg font-semibold mt-1">{recruiterProfile.companyType || "Not specified"}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Established Year</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <p className="text-lg font-semibold">{recruiterProfile.establishedYear}</p>
                      </div>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Number of Employees</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <UsersIcon className="h-4 w-4 text-muted-foreground" />
                        <p className="text-lg font-semibold">{recruiterProfile.numberOfEmployees}</p>
                      </div>
                    </div>
                  </div>

                  {recruiterProfile.companyDescription && (
                    <div>
                      <Label className="text-muted-foreground">About Company</Label>
                      <p className="mt-2 text-foreground">{recruiterProfile.companyDescription}</p>
                    </div>
                  )}

                  <div className="grid md:grid-cols-2 gap-6">
                    {recruiterProfile.companyWebsite && (
                      <div>
                        <Label className="text-muted-foreground">Website</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <Globe className="h-4 w-4 text-muted-foreground" />
                          <a
                            href={recruiterProfile.companyWebsite}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            {recruiterProfile.companyWebsite}
                          </a>
                        </div>
                      </div>
                    )}
                    {recruiterProfile.companyEmail && (
                      <div>
                        <Label className="text-muted-foreground">Email</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <p className="text-foreground">{recruiterProfile.companyEmail}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Location */}
              {recruiterProfile.location && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-primary" />
                      <CardTitle>Location</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {recruiterProfile.location.address && (
                        <p className="text-foreground">{recruiterProfile.location.address}</p>
                      )}
                      <p className="text-foreground">
                        {[
                          recruiterProfile.location.city,
                          recruiterProfile.location.state,
                          recruiterProfile.location.country,
                          recruiterProfile.location.pincode
                        ].filter(Boolean).join(", ")}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Hiring Positions */}
              {recruiterProfile.hiringFor && recruiterProfile.hiringFor.length > 0 && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-5 w-5 text-primary" />
                      <CardTitle>Currently Hiring For</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recruiterProfile.hiringFor.map((position: any, index: number) => (
                        <div key={index} className="p-4 border rounded-lg">
                          <h4 className="font-semibold text-lg">{position.role}</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {position.positions} position{position.positions > 1 ? 's' : ''} • {position.experienceRequired}
                          </p>
                          {position.skills && position.skills.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-3">
                              {position.skills.map((skill: string, skillIndex: number) => (
                                <Badge key={skillIndex} variant="secondary">{skill}</Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Benefits */}
              {recruiterProfile.benefits && recruiterProfile.benefits.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Company Benefits</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {recruiterProfile.benefits.map((benefit: string, index: number) => (
                        <Badge key={index} variant="secondary" className="px-3 py-1">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          {benefit}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Social Links */}
              {recruiterProfile.socialLinks && Object.values(recruiterProfile.socialLinks).some((link: any) => link) && (
                <Card>
                  <CardHeader>
                    <CardTitle>Social Media</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-4">
                      {recruiterProfile.socialLinks.linkedin && (
                        <a
                          href={recruiterProfile.socialLinks.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          LinkedIn
                        </a>
                      )}
                      {recruiterProfile.socialLinks.twitter && (
                        <a
                          href={recruiterProfile.socialLinks.twitter}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          Twitter
                        </a>
                      )}
                      {recruiterProfile.socialLinks.facebook && (
                        <a
                          href={recruiterProfile.socialLinks.facebook}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          Facebook
                        </a>
                      )}
                      {recruiterProfile.socialLinks.instagram && (
                        <a
                          href={recruiterProfile.socialLinks.instagram}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          Instagram
                        </a>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <Card className="max-w-2xl mx-auto">
              <CardHeader className="text-center">
                <Building2 className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <CardTitle>Complete Your Company Profile</CardTitle>
                <CardDescription>
                  Create your company profile to start posting jobs and connecting with candidates
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button onClick={() => navigate("/recruiter/profile")} size="lg">
                  <Plus className="h-5 w-5 mr-2" />
                  Create Company Profile
                </Button>
              </CardContent>
            </Card>
          )}
        </section>

        <Footer />
      </div>
    );
  }
  
  // Job Seeker Profile View (existing code)
  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-hero">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-10 right-20 w-64 h-64 bg-primary-foreground/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 left-20 w-80 h-80 bg-accent/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        
        <div className="relative container mx-auto px-4 py-16">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
              <span className="text-sm font-medium text-primary-foreground">Professional Profile</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-primary-foreground">
              Your Career Profile
            </h1>
            
            <p className="text-lg text-primary-foreground/90 max-w-2xl">
              Complete your profile to unlock personalized job recommendations and connect with top employers
            </p>
          </div>
        </div>
      </section>
      
      {/* Profile Content */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {/* Left Sidebar - Profile Overview */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Card */}
            <Card className="border-border/50 shadow-lg bg-card/50 backdrop-blur-sm">
              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-4">
                  <Avatar className="h-32 w-32 border-4 border-primary/20 shadow-xl">
                    <AvatarFallback className="text-3xl font-bold bg-gradient-hero text-primary-foreground">
                      {formData.name ? getInitials(formData.name) : "U"}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <CardTitle className="text-2xl">{formData.name || "Your Name"}</CardTitle>
                <CardDescription className="flex items-center justify-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {formData.location || "Add your location"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Profile Completion</span>
                    <span className="font-semibold text-primary">{profileCompletion}%</span>
                  </div>
                  <Progress value={profileCompletion} className="h-2" />
                </div>
                
                <div className="space-y-2 pt-4 border-t border-border">
                  <div className="flex items-center gap-2 text-sm">
                    {formData.name ? (
                      <CheckCircle2 className="h-4 w-4 text-accent" />
                    ) : (
                      <div className="h-4 w-4 rounded-full border-2 border-muted" />
                    )}
                    <span className={formData.name ? "text-foreground" : "text-muted-foreground"}>
                      Basic Information
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    {formData.skills.length > 0 ? (
                      <CheckCircle2 className="h-4 w-4 text-accent" />
                    ) : (
                      <div className="h-4 w-4 rounded-full border-2 border-muted" />
                    )}
                    <span className={formData.skills.length > 0 ? "text-foreground" : "text-muted-foreground"}>
                      Skills Added
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    {formData.experience ? (
                      <CheckCircle2 className="h-4 w-4 text-accent" />
                    ) : (
                      <div className="h-4 w-4 rounded-full border-2 border-muted" />
                    )}
                    <span className={formData.experience ? "text-foreground" : "text-muted-foreground"}>
                      Experience Details
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    {formData.resume ? (
                      <CheckCircle2 className="h-4 w-4 text-accent" />
                    ) : (
                      <div className="h-4 w-4 rounded-full border-2 border-muted" />
                    )}
                    <span className={formData.resume ? "text-foreground" : "text-muted-foreground"}>
                      Resume Uploaded
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Quick Stats */}
            <Card className="border-border/50 shadow-lg bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Skills Listed</span>
                  <Badge variant="secondary" className="font-semibold">
                    {formData.skills.length}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Profile Views</span>
                  <Badge variant="secondary" className="font-semibold">0</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Applications</span>
                  <Badge variant="secondary" className="font-semibold">0</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Main Content - Profile Form */}
          <div className="lg:col-span-2">
            <Card className="border-border/50 shadow-xl bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-3xl">Profile Information</CardTitle>
                    <CardDescription className="mt-2">
                      Fill in your details to create a comprehensive professional profile
                    </CardDescription>
                  </div>
                  {!isEditing && (
                    <Button onClick={() => setIsEditing(true)} variant="outline">
                      Edit Profile
                    </Button>
                  )}
                </div>
              </CardHeader>
              
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Basic Information Section */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 pb-2 border-b border-border">
                      <User className="h-5 w-5 text-primary" />
                      <h3 className="text-xl font-semibold">Basic Information</h3>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-base font-medium">
                          Full Name <span className="text-destructive">*</span>
                        </Label>
                        <div className="relative">
                          <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder="John Doe"
                            className="pl-10 h-12 border-border/60 focus:border-primary"
                            disabled={!isEditing}
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-base font-medium">
                          Email Address <span className="text-destructive">*</span>
                        </Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="john.doe@example.com"
                            className="pl-10 h-12 border-border/60 focus:border-primary bg-muted/50 cursor-not-allowed"
                            disabled={true}
                            readOnly
                            required
                            title="Email address cannot be changed"
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Email address cannot be changed
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="location" className="text-base font-medium">
                        Location <span className="text-destructive">*</span>
                      </Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="location"
                          name="location"
                          value={formData.location}
                          onChange={handleInputChange}
                          placeholder="City, State, Country"
                          className="pl-10 h-12 border-border/60 focus:border-primary"
                          disabled={!isEditing}
                          required
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Skills Section */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 pb-2 border-b border-border">
                      <Sparkles className="h-5 w-5 text-primary" />
                      <h3 className="text-xl font-semibold">Skills & Expertise</h3>
                    </div>
                    
                    <div className="space-y-4">
                      <Label htmlFor="skills" className="text-base font-medium">
                        Add Your Skills <span className="text-destructive">*</span>
                      </Label>
                      
                      {isEditing && (
                        <div className="flex gap-2">
                          <Input
                            id="skills"
                            value={currentSkill}
                            onChange={(e) => setCurrentSkill(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                            placeholder="e.g., JavaScript, React, Node.js"
                            className="h-12 border-border/60 focus:border-primary"
                          />
                          <Button
                            type="button"
                            onClick={handleAddSkill}
                            className="h-12 px-6 bg-gradient-hero hover:opacity-90"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add
                          </Button>
                        </div>
                      )}
                      
                      {formData.skills.length > 0 && (
                        <div className="flex flex-wrap gap-2 p-4 bg-muted/30 rounded-lg border border-border/50">
                          {formData.skills.map((skill, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="px-4 py-2 text-sm font-medium bg-primary/10 hover:bg-primary/20 border border-primary/20"
                            >
                              {skill}
                              {isEditing && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveSkill(skill)}
                                  className="ml-2 hover:text-destructive"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              )}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Experience Section */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 pb-2 border-b border-border">
                      <Briefcase className="h-5 w-5 text-primary" />
                      <h3 className="text-xl font-semibold">Professional Experience</h3>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="experience" className="text-base font-medium">
                        Work Experience <span className="text-destructive">*</span>
                      </Label>
                      <Textarea
                        id="experience"
                        name="experience"
                        value={formData.experience}
                        onChange={handleInputChange}
                        placeholder="Describe your work experience, roles, and achievements..."
                        className="min-h-[150px] border-border/60 focus:border-primary resize-none"
                        disabled={!isEditing}
                        required
                      />
                      <p className="text-sm text-muted-foreground">
                        Include your previous roles, responsibilities, and key accomplishments
                      </p>
                    </div>
                  </div>
                  
                  {/* Resume Upload Section */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 pb-2 border-b border-border">
                      <FileText className="h-5 w-5 text-primary" />
                      <h3 className="text-xl font-semibold">Resume</h3>
                    </div>
                    
                    <div className="space-y-4">
                      <Label htmlFor="resume" className="text-base font-medium">
                        Upload Resume <span className="text-muted-foreground">(Optional)</span>
                      </Label>
                      
                      {isEditing && (
                        <div className="relative">
                          <input
                            type="file"
                            id="resume"
                            onChange={handleResumeUpload}
                            accept=".pdf,.doc,.docx"
                            className="hidden"
                          />
                          <label
                            htmlFor="resume"
                            className="flex items-center justify-center gap-3 p-8 border-2 border-dashed border-border/60 rounded-lg hover:border-primary/50 transition-colors cursor-pointer bg-muted/20 hover:bg-muted/40"
                          >
                            <Upload className="h-8 w-8 text-muted-foreground" />
                            <div className="text-center">
                              <p className="text-sm font-medium text-foreground">
                                Click to upload or drag and drop
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                PDF, DOC, or DOCX (Max 5MB)
                              </p>
                            </div>
                          </label>
                        </div>
                      )}
                      
                      {formData.resume && (
                        <div className="flex items-center justify-between p-4 bg-accent/10 border border-accent/20 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-accent/20 rounded-lg">
                              <FileText className="h-5 w-5 text-accent" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">{formData.resume.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {(formData.resume.size / 1024).toFixed(2)} KB
                              </p>
                            </div>
                          </div>
                          {isEditing && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => setFormData(prev => ({ ...prev, resume: null }))}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  {isEditing && (
                    <div className="flex gap-4 pt-6 border-t border-border">
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 h-12 text-base font-semibold bg-gradient-hero hover:opacity-90 disabled:opacity-50"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="h-5 w-5 mr-2" />
                            Save Profile
                          </>
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsEditing(false)}
                        disabled={isSubmitting}
                        className="h-12 px-8"
                      >
                        Cancel
                      </Button>
                    </div>
                  )}
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Profile;
