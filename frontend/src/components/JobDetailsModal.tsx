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
import { 
  MapPin, 
  Briefcase, 
  Building2, 
  DollarSign, 
  Clock, 
  Users, 
  Calendar,
  ExternalLink,
  Sparkles
} from "lucide-react";

interface Job {
  id: number | string;
  title: string;
  company: string;
  location: string;
  city: string;
  state: string;
  type: string;
  workMode: string;
  salary?: { min: number; max: number; currency: string; period: string };
  skills: string[];
  description: string;
  source: string;
  postedAt: string;
  openings: number;
  experience: string;
  category: string;
}

interface JobDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  job: Job | null;
  onApply: (job: Job) => void;
}

export function JobDetailsModal({ open, onOpenChange, job, onApply }: JobDetailsModalProps) {
  if (!job) return null;

  const formatSalary = (salary: { min: number; max: number; currency: string; period: string } | undefined) => {
    if (!salary) return "Not disclosed";
    const min = salary.min / 100000;
    const max = salary.max / 100000;
    return `₹${min}-${max} LPA`;
  };

  const handleApply = () => {
    onOpenChange(false);
    onApply(job);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <DialogTitle className="text-2xl mb-2">{job.title}</DialogTitle>
              <DialogDescription className="text-base flex items-center gap-2 mb-2">
                <Building2 className="h-4 w-4" />
                {job.company}
              </DialogDescription>
              {job.source === "ai" && (
                <Badge variant="secondary" className="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">
                  <Sparkles className="h-3 w-3 mr-1" />
                  AI Sourced
                </Badge>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Quick Info */}
          <div className="grid grid-cols-2 gap-4 py-4 bg-muted/50 rounded-lg px-4">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Location</p>
                <p className="text-sm font-medium">{job.location}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Job Type</p>
                <p className="text-sm font-medium">{job.type}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Work Mode</p>
                <p className="text-sm font-medium">{job.workMode}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Salary</p>
                <p className="text-sm font-medium text-green-600 dark:text-green-400">
                  {formatSalary(job.salary)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Experience</p>
                <p className="text-sm font-medium">{job.experience}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Openings</p>
                <p className="text-sm font-medium">{job.openings}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Description */}
          <div>
            <h3 className="font-semibold text-lg mb-3">Job Description</h3>
            <p className="text-muted-foreground leading-relaxed">{job.description}</p>
          </div>

          <Separator />

          {/* Skills Required */}
          <div>
            <h3 className="font-semibold text-lg mb-3">Required Skills</h3>
            <div className="flex flex-wrap gap-2">
              {job.skills.map((skill) => (
                <Badge key={skill} variant="secondary" className="text-sm py-1.5 px-3">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>

          <Separator />

          {/* Additional Info */}
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Category:</span>
              <Badge variant="outline">{job.category}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Posted:
              </span>
              <span className="font-medium">{job.postedAt}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button onClick={handleApply} className="flex-1" size="lg">
              Apply Now
            </Button>
            {job.source === "ai" && (
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => window.open(`https://www.indeed.com/jobs?q=${encodeURIComponent(job.title)}&l=${encodeURIComponent(job.location)}`, '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Visit Source
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
