import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs"; // ✅ Use bcryptjs

// ✅ Ensure environment variables exist
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error("Supabase URL or service role key is missing!");
}

// ✅ Server-side Supabase client
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Fetch admin from Supabase
    const { data: admin, error } = await supabaseAdmin
      .from("admin_users")
      .select("id, name, email, password_hash")
      .eq("email", email)
      .limit(1)
      .single();

    if (error || !admin) {
      return NextResponse.json({ error: "Admin not found" }, { status: 401 });
    }

    // ✅ Compare password using bcryptjs (works with 10-cost-factor hashes)
    const isValid = bcrypt.compareSync(password, admin.password_hash);

    if (!isValid) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    // ✅ Return admin info
    return NextResponse.json({
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
      },
    });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
