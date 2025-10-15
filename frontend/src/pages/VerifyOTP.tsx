import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { API_ENDPOINTS } from "@/lib/api";
import { Briefcase, Mail, Loader2, ArrowLeft, RefreshCw } from "lucide-react";
import axios from "axios";

const VerifyOTP = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  // Get email and token from location state
  const email = location.state?.email;
  const tempToken = location.state?.tempToken;
  
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Redirect if no email or token
  useEffect(() => {
    if (!email || !tempToken) {
      toast({
        title: "Session expired",
        description: "Please sign up again to continue.",
        variant: "destructive",
      });
      navigate("/auth?tab=signup");
    }
  }, [email, tempToken, navigate, toast]);

  // Timer countdown
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  // Prevent navigation away
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  const handleChange = (index: number, value: string) => {
    // Only allow numbers
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);
    const newOtp = [...otp];
    
    for (let i = 0; i < pastedData.length; i++) {
      if (/^\d$/.test(pastedData[i])) {
        newOtp[i] = pastedData[i];
      }
    }
    
    setOtp(newOtp);
    
    // Focus the next empty input or the last input
    const nextEmptyIndex = newOtp.findIndex((val) => !val);
    if (nextEmptyIndex !== -1) {
      inputRefs.current[nextEmptyIndex]?.focus();
    } else {
      inputRefs.current[5]?.focus();
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const otpValue = otp.join("");
    if (otpValue.length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter all 6 digits.",
        variant: "destructive",
      });
      return;
    }

    setIsVerifying(true);

    try {
      const response = await axios.post(
        API_ENDPOINTS.AUTH_VERIFY_OTP,
        {
          otp: otpValue,
        },
        {
          withCredentials: true  // Send cookie with request
        }
      );

      const data = response.data;

      if (response.status === 200 && data.success) {
        // Store the authentication token and user data
        if (data.token) {
          localStorage.setItem("rozgar_token", data.token);
        }
        if (data.user) {
          localStorage.setItem("rozgar_user", JSON.stringify(data.user));
        }

        toast({
          title: "Email verified!",
          description: "Your account has been successfully verified.",
        });

        // Redirect to jobs page
        setTimeout(() => {
          navigate("/jobs", { replace: true });
          window.location.reload(); // Reload to update auth context
        }, 500);
      } else {
        throw new Error(data.message || "Failed to verify OTP");
      }
    } catch (error) {
      console.error("OTP verification error:", error);
      toast({
        title: "Verification failed",
        description: error?.response?.data?.message || error.message || "Invalid OTP. Please try again.",
        variant: "destructive",
      });
      // Clear OTP inputs
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOTP = async () => {
    setIsResending(true);

    try {
      const response = await axios.post(
        API_ENDPOINTS.AUTH_SEND_VERIFY_OTP,
        {},  // Empty body, auth via cookie
        {
          withCredentials: true
        }
      );

      const data = response.data;

      if (response.status === 200 && data.success) {
        toast({
          title: "OTP sent!",
          description: "A new verification code has been sent to your email.",
        });
        
        // Reset timer
        setTimer(60);
        setCanResend(false);
        
        // Clear current OTP
        setOtp(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
      } else {
        throw new Error(data.message || "Failed to resend OTP");
      }
    } catch (error) {
      console.error("Resend OTP error:", error);
      toast({
        title: "Failed to resend",
        description: error?.response?.data?.message || error.message || "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsResending(false);
    }
  };

  const handleBackToSignup = () => {
    const shouldLeave = window.confirm(
      "Are you sure you want to go back? You'll need to sign up again."
    );
    if (shouldLeave) {
      navigate("/auth?tab=signup", { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <Briefcase className="h-10 w-10 text-primary" />
            <span className="text-3xl font-bold text-foreground">Rozgar</span>
          </Link>
          <p className="text-muted-foreground">Verify your email to continue</p>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <Mail className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Verify Your Email</CardTitle>
            <CardDescription className="mt-2">
              We've sent a 6-digit verification code to
              <br />
              <span className="font-semibold text-foreground">{email}</span>
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleVerifyOTP} className="space-y-6">
              {/* OTP Input */}
              <div className="space-y-2">
                <div className="flex gap-2 justify-center" onPaste={handlePaste}>
                  {otp.map((digit, index) => (
                    <Input
                      key={index}
                      ref={(el) => (inputRefs.current[index] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      className="w-12 h-14 text-center text-2xl font-semibold"
                      disabled={isVerifying}
                      autoFocus={index === 0}
                    />
                  ))}
                </div>
              </div>

              {/* Timer/Resend */}
              <div className="text-center">
                {canResend ? (
                  <Button
                    type="button"
                    variant="link"
                    onClick={handleResendOTP}
                    disabled={isResending}
                    className="text-primary"
                  >
                    {isResending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Resend OTP
                      </>
                    )}
                  </Button>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Resend OTP in <span className="font-semibold text-primary">{timer}s</span>
                  </p>
                )}
              </div>

              {/* Verify Button */}
              <Button
                type="submit"
                className="w-full h-12 text-base"
                disabled={isVerifying || otp.join("").length !== 6}
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify Email"
                )}
              </Button>

              {/* Back Button */}
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleBackToSignup}
                disabled={isVerifying}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Sign Up
              </Button>
            </form>

            <div className="mt-6 p-4 bg-muted/50 rounded-lg">
              <p className="text-xs text-center text-muted-foreground">
                Didn't receive the code? Check your spam folder or click resend after the timer expires.
              </p>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-6">
          By verifying your email, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
};

export default VerifyOTP;
