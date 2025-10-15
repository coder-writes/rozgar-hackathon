import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { API_ENDPOINTS } from "@/lib/api";
import { 
  Users, 
  MapPin, 
  Calendar, 
  TrendingUp, 
  MessageSquare,
  Settings,
  UserPlus,
  Bell,
  Share2,
  MoreVertical,
  ArrowLeft
} from "lucide-react";

interface CommunityData {
  id: string;
  name: string;
  description: string;
  type: 'location' | 'skill' | 'topic';
  members: number;
  posts: number;
  createdAt: string;
  isJoined: boolean;
  bannerImage?: string;
  tags: string[];
  admins: Array<{
    name: string;
    role: string;
  }>;
  rules: string[];
}

interface CommunityPost {
  id: string;
  title: string;
  content: string;
  author: string;
  createdAt: string;
  likes: number;
  comments: number;
  type: 'discussion' | 'job' | 'resource' | 'event';
}

// Mock data - replace with actual API calls
const mockCommunityData: Record<string, CommunityData> = {
  'mumbai-tech': {
    id: 'mumbai-tech',
    name: 'Mumbai Tech Community',
    description: 'A vibrant community of tech professionals, entrepreneurs, and enthusiasts in Mumbai. Connect, learn, and grow together in the city of dreams.',
    type: 'location',
    members: 2400,
    posts: 156,
    createdAt: '2023-06-15',
    isJoined: true,
    tags: ['Technology', 'Networking', 'Startups', 'Jobs'],
    admins: [
      { name: 'Raj Patel', role: 'Community Manager' },
      { name: 'Priya Sharma', role: 'Tech Lead' }
    ],
    rules: [
      'Be respectful and professional',
      'No spam or self-promotion without permission',
      'Share relevant content only',
      'Help others in the community',
      'Follow Mumbai tech scene guidelines'
    ]
  },
  'js-devs': {
    id: 'js-devs',
    name: 'JavaScript Developers',
    description: 'A community for JavaScript developers of all levels. Share knowledge, ask questions, and stay updated with the latest in the JS ecosystem.',
    type: 'skill',
    members: 8900,
    posts: 543,
    createdAt: '2023-01-20',
    isJoined: true,
    tags: ['JavaScript', 'React', 'Node.js', 'TypeScript', 'Vue'],
    admins: [
      { name: 'Alex Johnson', role: 'Senior Developer' },
      { name: 'Maria Garcia', role: 'Tech Educator' }
    ],
    rules: [
      'Keep discussions JavaScript-related',
      'Provide code examples when asking for help',
      'No framework wars or toxic behavior',
      'Share learning resources',
      'Help beginners learn'
    ]
  }
};

const mockPosts: CommunityPost[] = [
  {
    id: '1',
    title: 'React 18 Best Practices Discussion',
    content: 'What are your favorite React 18 features and how have you implemented them in your projects?',
    author: 'Sarah Dev',
    createdAt: '2024-01-15T10:30:00Z',
    likes: 24,
    comments: 12,
    type: 'discussion'
  },
  {
    id: '2',
    title: 'Frontend Developer Position - Remote',
    content: 'We are hiring a mid-level frontend developer. 3+ years experience required.',
    author: 'Tech Recruiter',
    createdAt: '2024-01-14T14:20:00Z',
    likes: 8,
    comments: 5,
    type: 'job'
  }
];

