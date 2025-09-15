import { useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';
import { useAuth } from './use-auth';

export type Profile = {
  name: string;
  headline: string;
  bio: string;
  email?: string;
  phone?: string;
  portfolio?: string;
  website?: string;
  github?: string;
  twitter?: string;
  linkedin?: string;
};

const DEFAULT_PROFILE: Profile = {
  name: 'Cyb3r Vishal',
  headline: 'Cybersecurity Researcher | Dev',
  bio: "I’m Vishal, a passionate web developer and ethical hacker pursuing a B.Sc. in Electronics at University of Delhi. My journey combines frontend development with cybersecurity research, where I focus on building secure, scalable web apps while testing and improving the security of digital systems.",
  email: 'Anonymous@gmail.com',
  phone: '+91 9999999992',
  portfolio: 'https://cybervishal.netlify.app',
  website: 'https://cybervishal.netlify.app',
  github: 'https://github.com/cyb3r-vishal',
  twitter: 'https://x.com/VishalC69972174?t=VK9WXyT1BlRhjLOyIXzLOA&s=08',
  linkedin: 'https://linkedin.com/in/vishal-chauhan-0494492b5',
};

export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile>(DEFAULT_PROFILE);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);

      if (!isSupabaseConfigured) {
        // Local mode: read from localStorage
        const raw = localStorage.getItem('local_profile');
        if (!cancelled) {
          setProfile(raw ? { ...DEFAULT_PROFILE, ...JSON.parse(raw) } : DEFAULT_PROFILE);
          setLoading(false);
        }
        return;
      }

      // Supabase mode: always fetch a single public profile row so homepage is consistent
      const { data, error } = await supabase
        .from('profile')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (!cancelled) {
        if (error) {
          // Fallback to default if RLS blocks or no row
          setProfile(DEFAULT_PROFILE);
        } else {
          setProfile(data ? { ...DEFAULT_PROFILE, ...data } : DEFAULT_PROFILE);
        }
        setLoading(false);
      }
    }

    load();
    // Re-load when user changes (e.g., after saving in dashboard)
  }, [user]);

  return { profile, loading };
}