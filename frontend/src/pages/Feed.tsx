import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { 
  MapPin, 
  Clock, 
  Users, 
  Briefcase, 
  BookOpen, 
  MessageSquare,
  Heart,
  Share2,
  Eye,
  TrendingUp,
  Calendar,
  ChevronRight,
  PlusCircle
} from "lucide-react";
import { Link } from "react-router-dom";
import { API_ENDPOINTS } from "@/lib/api";
import { CreatePostModal } from "@/components/CreatePostModal";

interface Post {
  id: string;
  type: 'job' | 'course' | 'post' | 'poll';
  title: string;
  content: string;
  author: {
    id?: string;
    name: string;
    role: string;
    community?: string;
  };
  community: {
    id: string;
    name: string;
    type: 'location' | 'skill' | 'topic';
  };
  createdAt: string;
  engagement: {
    likes: number;
    comments: number;
    shares: number;
    views: number;
    isLikedByUser?: boolean;
  };
  metadata?: {
    company?: string;
    location?: string;
    salary?: string;
    duration?: string;
    price?: string;
    pollOptions?: string[];
  };
}

interface Community {
  id: string;
  name: string;
  members?: number;
  memberCount?: number;
  type: 'location' | 'skill' | 'topic';
}

const Feed = () => {
  const { user, isAuthenticated } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'job' | 'course' | 'post' | 'poll'>('all');
  const [showCreatePostModal, setShowCreatePostModal] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchFeedData = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem('token');
        const headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        };

        // Fetch feed posts and communities in parallel
        const [feedRes, communitiesRes] = await Promise.all([
          fetch(API_ENDPOINTS.FEED + `?page=1&limit=20&type=${activeFilter}`, { headers }),
          fetch(API_ENDPOINTS.COMMUNITIES + '/my', { headers })
        ]);

        const feedData = await feedRes.json();
        const communitiesData = await communitiesRes.json();

        if (feedData.success && feedData.data) {
          setPosts(feedData.data.posts || []);
        }

        if (communitiesData.success && communitiesData.data) {
          setCommunities(communitiesData.data || []);
        }

        setLoading(false);
      } catch (err) {
        console.error('Error fetching feed data:', err);
        setError('Failed to load feed. Please try again.');
        setLoading(false);
      }
    };

    fetchFeedData();
  }, [isAuthenticated, activeFilter]);

  const handlePostCreated = () => {
    // Refetch feed data when a new post is created
    const fetchFeedData = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        };

        const feedRes = await fetch(API_ENDPOINTS.FEED + `?page=1&limit=20&type=${activeFilter}`, { headers });
        const feedData = await feedRes.json();

        if (feedData.success && feedData.data) {
          setPosts(feedData.data.posts || []);
        }
      } catch (err) {
        console.error('Error refreshing feed:', err);
      }
    };

    fetchFeedData();
  };

  const filteredPosts = activeFilter === 'all' 
    ? posts 
    : posts.filter(post => post.type === activeFilter);

  const getPostIcon = (type: string) => {
    switch (type) {
      case 'job': return <Briefcase className="h-4 w-4" />;
      case 'course': return <BookOpen className="h-4 w-4" />;
      case 'post': return <MessageSquare className="h-4 w-4" />;
      case 'poll': return <TrendingUp className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'job': return 'bg-green-100 text-green-800';
      case 'course': return 'bg-blue-100 text-blue-800';
      case 'post': return 'bg-purple-100 text-purple-800';
      case 'poll': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  if (!isAuthenticated) {
    return null; // This should be handled by ProtectedRoute
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar - My Communities */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  My Communities
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {communities.slice(0, 4).map((community) => (
                  <Link 
                    key={community.id}
                    to={`/community/${community.id}`}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">
                        {community.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{community.name}</p>
                      <p className="text-xs text-muted-foreground">{community.memberCount || community.members || 0} members</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </Link>
                ))}
                <Link 
                  to="/communities" 
                  className="flex items-center justify-center gap-2 p-2 text-sm text-primary hover:bg-primary/10 rounded-lg transition-colors"
                >
                  View All Communities
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Main Feed */}
          <div className="lg:col-span-2">
            {/* Create Post Button */}
            <div className="mb-6">
              <Button 
                onClick={() => setShowCreatePostModal(true)} 
                className="w-full"
                size="lg"
              >
                <PlusCircle className="h-5 w-5 mr-2" />
                Create New Post
              </Button>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 mb-6 overflow-x-auto">
              {['all', 'job', 'course', 'post', 'poll'].map((filter) => (
                <Button
                  key={filter}
                  variant={activeFilter === filter ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveFilter(filter as any)}
                  className="capitalize whitespace-nowrap"
                >
                  {filter === 'all' ? 'All Posts' : `${filter}s`}
                </Button>
              ))}
            </div>

            {/* Posts */}
            <div className="space-y-6">
              {loading ? (
                // Loading skeleton
                [...Array(3)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-muted rounded-full"></div>
                        <div className="space-y-2">
                          <div className="h-4 w-32 bg-muted rounded"></div>
                          <div className="h-3 w-24 bg-muted rounded"></div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="h-4 w-full bg-muted rounded"></div>
                        <div className="h-4 w-3/4 bg-muted rounded"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                filteredPosts.map((post) => (
                  <Card key={post.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback>
                              {post.author.name.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{post.author.name}</p>
                              <Badge variant="secondary" className="text-xs">
                                {post.author.role}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Link 
                                to={`/community/${post.community.id}`}
                                className="hover:text-primary"
                              >
                                {post.community.name}
                              </Link>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {formatTimeAgo(post.createdAt)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <Badge className={`${getTypeColor(post.type)} flex items-center gap-1`}>
                          {getPostIcon(post.type)}
                          {post.type.toUpperCase()}
                        </Badge>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pt-0">
                      <h3 className="font-semibold text-lg mb-2">{post.title}</h3>
                      <p className="text-muted-foreground mb-4">{post.content}</p>
                      
                      {/* Post-specific metadata */}
                      {post.metadata && (
                        <div className="mb-4">
                          {post.type === 'job' && (
                            <div className="flex flex-wrap gap-3 text-sm">
                              {post.metadata.company && (
                                <span className="flex items-center gap-1">
                                  <Briefcase className="h-3 w-3" />
                                  {post.metadata.company}
                                </span>
                              )}
                              {post.metadata.location && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {post.metadata.location}
                                </span>
                              )}
                              {post.metadata.salary && (
                                <span className="font-medium text-green-600">
                                  {post.metadata.salary}
                                </span>
                              )}
                            </div>
                          )}
                          
                          {post.type === 'course' && (
                            <div className="flex flex-wrap gap-3 text-sm">
                              {post.metadata.duration && (
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {post.metadata.duration}
                                </span>
                              )}
                              {post.metadata.price && (
                                <span className="font-medium text-blue-600">
                                  {post.metadata.price}
                                </span>
                              )}
                            </div>
                          )}
                          
                          {post.type === 'poll' && post.metadata.pollOptions && (
                            <div className="space-y-2">
                              {post.metadata.pollOptions.map((option, index) => (
                                <div 
                                  key={index}
                                  className="p-2 border rounded-lg hover:bg-muted cursor-pointer transition-colors"
                                >
                                  {option}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                      
                      <Separator className="my-3" />
                      
                      {/* Engagement */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <Button variant="ghost" size="sm" className="gap-1">
                            <Heart className="h-4 w-4" />
                            {post.engagement.likes}
                          </Button>
                          <Button variant="ghost" size="sm" className="gap-1">
                            <MessageSquare className="h-4 w-4" />
                            {post.engagement.comments}
                          </Button>
                          <Button variant="ghost" size="sm" className="gap-1">
                            <Share2 className="h-4 w-4" />
                            {post.engagement.shares}
                          </Button>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Eye className="h-3 w-3" />
                          {post.engagement.views}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>

          {/* Right Sidebar - Trending Communities */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Trending Communities
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {communities.slice(0, 5).map((community, index) => (
                  <Link 
                    key={community.id}
                    to={`/community/${community.id}`}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-medium">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{community.name}</p>
                      <p className="text-xs text-muted-foreground">{community.memberCount || community.members || 0} members</p>
                    </div>
                  </Link>
                ))}
                <Link 
                  to="/communities/discover" 
                  className="flex items-center justify-center gap-2 p-2 text-sm text-primary hover:bg-primary/10 rounded-lg transition-colors"
                >
                  Discover More
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <CreatePostModal 
        open={showCreatePostModal}
        onOpenChange={setShowCreatePostModal}
        onSuccess={handlePostCreated}
      />
      
      <Footer />
    </div>
  );
};

export default Feed;
