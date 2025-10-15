import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  LayoutDashboard,
  Briefcase, 
  BookOpen, 
  TrendingUp,
  Clock,
  MapPin,
  Building,
  Calendar,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Eye,
  ArrowRight,
  Star,
  PlayCircle,
  Users,
  Target,
  Award
} from "lucide-react";
import { Link } from "react-router-dom";
import { API_ENDPOINTS } from "@/lib/api";

interface Application {
  id: string;
  jobTitle: string;
  company: string;
  appliedDate: string;
  status: 'applied' | 'reviewing' | 'interview' | 'rejected' | 'offered';
  location: string;
  salary: string;
  type: 'full-time' | 'part-time' | 'contract' | 'internship';
}

interface JobRecommendation {
  id: string;
  jobId?: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  type: 'full-time' | 'part-time' | 'contract' | 'internship';
  matchScore: number;
  postedDate: string;
  description: string;
  skills: string[];
}

interface OngoingCourse {
  id: string;
  courseId?: string;
  title: string;
  instructor: string;
  progress: number;
  totalLessons: number;
  completedLessons: number;
  estimatedTime: string;
  thumbnail: string;
  nextLesson: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

const Dashboard = () => {
  const { user, profile, isAuthenticated } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [recommendations, setRecommendations] = useState<JobRecommendation[]>([]);
  const [courses, setCourses] = useState<OngoingCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem('token');
        const headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        };

        // Fetch all dashboard data in parallel
        const [applicationsRes, recommendationsRes, coursesRes] = await Promise.all([
          fetch(API_ENDPOINTS.DASHBOARD_APPLICATIONS + '?limit=10', { headers }),
          fetch(API_ENDPOINTS.DASHBOARD_RECOMMENDATIONS + '?limit=10', { headers }),
          fetch(API_ENDPOINTS.DASHBOARD_COURSES + '?limit=10', { headers })
        ]);

        // Parse responses
        const applicationsData = await applicationsRes.json();
        const recommendationsData = await recommendationsRes.json();
        const coursesData = await coursesRes.json();

        // Set applications
        if (applicationsData.success && applicationsData.data) {
          setApplications(applicationsData.data);
        }

        // Set recommendations
        if (recommendationsData.success && recommendationsData.data) {
          setRecommendations(recommendationsData.data);
        }

        // Set courses
        if (coursesData.success && coursesData.data) {
          setCourses(coursesData.data);
        }

