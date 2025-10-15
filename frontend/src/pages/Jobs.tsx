import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { 
  Search, 
  MapPin, 
  Briefcase, 
  Clock, 
  Sparkles, 
  Filter,
  Building2,
  DollarSign,
  TrendingUp,
  BookmarkPlus,
  Bookmark,
  X
} from "lucide-react";

const mockJobs = [
  {
    id: 1,
    title: "Frontend Developer",
    company: "Tech Solutions Ltd",
    location: "Mumbai",
    city: "Mumbai",
    state: "Maharashtra",
    type: "Full-time",
    workMode: "Remote",
    salary: { min: 800000, max: 1200000, currency: "INR", period: "Year" },
    skills: ["React", "TypeScript", "Tailwind"],
    description: "Build modern web applications using React and TypeScript. Work with a talented team on cutting-edge projects.",
    source: "recruiter",
    postedAt: "2 days ago",
    openings: 3,
    experience: "2-4 years",
    category: "IT & Software"
  },
  {
    id: 2,
    title: "Full Stack Engineer",
    company: "StartUp Hub",
    location: "Bangalore",
    city: "Bangalore",
    state: "Karnataka",
    type: "Full-time",
    workMode: "Hybrid",
    salary: { min: 1000000, max: 1500000, currency: "INR", period: "Year" },
    skills: ["Node.js", "React", "MongoDB"],
    description: "Work on exciting startup projects with modern tech stack. Be part of a fast-growing team.",
    source: "ai",
    postedAt: "1 week ago",
    openings: 2,
    experience: "3-5 years",
    category: "IT & Software"
  },
  {
    id: 3,
    title: "UI/UX Designer",
    company: "Creative Agency",
    location: "Mumbai",
    city: "Mumbai",
    state: "Maharashtra",
    type: "Contract",
    workMode: "On-site",
    salary: { min: 600000, max: 900000, currency: "INR", period: "Year" },
    skills: ["Figma", "Design Systems", "User Research"],
    description: "Design beautiful and intuitive user experiences for our diverse client portfolio.",
    source: "recruiter",
    postedAt: "3 days ago",
    openings: 1,
    experience: "1-3 years",
    category: "Design & Creative"
  },
  {
    id: 4,
    title: "DevOps Engineer",
    company: "Cloud Services Inc",
    location: "Pune",
    city: "Pune",
    state: "Maharashtra",
    type: "Full-time",
    workMode: "Remote",
    salary: { min: 1200000, max: 1800000, currency: "INR", period: "Year" },
    skills: ["AWS", "Docker", "Kubernetes"],
    description: "Manage cloud infrastructure and automate deployment pipelines for enterprise clients.",
    source: "recruiter",
    postedAt: "5 days ago",
    openings: 2,
    experience: "4-6 years",
    category: "IT & Software"
  },
  {
    id: 5,
    title: "Marketing Manager",
    company: "Growth Marketing Co",
    location: "Delhi",
    city: "Delhi",
    state: "Delhi",
    type: "Full-time",
    workMode: "Hybrid",
    salary: { min: 900000, max: 1300000, currency: "INR", period: "Year" },
    skills: ["SEO", "Content Marketing", "Analytics"],
    description: "Lead marketing initiatives and drive growth strategies for B2B SaaS products.",
    source: "ai",
    postedAt: "4 days ago",
    openings: 1,
    experience: "5-7 years",
    category: "Marketing & Sales"
  },
  {
    id: 6,
    title: "Backend Developer",
    company: "Enterprise Tech",
    location: "Hyderabad",
    city: "Hyderabad",
    state: "Telangana",
    type: "Full-time",
    workMode: "On-site",
    salary: { min: 800000, max: 1100000, currency: "INR", period: "Year" },
    skills: ["Java", "Spring Boot", "PostgreSQL"],
    description: "Build scalable backend systems for high-traffic enterprise applications.",
    source: "recruiter",
    postedAt: "1 day ago",
    openings: 4,
    experience: "2-5 years",
    category: "IT & Software"
  },
];




