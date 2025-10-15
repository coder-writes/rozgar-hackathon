import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Briefcase, BookOpen, Users, TrendingUp, Award, Target, Sparkles, Zap, ArrowRight, CheckCircle2, Star } from "lucide-react";
import heroImage from "@/assets/hero-image.jpg";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero opacity-90" />
        
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>
        
        <div className="relative container mx-auto px-4 py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-primary-foreground space-y-8">
              {/* Floating badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20 animate-fade-in">
                <Sparkles className="h-4 w-4 text-primary-foreground animate-pulse" />
                <span className="text-sm font-medium">AI-Powered Career Platform</span>
                <Badge variant="secondary" className="text-xs">New</Badge>
              </div>
              
              {/* Animated heading */}
              <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight animate-fade-in-up">
                Connect Local Talent with{" "}
                <span className="relative inline-block">
                  <span className="relative z-10 bg-gradient-to-r from-primary-foreground to-primary-foreground/80 bg-clip-text text-transparent">
                    Opportunity
                  </span>
                  <span className="absolute bottom-2 left-0 right-0 h-3 bg-accent/30 -rotate-1"></span>
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl text-primary-foreground/90 leading-relaxed animate-fade-in-up animation-delay-200">
                Rozgar bridges job seekers, recruiters, and skill development resources in your community. Build your career with AI-powered job matching and curated learning paths.
              </p>
              
              {/* Feature highlights */}
              <div className="flex flex-wrap gap-4 animate-fade-in-up animation-delay-400">
                <div className="flex items-center gap-2 text-primary-foreground/90">
                  <CheckCircle2 className="h-5 w-5 text-accent" />
                  <span className="text-sm font-medium">Active Jobs</span>
                </div>
                <div className="flex items-center gap-2 text-primary-foreground/90">
                  <CheckCircle2 className="h-5 w-5 text-accent" />
                  <span className="text-sm font-medium">Free Skill Courses</span>
                </div>
                <div className="flex items-center gap-2 text-primary-foreground/90">
                  <CheckCircle2 className="h-5 w-5 text-accent" />
                  <span className="text-sm font-medium">Active Community</span>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up animation-delay-600">
                <Link to="/auth?tab=signup" className="group">
                  <Button size="lg" variant="secondary" className="w-full sm:w-auto text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
                    <Zap className="mr-2 h-5 w-5 group-hover:animate-pulse" />
                    Join as Job Seeker
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link to="/auth?tab=signup&role=recruiter" className="group">
                  <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto text-lg border-2 border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10 backdrop-blur-sm shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                  >
                  <Briefcase className="mr-2 h-5 w-5" />
                  <span className="text-black group-hover:text-primary-foreground/100">
                    Post Jobs as Recruiter
                  </span>
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
              
              {/* Social proof */}
              <div className="flex items-center gap-6 pt-4 animate-fade-in-up animation-delay-800">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-10 h-10 rounded-full bg-primary-foreground/20 border-2 border-primary-foreground/30 flex items-center justify-center text-xs font-bold">
                      {String.fromCharCode(64 + i)}
                    </div>
                  ))}
                </div>
                <div className="flex flex-col">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className="h-4 w-4 fill-accent text-accent" />
                    ))}
                  </div>
                  <p className="text-sm text-primary-foreground/80">
                    <span className="font-bold">many</span> professionals have joined
                  </p>
                </div>
              </div>
            </div>
            
            <div className="relative hidden lg:block animate-fade-in-up animation-delay-400">
              {/* Floating cards effect */}
              <div className="absolute -top-8 -right-8 w-48 h-48 bg-accent/20 rounded-2xl backdrop-blur-sm border border-primary-foreground/10 p-4 animate-float shadow-2xl">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-accent/30 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-primary-foreground/60">Career Growth</p>
                    <p className="text-lg font-bold text-primary-foreground">+85%</p>
                  </div>
                </div>
              </div>
              
              <div className="absolute -bottom-8 -left-8 w-56 h-56 bg-primary/20 rounded-2xl backdrop-blur-sm border border-primary-foreground/10 p-4 animate-float animation-delay-1000 shadow-2xl">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/30 flex items-center justify-center">
                    <Award className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-primary-foreground/60">Skill Badges</p>
                    <p className="text-lg font-bold text-primary-foreground">500+</p>
                  </div>
                </div>
              </div>
              
              <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl transform hover:scale-105 transition-transform duration-500">
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-accent/20 mix-blend-overlay"></div>
                <img 
                  src={heroImage} 
                  alt="Professional team collaboration" 
                  className="rounded-2xl w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent"></div>
        
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold">
              <Sparkles className="h-4 w-4" />
              Platform Features
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              A complete ecosystem for local employment and skill development
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 group border-2 hover:border-primary/50 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
              <div className="relative z-10">
                <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Briefcase className="h-8 w-8 text-primary-foreground" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-card-foreground group-hover:text-primary transition-colors">
                  Smart Job Matching
                </h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  AI-powered job board with local and remote opportunities. Filter by skills, experience, and get matched with the perfect role.
                </p>
                <div className="flex items-center gap-2 text-primary font-semibold text-sm group-hover:gap-3 transition-all">
                  <span>Explore Jobs</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Card>
            
            <Card className="p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 group border-2 hover:border-accent/50 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
              <div className="relative z-10">
                <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-accent to-accent/80 flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <BookOpen className="h-8 w-8 text-accent-foreground" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-card-foreground group-hover:text-accent transition-colors">
                  Curated Skills Library
                </h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Access free courses, tutorials, and resources. Track your progress and earn badges to showcase on your profile.
                </p>
                <div className="flex items-center gap-2 text-accent font-semibold text-sm group-hover:gap-3 transition-all">
                  <span>Browse Courses</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Card>
            
            <Card className="p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 group border-2 hover:border-primary/50 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
              <div className="relative z-10">
                <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Users className="h-8 w-8 text-primary-foreground" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-card-foreground group-hover:text-primary transition-colors">
                  Active Community
                </h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Share projects, get feedback, and connect with peers. Collaborate on open-source work and build your portfolio.
                </p>
                <div className="flex items-center gap-2 text-primary font-semibold text-sm group-hover:gap-3 transition-all">
                  <span>Join Community</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-secondary relative overflow-hidden">
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center group">
              <div className="flex items-center justify-center mb-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                  <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <TrendingUp className="h-10 w-10 text-primary-foreground" />
                  </div>
                </div>
              </div>
              <div className="text-5xl md:text-6xl font-bold text-primary mb-3 group-hover:scale-110 transition-transform duration-300">
                1,000+
              </div>
              <div className="text-lg font-semibold text-foreground mb-2">Active Jobs</div>
              <div className="text-sm text-muted-foreground">Updated daily with new opportunities</div>
            </div>
            
            <div className="text-center group">
              <div className="flex items-center justify-center mb-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-accent/20 rounded-full blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                  <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-accent to-accent/80 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Award className="h-10 w-10 text-accent-foreground" />
                  </div>
                </div>
              </div>
              <div className="text-5xl md:text-6xl font-bold text-accent mb-3 group-hover:scale-110 transition-transform duration-300">
                500+
              </div>
              <div className="text-lg font-semibold text-foreground mb-2">Skill Resources</div>
              <div className="text-sm text-muted-foreground">Free courses and learning materials</div>
            </div>
            
            <div className="text-center group">
              <div className="flex items-center justify-center mb-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                  <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Target className="h-10 w-10 text-primary-foreground" />
                  </div>
                </div>
              </div>
              <div className="text-5xl md:text-6xl font-bold text-primary mb-3 group-hover:scale-110 transition-transform duration-300">
                5,000+
              </div>
              <div className="text-lg font-semibold text-foreground mb-2">Community Members</div>
              <div className="text-sm text-muted-foreground">Growing network of professionals</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-hero relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero opacity-90" />
        
        {/* Animated decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-10 left-1/4 w-64 h-64 bg-primary-foreground/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-pulse delay-700"></div>
        </div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Floating badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20 animate-fade-in">
              <Zap className="h-4 w-4 text-primary-foreground animate-pulse" />
              <span className="text-sm font-medium text-primary-foreground">Start Your Journey Today</span>
            </div>
            
            <h2 className="text-4xl md:text-6xl font-bold text-primary-foreground mb-6 leading-tight">
              Ready to Transform Your Career?
            </h2>
            
            <p className="text-xl md:text-2xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto leading-relaxed">
              Join thousands of professionals building their careers through Rozgar's innovative platform
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/auth?tab=signup" className="group">
                <Button size="lg" variant="secondary" className="text-lg px-8 py-6 shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300">
                  <Sparkles className="mr-2 h-5 w-5 group-hover:animate-spin" />
                  Create Free Account
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              
              <Link to="/jobs" className="group">
                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg px-8 py-6 border-2 border-primary-foreground text-black bg-primary-foreground/10 backdrop-blur-sm shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
                >
                  <Briefcase className="mr-2 h-5 w-5 text-black" />
                  Browse Jobs
                </Button>
              </Link>
            </div>
            
            {/* Trust indicators */}
            <div className="pt-8 flex flex-col sm:flex-row items-center justify-center gap-8 text-primary-foreground/80">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-accent" />
                <span className="text-sm font-medium">No Credit Card Required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-accent" />
                <span className="text-sm font-medium">Free Forever Plan</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-accent" />
                <span className="text-sm font-medium">Cancel Anytime</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Home;
