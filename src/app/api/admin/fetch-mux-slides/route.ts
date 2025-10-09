import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseServer = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const slides = await req.json();

    // Remove invalid linked_course_id to prevent FK errors
    const validCourses = await supabaseServer.from("courses_mux").select("id");
    const validCourseIds = new Set(validCourses.data?.map(c => c.id));

    const payload = slides.map((s: any) => ({
      id: /^[0-9a-f\-]{36}$/i.test(s.id) ? s.id : undefined,
      image_url: s.image_url || null,
      heading: s.heading || null,
      subheading: s.subheading || null,
      button_text: s.button_text || null,
      linked_course_id: validCourseIds.has(s.linked_course_id) ? s.linked_course_id : null,
    }));

    const { error } = await supabaseServer
      .from("hero_slides_new")
      .upsert(payload, { onConflict: "id" });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}
