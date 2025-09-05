import { createClient } from "@supabase/supabase-js";

// Expect these to be provided in a .env file with Vite prefix
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

// If missing, create a safe no-op client to avoid runtime crashes (e.g., NO_FCP)
// You can add real values in a .env file later.
let client;
if (!isSupabaseConfigured) {
  // eslint-disable-next-line no-console
  console.warn("Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Using a disabled Supabase client.");
  // Create a stub that throws only when API is actually used
  client = new Proxy({} as any, {
    get() {
      return () => {
        throw new Error(
          "Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in a .env file."
        );
      };
    },
  });
} else {
  client = createClient(supabaseUrl!, supabaseAnonKey!);
}

export const supabase = client;