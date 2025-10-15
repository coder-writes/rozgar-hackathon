import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Award, ExternalLink, CheckCircle2, Clock } from "lucide-react";
import { API_ENDPOINTS } from "@/lib/api";

const Skills = () => {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('rozgar_token');
        const headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        };

        const response = await fetch(API_ENDPOINTS.DASHBOARD_COURSES, { headers });
        const data = await response.json();

        if (data.success && data.data) {
          setCourses(data.data);
        } else {
          // If no courses, set empty array
          setCourses([]);
        }

        setLoading(false);
      } catch (err) {
        console.error('Error fetching courses:', err);
        setError('Failed to load courses. Please try again.');
        setCourses([]);
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const handleStatusChange = (courseId: number, newStatus: string | null) => {
    setCourses(prev => prev.map(course => 
      course.id === courseId ? { ...course, status: newStatus } : course
    ));
  };

  const completedCount = courses.filter(c => c.status === "completed").length;
  const inProgressCount = courses.filter(c => c.status === "in-progress").length;

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 text-foreground">Skill Library</h1>
          <p className="text-muted-foreground">Curated resources to accelerate your learning journey</p>
        </div>

        {/* Progress Overview */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold text-card-foreground">{courses.length}</div>
                <div className="text-sm text-muted-foreground">Total Resources</div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center">
                <Clock className="h-6 w-6 text-accent" />
              </div>
              <div>
                <div className="text-2xl font-bold text-card-foreground">{inProgressCount}</div>
                <div className="text-sm text-muted-foreground">In Progress</div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center">
                <Award className="h-6 w-6 text-accent" />
              </div>
              <div>
                <div className="text-2xl font-bold text-accent">{completedCount}</div>
                <div className="text-sm text-muted-foreground">Badges Earned</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Course Listings */}
        <div className="space-y-4">
          {courses.map(course => (
            <Card key={course.id} className="p-6 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-xl font-bold text-card-foreground">{course.title}</h3>
                    {course.status === "completed" && (
                      <Badge variant="secondary" className="bg-accent/10 text-accent">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Completed
                      </Badge>
                    )}
                    {course.status === "in-progress" && (
                      <Badge variant="secondary" className="bg-primary/10 text-primary">
                        <Clock className="h-3 w-3 mr-1" />
                        In Progress
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{course.source} • {course.duration}</p>
                </div>
              </div>

              <p className="text-muted-foreground mb-4">{course.description}</p>

              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="outline">{course.category}</Badge>
                <Badge variant="outline">{course.difficulty}</Badge>
              </div>

              {course.status === "in-progress" && (
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">45%</span>
                  </div>
                  <Progress value={45} />
                </div>
              )}

              <div className="flex gap-2">
                <Button variant="outline" size="sm" asChild>
                  <a href={course.link} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-1" />
                    View Course
                  </a>
                </Button>
                
                {!course.status && (
                  <Button size="sm" onClick={() => handleStatusChange(course.id, "in-progress")}>
                    Start Learning
                  </Button>
                )}
                
                {course.status === "in-progress" && (
                  <Button size="sm" onClick={() => handleStatusChange(course.id, "completed")}>
                    Mark Complete
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Skills;
