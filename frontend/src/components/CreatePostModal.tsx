import { useState, useEffect } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { API_ENDPOINTS } from "@/lib/api";

interface Community {
  _id: string;
  id: string;
  name: string;
  type: string;
}

interface CreatePostModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  communityId?: string;
}

export function CreatePostModal({ 
  open, 
  onOpenChange, 
  onSuccess,
  communityId 
}: CreatePostModalProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [type, setType] = useState("discussion");
  const [tags, setTags] = useState("");
  const [selectedCommunities, setSelectedCommunities] = useState<string[]>([]);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loadingCommunities, setLoadingCommunities] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Fetch user's communities when modal opens
  useEffect(() => {
    if (open) {
      fetchUserCommunities();
      // If communityId is provided, pre-select it
      if (communityId) {
        setSelectedCommunities([communityId]);
      }
    }
  }, [open, communityId]);

  const fetchUserCommunities = async () => {
    try {
      setLoadingCommunities(true);
      const token = localStorage.getItem("rozgar_token");
      const response = await fetch(API_ENDPOINTS.COMMUNITIES + '/my', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success && data.data) {
        setCommunities(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch communities:', error);
    } finally {
      setLoadingCommunities(false);
    }
  };

  const toggleCommunity = (communityId: string) => {
    setSelectedCommunities(prev => 
      prev.includes(communityId)
        ? prev.filter(id => id !== communityId)
        : [...prev, communityId]
    );
  };

  const resetForm = () => {
    setTitle("");
    setContent("");
    setType("discussion");
    setTags("");
    setSelectedCommunities(communityId ? [communityId] : []);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!title.trim()) {
      setError("Title is required");
      return;
    }
    if (title.trim().length < 5) {
      setError("Title must be at least 5 characters long");
      return;
    }
    if (title.trim().length > 200) {
      setError("Title cannot exceed 200 characters");
      return;
    }
    if (!content.trim()) {
      setError("Content is required");
      return;
    }
    if (content.trim().length < 10) {
      setError("Content must be at least 10 characters long");
      return;
    }
    if (content.trim().length > 5000) {
      setError("Content cannot exceed 5000 characters");
      return;
    }
    if (selectedCommunities.length === 0) {
      setError("Please select at least one community");
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("rozgar_token");
      if (!token) {
        setError("You must be logged in to create a post");
        setIsSubmitting(false);
        return;
      }

      const postData = {
        title: title.trim(),
        content: content.trim(),
        type,
        tags: tags.split(",").map(tag => tag.trim()).filter(tag => tag !== ""),
        communityIds: selectedCommunities
      };

      const response = await fetch(API_ENDPOINTS.FEED_POSTS, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(postData)
      });

      const responseData = await response.json();

      if (!response.ok || !responseData.success) {
        throw new Error(responseData.message || "Failed to create post");
      }

      // Success
      resetForm();
      onOpenChange(false);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create post. Please try again.");
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
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create New Post</DialogTitle>
          <DialogDescription>
            Share your thoughts, questions, or insights with the community.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {error && (
              <div className="text-sm text-red-500 bg-red-50 border border-red-200 rounded p-3">
                {error}
              </div>
            )}

            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="title">
                  Title <span className="text-red-500">*</span>
                </Label>
                <span className={`text-xs ${title.length < 5 ? 'text-red-500' : title.length > 180 ? 'text-orange-500' : 'text-muted-foreground'}`}>
                  {title.length}/200 {title.length < 5 && title.length > 0 && '(min 5)'}
                </span>
              </div>
              <Input
                id="title"
                placeholder="Enter post title (minimum 5 characters)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={isSubmitting}
                maxLength={200}
              />
            </div>

            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="content">
                  Content <span className="text-red-500">*</span>
                </Label>
                <span className={`text-xs ${content.length < 10 ? 'text-red-500' : content.length > 4800 ? 'text-orange-500' : 'text-muted-foreground'}`}>
                  {content.length}/5000 {content.length < 10 && content.length > 0 && '(min 10)'}
                </span>
              </div>
              <Textarea
                id="content"
                placeholder="What's on your mind? (minimum 10 characters)"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                disabled={isSubmitting}
                rows={6}
                className="resize-none"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="type">Post Type</Label>
              <Select value={type} onValueChange={setType} disabled={isSubmitting}>
                <SelectTrigger id="type">
                  <SelectValue placeholder="Select post type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="post">Discussion</SelectItem>
                  <SelectItem value="job">Job</SelectItem>
                  <SelectItem value="course">Course</SelectItem>
                  <SelectItem value="poll">Poll</SelectItem>
                  <SelectItem value="event">Event</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>
                Communities <span className="text-red-500">*</span>
              </Label>
              {loadingCommunities ? (
                <div className="text-sm text-muted-foreground">Loading communities...</div>
              ) : communities.length === 0 ? (
                <div className="text-sm text-muted-foreground">
                  You haven't joined any communities yet. Join communities to post!
                </div>
              ) : (
                <div className="space-y-2 max-h-40 overflow-y-auto border rounded-md p-3">
                  {communities.map((community) => (
                    <div key={community._id || community.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`community-${community._id || community.id}`}
                        checked={selectedCommunities.includes(community._id || community.id)}
                        onCheckedChange={() => toggleCommunity(community._id || community.id)}
                        disabled={isSubmitting || (communityId !== undefined && (community._id || community.id) === communityId)}
                      />
                      <label
                        htmlFor={`community-${community._id || community.id}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                      >
                        {community.name}
                        <Badge variant="outline" className="ml-2 text-xs">
                          {community.type}
                        </Badge>
                      </label>
                    </div>
                  ))}
                </div>
              )}
              {selectedCommunities.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedCommunities.map(id => {
                    const community = communities.find(c => (c._id || c.id) === id);
                    return community ? (
                      <Badge key={id} variant="secondary" className="gap-1">
                        {community.name}
                        {communityId !== id && (
                          <X 
                            className="h-3 w-3 cursor-pointer" 
                            onClick={() => toggleCommunity(id)}
                          />
                        )}
                      </Badge>
                    ) : null;
                  })}
                </div>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="tags">
                Tags
                <span className="text-muted-foreground text-xs ml-2">
                  (comma-separated)
                </span>
              </Label>
              <Input
                id="tags"
                placeholder="e.g., javascript, react, webdev"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                disabled={isSubmitting}
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
              {isSubmitting ? "Creating..." : "Create Post"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
