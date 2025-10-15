import { useState, useEffect } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { API_ENDPOINTS } from "@/lib/api";
import { Briefcase, Mail, Lock, User, Loader2 } from "lucide-react";
import heroImage from "@/assets/hero-image.jpg";
import logoImage from "@/assets/gar (1).png";
import axios from "axios";

const Auth = () => {
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get("tab") || "signin";
  const navigate = useNavigate();
  const { login, signup, isAuthenticated } = useAuth();
  const { toast } = useToast();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<"seeker" | "recruiter">("seeker");
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(defaultTab);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.post(
        API_ENDPOINTS.AUTH_LOGIN,
        {
          email,
          password,
        },
        {
          withCredentials: true
        }
      );

      const data = response.data;

      if (!response.status || !data.success) {
        throw new Error(data.message || "Failed to sign in");
      }

      // Check if email is verified
      if (!data.user.isVerified) {
        toast({
          title: "Email not verified",
          description: "Please verify your email before signing in.",
          variant: "destructive",
        });

        // Send OTP for verification
        const otpResponse = await axios.post(
          API_ENDPOINTS.AUTH_SEND_VERIFY_OTP,
          {},  // Empty body, auth via cookie
          {
            withCredentials: true
          }
        );

        if (otpResponse.status === 200) {
          navigate("/verify-otp", {
            state: {
              email,
              tempToken: data.tempToken,
            },
            replace: true,
          });
        }
        return;
      }

      // Store authentication token and user data
      if (data.token) {
        localStorage.setItem("rozgar_token", data.token);
      }
      if (data.user) {
        localStorage.setItem("rozgar_user", JSON.stringify(data.user));
      }

      toast({
        title: "Welcome back!",
        description: "You have successfully signed in.",
      });

      // Update auth context
      await login(email, password);
      navigate("/dashboard");
    } catch (error) {
      console.error("Sign in error:", error);
      toast({
        title: "Error",
        description: error?.response?.data?.message || error.message || "Failed to sign in. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Step 1: Register user
      const registerResponse = await axios.post(
        API_ENDPOINTS.AUTH_REGISTER,
        {
          name,
          email,
          password,
          role,
        },
        {
          withCredentials: true
        }
      );

      const registerData = registerResponse.data;
      
      if (!registerResponse.status || !registerData.success) {
        throw new Error(registerData.message || "Failed to create account");
      }
      
      console.log("Registration successful:", registerData);
      
      // Step 2: Send OTP for verification (cookie is already set from registration)
      const otpResponse = await axios.post(
        API_ENDPOINTS.AUTH_SEND_VERIFY_OTP,
        {},  // Empty body, auth is via cookie
        {
          withCredentials: true  // Important: sends cookie with request
        }
      );
      
      const otpData = otpResponse.data;
      console.log("OTP response:", otpData);

      if (!otpResponse.status || !otpData.success) {
        throw new Error(otpData.message || "Failed to send verification code");
      }

      toast({
        title: "Account created!",
        description: "Please check your email for the verification code.",
      });

      // Navigate to OTP verification page
      navigate("/verify-otp", {
        state: {
          email,
          tempToken: registerData.tempToken,
        },
        replace: true,
      });
    } catch (error) {
      console.error("Sign up error:", error);
      toast({
        title: "Error",
        description: error?.response?.data?.message || error.message || "Failed to create account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-6">
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        {/* Visual Panel - Order changes based on active tab */}
        <div 
          className={`hidden md:flex flex-col items-start justify-center space-y-6 px-6 transition-all duration-500 ${
            activeTab === "signup" ? "md:order-1" : "md:order-2"
          }`}
        >
          <div className="relative w-full">
            <img
              src={heroImage}
              alt="Professional workspace"
              className="w-full rounded-lg shadow-md object-cover h-72"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-lg" />
            <div className="absolute bottom-6 left-6 right-6">
              <h3 className="text-2xl font-semibold text-white">Join thousands finding work nearby</h3>
              <p className="text-sm text-white/90 mt-2">Real opportunities. Real people. Real results.</p>
            </div>
          </div>
          <div className="space-y-4 w-full">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-primary mt-2" />
              <div>
                <p className="text-sm font-medium text-foreground">Browse verified listings</p>
                <p className="text-xs text-muted-foreground">All employers are background-checked</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-primary mt-2" />
              <div>
                <p className="text-sm font-medium text-foreground">Connect directly</p>
                <p className="text-xs text-muted-foreground">No middlemen, faster hiring process</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-primary mt-2" />
              <div>
                <p className="text-sm font-medium text-foreground">Local opportunities</p>
                <p className="text-xs text-muted-foreground">Find work in your neighborhood</p>
              </div>
            </div>
          </div>
        </div>

        {/* Auth Card - Order changes based on active tab */}
        <div 
          className={`w-full max-w-md mx-auto transition-all duration-500 ${
            activeTab === "signup" ? "md:order-2" : "md:order-1"
          }`}
        >
          <div className="text-center mb-6">
            <Link to="/" className="inline-flex items-center gap-3 mb-3 hover:opacity-80 transition-opacity">
              <img src={logoImage} alt="Rozgar Logo" className="h-16 w-32 object-contain" />
            </Link>
            <p className="text-sm text-muted-foreground">Your path to better opportunities</p>
          </div>

          <Card className="p-6 shadow-lg overflow-hidden">
            <Tabs defaultValue={defaultTab} className="w-full" onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="signin">Sign in</TabsTrigger>
                <TabsTrigger value="signup">Sign up</TabsTrigger>
              </TabsList>

              <div className="relative min-h-[450px]">
                <TabsContent 
                  value="signin" 
                  className={`transition-all duration-500 ease-in-out ${
                    activeTab === "signin" 
                      ? "translate-x-0 opacity-100" 
                      : "-translate-x-full opacity-0 absolute inset-0 pointer-events-none"
                  }`}
                >
                <form onSubmit={handleSignIn} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email" className="text-sm font-medium">
                      Email address
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signin-email"
                        type="email"
                        placeholder="Enter your email"
                        className="pl-10"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="signin-password" className="text-sm font-medium">
                        Password
                      </Label>
                      <Link 
                        to="/forgot-password" 
                        className="text-xs text-primary hover:underline"
                      >
                        Forgot?
                      </Link>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signin-password"
                        type="password"
                        placeholder="Enter your password"
                        className="pl-10"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full mt-6" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Signing you in
                      </>
                    ) : (
                      "Continue"
                    )}
                  </Button>

                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">
                        Or
                      </span>
                    </div>
                  </div>

                  <Link to="/dashboard">
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="w-full"
                    >
                      Browse jobs without signing in
                    </Button>
                  </Link>
                </form>
              </TabsContent>

              <TabsContent 
                value="signup"
                className={`transition-all duration-500 ease-in-out ${
                  activeTab === "signup" 
                    ? "translate-x-0 opacity-100" 
                    : "translate-x-full opacity-0 absolute inset-0 pointer-events-none"
                }`}
              >
                <form onSubmit={handleSignUp} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name" className="text-sm font-medium">
                      Your name
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-name"
                        type="text"
                        placeholder="e.g., Priya Sharma"
                        className="pl-10"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className="text-sm font-medium">
                      Work email
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="priya@example.com"
                        className="pl-10"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">We'll send a verification code here</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className="text-sm font-medium">
                      Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="Use 8+ characters"
                        className="pl-10"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={8}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Account type</Label>
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        type="button"
                        variant={role === "seeker" ? "default" : "outline"}
                        onClick={() => setRole("seeker")}
                        className="w-full h-auto py-3 flex flex-col items-center gap-1"
                      >
                        <span className="font-medium">Looking for work</span>
                        <span className="text-xs opacity-80">Job seeker</span>
                      </Button>
                      <Button
                        type="button"
                        variant={role === "recruiter" ? "default" : "outline"}
                        onClick={() => setRole("recruiter")}
                        className="w-full h-auto py-3 flex flex-col items-center gap-1"
                      >
                        <span className="font-medium">Hiring talent</span>
                        <span className="text-xs opacity-80">Recruiter</span>
                      </Button>
                    </div>
                  </div>

                  <Button type="submit" className="w-full mt-6" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Setting up your account
                      </>
                    ) : (
                      "Get started"
                    )}
                  </Button>

                  <p className="text-xs text-muted-foreground text-center leading-relaxed pt-2">
                    By signing up, you agree to our{" "}
                    <Link to="/terms" className="underline hover:text-foreground">Terms</Link>
                    {" "}and{" "}
                    <Link to="/privacy" className="underline hover:text-foreground">Privacy Policy</Link>
                  </p>
                </form>
              </TabsContent>
              </div>
            </Tabs>
          </Card>

          <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground mt-4">
            <Link to="/help" className="hover:text-foreground hover:underline transition-colors">Help Center</Link>
            <span>•</span>
            <Link to="/contact" className="hover:text-foreground hover:underline transition-colors">Contact Us</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
