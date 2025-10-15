import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  User, 
  MapPin, 
  Mail, 
  Phone,
  Briefcase, 
  GraduationCap,
  Award,
  FileText,
  Download,
  Calendar,
  Building2,
  Link as LinkIcon
} from "lucide-react";
import { API_ENDPOINTS } from "@/lib/api";

interface ApplicantProfile {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  location?: string;
  headline?: string;
  bio?: string;
  skills: string[];
  education: Array<{
    institution: string;
    degree: string;
    field: string;
    startDate: string;
    endDate: string;
    grade?: string;
  }>;
  workExperience: Array<{
    company: string;
    position: string;
    startDate: string;
    endDate?: string;
    current: boolean;
    description: string;
  }>;
  certifications: Array<{
    name: string;
    issuer: string;
    issueDate: string;
    credentialId?: string;
    url?: string;
  }>;
  resume?: {
    filename: string;
    path: string;
    uploadedAt: string;
  };
  portfolioUrl?: string;
  linkedinUrl?: string;
  githubUrl?: string;
}

interface ApplicantProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  applicantId: string | null;
}

export function ApplicantProfileModal({ open, onOpenChange, applicantId }: ApplicantProfileModalProps) {
  const [profile, setProfile] = useState<ApplicantProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open && applicantId) {
      fetchApplicantProfile();
    }
  }, [open, applicantId]);

  const fetchApplicantProfile = async () => {
    if (!applicantId) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch(API_ENDPOINTS.PROFILE_BY_ID(applicantId));
      const data = await response.json();

      if (data.success) {
        setProfile(data.data);
      } else {
        setError(data.message || "Failed to load profile");
      }
    } catch (err) {
      console.error("Error fetching applicant profile:", err);
      setError("Failed to load applicant profile");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadResume = () => {
    if (profile?.email) {
      window.open(API_ENDPOINTS.PROFILE_RESUME(profile.email), '_blank');
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  if (!applicantId) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Applicant Profile</DialogTitle>
          <DialogDescription>
            Detailed profile information of the applicant
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-500">{error}</p>
              <Button 
                onClick={fetchApplicantProfile} 
                variant="outline" 
                className="mt-4"
              >
                Try Again
              </Button>
            </div>
          ) : profile ? (
            <div className="space-y-6">
              {/* Header Section */}
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                    <User className="w-8 h-8 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{profile.name}</h2>
                    {profile.headline && (
                      <p className="text-muted-foreground">{profile.headline}</p>
                    )}
                    <div className="flex flex-wrap gap-3 mt-2">
                      {profile.email && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Mail className="w-4 h-4" />
                          {profile.email}
                        </div>
                      )}
                      {profile.phone && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Phone className="w-4 h-4" />
                          {profile.phone}
                        </div>
                      )}
                      {profile.location && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <MapPin className="w-4 h-4" />
                          {profile.location}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {profile.resume && (
                  <Button onClick={handleDownloadResume} size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Resume
                  </Button>
                )}
              </div>

              <Separator />

              {/* Bio */}
              {profile.bio && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">About</h3>
                  <p className="text-muted-foreground">{profile.bio}</p>
                </div>
              )}

              {/* Skills */}
              {profile.skills && profile.skills.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    Skills
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.map((skill, index) => (
                      <Badge key={index} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Work Experience */}
              {profile.workExperience && profile.workExperience.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Briefcase className="w-5 h-5" />
                    Work Experience
                  </h3>
                  <div className="space-y-4">
                    {profile.workExperience.map((exp, index) => (
                      <div key={index} className="border-l-2 border-blue-600 pl-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-semibold">{exp.position}</h4>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Building2 className="w-4 h-4" />
                              {exp.company}
                            </div>
                          </div>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Calendar className="w-4 h-4" />
                            {formatDate(exp.startDate)} - {exp.current ? 'Present' : formatDate(exp.endDate || '')}
                          </div>
                        </div>
                        {exp.description && (
                          <p className="text-sm text-muted-foreground mt-2">{exp.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Education */}
              {profile.education && profile.education.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <GraduationCap className="w-5 h-5" />
                    Education
                  </h3>
                  <div className="space-y-4">
                    {profile.education.map((edu, index) => (
                      <div key={index} className="border-l-2 border-green-600 pl-4">
                        <h4 className="font-semibold">{edu.degree} in {edu.field}</h4>
                        <p className="text-sm text-muted-foreground">{edu.institution}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(edu.startDate)} - {formatDate(edu.endDate)}
                          {edu.grade && ` • Grade: ${edu.grade}`}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Certifications */}
              {profile.certifications && profile.certifications.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Certifications
                  </h3>
                  <div className="space-y-3">
                    {profile.certifications.map((cert, index) => (
                      <div key={index} className="flex items-start justify-between p-3 border rounded-lg">
                        <div>
                          <h4 className="font-semibold">{cert.name}</h4>
                          <p className="text-sm text-muted-foreground">{cert.issuer}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Issued: {formatDate(cert.issueDate)}
                          </p>
                          {cert.credentialId && (
                            <p className="text-xs text-muted-foreground">
                              ID: {cert.credentialId}
                            </p>
                          )}
                        </div>
                        {cert.url && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(cert.url, '_blank')}
                          >
                            <LinkIcon className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Links */}
              {(profile.portfolioUrl || profile.linkedinUrl || profile.githubUrl) && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Links</h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.portfolioUrl && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(profile.portfolioUrl, '_blank')}
                      >
                        <LinkIcon className="w-4 h-4 mr-2" />
                        Portfolio
                      </Button>
                    )}
                    {profile.linkedinUrl && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(profile.linkedinUrl, '_blank')}
                      >
                        <LinkIcon className="w-4 h-4 mr-2" />
                        LinkedIn
                      </Button>
                    )}
                    {profile.githubUrl && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(profile.githubUrl, '_blank')}
                      >
                        <LinkIcon className="w-4 h-4 mr-2" />
                        GitHub
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
