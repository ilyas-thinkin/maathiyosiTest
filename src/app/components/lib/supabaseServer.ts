// components/lib/supabaseServer.ts
import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!; // server-side only

export const supabaseServer: SupabaseClient = createClient(
  supabaseUrl,
  supabaseServiceKey
);
