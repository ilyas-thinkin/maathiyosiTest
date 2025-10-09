import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// 🔑 Create admin client using service role
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(req: Request) {
  try {
    console.log("🟢 Received request to save hero slides");

    // 🧾 Parse body
    const slides = await req.json();

    if (!Array.isArray(slides)) {
      console.error("❌ Invalid payload format:", slides);
      return NextResponse.json(
        { success: false, error: "Invalid payload" },
        { status: 400 }
      );
    }

    console.log(`📦 Received ${slides.length} slides for saving`);

    // 🧹 Clean up slides for DB
    const sanitizedSlides = slides.map((s: any, i: number) => ({
      id: /^[0-9a-f\-]{36}$/i.test(s.id) ? s.id : undefined,
      heading: s.heading || null,
      subheading: s.subheading || null,
      button_text: s.button_text || "Browse Courses",
      linked_course_id: s.linked_course_id || null,
      image_url: s.image_url || null,
      created_by: "admin-panel", // mark who created it
    }));

    sanitizedSlides.forEach((slide, i) =>
      console.log(`🧩 Slide [${i + 1}]:`, slide)
    );

    // 💾 Save to DB (upsert)
    const { data, error } = await supabaseAdmin
      .from("hero_slides_new")
      .upsert(sanitizedSlides, { onConflict: "id" })
      .select();

    if (error) {
      console.error("❌ Supabase upsert error:", error.message);
      throw error;
    }

    console.log(`✅ Successfully saved ${data.length} slides`);
    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    console.error("❌ save-hero-slides-new error:", err.message);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
