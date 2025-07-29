"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClientComponentClient } from "@/app/components/lib/supabaseClient";

type Lesson = {
  id: string;
  title: string;
  description: string | null;
  video_url: string | null;
  course_id: string;
};

export default function LessonsPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClientComponentClient();

  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [lessons, setLessons] = useState<Lesson[]>([]);

  useEffect(() => {
    const checkAccessAndFetchLessons = async () => {
      // ✅ 1️⃣ Check if user is logged in
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/student-login");
        return;
      }

      // ✅ 2️⃣ Check if user purchased this course
      const { data: purchase } = await supabase
        .from("purchases")
        .select("*")
        .eq("user_id", user.id)
        .eq("course_id", params.id)
        .maybeSingle();

      if (!purchase) {
        router.push(`/courses/${params.id}`);
        return;
      }

      setAuthorized(true);

      // ✅ 3️⃣ Fetch lessons for this course
      const { data: lessonsData, error } = await supabase
        .from("course_lessons")
        .select("*")
        .eq("course_id", params.id);

      if (error) {
        console.error("Error fetching lessons:", error.message);
      } else {
        setLessons(lessonsData || []);
      }

      setLoading(false);
    };

    checkAccessAndFetchLessons();
  }, [params.id, supabase, router]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
        <p>Loading lessons...</p>
      </div>
    );
  }

  if (!authorized) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <p className="text-red-600">You don’t have access to this course.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Course Lessons</h1>

      {lessons.length === 0 ? (
        <p>No lessons uploaded yet.</p>
      ) : (
        <div className="space-y-6">
          {lessons.map((lesson) => (
            <div key={lesson.id} className="bg-white rounded-xl shadow-md p-4">
              <h2 className="text-xl font-semibold mb-2">{lesson.title}</h2>
              {lesson.description && (
                <p className="text-gray-700 mb-3">{lesson.description}</p>
              )}

              {/* ✅ Show video if available */}
              {lesson.video_url ? (
                <video
                  src={lesson.video_url}
                  controls
                  className="w-full rounded-lg"
                />
              ) : (
                <p className="text-gray-500 italic">Video not uploaded yet.</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
