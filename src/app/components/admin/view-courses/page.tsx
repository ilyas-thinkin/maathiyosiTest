"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";

type Course = {
  id: string;
  title: string;
  description: string;
  category: string;
  thumbnail_url: string;
  topics: string[];
  created_at: string;
};

type Lesson = {
  id: string;
  course_id: string;
  title: string;
  video_url: string;
  description?: string;
  duration?: string;
};

const ViewCourses = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [expandedCourseId, setExpandedCourseId] = useState<string | null>(null);
  const [lessonsMap, setLessonsMap] = useState<Record<string, Lesson[]>>({});
  const [loadingLessons, setLoadingLessons] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching courses:", error.message);
        return;
      }

      setCourses(data as Course[]);
    };

    fetchCourses();
  }, []);

  const toggleLessons = async (courseId: string) => {
    if (expandedCourseId === courseId) {
      setExpandedCourseId(null);
      return;
    }

    setExpandedCourseId(courseId);

    if (!lessonsMap[courseId]) {
      setLoadingLessons(courseId);
      const { data, error } = await supabase
        .from("course_lessons")
        .select("*")
        .eq("course_id", courseId);

      setLoadingLessons(null);

      if (error) {
        console.error("Error fetching lessons:", error.message);
        return;
      }

      setLessonsMap((prev) => ({ ...prev, [courseId]: data as Lesson[] }));
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8 text-center text-red-600">
        📚 Uploaded Courses
      </h1>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => (
          <motion.div
            key={course.id}
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
          >
            {/* Thumbnail */}
            <div className="relative">
              <img
                src={course.thumbnail_url}
                alt={course.title}
                className="w-full h-44 object-cover"
              />
              <span className="absolute top-3 right-3 bg-red-600 text-white text-xs px-2 py-1 rounded-full shadow">
                {course.category}
              </span>
            </div>

            {/* Content */}
            <div className="p-4">
              <h2 className="text-lg font-semibold text-gray-900">
                {course.title}
              </h2>
              <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                {course.description}
              </p>
              <p className="text-sm mt-2 text-gray-700">
                <strong>Topics:</strong> {course.topics?.join(", ")}
              </p>

              {/* Toggle Lessons Button */}
              <button
                onClick={() => toggleLessons(course.id)}
                className="mt-4 w-full py-2 bg-red-600 text-white rounded-xl font-medium shadow hover:bg-red-700 transition-colors"
              >
                {expandedCourseId === course.id ? "Hide Lessons" : "View Lessons"}
              </button>
            </div>

            {/* Lessons Section with animation */}
            <AnimatePresence>
              {expandedCourseId === course.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="bg-gray-50 border-t p-4"
                >
                  {loadingLessons === course.id ? (
                    <p className="text-gray-500 text-sm">⏳ Loading lessons...</p>
                  ) : lessonsMap[course.id]?.length > 0 ? (
                    lessonsMap[course.id].map((lesson, idx) => (
                      <motion.div
                        key={lesson.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="mb-3 border p-3 rounded-xl bg-white shadow-sm"
                      >
                        <h3 className="font-medium text-gray-900">
                          🎥 Lesson {idx + 1}: {lesson.title}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {lesson.description || "No description provided"}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          ⏱ Duration: {lesson.duration || "N/A"}
                        </p>

                        <video
                          src={lesson.video_url}
                          controls
                          controlsList="nodownload"
                          className="w-full rounded-lg mt-3"
                          onContextMenu={(e) => e.preventDefault()}
                        />
                      </motion.div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm">🚫 No lessons found.</p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ViewCourses;
