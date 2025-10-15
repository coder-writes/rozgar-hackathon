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

interface CreateJobModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function CreateJobModal({ 
  open, 
  onOpenChange, 
  onSuccess 
}: CreateJobModalProps) {
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [location, setLocation] = useState("");
  const [type, setType] = useState("Full-time");
  const [salary, setSalary] = useState("");
  const [description, setDescription] = useState("");
  const [requirements, setRequirements] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const resetForm = () => {
    setTitle("");
    setCompany("");
    setLocation("");
    setType("Full-time");
    setSalary("");
    setDescription("");
    setRequirements("");
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!title.trim()) {
      setError("Job title is required");
      return;
    }
    if (!company.trim()) {
      setError("Company name is required");
      return;
    }
    if (!location.trim()) {
      setError("Location is required");
      return;
    }
    if (!description.trim()) {
      setError("Job description is required");
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("You must be logged in to post a job");
        setIsSubmitting(false);
        return;
      }

      const jobData = {
        title: title.trim(),
        company: company.trim(),
        location: location.trim(),
        type,
        salary: salary.trim() || undefined,
        description: description.trim(),
        requirements: requirements
          .split("\n")
          .map(req => req.trim())
          .filter(req => req !== "")
      };

      const response = await fetch(API_ENDPOINTS.RECRUITER_JOBS, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(jobData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create job posting");
      }

      // Success
      resetForm();
      onOpenChange(false);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create job. Please try again.");
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

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Post a New Job</DialogTitle>
          <DialogDescription>
            Create a job posting to attract talented candidates.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {error && (
              <div className="text-sm text-red-500 bg-red-50 border border-red-200 rounded p-3">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="title">
                  Job Title <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  placeholder="e.g., Senior Software Engineer"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="company">
                  Company <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="company"
                  placeholder="Company name"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="location">
                  Location <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="location"
                  placeholder="e.g., San Francisco, CA"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="type">Job Type</Label>
                <Select value={type} onValueChange={setType} disabled={isSubmitting}>
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Select job type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Full-time">Full-time</SelectItem>
                    <SelectItem value="Part-time">Part-time</SelectItem>
                    <SelectItem value="Contract">Contract</SelectItem>
                    <SelectItem value="Internship">Internship</SelectItem>
                    <SelectItem value="Freelance">Freelance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="salary">
                Salary Range
                <span className="text-muted-foreground text-xs ml-2">(optional)</span>
              </Label>
              <Input
                id="salary"
                placeholder="e.g., $80k - $120k/year"
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">
                Job Description <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="description"
                placeholder="Describe the role, responsibilities, and what you're looking for..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isSubmitting}
                rows={6}
                className="resize-none"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="requirements">
                Requirements
                <span className="text-muted-foreground text-xs ml-2">
                  (one per line)
                </span>
              </Label>
              <Textarea
                id="requirements"
                placeholder="5+ years of React experience&#10;Strong understanding of TypeScript&#10;Experience with Node.js"
                value={requirements}
                onChange={(e) => setRequirements(e.target.value)}
                disabled={isSubmitting}
                rows={5}
                className="resize-none"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Posting..." : "Post Job"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
