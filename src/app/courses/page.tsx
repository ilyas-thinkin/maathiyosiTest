"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

type MuxCourse = {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  thumbnail_url: string;
  created_at: string;
};

export default function CoursesPage() {
  const [courses, setCourses] = useState<MuxCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/fetch-mux-courses");
      const data = await res.json();
      console.log("Fetched data:", data); // 👀 Debug output

      // ✅ Safely handle multiple response formats
      let coursesArray: MuxCourse[] = [];

      if (Array.isArray(data)) {
        coursesArray = data;
      } else if (Array.isArray(data?.courses)) {
        coursesArray = data.courses;
      } else if (Array.isArray(data?.data)) {
        coursesArray = data.data;
      } else {
        console.error("Unexpected API response format:", data);
      }

      setCourses(coursesArray);
    } catch (err) {
      console.error("Fetch error:", err);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-14 w-14 border-4 border-indigo-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-4xl font-extrabold text-indigo-600 mb-8 text-center">
        📚 Available Courses
      </h1>

      {courses.length === 0 ? (
        <p className="text-center text-gray-400">No courses available.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence>
            {courses.map((course, index) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.7 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                onClick={() => router.push(`/courses/${course.id}`)}
                className="cursor-pointer bg-gradient-to-br from-white to-indigo-50 rounded-3xl shadow-xl overflow-hidden hover:scale-105 hover:shadow-2xl transition-transform duration-300 relative"
              >
                <div className="relative h-48 overflow-hidden rounded-t-3xl">
                  <img
                    src={course.thumbnail_url || "/placeholder.png"}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-5">
                  <h2 className="text-xl font-bold text-indigo-800 line-clamp-1">
                    {course.title}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {course.category}
                  </p>
                  <p className="text-gray-700 mt-2 line-clamp-3">
                    {course.description}
                  </p>
                  <p className="text-lg font-semibold text-purple-600 mt-3">
                    ₹{course.price?.toLocaleString() || "0"}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
