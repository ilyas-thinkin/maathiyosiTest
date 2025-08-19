"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClientComponentClient } from "../../../components/lib/supabaseClient";
import { CoursePlayer } from "../../../CoursePlayer"; // ✅ path okay

type Lesson = {
  id: string;
  title: string;
  video_url?: string;
  document_url?: string;
};

type Course = {
  id: string;
  title: string;
  description: string;
  price: number;
  thumbnail_url: string;
};

export default function CoursePage() {
  const params = useParams();
  const courseId = params?.id as string;
  const supabase = createClientComponentClient();

  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!courseId) return;

    const fetchCourse = async () => {
      setLoading(true);

      // ✅ Try normal course
      const { data: normalCourse } = await supabase
        .from("courses")
        .select("*")
        .eq("id", courseId)
        .single();

      // ✅ If not found, try YouTube course
      const { data: ytCourse } = !normalCourse
        ? await supabase.from("courses_yt").select("*").eq("id", courseId).single()
        : { data: null };

      const finalCourse = normalCourse || ytCourse;
      if (!finalCourse) {
        setLoading(false);
        return;
      }
      setCourse(finalCourse);

      // ✅ Fetch lessons
      if (normalCourse) {
        const { data: lessonsData } = await supabase
          .from("course_lessons")
          .select("*")
          .eq("course_id", courseId)
          .order("id");

        setLessons(lessonsData || []);
      } else if (ytCourse) {
        const { data: ytLessons } = await supabase
          .from("course_lessons_yt")
          .select("*")
          .eq("course_id", courseId)
          .order("id");

        const mappedLessons: Lesson[] =
          ytLessons?.map((lesson) => ({
            id: lesson.id,
            title: lesson.title,
            video_url: lesson.video_url, // 🔒 proxy (students don’t see yt)
            document_url: lesson.document_url || null,
          })) || [];

        setLessons(mappedLessons);
      }

      setLoading(false);
    };

    fetchCourse();
  }, [courseId, supabase]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-lg font-semibold text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-lg font-semibold text-red-500">Course not found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4 text-rose-600">{course.title}</h1>
      <p className="text-gray-600 mb-6">{course.description}</p>

      {lessons.length > 0 ? (
        <CoursePlayer courseId={course.id} lessons={lessons} />
      ) : (
        <p className="text-gray-500">No lessons available yet.</p>
      )}
    </div>
  );
}
