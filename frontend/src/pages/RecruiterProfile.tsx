import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_ENDPOINTS } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Building2, 
  MapPin, 
  Users, 
  Globe, 
  Mail, 
  Phone, 
  Briefcase,
  Calendar,
  Loader2,
  Save,
  Plus,
  X,
  Linkedin,
  Twitter,
  Facebook,
  Instagram
} from "lucide-react";

interface Location {
  address: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
}

interface HiringPosition {
  role: string;
  positions: number;
  experienceRequired: string;
  skills: string[];
}

interface SocialLinks {
  linkedin: string;
  twitter: string;
  facebook: string;
  instagram: string;
}

interface RecruiterProfile {
  _id?: string;
  companyName: string;
  companyDescription: string;
  industry: string;
  companyWebsite: string;
  companyEmail: string;
  companyPhone: string;
  companyLogo: string;
  establishedYear: number;
  numberOfEmployees: number;
  employeeRange: string;
  location: Location;
  hiringFor: HiringPosition[];
  socialLinks: SocialLinks;
  benefits: string[];
  companySize: string;
  companyType: string;
  profileCompletion: number;
}

const RecruiterProfile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isNewProfile, setIsNewProfile] = useState(false);
  
  const [profile, setProfile] = useState<RecruiterProfile>({
    companyName: "",
    companyDescription: "",
    industry: "",
    companyWebsite: "",
    companyEmail: "",
    companyPhone: "",
    companyLogo: "",
    establishedYear: new Date().getFullYear(),
    numberOfEmployees: 1,
    employeeRange: "1-10",
    location: {
      address: "",
      city: "",
      state: "",
      country: "India",
      pincode: "",
    },
    hiringFor: [],
    socialLinks: {
      linkedin: "",
      twitter: "",
      facebook: "",
      instagram: "",
    },
    benefits: [],
    companySize: "Startup",
    companyType: "Private",
    profileCompletion: 0,
  });

  const [newBenefit, setNewBenefit] = useState("");
  const [newPosition, setNewPosition] = useState<HiringPosition>({
    role: "",
    positions: 1,
    experienceRequired: "",
    skills: [],
  });
  const [newSkill, setNewSkill] = useState("");

  useEffect(() => {
    if (user?.role !== "recruiter") {
      toast({
        title: "Access Denied",
        description: "Only recruiters can access this page",
        variant: "destructive",
      });
      navigate("/");
      return;
    }
    fetchProfile();
  }, [user, navigate]);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("rozgar_token");
      const response = await axios.get(API_ENDPOINTS.RECRUITER_PROFILE, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        setProfile(response.data.data);
        setIsNewProfile(false);
      }
    } catch (error: any) {
      if (error.response?.status === 404) {
        setIsNewProfile(true);
      } else {
        console.error("Error fetching profile:", error);
        toast({
          title: "Error",
          description: "Failed to load profile",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const token = localStorage.getItem("rozgar_token");
      
      if (!token) {
        toast({
          title: "Authentication Error",
          description: "Please login again",
          variant: "destructive",
        });
        navigate("/auth");
        return;
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      console.log("Saving profile data:", profile);
      console.log("Is new profile:", isNewProfile);
      console.log("API Endpoint:", isNewProfile ? "POST" : "PUT", API_ENDPOINTS.RECRUITER_PROFILE);

      let response;
      if (isNewProfile) {
        response = await axios.post(API_ENDPOINTS.RECRUITER_PROFILE, profile, config);
      } else {
        response = await axios.put(API_ENDPOINTS.RECRUITER_PROFILE, profile, config);
      }

      console.log("API Response:", response.data);

      if (response.data.success) {
        setProfile(response.data.data);
        setIsNewProfile(false);
        toast({
          title: "Success",
          description: isNewProfile ? "Profile created successfully" : "Profile updated successfully",
        });
        
        // Redirect to feed page after successful save
        setTimeout(() => {
          navigate("/feed");
        }, 1500);
      } else {
        throw new Error(response.data.message || "Failed to save profile");
      }
    } catch (error: any) {
      console.error("Error saving profile:", error);
      console.error("Error response:", error.response?.data);
      toast({
        title: "Error",
        description: error.response?.data?.message || error.message || "Failed to save profile",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAddBenefit = () => {
    if (newBenefit.trim()) {
      setProfile({ ...profile, benefits: [...profile.benefits, newBenefit.trim()] });
      setNewBenefit("");
    }
  };

  const handleRemoveBenefit = (index: number) => {
    setProfile({
      ...profile,
      benefits: profile.benefits.filter((_, i) => i !== index),
    });
  };

  const handleAddPosition = () => {
    if (newPosition.role.trim() && newPosition.positions > 0) {
      setProfile({ ...profile, hiringFor: [...profile.hiringFor, newPosition] });
      setNewPosition({
        role: "",
        positions: 1,
        experienceRequired: "",
        skills: [],
      });
    }
  };

  const handleRemovePosition = (index: number) => {
    setProfile({
      ...profile,
      hiringFor: profile.hiringFor.filter((_, i) => i !== index),
    });
  };

  const handleAddSkill = () => {
    if (newSkill.trim()) {
      setNewPosition({
        ...newPosition,
        skills: [...newPosition.skills, newSkill.trim()],
      });
      setNewSkill("");
    }
  };

  const handleRemoveSkill = (index: number) => {
    setNewPosition({
      ...newPosition,
      skills: newPosition.skills.filter((_, i) => i !== index),
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle py-8">
      <div className="container max-w-4xl mx-auto px-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Building2 className="h-8 w-8 text-primary" />
            Recruiter Profile
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage your company information and hiring requirements
          </p>
          {profile.profileCompletion !== undefined && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Profile Completion</span>
                <span className="text-sm font-semibold">{profile.profileCompletion}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-primary rounded-full h-2 transition-all"
                  style={{ width: `${profile.profileCompletion}%` }}
                />
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Company Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Company Information
              </CardTitle>
              <CardDescription>Basic information about your company</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name *</Label>
                  <Input
                    id="companyName"
                    value={profile.companyName}
                    onChange={(e) => setProfile({ ...profile, companyName: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="industry">Industry</Label>
                  <Input
                    id="industry"
                    value={profile.industry}
                    onChange={(e) => setProfile({ ...profile, industry: e.target.value })}
                    placeholder="e.g., Technology, Healthcare"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="companyDescription">Company Description</Label>
                <Textarea
                  id="companyDescription"
                  value={profile.companyDescription}
                  onChange={(e) => setProfile({ ...profile, companyDescription: e.target.value })}
                  rows={4}
                  placeholder="Tell us about your company..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companyWebsite">Website</Label>
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <Input
                      id="companyWebsite"
                      type="url"
                      value={profile.companyWebsite}
                      onChange={(e) => setProfile({ ...profile, companyWebsite: e.target.value })}
                      placeholder="https://example.com"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyEmail">Company Email</Label>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <Input
                      id="companyEmail"
                      type="email"
                      value={profile.companyEmail}
                      onChange={(e) => setProfile({ ...profile, companyEmail: e.target.value })}
                      placeholder="contact@example.com"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companyPhone">Phone Number</Label>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <Input
                      id="companyPhone"
                      type="tel"
                      value={profile.companyPhone}
                      onChange={(e) => setProfile({ ...profile, companyPhone: e.target.value })}
                      placeholder="+91 1234567890"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="establishedYear">Established Year *</Label>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <Input
                      id="establishedYear"
                      type="number"
                      min="1800"
                      max={new Date().getFullYear()}
                      value={profile.establishedYear}
                      onChange={(e) => setProfile({ ...profile, establishedYear: parseInt(e.target.value) })}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="numberOfEmployees">Number of Employees *</Label>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <Input
                      id="numberOfEmployees"
                      type="number"
                      min="1"
                      value={profile.numberOfEmployees}
                      onChange={(e) => setProfile({ ...profile, numberOfEmployees: parseInt(e.target.value) })}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="employeeRange">Employee Range</Label>
                  <Select
                    value={profile.employeeRange}
                    onValueChange={(value) => setProfile({ ...profile, employeeRange: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-10">1-10</SelectItem>
                      <SelectItem value="11-50">11-50</SelectItem>
                      <SelectItem value="51-200">51-200</SelectItem>
                      <SelectItem value="201-500">201-500</SelectItem>
                      <SelectItem value="501-1000">501-1000</SelectItem>
                      <SelectItem value="1000+">1000+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companySize">Company Size</Label>
                  <Select
                    value={profile.companySize}
                    onValueChange={(value) => setProfile({ ...profile, companySize: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Startup">Startup</SelectItem>
                      <SelectItem value="Small">Small</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="Large">Large</SelectItem>
                      <SelectItem value="Enterprise">Enterprise</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="companyType">Company Type</Label>
                <Select
                  value={profile.companyType}
                  onValueChange={(value) => setProfile({ ...profile, companyType: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Private">Private</SelectItem>
                    <SelectItem value="Public">Public</SelectItem>
                    <SelectItem value="Government">Government</SelectItem>
                    <SelectItem value="Non-Profit">Non-Profit</SelectItem>
                    <SelectItem value="Startup">Startup</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Location */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Location
              </CardTitle>
              <CardDescription>Where is your company located?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={profile.location.address}
                  onChange={(e) => setProfile({
                    ...profile,
                    location: { ...profile.location, address: e.target.value }
                  })}
                  placeholder="Street address"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={profile.location.city}
                    onChange={(e) => setProfile({
                      ...profile,
                      location: { ...profile.location, city: e.target.value }
                    })}
                    placeholder="City"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={profile.location.state}
                    onChange={(e) => setProfile({
                      ...profile,
                      location: { ...profile.location, state: e.target.value }
                    })}
                    placeholder="State"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    value={profile.location.country}
                    onChange={(e) => setProfile({
                      ...profile,
                      location: { ...profile.location, country: e.target.value }
                    })}
                    placeholder="Country"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pincode">Pincode</Label>
                  <Input
                    id="pincode"
                    value={profile.location.pincode}
                    onChange={(e) => setProfile({
                      ...profile,
                      location: { ...profile.location, pincode: e.target.value }
                    })}
                    placeholder="Pincode"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Hiring Positions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Currently Hiring For
              </CardTitle>
              <CardDescription>Add positions you're actively recruiting for</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {profile.hiringFor.map((position, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold">{position.role}</h4>
                      <p className="text-sm text-muted-foreground">
                        {position.positions} position{position.positions > 1 ? 's' : ''} • {position.experienceRequired}
                      </p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {position.skills.map((skill, skillIndex) => (
                          <Badge key={skillIndex} variant="secondary">{skill}</Badge>
                        ))}
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemovePosition(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}

              <Separator />

              <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                <h4 className="font-semibold text-sm">Add New Position</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    placeholder="Role (e.g., Software Engineer)"
                    value={newPosition.role}
                    onChange={(e) => setNewPosition({ ...newPosition, role: e.target.value })}
                  />
                  <Input
                    type="number"
                    min="1"
                    placeholder="Number of positions"
                    value={newPosition.positions}
                    onChange={(e) => setNewPosition({ ...newPosition, positions: parseInt(e.target.value) || 1 })}
                  />
                </div>
                <Input
                  placeholder="Experience required (e.g., 2-4 years)"
                  value={newPosition.experienceRequired}
                  onChange={(e) => setNewPosition({ ...newPosition, experienceRequired: e.target.value })}
                />
                <div className="space-y-2">
                  <Label>Required Skills</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add skill"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                    />
                    <Button type="button" onClick={handleAddSkill} size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {newPosition.skills.map((skill, index) => (
                      <Badge key={index} variant="secondary">
                        {skill}
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(index)}
                          className="ml-2"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
                <Button type="button" onClick={handleAddPosition} size="sm" className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Position
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Benefits */}
          <Card>
            <CardHeader>
              <CardTitle>Company Benefits</CardTitle>
              <CardDescription>What benefits do you offer?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {profile.benefits.map((benefit, index) => (
                  <Badge key={index} variant="secondary">
                    {benefit}
                    <button
                      type="button"
                      onClick={() => handleRemoveBenefit(index)}
                      className="ml-2"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Add benefit (e.g., Health Insurance)"
                  value={newBenefit}
                  onChange={(e) => setNewBenefit(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddBenefit())}
                />
                <Button type="button" onClick={handleAddBenefit} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Social Links */}
          <Card>
            <CardHeader>
              <CardTitle>Social Media</CardTitle>
              <CardDescription>Connect your company's social profiles</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="linkedin">LinkedIn</Label>
                <div className="flex items-center gap-2">
                  <Linkedin className="h-4 w-4 text-muted-foreground" />
                  <Input
                    id="linkedin"
                    value={profile.socialLinks.linkedin}
                    onChange={(e) => setProfile({
                      ...profile,
                      socialLinks: { ...profile.socialLinks, linkedin: e.target.value }
                    })}
                    placeholder="https://linkedin.com/company/..."
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="twitter">Twitter</Label>
                <div className="flex items-center gap-2">
                  <Twitter className="h-4 w-4 text-muted-foreground" />
                  <Input
                    id="twitter"
                    value={profile.socialLinks.twitter}
                    onChange={(e) => setProfile({
                      ...profile,
                      socialLinks: { ...profile.socialLinks, twitter: e.target.value }
                    })}
                    placeholder="https://twitter.com/..."
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="facebook">Facebook</Label>
                <div className="flex items-center gap-2">
                  <Facebook className="h-4 w-4 text-muted-foreground" />
                  <Input
                    id="facebook"
                    value={profile.socialLinks.facebook}
                    onChange={(e) => setProfile({
                      ...profile,
                      socialLinks: { ...profile.socialLinks, facebook: e.target.value }
                    })}
                    placeholder="https://facebook.com/..."
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="instagram">Instagram</Label>
                <div className="flex items-center gap-2">
                  <Instagram className="h-4 w-4 text-muted-foreground" />
                  <Input
                    id="instagram"
                    value={profile.socialLinks.instagram}
                    onChange={(e) => setProfile({
                      ...profile,
                      socialLinks: { ...profile.socialLinks, instagram: e.target.value }
                    })}
                    placeholder="https://instagram.com/..."
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex gap-4">
            <Button type="submit" disabled={saving} className="flex-1">
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {isNewProfile ? "Create Profile" : "Save Changes"}
                </>
              )}
            </Button>
            <Button type="button" variant="outline" onClick={() => navigate("/feed")}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RecruiterProfile;