const Jobs = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedWorkMode, setSelectedWorkMode] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  const [bookmarkedJobs, setBookmarkedJobs] = useState<number[]>([]);
  const [sortBy, setSortBy] = useState<string>("recent");

  const allSkills = Array.from(new Set(mockJobs.flatMap(job => job.skills)));
  const allCities = Array.from(new Set(mockJobs.map(job => job.city))).sort();
  const allCategories = Array.from(new Set(mockJobs.map(job => job.category))).sort();

  const toggleBookmark = (jobId: number) => {
    setBookmarkedJobs(prev =>
      prev.includes(jobId) ? prev.filter(id => id !== jobId) : [...prev, jobId]
    );
  };

  const filteredJobs = mockJobs.filter(job => {
    const matchesSearch = 
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCity = selectedCity === "all" || job.city === selectedCity;
    const matchesType = selectedType === "all" || job.type === selectedType;
    const matchesWorkMode = selectedWorkMode === "all" || job.workMode === selectedWorkMode;
    const matchesCategory = selectedCategory === "all" || job.category === selectedCategory;
    const matchesSkill = !selectedSkill || job.skills.includes(selectedSkill);
    
    return matchesSearch && matchesCity && matchesType && matchesWorkMode && matchesCategory && matchesSkill;
  });

  // Sort jobs
  const sortedJobs = [...filteredJobs].sort((a, b) => {
    if (sortBy === "salary-high") {
      return (b.salary?.max || 0) - (a.salary?.max || 0);
    } else if (sortBy === "salary-low") {
      return (a.salary?.min || 0) - (b.salary?.min || 0);
    }
    return 0; // recent (default order)
  });

  const clearAllFilters = () => {
    setSearchQuery("");
    setSelectedCity("all");
    setSelectedType("all");
    setSelectedWorkMode("all");
    setSelectedCategory("all");
    setSelectedSkill(null);
  };

  const activeFiltersCount = [
    selectedCity !== "all",
    selectedType !== "all",
    selectedWorkMode !== "all",
    selectedCategory !== "all",
    selectedSkill !== null,
  ].filter(Boolean).length;

  const formatSalary = (salary: { min: number; max: number; currency: string; period: string } | undefined) => {
    if (!salary) return "Not disclosed";
    const min = salary.min / 100000;
    const max = salary.max / 100000;
    return `₹${min}-${max} LPA`;
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 text-foreground">Find Your Next Opportunity</h1>
          <p className="text-muted-foreground">
            Discover {mockJobs.length} jobs matched to your skills and interests
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Filters - Desktop */}
          <aside className="hidden lg:block space-y-6">
            <Card className="p-6 sticky top-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Filters</h2>
                {activeFiltersCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAllFilters}
                    className="text-xs"
                  >
                    Clear all
                  </Button>
                )}
              </div>

              <Separator className="mb-4" />

              {/* Location Filter */}
              <div className="space-y-3 mb-6">
                <Label className="text-sm font-semibold flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Location
                </Label>
                <Select value={selectedCity} onValueChange={setSelectedCity}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select city" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Cities</SelectItem>
                    {allCities.map((city) => (
                      <SelectItem key={city} value={city}>
                        {city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Job Type Filter */}
              <div className="space-y-3 mb-6">
                <Label className="text-sm font-semibold flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  Employment Type
                </Label>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="Full-time">Full-time</SelectItem>
                    <SelectItem value="Part-time">Part-time</SelectItem>
                    <SelectItem value="Contract">Contract</SelectItem>
                    <SelectItem value="Internship">Internship</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Work Mode Filter */}
              <div className="space-y-3 mb-6">
                <Label className="text-sm font-semibold flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Work Mode
                </Label>
                <Select value={selectedWorkMode} onValueChange={setSelectedWorkMode}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Modes</SelectItem>
                    <SelectItem value="Remote">Remote</SelectItem>
                    <SelectItem value="On-site">On-site</SelectItem>
                    <SelectItem value="Hybrid">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Category Filter */}
              <div className="space-y-3 mb-6">
                <Label className="text-sm font-semibold flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Category
                </Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {allCategories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Skills Filter */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold">Top Skills</Label>
                <ScrollArea className="h-[200px]">
                  <div className="space-y-2">
                    {allSkills.map((skill) => (
                      <Button
                        key={skill}
                        variant={selectedSkill === skill ? "default" : "outline"}
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => setSelectedSkill(selectedSkill === skill ? null : skill)}
                      >
                        {skill}
                      </Button>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </Card>
          </aside>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Search and Mobile Filters */}
            <div className="space-y-4">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search jobs by title, company, or keyword..."
                    className="pl-10 h-12"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                {/* Mobile Filter Sheet */}
                <Sheet>
                  <SheetTrigger asChild className="lg:hidden">
                    <Button variant="outline" size="icon" className="h-12 w-12 relative">
                      <Filter className="h-5 w-5" />
                      {activeFiltersCount > 0 && (
                        <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs">
                          {activeFiltersCount}
                        </Badge>
                      )}
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-[300px]">
                    <SheetHeader>
                      <SheetTitle>Filters</SheetTitle>
                    </SheetHeader>
                    <div className="mt-6 space-y-6">
                      {/* Mobile filters - same as sidebar */}
                      <div className="space-y-3">
                        <Label className="text-sm font-semibold flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          Location
                        </Label>
                        <Select value={selectedCity} onValueChange={setSelectedCity}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select city" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Cities</SelectItem>
                            {allCities.map((city) => (
                              <SelectItem key={city} value={city}>
                                {city}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-3">
                        <Label className="text-sm font-semibold flex items-center gap-2">
                          <Briefcase className="h-4 w-4" />
                          Employment Type
                        </Label>
                        <Select value={selectedType} onValueChange={setSelectedType}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Types</SelectItem>
                            <SelectItem value="Full-time">Full-time</SelectItem>
                            <SelectItem value="Part-time">Part-time</SelectItem>
                            <SelectItem value="Contract">Contract</SelectItem>
                            <SelectItem value="Internship">Internship</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-3">
                        <Label className="text-sm font-semibold flex items-center gap-2">
                          <Building2 className="h-4 w-4" />
                          Work Mode
                        </Label>
                        <Select value={selectedWorkMode} onValueChange={setSelectedWorkMode}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select mode" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Modes</SelectItem>
                            <SelectItem value="Remote">Remote</SelectItem>
                            <SelectItem value="On-site">On-site</SelectItem>
                            <SelectItem value="Hybrid">Hybrid</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-3">
                        <Label className="text-sm font-semibold flex items-center gap-2">
                          <TrendingUp className="h-4 w-4" />
                          Category
                        </Label>
                        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            {allCategories.map((category) => (
                              <SelectItem key={category} value={category}>
                                {category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <Button onClick={clearAllFilters} variant="outline" className="w-full">
                        Clear All Filters
                      </Button>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>

              {/* Active Filters Tags */}
              {activeFiltersCount > 0 && (
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="text-sm text-muted-foreground">Active filters:</span>
                  {selectedCity !== "all" && (
                    <Badge variant="secondary" className="gap-1">
                      {selectedCity}
                      <X
                        className="h-3 w-3 cursor-pointer hover:text-destructive"
                        onClick={() => setSelectedCity("all")}
                      />
                    </Badge>
                  )}
                  {selectedType !== "all" && (
                    <Badge variant="secondary" className="gap-1">
                      {selectedType}
                      <X
                        className="h-3 w-3 cursor-pointer hover:text-destructive"
                        onClick={() => setSelectedType("all")}
                      />
                    </Badge>
                  )}
                  {selectedWorkMode !== "all" && (
                    <Badge variant="secondary" className="gap-1">
                      {selectedWorkMode}
                      <X
                        className="h-3 w-3 cursor-pointer hover:text-destructive"
                        onClick={() => setSelectedWorkMode("all")}
                      />
                    </Badge>
                  )}
                  {selectedCategory !== "all" && (
                    <Badge variant="secondary" className="gap-1">
                      {selectedCategory}
                      <X
                        className="h-3 w-3 cursor-pointer hover:text-destructive"
                        onClick={() => setSelectedCategory("all")}
                      />
                    </Badge>
                  )}
                  {selectedSkill && (
                    <Badge variant="secondary" className="gap-1">
                      {selectedSkill}
                      <X
                        className="h-3 w-3 cursor-pointer hover:text-destructive"
                        onClick={() => setSelectedSkill(null)}
                      />
                    </Badge>
                  )}
                </div>
              )}

              {/* Sort and Results Count */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <p className="text-sm text-muted-foreground">
                  Showing <span className="font-semibold text-foreground">{sortedJobs.length}</span> jobs
                </p>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">Most Recent</SelectItem>
                    <SelectItem value="salary-high">Salary: High to Low</SelectItem>
                    <SelectItem value="salary-low">Salary: Low to High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Job Listings */}
            <div className="space-y-4">
              {sortedJobs.length === 0 ? (
                <Card className="p-12">
                  <div className="text-center space-y-4">
                    <Briefcase className="h-16 w-16 mx-auto text-muted-foreground opacity-50" />
                    <h3 className="text-xl font-semibold">No jobs found</h3>
                    <p className="text-muted-foreground">
                      Try adjusting your filters or search query
                    </p>
                    <Button onClick={clearAllFilters}>Clear Filters</Button>
                  </div>
                </Card>
              ) : (
                sortedJobs.map((job, index) => (
                  <Card
                    key={job.id}
                    className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer group"
                    style={{
                      animation: `fadeIn 0.3s ease-in ${index * 0.1}s both`
                    }}
                  >
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1 min-w-0">
                          {/* Title and Company */}
                          <div className="flex items-start justify-between gap-2 mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                                  {job.title}
                                </h3>
                                {job.source === "ai" && (
                                  <Badge variant="secondary" className="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">
                                    <Sparkles className="h-3 w-3 mr-1" />
                                    AI Sourced
                                  </Badge>
                                )}
                              </div>
                              <p className="text-muted-foreground font-medium flex items-center gap-2">
                                <Building2 className="h-4 w-4" />
                                {job.company}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => toggleBookmark(job.id)}
                              className="shrink-0"
                            >
                              {bookmarkedJobs.includes(job.id) ? (
                                <Bookmark className="h-5 w-5 fill-primary text-primary" />
                              ) : (
                                <BookmarkPlus className="h-5 w-5" />
                              )}
                            </Button>
                          </div>

                          {/* Description */}
                          <p className="text-muted-foreground mb-4 line-clamp-2">
                            {job.description}
                          </p>

                          {/* Job Details */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4 text-sm">
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <MapPin className="h-4 w-4 shrink-0" />
                              <span className="truncate">{job.location}</span>
                            </div>
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Briefcase className="h-4 w-4 shrink-0" />
                              <span className="truncate">{job.type}</span>
                            </div>
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Building2 className="h-4 w-4 shrink-0" />
                              <span className="truncate">{job.workMode}</span>
                            </div>
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Clock className="h-4 w-4 shrink-0" />
                              <span className="truncate">{job.postedAt}</span>
                            </div>
                          </div>

                          {/* Salary and Experience */}
                          <div className="flex flex-wrap gap-3 mb-4 text-sm">
                            <div className="flex items-center gap-1 font-medium text-green-600 dark:text-green-400">
                              <DollarSign className="h-4 w-4" />
                              {formatSalary(job.salary)}
                            </div>
                            <Badge variant="outline" className="font-normal">
                              {job.experience}
                            </Badge>
                            <Badge variant="outline" className="font-normal">
                              {job.openings} {job.openings === 1 ? "opening" : "openings"}
                            </Badge>
                          </div>

                          {/* Skills */}
                          <div className="flex flex-wrap gap-2 mb-4">
                            {job.skills.map((skill) => (
                              <Badge
                                key={skill}
                                variant="secondary"
                                className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                                onClick={() => setSelectedSkill(skill)}
                              >
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 pt-4 border-t">
                        <Button className="flex-1 sm:flex-none">
                          Apply Now
                        </Button>
                        <Button variant="outline" className="flex-1 sm:flex-none">
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
      
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default Jobs;
