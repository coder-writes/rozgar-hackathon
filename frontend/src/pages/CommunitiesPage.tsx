import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  MapPin, 
  TrendingUp, 
  MessageSquare,
  Search,
  Filter,
  UserPlus,
  BookOpen,
  Code,
  Briefcase
} from "lucide-react";
import { API_ENDPOINTS } from "@/lib/api";
import { CreateCommunityModal } from "@/components/CreateCommunityModal";

interface Community {
  id: string;
  _id?: string;
  name: string;
  description: string;
  type: 'location' | 'skill' | 'topic';
  members?: number;
  memberCount?: number;
  posts?: number;
  postCount?: number;
  isJoined: boolean;
  tags: string[];
  trending?: boolean;
  featured?: boolean;
}

const CommunitiesPage = () => {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [filteredCommunities, setFilteredCommunities] = useState<Community[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'location' | 'skill' | 'topic'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCommunities = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem('rozgar_token');
        const headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        };

        const type = activeFilter === 'all' ? '' : `&type=${activeFilter}`;
        const search = searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : '';
        
        const response = await fetch(
          API_ENDPOINTS.COMMUNITIES + `?page=1&limit=50${type}${search}`,
          { headers }
        );

        const data = await response.json();

        if (data.success && data.data) {
          const formattedCommunities = (data.data.communities || []).map((comm: any) => ({
            id: comm._id || comm.id,
            name: comm.name,
            description: comm.description,
            type: comm.type,
            members: comm.memberCount || comm.members || 0,
            posts: comm.postCount || comm.posts || 0,
            isJoined: comm.isJoined || false,
            tags: comm.tags || [],
            trending: comm.trending,
            featured: comm.featured
          }));
          
          setCommunities(formattedCommunities);
          setFilteredCommunities(formattedCommunities);
        }

        setLoading(false);
      } catch (err) {
        console.error('Error fetching communities:', err);
        setError('Failed to load communities. Please try again.');
        setLoading(false);
      }
    };

    fetchCommunities();
  }, [activeFilter, searchQuery]);

  const handleJoinCommunity = async (communityId: string) => {
    try {
      const token = localStorage.getItem('rozgar_token');
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };

      const community = communities.find(c => c.id === communityId);
      if (!community) return;

      const endpoint = community.isJoined 
        ? API_ENDPOINTS.COMMUNITY_LEAVE(communityId)
        : API_ENDPOINTS.COMMUNITY_JOIN(communityId);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers
      });

      const data = await response.json();

      if (data.success) {
        // Update local state
        setCommunities(prev =>
          prev.map(comm =>
            comm.id === communityId
              ? {
                  ...comm,
                  isJoined: !comm.isJoined,
                  members: data.data.memberCount || (comm.isJoined ? comm.members! - 1 : comm.members! + 1)
                }
              : comm
          )
        );
        setFilteredCommunities(prev =>
          prev.map(comm =>
            comm.id === communityId
              ? {
                  ...comm,
                  isJoined: !comm.isJoined,
                  members: data.data.memberCount || (comm.isJoined ? comm.members! - 1 : comm.members! + 1)
                }
              : comm
          )
        );
      }
    } catch (err) {
      console.error('Error joining/leaving community:', err);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'location': return <MapPin className="h-4 w-4" />;
      case 'skill': return <Code className="h-4 w-4" />;
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

  const [showCreateModal, setShowCreateModal] = useState(false);

  const featuredCommunities = communities.filter(c => c.featured);
  const trendingCommunities = communities.filter(c => c.trending);

  const handleCommunityCreated = () => {
    // Refresh communities list
    const fetchCommunities = async () => {
      try {
        const token = localStorage.getItem('rozgar_token');
        const headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        };

        const type = activeFilter === 'all' ? '' : `&type=${activeFilter}`;
        const search = searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : '';
        
        const response = await fetch(
          API_ENDPOINTS.COMMUNITIES + `?page=1&limit=50${type}${search}`,
          { headers }
        );

        const data = await response.json();

        if (data.success && data.data) {
          const formattedCommunities = (data.data.communities || []).map((comm: any) => ({
            id: comm._id || comm.id,
            name: comm.name,
            description: comm.description,
            type: comm.type,
            members: comm.memberCount || comm.members || 0,
            posts: comm.postCount || comm.posts || 0,
            isJoined: comm.isJoined || false,
            tags: comm.tags || [],
            trending: comm.trending,
            featured: comm.featured
          }));
          
          setCommunities(formattedCommunities);
          setFilteredCommunities(formattedCommunities);
        }
      } catch (err) {
        console.error('Error fetching communities:', err);
      }
    };
    fetchCommunities();
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-4xl font-bold">Discover Communities</h1>
            <Button onClick={() => setShowCreateModal(true)}>
              <UserPlus className="h-4 w-4 mr-2" />
              Create Community
            </Button>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Find and join communities based on your location, skills, and interests. 
            Connect with like-minded professionals and grow your network.
          </p>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search communities, skills, or locations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="flex gap-2">
                {['all', 'location', 'skill', 'topic'].map((filter) => (
                  <Button
                    key={filter}
                    variant={activeFilter === filter ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setActiveFilter(filter as any)}
                    className="capitalize"
                  >
                    {filter === 'all' ? 'All' : filter}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Featured Communities */}
        {!searchQuery && activeFilter === 'all' && featuredCommunities.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <TrendingUp className="h-6 w-6" />
              Featured Communities
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredCommunities.slice(0, 3).map((community) => (
                <Card key={community.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback>
                          {community.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <Badge className={`${getTypeColor(community.type)} flex items-center gap-1`}>
                        {getTypeIcon(community.type)}
                        {community.type}
                      </Badge>
                    </div>
                    <div>
                      <Link to={`/community/${community.id}`} className="hover:text-primary">
                        <h3 className="text-lg font-semibold">{community.name}</h3>
                      </Link>
                      <p className="text-sm text-muted-foreground">{community.description}</p>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-1 mb-4">
                      {community.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {community.members.toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />
                        {community.posts} posts
                      </span>
                    </div>
                    
                    <Button
                      onClick={() => handleJoinCommunity(community.id)}
                      className={`w-full ${community.isJoined ? 'bg-green-600 hover:bg-green-700' : ''}`}
                      size="sm"
                    >
                      {community.isJoined ? (
                        <>
                          <Users className="h-4 w-4 mr-2" />
                          Joined
                        </>
                      ) : (
                        <>
                          <UserPlus className="h-4 w-4 mr-2" />
                          Join
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* All Communities */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">
              {searchQuery ? `Search Results (${filteredCommunities.length})` : 'All Communities'}
            </h2>
            <div className="text-sm text-muted-foreground">
              Showing {filteredCommunities.length} communities
            </div>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 bg-muted rounded-full"></div>
                      <div className="space-y-2">
                        <div className="h-4 w-32 bg-muted rounded"></div>
                        <div className="h-3 w-24 bg-muted rounded"></div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="h-3 w-full bg-muted rounded"></div>
                      <div className="h-3 w-3/4 bg-muted rounded"></div>
                      <div className="h-8 w-full bg-muted rounded"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <>
              {filteredCommunities.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredCommunities.map((community) => (
                    <Card key={community.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <Avatar className="h-12 w-12">
                            <AvatarFallback>
                              {community.name.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex gap-1">
                            {community.trending && (
                              <Badge variant="secondary" className="text-xs">
                                🔥 Trending
                              </Badge>
                            )}
                            <Badge className={`${getTypeColor(community.type)} flex items-center gap-1`}>
                              {getTypeIcon(community.type)}
                              {community.type}
                            </Badge>
                          </div>
                        </div>
                        <div>
                          <Link to={`/community/${community.id}`} className="hover:text-primary">
                            <h3 className="text-lg font-semibold">{community.name}</h3>
                          </Link>
                          <p className="text-sm text-muted-foreground">{community.description}</p>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-1 mb-4">
                          {community.tags.slice(0, 3).map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {community.tags.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{community.tags.length - 3} more
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {community.members.toLocaleString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageSquare className="h-3 w-3" />
                            {community.posts} posts
                          </span>
                        </div>
                        
                        <Button
                          onClick={() => handleJoinCommunity(community.id)}
                          className={`w-full ${community.isJoined ? 'bg-green-600 hover:bg-green-700' : ''}`}
                          size="sm"
                        >
                          {community.isJoined ? (
                            <>
                              <Users className="h-4 w-4 mr-2" />
                              Joined
                            </>
                          ) : (
                            <>
                              <UserPlus className="h-4 w-4 mr-2" />
                              Join
                            </>
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="text-center py-12">
                  <CardContent>
                    <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No communities found</h3>
                    <p className="text-muted-foreground">
                      Try adjusting your search terms or filters to find communities.
                    </p>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </div>
      
      <CreateCommunityModal 
        open={showCreateModal} 
        onOpenChange={setShowCreateModal}
        onSuccess={handleCommunityCreated}
      />
      
      <Footer />
    </div>
  );
};

export default CommunitiesPage;
