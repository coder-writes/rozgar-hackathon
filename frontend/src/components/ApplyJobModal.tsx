import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { API_ENDPOINTS } from "@/lib/api";
import { Loader2, Briefcase } from "lucide-react";

interface Job {
  id: number | string;
  title: string;
  company: string;
  location: string;
  type: string;
  salary?: { min: number; max: number; currency: string; period: string };
  source: string;
}

interface ApplyJobModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  job: Job | null;
  onSuccess: () => void;
}

export function ApplyJobModal({ open, onOpenChange, job, onSuccess }: ApplyJobModalProps) {
  const [coverLetter, setCoverLetter] = useState("");
  const [expectedSalary, setExpectedSalary] = useState("");
  const [notes, setNotes] = useState("");
  const [priority, setPriority] = useState("medium");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const resetForm = () => {
    setCoverLetter("");
    setExpectedSalary("");
    setNotes("");
    setPriority("medium");
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!job) return;

    setError("");
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("rozgar_token");
      if (!token) {
        setError("You must be logged in to apply for jobs");
        setIsSubmitting(false);
        return;
      }

      // For AI-sourced jobs, just redirect to external website
      if (job.source === "ai" && typeof job.id === 'number') {
        // Open external job posting in new tab
        window.open(`https://www.indeed.com/jobs?q=${encodeURIComponent(job.title)}&l=${encodeURIComponent(job.location)}`, '_blank');
        resetForm();
        onOpenChange(false);
        onSuccess();
        return;
      }

      // For recruiter-posted jobs, save application to database
      const applicationData = {
        jobPostId: typeof job.id === 'string' ? job.id : undefined,
        jobTitle: job.title,
        company: job.company,
        location: job.location,
        salary: job.salary ? `${job.salary.currency} ${job.salary.min}-${job.salary.max}/${job.salary.period}` : undefined,
        jobType: job.type.toLowerCase().replace('-', ''),
        applicationMethod: 'platform',
        coverLetter: coverLetter.trim() || undefined,
        notes: notes.trim() || undefined,
        expectedSalary: expectedSalary.trim() || undefined,
        priority
      };

      const response = await fetch(API_ENDPOINTS.APPLICATION_CREATE, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(applicationData)
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to submit application");
      }

      // Success
      resetForm();
      onOpenChange(false);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit application. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open && !isSubmitting) {
      resetForm();
    }
    onOpenChange(open);
  };

  if (!job) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Apply for {job.title}
          </DialogTitle>
          <DialogDescription>
            {job.source === "ai" ? (
              <span className="text-purple-600 dark:text-purple-400">
                You'll be redirected to the external job posting
              </span>
            ) : (
              <span>
                Submit your application for {job.company}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        {job.source === "ai" ? (
          // Simplified form for AI jobs (just redirect)
          <div className="py-6">
            <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4 mb-4">
              <p className="text-sm text-purple-900 dark:text-purple-100">
                This is an AI-sourced job from external websites. Clicking "Apply Now" will open the job posting in a new tab.
              </p>
            </div>
            <div className="space-y-2 text-sm">
              <p><strong>Position:</strong> {job.title}</p>
              <p><strong>Company:</strong> {job.company}</p>
              <p><strong>Location:</strong> {job.location}</p>
            </div>
          </div>
        ) : (
          // Full application form for recruiter jobs
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              {error && (
                <div className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded p-3">
                  {error}
                </div>
              )}

              <div className="grid gap-2">
                <Label htmlFor="coverLetter">
                  Cover Letter
                  <span className="text-muted-foreground text-xs ml-2">(Optional)</span>
                </Label>
                <Textarea
                  id="coverLetter"
                  placeholder="Tell the employer why you're a great fit for this role..."
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  disabled={isSubmitting}
                  rows={6}
                  className="resize-none"
                />
                <span className="text-xs text-muted-foreground">
                  {coverLetter.length}/1000 characters
                </span>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="expectedSalary">
                  Expected Salary
                  <span className="text-muted-foreground text-xs ml-2">(Optional)</span>
                </Label>
                <Input
                  id="expectedSalary"
                  placeholder="e.g., ₹10-12 LPA"
                  value={expectedSalary}
                  onChange={(e) => setExpectedSalary(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="priority">Application Priority</Label>
                <Select value={priority} onValueChange={setPriority} disabled={isSubmitting}>
                  <SelectTrigger id="priority">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-xs text-muted-foreground">
                  Track how important this application is to you
                </span>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="notes">
                  Notes
                  <span className="text-muted-foreground text-xs ml-2">(Optional)</span>
                </Label>
                <Textarea
                  id="notes"
                  placeholder="Any additional notes about this application..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  disabled={isSubmitting}
                  rows={3}
                  className="resize-none"
                />
              </div>
            </div>
          </form>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              job.source === "ai" ? "Visit Job Posting" : "Submit Application"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
