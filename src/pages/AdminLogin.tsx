import { useState, useEffect } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Eye, EyeOff, Shield, AlertTriangle } from "lucide-react";
import { z } from "zod";
import { sanitizeInput, SessionManager, AuditLogger, RateLimiter } from "@/lib/security";

// Validation schema
const loginSchema = z.object({
  email: z.string().min(1, "Email/Username is required").max(100, "Too long"),
  password: z.string().min(6, "Password must be at least 6 characters").max(100, "Too long"),
});

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [attemptCount, setAttemptCount] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockTimeLeft, setBlockTimeLeft] = useState(0);

  // Rate limiting - block after 5 failed attempts for 5 minutes
  useEffect(() => {
    const attempts = localStorage.getItem("login_attempts");
    const lastAttempt = localStorage.getItem("last_attempt_time");
    
    if (attempts && lastAttempt) {
      const count = parseInt(attempts);
      const lastTime = parseInt(lastAttempt);
      const now = Date.now();
      const timeDiff = now - lastTime;
      const blockDuration = 5 * 60 * 1000; // 5 minutes
      
      if (count >= 5 && timeDiff < blockDuration) {
        setIsBlocked(true);
        setBlockTimeLeft(Math.ceil((blockDuration - timeDiff) / 1000));
        
        const timer = setInterval(() => {
          const remaining = Math.ceil((blockDuration - (Date.now() - lastTime)) / 1000);
          if (remaining <= 0) {
            setIsBlocked(false);
            setBlockTimeLeft(0);
            localStorage.removeItem("login_attempts");
            localStorage.removeItem("last_attempt_time");
            clearInterval(timer);
          } else {
            setBlockTimeLeft(remaining);
          }
        }, 1000);
        
        return () => clearInterval(timer);
      } else if (timeDiff >= blockDuration) {
        // Reset attempts after block period
        localStorage.removeItem("login_attempts");
        localStorage.removeItem("last_attempt_time");
      } else {
        setAttemptCount(count);
      }
    }
  }, []);

  const validateForm = () => {
    try {
      loginSchema.parse({ email: email.trim(), password });
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: { email?: string; password?: string } = {};
        error.errors.forEach((err) => {
          if (err.path[0] === "email") fieldErrors.email = err.message;
          if (err.path[0] === "password") fieldErrors.password = err.message;
        });
        setErrors(fieldErrors);
      }
      return false;
    }
  };

  const recordFailedAttempt = () => {
    const newCount = attemptCount + 1;
    setAttemptCount(newCount);
    localStorage.setItem("login_attempts", newCount.toString());
    localStorage.setItem("last_attempt_time", Date.now().toString());
    
    if (newCount >= 5) {
      setIsBlocked(true);
      setBlockTimeLeft(300); // 5 minutes
      toast.error("Too many failed attempts. Account temporarily blocked for 5 minutes.");
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isBlocked) {
      toast.error(`Account blocked. Try again in ${Math.ceil(blockTimeLeft / 60)} minutes.`);
      AuditLogger.log('login_attempt_blocked', { reason: 'rate_limited' });
      return;
    }

    // Rate limiting check
    const clientId = 'login_' + (navigator.userAgent + window.location.hostname).slice(0, 50);
    if (!RateLimiter.isAllowed(clientId, 5, 300000)) { // 5 attempts per 5 minutes
      toast.error('Too many login attempts. Please wait before trying again.');
      AuditLogger.log('login_rate_limited', { clientId });
      return;
    }

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    // Sanitize inputs
    const sanitizedEmail = sanitizeInput(email.trim().toLowerCase());
    const sanitizedPassword = sanitizeInput(password.trim());

    AuditLogger.log('login_attempt', { 
      email: sanitizedEmail,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent.slice(0, 100)
    });

    // Local fallback: username/password m1traj/m1traj when Supabase is not configured
    if (!isSupabaseConfigured) {
      // Add delay to prevent timing attacks
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 500));
      
      if (sanitizedEmail === "m1traj" && sanitizedPassword === "m1traj") {
        // Clear failed attempts on successful login
        localStorage.removeItem("login_attempts");
        localStorage.removeItem("last_attempt_time");
        RateLimiter.reset(clientId);
        
        const adminUser = { 
          id: "local-admin", 
          email: "admin@local",
          loginTime: Date.now()
        };
        
        SessionManager.createSession(adminUser);
        AuditLogger.log('login_success', { 
          userId: adminUser.id,
          method: 'local_auth'
        });
        
        toast.success("Logged in as local admin");
        navigate("/admin");
      } else {
        recordFailedAttempt();
        AuditLogger.log('login_failed', { 
          email: sanitizedEmail,
          reason: 'invalid_credentials',
          method: 'local_auth'
        });
        toast.error("Invalid credentials");
      }
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email: sanitizedEmail, 
        password: sanitizedPassword 
      });
      
      if (error) {
        recordFailedAttempt();
        AuditLogger.log('login_failed', { 
          email: sanitizedEmail,
          error: error.message,
          method: 'supabase_auth'
        });
        toast.error(error.message);
      } else if (data.user) {
        // Clear failed attempts on successful login
        localStorage.removeItem("login_attempts");
        localStorage.removeItem("last_attempt_time");
        RateLimiter.reset(clientId);
        
        SessionManager.createSession(data.user);
        AuditLogger.log('login_success', { 
          userId: data.user.id,
          method: 'supabase_auth'
        });
        
        toast.success("Logged in successfully");
        navigate("/admin");
      }
    } catch (error) {
      recordFailedAttempt();
      AuditLogger.log('login_error', { 
        email: sanitizedEmail,
        error: error instanceof Error ? error.message : 'Unknown error',
        method: 'supabase_auth'
      });
      toast.error("Login failed. Please try again.");
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background noise-bg">
      {/* Matrix-style background effect */}
      <div className="absolute inset-0 matrix-bg opacity-30" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      
      <Card className="w-full max-w-md shadow-2xl border-border/50 bg-card/80 backdrop-blur-sm relative z-10">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-primary/10 border border-primary/20">
              <Shield className="h-12 w-12 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold font-cyber">
            <span className="neon-text-green">ADMIN</span> <span className="neon-text-red">ACCESS</span>
          </CardTitle>
          <CardDescription className="font-mono">Secure access to admin panel</CardDescription>
        </CardHeader>
        <CardContent>
          {isBlocked && (
            <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm font-mono">
                ACCESS BLOCKED: {Math.floor(blockTimeLeft / 60)}:{(blockTimeLeft % 60).toString().padStart(2, '0')}
              </span>
            </div>
          )}
          
          {attemptCount > 0 && attemptCount < 5 && !isBlocked && (
            <div className="mb-4 p-3 bg-accent/10 border border-accent/20 rounded-md text-accent">
              <span className="text-sm font-mono">
                WARNING: {attemptCount}/5 failed attempts. Access will be blocked after 5 attempts.
              </span>
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <Input
                type="text"
                placeholder="Username or Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading || isBlocked}
                autoComplete="username"
                className={errors.email ? "border-red-500" : ""}
              />
              {errors.email && (
                <p className="text-sm text-red-500 mt-1">{errors.email}</p>
              )}
            </div>
            
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading || isBlocked}
                autoComplete="current-password"
                className={errors.password ? "border-red-500 pr-10" : "pr-10"}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                disabled={loading || isBlocked}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
              {errors.password && (
                <p className="text-sm text-red-500 mt-1">{errors.password}</p>
              )}
            </div>
            
            <Button 
              type="submit" 
              className="w-full font-mono font-bold bg-primary text-primary-foreground hover:bg-primary/90 border border-primary/20" 
              disabled={loading || isBlocked}
            >
              {loading ? "AUTHENTICATING..." : "AUTHENTICATE"}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-xs text-muted-foreground font-mono">
              [PROTECTED] Rate limiting & input validation active
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}