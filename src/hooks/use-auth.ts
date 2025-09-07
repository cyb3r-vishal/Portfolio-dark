import { useEffect, useState, useRef } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";
import { SessionManager, AuditLogger, checkSecurityHeaders } from "@/lib/security";
import { toast } from "sonner";

// Enhanced local fallback auth with security features
function getLocalUser(): User | null {
  const sessionUser = SessionManager.getSession();
  if (!sessionUser) return null;
  
  try {
    return {
      id: sessionUser.id,
      app_metadata: {},
      user_metadata: { email: sessionUser.email },
      aud: "authenticated",
      created_at: sessionUser.loginTime ? new Date(sessionUser.loginTime).toISOString() : new Date().toISOString(),
      identities: [],
      confirmed_at: new Date().toISOString(),
      email: sessionUser.email,
      phone: "",
      role: "",
      updated_at: new Date().toISOString(),
    } as unknown as User;
  } catch (error) {
    console.error('Error parsing local user:', error);
    SessionManager.clearSession();
    return null;
  }
}

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Use ref to track current user to avoid stale closures
  const userRef = useRef<User | null>(null);
  
  // Update ref whenever user state changes
  useEffect(() => {
    userRef.current = user;
  }, [user]);

  useEffect(() => {
    let isMounted = true;
    
    // Run security checks in development
    checkSecurityHeaders();

    if (!isSupabaseConfigured) {
      const u = getLocalUser();
      if (isMounted) {
        setUser(u);
        setSession(null);
        setLoading(false);
        if (u) {
          AuditLogger.log('session_restored', { userId: u.id });
        }
      }
      
      const onStorage = () => {
        if (!isMounted) return;
        const newUser = getLocalUser();
        const currentUser = userRef.current;
        setUser(newUser);
        if (newUser && !currentUser) {
          AuditLogger.log('user_session_restored', { userId: newUser.id });
        } else if (!newUser && currentUser) {
          AuditLogger.log('user_session_expired', { userId: currentUser.id });
        }
      };
      
      window.addEventListener("storage", onStorage);
      
      // Set up session validation interval with ref to avoid stale closure
      const sessionInterval = setInterval(() => {
        if (!isMounted) return;
        const currentUser = getLocalUser();
        const stateUser = userRef.current;
        if (!currentUser && stateUser) {
          setUser(null);
          toast.error('Session expired. Please log in again.');
          AuditLogger.log('session_expired', { userId: stateUser.id });
        }
      }, 60000); // Check every minute
      
      return () => {
        isMounted = false;
        window.removeEventListener("storage", onStorage);
        clearInterval(sessionInterval);
      };
    }

    supabase.auth.getSession().then(({ data, error }) => {
      if (!isMounted) return;
      
      if (error) {
        console.error('Auth session error:', error);
        toast.error('Authentication error. Please log in again.');
        setSession(null);
        setUser(null);
      } else {
        setSession(data.session);
        setUser(data.session?.user ?? null);
        if (data.session?.user) {
          SessionManager.createSession(data.session.user);
          AuditLogger.log('session_restored', { userId: data.session.user.id });
        }
      }
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((event, newSession) => {
      if (!isMounted) return;
      
      setSession(newSession);
      setUser(newSession?.user ?? null);
      
      if (event === 'SIGNED_IN' && newSession?.user) {
        SessionManager.createSession(newSession.user);
        AuditLogger.log('user_signed_in', { userId: newSession.user.id });
        toast.success('Signed in successfully');
      } else if (event === 'SIGNED_OUT') {
        SessionManager.clearSession();
        AuditLogger.log('user_signed_out');
      } else if (event === 'TOKEN_REFRESHED' && newSession?.user) {
        SessionManager.createSession(newSession.user);
      }
    });

    return () => {
      isMounted = false;
      sub.subscription.unsubscribe();
    };
  }, []); // Remove user dependency to prevent infinite loop

  const logout = async () => {
    try {
      AuditLogger.log('user_logout_initiated', { userId: user?.id });
      
      if (isSupabaseConfigured) {
        const { error } = await supabase.auth.signOut();
        if (error) {
          console.error('Logout error:', error);
          toast.error('Error during logout');
          return;
        }
      } else {
        SessionManager.clearSession();
        setUser(null);
        setSession(null);
      }
      
      AuditLogger.log('user_logged_out');
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout failed:', error);
      toast.error('Logout failed');
    }
  };

  return { 
    session, 
    user, 
    loading, 
    logout,
    isAuthenticated: !!user && (isSupabaseConfigured ? !!session : SessionManager.isSessionValid())
  };
}