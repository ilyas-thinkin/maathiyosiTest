import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const { data: admin, error } = await supabaseAdmin
      .from("admin_users")
      .select("id, name, email, password_hash")
      .eq("email", email)
      .limit(1)
      .single();

    if (error || !admin) {
      return NextResponse.json({ error: "Admin not found" }, { status: 401 });
    }

    const isValid = bcrypt.compareSync(password, admin.password_hash);

    if (!isValid) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    // ✅ Create response
    const res = NextResponse.json({
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
      },
    });

    // ✅ Set httpOnly cookie for middleware
    res.cookies.set("admin_token", "logged_in", {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24, // 1 day
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    return res;
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