const CommunityPage = () => {
  const { communityId } = useParams<{ communityId: string }>();
  const [community, setCommunity] = useState<CommunityData | null>(null);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('posts');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (communityId) {
      fetchCommunityData();
    }
  }, [communityId]);

  useEffect(() => {
    if (communityId && activeTab === 'posts') {
      fetchCommunityPosts();
    } else if (communityId && activeTab === 'members') {
      fetchCommunityMembers();
    }
  }, [communityId, activeTab]);

  const fetchCommunityData = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('rozgar_token');
      
      const response = await fetch(API_ENDPOINTS.COMMUNITY_BY_ID(communityId!), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success && data.data) {
        const communityData = data.data;
        setCommunity({
          id: communityData._id,
          name: communityData.name,
          description: communityData.description,
          type: communityData.type,
          members: communityData.memberCount || 0,
          posts: communityData.postCount || 0,
          createdAt: communityData.createdAt,
          isJoined: communityData.isJoined,
          tags: communityData.tags || [],
          admins: communityData.admins || [],
          rules: communityData.rules || []
        });
      } else {
        setError('Community not found');
      }
    } catch (err) {
      console.error('Error fetching community:', err);
      setError('Failed to load community');
    } finally {
      setLoading(false);
    }
  };

  const fetchCommunityPosts = async () => {
    try {
      const token = localStorage.getItem('rozgar_token');
      
      const response = await fetch(API_ENDPOINTS.COMMUNITY_POSTS(communityId!), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success && data.data && data.data.posts) {
        setPosts(data.data.posts.map((post: any) => ({
          id: post.id,
          title: post.title,
          content: post.content,
          author: post.author.name,
          createdAt: post.createdAt,
          likes: post.engagement.likes,
          comments: post.engagement.comments,
          type: post.type
        })));
      }
    } catch (err) {
      console.error('Error fetching posts:', err);
    }
  };

  const fetchCommunityMembers = async () => {
    try {
      const token = localStorage.getItem('rozgar_token');
      
      const response = await fetch(API_ENDPOINTS.COMMUNITY_MEMBERS(communityId!), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success && data.data) {
        setMembers(data.data.members || []);
      }
    } catch (err) {
      console.error('Error fetching members:', err);
    }
  };

  const handleJoinCommunity = async () => {
    if (!community) return;
    
    try {
      const token = localStorage.getItem('rozgar_token');
      const endpoint = community.isJoined 
        ? API_ENDPOINTS.COMMUNITY_LEAVE(communityId!)
        : API_ENDPOINTS.COMMUNITY_JOIN(communityId!);
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        setCommunity({
          ...community,
          isJoined: !community.isJoined,
          members: community.isJoined ? community.members - 1 : community.members + 1
        });
      }
    } catch (err) {
      console.error('Error joining/leaving community:', err);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'location': return <MapPin className="h-4 w-4" />;
      case 'skill': return <TrendingUp className="h-4 w-4" />;
      case 'topic': return <MessageSquare className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'location': return 'bg-blue-100 text-blue-800';
      case 'skill': return 'bg-green-100 text-green-800';
      case 'topic': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-48 bg-muted rounded-lg"></div>
            <div className="h-20 bg-muted rounded-lg"></div>
            <div className="h-40 bg-muted rounded-lg"></div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!community) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Card className="text-center py-12">
            <CardContent>
              <h2 className="text-2xl font-bold mb-4">Community Not Found</h2>
              <p className="text-muted-foreground mb-6">The community you're looking for doesn't exist or has been removed.</p>
              <Link to="/feed">
                <Button>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Feed
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Back button */}
        <Link to="/feed" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4" />
          Back to Feed
        </Link>

        {/* Community Header */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              <Avatar className="h-20 w-20 mx-auto md:mx-0">
                <AvatarFallback className="text-2xl">
                  {community.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-col md:flex-row md:items-center gap-3 mb-3">
                  <h1 className="text-3xl font-bold">{community.name}</h1>
                  <Badge className={`${getTypeColor(community.type)} flex items-center gap-1 w-fit mx-auto md:mx-0`}>
                    {getTypeIcon(community.type)}
                    {community.type.charAt(0).toUpperCase() + community.type.slice(1)}
                  </Badge>
                </div>
                
                <p className="text-muted-foreground mb-4">{community.description}</p>
                
                <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-muted-foreground mb-4">
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {community.members.toLocaleString()} members
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageSquare className="h-4 w-4" />
                    {community.posts} posts
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Created {formatDate(community.createdAt)}
                  </span>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {community.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div className="flex flex-col gap-2 mx-auto md:mx-0">
                <Button 
                  onClick={handleJoinCommunity}
                  className={community.isJoined ? 'bg-green-600 hover:bg-green-700' : ''}
                >
                  {community.isJoined ? (
                    <>
                      <Users className="h-4 w-4 mr-2" />
                      Joined
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Join Community
                    </>
                  )}
                </Button>
                
                {community.isJoined && (
                  <>
                    <Button variant="outline" size="sm">
                      <Bell className="h-4 w-4 mr-2" />
                      Notifications
                    </Button>
                    <Button variant="outline" size="sm">
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-4 w-full mb-6">
                <TabsTrigger value="posts">Posts</TabsTrigger>
                <TabsTrigger value="events">Events</TabsTrigger>
                <TabsTrigger value="resources">Resources</TabsTrigger>
                <TabsTrigger value="members">Members</TabsTrigger>
              </TabsList>

              <TabsContent value="posts" className="space-y-4">
                {posts.map((post) => (
                  <Card key={post.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold">{post.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            by {post.author} • {formatDate(post.createdAt)}
                          </p>
                        </div>
                        <Badge variant="outline" className="capitalize">
                          {post.type}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-4">{post.content}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" />
                          {post.likes} likes
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" />
                          {post.comments} comments
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="events">
                <Card>
                  <CardContent className="text-center py-12">
                    <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No upcoming events</h3>
                    <p className="text-muted-foreground">Stay tuned for community events and meetups!</p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="resources">
                <Card>
                  <CardContent className="text-center py-12">
                    <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No resources yet</h3>
                    <p className="text-muted-foreground">Community resources and guides will appear here.</p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="members">
                <Card>
                  <CardHeader>
                    <CardTitle>Members ({community.members.toLocaleString()})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {members.length === 0 ? (
                      <div className="text-center py-12">
                        <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Loading members...</h3>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {members.map((member, index) => (
                          <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10">
                                <AvatarFallback>
                                  {member.user?.name?.substring(0, 2).toUpperCase() || 'U'}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{member.user?.name || 'Unknown User'}</p>
                                <p className="text-sm text-muted-foreground">
                                  {member.user?.location || 'Location not specified'}
                                </p>
                                {member.user?.skills && member.user.skills.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {member.user.skills.slice(0, 3).map((skill: string, i: number) => (
                                      <Badge key={i} variant="secondary" className="text-xs">
                                        {skill}
                                      </Badge>
                                    ))}
                                    {member.user.skills.length > 3 && (
                                      <Badge variant="secondary" className="text-xs">
                                        +{member.user.skills.length - 3}
                                      </Badge>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {member.isAdmin && (
                                <Badge variant="default" className="text-xs">Admin</Badge>
                              )}
                              {member.isModerator && (
                                <Badge variant="outline" className="text-xs">Mod</Badge>
                              )}
                              <Badge variant="outline" className="text-xs capitalize">
                                {member.role || 'Member'}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Community Rules */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Community Rules</CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="space-y-2 text-sm">
                  {community.rules.map((rule, index) => (
                    <li key={index} className="flex gap-2">
                      <span className="font-medium text-primary">{index + 1}.</span>
                      <span>{rule}</span>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>

            {/* Admins */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Admins</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {community.admins.map((admin, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">
                        {admin.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{admin.name}</p>
                      <p className="text-xs text-muted-foreground">{admin.role}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default CommunityPage;
