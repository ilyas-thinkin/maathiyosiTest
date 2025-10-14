"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

type UnifiedCourse = {
  id: string; // prefixed for MUX courses
  rawId: string | number;
  title: string;
  price: number;
  thumbnailUrl?: string | null;
};

export default function HomePageCourses() {
  const [courses, setCourses] = useState<UnifiedCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/fetch-mux-courses");
      const data = await res.json();

      let coursesArray: any[] = [];
      if (Array.isArray(data)) coursesArray = data;
      else if (Array.isArray(data?.courses)) coursesArray = data.courses;
      else if (Array.isArray(data?.data)) coursesArray = data.data;

      const mappedCourses: UnifiedCourse[] = coursesArray.map((c: any) => ({
        id: `${c.id}`,
        rawId: c.id,
        title: c.title,
        price: Number(c.price ?? 0),
        thumbnailUrl: c.thumbnail_url ?? "/placeholder.png",
      }));

      setCourses(mappedCourses);
    } catch (err: any) {
      console.error(err);
      setError("Failed to load courses");
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-14 w-14 border-4 border-red-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <section className="max-w-7xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h2 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-red-600 to-red-400 text-transparent bg-clip-text">
          Explore Our Courses
        </h2>
        <p className="mt-3 text-gray-600 text-lg">
          Learn, grow, and unlock your potential 🚀
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-300 bg-red-50 p-4 text-red-800 shadow-sm text-center">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        <AnimatePresence>
          {courses.slice(0, 8).map((course, index) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              onClick={() => router.push(`/courses/${course.id}`)}
              className="cursor-pointer bg-white rounded-3xl shadow-xl overflow-hidden hover:scale-105 hover:shadow-2xl transition-transform duration-300 relative flex flex-col"
            >
              <div className="relative h-48 overflow-hidden rounded-t-3xl">
                <img
                  src={course.thumbnailUrl || "/placeholder.png"}
                  alt={course.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              <div className="p-5 flex flex-col flex-grow">
                <h3 className="text-lg font-bold text-zinc-900 line-clamp-2">
                  {course.title}
                </h3>
                <p className="text-gray-500 mt-1 flex-grow">
                  Tap to explore and enroll instantly.
                </p>
                <p className="text-lg font-semibold text-red-600 mt-3">
                  ₹{course.price.toLocaleString() || "0"}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {courses.length === 0 && !loading && (
        <p className="text-center text-gray-400 mt-10">No courses available.</p>
      )}
    </section>
  );
}
