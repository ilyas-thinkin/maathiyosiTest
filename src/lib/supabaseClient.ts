import { createClient } from '@supabase/supabase-js';
import { createClientComponentClient as createAuthClient } from '@supabase/auth-helpers-nextjs';

// ✅ Load env safely
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase environment variables are missing.');
  throw new Error('supabaseUrl is required.');
}

// ✅ Server + Client Safe Supabase Client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ✅ Auth Helper (client-side use)
export const createClientComponentClient = () =>
  createAuthClient({
    supabaseUrl,
    supabaseKey: supabaseAnonKey,
  });
