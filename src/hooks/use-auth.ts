import { useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";

// Simple local fallback auth when Supabase is not configured.
// Uses localStorage key 'local_admin' to simulate a logged-in user.
function getLocalUser(): User | null {
  const raw = localStorage.getItem("local_admin");
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return {
      id: parsed.id,
      app_metadata: {},
      user_metadata: { email: parsed.email },
      aud: "authenticated",
      created_at: new Date().toISOString(),
      identities: [],
      confirmed_at: new Date().toISOString(),
      email: parsed.email,
      phone: "",
      role: "",
      updated_at: new Date().toISOString(),
    } as unknown as User;
  } catch {
    return null;
  }
}

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    if (!isSupabaseConfigured) {
      const u = getLocalUser();
      if (isMounted) {
        setUser(u);
        setSession(null);
        setLoading(false);
      }
      const onStorage = () => {
        if (!isMounted) return;
        setUser(getLocalUser());
      };
      window.addEventListener("storage", onStorage);
      return () => {
        isMounted = false;
        window.removeEventListener("storage", onStorage);
      };
    }

    supabase.auth.getSession().then(({ data }) => {
      if (!isMounted) return;
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
    });

    return () => {
      isMounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return { session, user, loading };
}