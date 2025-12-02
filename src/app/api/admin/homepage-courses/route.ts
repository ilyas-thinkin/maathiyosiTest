import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET - Fetch all homepage courses with full course details
export async function GET() {
  try {
    const { data: homepageCourses, error } = await supabase
      .from("homepage_courses")
      .select("*")
      .order("display_order", { ascending: true });

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    // Fetch full course details for each homepage course
    const coursesWithDetails = await Promise.all(
      homepageCourses.map(async (hc) => {
        try {
          if (hc.source === "mux") {
            const { data: course, error: courseError } = await supabase
              .from("courses_mux")
              .select("*")
              .eq("id", hc.course_id)
              .single();

            if (courseError) throw courseError;
            return course ? { ...course, source: "mux" } : null;
          } else if (hc.source === "vimeo") {
            const { data: course, error: courseError } = await supabase
              .from("courses_vimeo")
              .select("*")
              .eq("id", hc.course_id)
              .single();

            if (courseError) throw courseError;
            return course ? { ...course, source: "vimeo" } : null;
          }
          return null;
        } catch (err) {
          console.error(`Error fetching course ${hc.course_id}:`, err);
          return null;
        }
      })
    );

    // Filter out null values (courses that failed to fetch or were deleted)
    const validCourses = coursesWithDetails.filter(Boolean);

    return NextResponse.json({ success: true, data: validCourses });
  } catch (err: any) {
    console.error("GET error:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}

// POST - Update homepage courses (replace all)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { courses } = body;

    if (!Array.isArray(courses)) {
      return NextResponse.json(
        { success: false, error: "Invalid data format" },
        { status: 400 }
      );
    }

    // Delete all existing homepage courses
    const { error: deleteError } = await supabase
      .from("homepage_courses")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000"); // Delete all rows

    if (deleteError) {
      console.error("Delete error:", deleteError);
      return NextResponse.json(
        { success: false, error: deleteError.message },
        { status: 500 }
      );
    }

    // Insert new homepage courses
    if (courses.length > 0) {
      // Validate all course data before inserting
      const coursesToInsert = courses
        .filter(course => course.course_id && course.source) // Filter out invalid entries
        .map((course, index) => ({
          course_id: course.course_id,
          source: course.source,
          display_order: index
        }));

      if (coursesToInsert.length === 0) {
        return NextResponse.json(
          { success: false, error: "No valid courses to insert" },
          { status: 400 }
        );
      }

      const { error: insertError } = await supabase
        .from("homepage_courses")
        .insert(coursesToInsert);

      if (insertError) {
        console.error("Insert error:", insertError);
        return NextResponse.json(
          { success: false, error: insertError.message },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: "Homepage courses updated successfully"
    });
  } catch (err: any) {
    console.error("POST error:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
