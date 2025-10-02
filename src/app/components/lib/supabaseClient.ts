"use client"; // required for client-side auth helpers

import { createClient } from "@supabase/supabase-js";
import { createClientComponentClient as createAuthClient } from "@supabase/auth-helpers-nextjs";

// ✅ Use environment variables instead of hardcoding
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Standard Supabase client (can be used anywhere, e.g., server or client)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Client-side auth helper (Google login, sessions, etc.)
export const createClientComponentClient = () =>
  createAuthClient({
    supabaseUrl,
    supabaseKey: supabaseAnonKey,
  });
