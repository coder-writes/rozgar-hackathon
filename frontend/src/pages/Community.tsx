import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MessageSquare, ExternalLink, Github, Heart } from "lucide-react";

const mockPosts = [
  {
    id: 1,
    author: "Priya Sharma",
    title: "Built a Task Management App with React",
    description: "Just finished my first full-stack project! Built a task manager using React, Node.js, and MongoDB. Looking for feedback on the code structure and best practices.",
    skills: ["React", "Node.js", "MongoDB"],
    githubLink: "https://github.com",
    liveDemo: "https://demo.com",
    likes: 24,
    comments: 8,
    postedAt: "2 hours ago"
  },
  {
    id: 2,
    author: "Rahul Kumar",
    title: "Open Source Contribution Guide",
    description: "Created a comprehensive guide for beginners wanting to start contributing to open source projects. Includes finding projects, making your first PR, and etiquette.",
    skills: ["Git", "Open Source"],
    githubLink: "https://github.com",
    liveDemo: null,
    likes: 56,
    comments: 15,
    postedAt: "1 day ago"
  },
  {
    id: 3,
    author: "Anjali Verma",
    title: "E-commerce Platform with Stripe Integration",
    description: "Built a complete e-commerce solution with payment processing, inventory management, and order tracking. Happy to help others integrate Stripe!",
    skills: ["Next.js", "Stripe", "PostgreSQL"],
    githubLink: "https://github.com",
    liveDemo: "https://demo.com",
    likes: 42,
    comments: 12,
    postedAt: "3 days ago"
  },
];

const Community = () => {
  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold mb-2 text-foreground">Community</h1>
            <p className="text-muted-foreground">Share your work and learn from others</p>
          </div>
          <Button>Share Your Project</Button>
        </div>

        {/* Community Posts */}
        <div className="space-y-6">
          {mockPosts.map(post => (
            <Card key={post.id} className="p-6 hover:shadow-md transition-shadow">
              <div className="flex gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {post.author.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-lg font-bold text-card-foreground">{post.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        by {post.author} • {post.postedAt}
                      </p>
                    </div>
                  </div>

                  <p className="text-muted-foreground mb-4">{post.description}</p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {post.skills.map(skill => (
                      <Badge key={skill} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex items-center gap-4">
                    {post.githubLink && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={post.githubLink} target="_blank" rel="noopener noreferrer">
                          <Github className="h-4 w-4 mr-1" />
                          Code
                        </a>
                      </Button>
                    )}
                    
                    {post.liveDemo && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={post.liveDemo} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4 mr-1" />
                          Live Demo
                        </a>
                      </Button>
                    )}

                    <div className="flex-1" />

                    <Button variant="ghost" size="sm">
                      <Heart className="h-4 w-4 mr-1" />
                      {post.likes}
                    </Button>

                    <Button variant="ghost" size="sm">
                      <MessageSquare className="h-4 w-4 mr-1" />
                      {post.comments}
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Community;