        setLoading(false);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again.');
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [isAuthenticated]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'applied': return <Clock className="h-4 w-4 text-blue-500" />;
      case 'reviewing': return <Eye className="h-4 w-4 text-yellow-500" />;
      case 'interview': return <Users className="h-4 w-4 text-green-500" />;
      case 'rejected': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'offered': return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'applied': return 'bg-blue-100 text-blue-800';
      case 'reviewing': return 'bg-yellow-100 text-yellow-800';
      case 'interview': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'offered': return 'bg-green-200 text-green-900';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  if (!isAuthenticated) {
    return null; // This should be handled by ProtectedRoute
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <LayoutDashboard className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Dashboard</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Welcome back, {user?.name}! Here's what's happening with your career journey.
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
            <p className="font-medium">Error loading dashboard data</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Briefcase className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{applications.length}</p>
                  <p className="text-sm text-muted-foreground">Applications</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Target className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{recommendations.length}</p>
                  <p className="text-sm text-muted-foreground">Job Matches</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <BookOpen className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{courses.length}</p>
                  <p className="text-sm text-muted-foreground">Active Courses</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Award className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{profile?.profileCompletion || 0}%</p>
                  <p className="text-sm text-muted-foreground">Profile Complete</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Job Applications */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5" />
                    Recent Applications
                  </CardTitle>
                  <Link to="/jobs">
                    <Button variant="outline" size="sm">
                      View All
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="flex items-center gap-3 p-4 border rounded-lg">
                          <div className="h-10 w-10 bg-muted rounded"></div>
                          <div className="flex-1 space-y-2">
                            <div className="h-4 w-32 bg-muted rounded"></div>
                            <div className="h-3 w-24 bg-muted rounded"></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : applications.length > 0 ? (
                  <div className="space-y-3">
                    {applications.slice(0, 4).map((app) => (
                      <div key={app.id} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(app.status)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-medium">{app.jobTitle}</h3>
                            <Badge className={getStatusColor(app.status)} variant="secondary">
                              {app.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Building className="h-3 w-3" />
                              {app.company}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {app.location}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDate(app.appliedDate)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No applications yet</h3>
                    <p className="text-muted-foreground mb-4">Start applying to jobs to track your progress here.</p>
                    <Link to="/jobs">
                      <Button>Browse Jobs</Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Job Recommendations */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Recommended for You
                  </CardTitle>
                  <Link to="/jobs">
                    <Button variant="outline" size="sm">
                      View All
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    {[...Array(2)].map((_, i) => (
                      <div key={i} className="animate-pulse p-4 border rounded-lg">
                        <div className="space-y-3">
                          <div className="h-4 w-48 bg-muted rounded"></div>
                          <div className="h-3 w-32 bg-muted rounded"></div>
                          <div className="h-3 w-full bg-muted rounded"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recommendations.slice(0, 3).map((job) => (
                      <div key={job.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-semibold text-lg">{job.title}</h3>
                            <p className="text-muted-foreground">{job.company}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                              <Star className="h-3 w-3 mr-1" />
                              {job.matchScore}% match
                            </Badge>
                          </div>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-3">{job.description}</p>
                        
                        <div className="flex flex-wrap gap-2 mb-3">
                          {job.skills.slice(0, 4).map((skill) => (
                            <Badge key={skill} variant="outline" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {job.location}
                            </span>
                            <span className="font-medium text-green-600">{job.salary}</span>
                          </div>
                          <Button size="sm">Apply Now</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Ongoing Courses */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Ongoing Courses
                  </CardTitle>
                  <Link to="/skills">
                    <Button variant="outline" size="sm">
                      View All
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    {[...Array(2)].map((_, i) => (
                      <div key={i} className="animate-pulse p-3 border rounded-lg">
                        <div className="space-y-2">
                          <div className="h-4 w-full bg-muted rounded"></div>
                          <div className="h-3 w-24 bg-muted rounded"></div>
                          <div className="h-2 w-full bg-muted rounded"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : courses.length > 0 ? (
                  <div className="space-y-4">
                    {courses.slice(0, 3).map((course) => (
                      <div key={course.id} className="p-3 border rounded-lg hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h4 className="font-medium text-sm mb-1">{course.title}</h4>
                            <p className="text-xs text-muted-foreground mb-2">by {course.instructor}</p>
                          </div>
                          <Badge className={getDifficultyColor(course.difficulty)} variant="secondary">
                            {course.difficulty}
                          </Badge>
                        </div>
                        
                        <div className="mb-3">
                          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                            <span>Progress</span>
                            <span>{course.completedLessons}/{course.totalLessons} lessons</span>
                          </div>
                          <Progress value={course.progress} className="h-2" />
                          <p className="text-xs text-muted-foreground mt-1">{course.progress}% complete</p>
                        </div>
                        
                        <div className="text-xs text-muted-foreground mb-3">
                          <p><strong>Next:</strong> {course.nextLesson}</p>
                          <p className="flex items-center gap-1 mt-1">
                            <Clock className="h-3 w-3" />
                            {course.estimatedTime}
                          </p>
                        </div>
                        
                        <Button size="sm" className="w-full">
                          <PlayCircle className="h-4 w-4 mr-2" />
                          Continue Learning
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <BookOpen className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
                    <h4 className="font-medium mb-2">No active courses</h4>
                    <p className="text-xs text-muted-foreground mb-3">Start learning to boost your skills.</p>
                    <Link to="/skills">
                      <Button size="sm">Browse Courses</Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link to="/jobs" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <Briefcase className="h-4 w-4 mr-2" />
                    Browse Jobs
                  </Button>
                </Link>
                <Link to="/skills" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Explore Courses
                  </Button>
                </Link>
                <Link to="/communities" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="h-4 w-4 mr-2" />
                    Join Communities
                  </Button>
                </Link>
                <Link to="/profile" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <Award className="h-4 w-4 mr-2" />
                    Update Profile
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Dashboard;
