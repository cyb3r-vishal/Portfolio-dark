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
  headline: 'Ethical Hacker & Developer',
  bio: "I’m Vishal, a passionate web developer and ethical hacker pursuing a B.Sc. in Electronics at University of Delhi. My journey combines frontend development with cybersecurity research, where I focus on building secure, scalable web apps while testing and improving the security of digital systems.",
  email: 'Anonymous@gmail.com',
  phone: '+91 987-115-0322',
  portfolio: 'https://vishal-portfoli.netlify.app',
  website: '',
  github: '',
  twitter: '',
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

      if (!user) {
        if (!cancelled) setLoading(false);
        return;
      }

      const { data } = await supabase
        .from('profile')
        .select('*')
        .eq('owner', user.id)
        .maybeSingle();

      if (!cancelled) {
        setProfile(data ? { ...DEFAULT_PROFILE, ...data } : DEFAULT_PROFILE);
        setLoading(false);
      }
    }

    load();
    // Re-load when user changes
  }, [user]);

  return { profile, loading };
}