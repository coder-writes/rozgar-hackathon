import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Briefcase, 
  PlusCircle, 
  Users, 
  Eye, 
  Edit, 
  Trash2,
  MapPin,
  DollarSign,
  Calendar,
  UserCheck
} from "lucide-react";
import { API_ENDPOINTS } from "@/lib/api";
import { CreateJobModal } from "@/components/CreateJobModal";

interface Job {
  _id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  salary?: string;
  description: string;
  requirements: string[];
  postedAt: string;
  applicantsCount: number;
  status: 'active' | 'closed';
}

interface Applicant {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
    profile?: {
      headline?: string;
      location?: string;
    };
  };
  job: string;
  status: 'pending' | 'reviewed' | 'shortlisted' | 'rejected';
  resume?: string;
  coverLetter?: string;
  appliedAt: string;
}

const RecruiterDashboard = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [selectedJob, setSelectedJob] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateJobModal, setShowCreateJobModal] = useState(false);

  useEffect(() => {
    fetchRecruiterData();
  }, []);

  const fetchRecruiterData = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('rozgar_token');
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };

      // Fetch jobs posted by this recruiter
      const jobsRes = await fetch(API_ENDPOINTS.RECRUITER_JOBS, { headers });
      const jobsData = await jobsRes.json();

      if (jobsData.success && jobsData.data) {
        setJobs(jobsData.data);
      }

      setLoading(false);
    } catch (err) {
      console.error('Error fetching recruiter data:', err);
      setError('Failed to load dashboard data. Please try again.');
      setLoading(false);
    }
  };

  const fetchApplicants = async (jobId: string) => {
    try {
      const token = localStorage.getItem('rozgar_token');
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };

      const res = await fetch(`${API_ENDPOINTS.RECRUITER_JOBS}/${jobId}/applicants`, { headers });
      const data = await res.json();

      if (data.success && data.data) {
        setApplicants(data.data);
        setSelectedJob(jobId);
      }
    } catch (err) {
      console.error('Error fetching applicants:', err);
    }
  };

  const handleJobCreated = () => {
    fetchRecruiterData();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <p className="text-center">Loading dashboard...</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Recruiter Dashboard</h1>
            <p className="text-muted-foreground">
              Manage your job postings and review applicants
            </p>
          </div>
          <Button onClick={() => setShowCreateJobModal(true)} size="lg">
            <PlusCircle className="h-5 w-5 mr-2" />
            Post New Job
          </Button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {jobs.filter(job => job.status === 'active').length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Applicants</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {jobs.reduce((sum, job) => sum + job.applicantsCount, 0)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Jobs Posted</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{jobs.length}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="jobs" className="space-y-6">
          <TabsList>
            <TabsTrigger value="jobs">My Job Postings</TabsTrigger>
            <TabsTrigger value="applicants">Applicants</TabsTrigger>
          </TabsList>

          {/* Jobs Tab */}
          <TabsContent value="jobs" className="space-y-4">
            {jobs.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Briefcase className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No Jobs Posted Yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Start by posting your first job opening
                  </p>
                  <Button onClick={() => setShowCreateJobModal(true)}>
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Post Your First Job
                  </Button>
                </CardContent>
              </Card>
            ) : (
              jobs.map((job) => (
                <Card key={job._id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <CardTitle className="text-xl">{job.title}</CardTitle>
                          <Badge variant={job.status === 'active' ? 'default' : 'secondary'}>
                            {job.status}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {job.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Briefcase className="h-4 w-4" />
                            {job.type}
                          </span>
                          {job.salary && (
                            <span className="flex items-center gap-1">
                              <DollarSign className="h-4 w-4" />
                              {job.salary}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            Posted {formatDate(job.postedAt)}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {job.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">
                          {job.applicantsCount} applicant{job.applicantsCount !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => fetchApplicants(job._id)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Applicants
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* Applicants Tab */}
          <TabsContent value="applicants" className="space-y-4">
            {!selectedJob ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <UserCheck className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">Select a Job</h3>
                  <p className="text-muted-foreground">
                    Select a job from the "My Job Postings" tab to view its applicants
                  </p>
                </CardContent>
              </Card>
            ) : applicants.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No Applicants Yet</h3>
                  <p className="text-muted-foreground">
                    Applications will appear here once candidates apply
                  </p>
                </CardContent>
              </Card>
            ) : (
              applicants.map((applicant) => (
                <Card key={applicant._id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{applicant.user.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{applicant.user.email}</p>
                        {applicant.user.profile?.headline && (
                          <p className="text-sm mt-1">{applicant.user.profile.headline}</p>
                        )}
                      </div>
                      <Badge>{applicant.status}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {applicant.coverLetter && (
                        <div>
                          <h4 className="text-sm font-medium mb-1">Cover Letter</h4>
                          <p className="text-sm text-muted-foreground">{applicant.coverLetter}</p>
                        </div>
                      )}
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-muted-foreground">
                          Applied {formatDate(applicant.appliedAt)}
                        </span>
                        <Button variant="outline" size="sm">
                          View Profile
                        </Button>
                        {applicant.resume && (
                          <Button variant="outline" size="sm">
                            View Resume
                          </Button>
                        )}
                        <Button size="sm">
                          Chat
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>

      <CreateJobModal 
        open={showCreateJobModal}
        onOpenChange={setShowCreateJobModal}
        onSuccess={handleJobCreated}
      />
      
      <Footer />
    </div>
  );
};

export default RecruiterDashboard;
