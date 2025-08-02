"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClientComponentClient } from "@/app/components/lib/supabaseClient";
import { motion } from "framer-motion";
import { PlayCircle } from "lucide-react";

type Lesson = {
  id: string;
  title: string;
  description: string | null;
  video_url: string | null; // should store PATH like "videos/uuid/lesson1.mp4"
  course_id: string;
};

export default function LessonsPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClientComponentClient();

  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [expandedLesson, setExpandedLesson] = useState<string | null>(null);

  // ✅ Public bucket URL (no expiry)
  const PUBLIC_VIDEO_URL =
    "https://kcvghsnlzythcublawvf.supabase.co/storage/v1/object/public/course-videos/";

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

      // ✅ 3️⃣ Fetch lessons
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
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-rose-500 border-t-transparent mx-auto mb-4"></div>
        <p className="text-gray-600">Loading lessons...</p>
      </div>
    );
  }

  if (!authorized) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <p className="text-red-600 font-semibold">
          You don’t have access to this course.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8 text-rose-600 text-center">
        📚 Course Lessons
      </h1>

      {lessons.length === 0 ? (
        <p className="text-center text-gray-600">No lessons uploaded yet.</p>
      ) : (
        <div className="space-y-6">
          {lessons.map((lesson) => (
            <motion.div
              key={lesson.id}
              whileHover={{ y: -3 }}
              className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-5 border border-gray-100"
            >
              {/* ✅ Lesson Header */}
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() =>
                  setExpandedLesson(
                    expandedLesson === lesson.id ? null : lesson.id
                  )
                }
              >
                <h2 className="text-xl font-semibold text-gray-800">
                  {lesson.title}
                </h2>
                <PlayCircle
                  size={28}
                  className={`transition-colors ${
                    expandedLesson === lesson.id
                      ? "text-rose-600"
                      : "text-gray-400"
                  }`}
                />
              </div>

              {/* ✅ Expandable Section */}
              {expandedLesson === lesson.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mt-4 space-y-4"
                >
                  {lesson.description && (
                    <p className="text-gray-700">{lesson.description}</p>
                  )}

                  {/* ✅ Video Player */}
                  {lesson.video_url ? (
                    <div className="rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                      <video
                        src={
                          lesson.video_url.startsWith("http")
                            ? lesson.video_url // if already full URL
                            : `${PUBLIC_VIDEO_URL}${lesson.video_url}`
                        }
                        controls
                        className="w-full aspect-video"
                      />
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">
                      Video not uploaded yet.
                    </p>
                  )}
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
