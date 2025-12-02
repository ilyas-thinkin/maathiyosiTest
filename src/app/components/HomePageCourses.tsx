"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { FiArrowRight } from "react-icons/fi";

type Course = {
  id: string;
  slug: string;
  title: string;
  description?: string | null;
  price: number;
  category?: string | null;
  thumbnail_url?: string | null;
  created_at: string;
  source: 'mux' | 'vimeo';
};

export default function HomePageCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
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
      // Fetch homepage courses from the new API endpoint
      const res = await fetch("/api/admin/homepage-courses", { cache: "no-store" });
      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.error || "Failed to load homepage courses");
      }

      setCourses(result.data || []);
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
    <section className="max-w-7xl mx-auto px-6 py-16">
      <div className="text-center mb-12">
        <h2 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-[#de5252] to-[#f66] bg-clip-text text-transparent">
          Featured Courses
        </h2>
        <p className="text-gray-600 text-lg">
          Hand-picked courses to accelerate your learning journey
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-300 bg-red-50 p-4 text-red-800 shadow-sm text-center">
          {error}
        </div>
      )}

      {courses.length === 0 && !loading ? (
        <p className="text-center text-gray-400 mt-10">No featured courses available.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          <AnimatePresence>
            {courses.map((course, index) => (
              <motion.div
                key={`${course.source}-${course.id}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="group cursor-pointer bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg overflow-hidden transition-all duration-300 relative flex flex-col hover:-translate-y-1"
                onClick={() => router.push(`/courses/${course.slug}`)}
              >
                <div className="relative h-48 overflow-hidden bg-gradient-to-br from-red-50 to-pink-50">
                  <img
                    src={course.thumbnail_url || "/placeholder.png"}
                    alt={course.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/5 via-transparent to-transparent" />
                </div>

                {/* Content */}
                <div className="p-6 flex flex-col flex-grow gap-3 relative">
                  {/* Title */}
                  <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 leading-tight">
                    {course.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-gray-600 flex-grow leading-relaxed line-clamp-2">
                    {course.description?.trim() || "Discover what you will learn inside this course."}
                  </p>

                  {/* Price */}
                  <p className="text-xl font-bold bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent">
                    ₹{course.price?.toLocaleString() || "0"}
                  </p>

                  {/* Arrow Circle - Bottom Right */}
                  <div className="absolute bottom-5 right-5 w-10 h-10 rounded-full bg-gradient-to-r from-red-500 to-pink-500 flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all duration-300">
                    <FiArrowRight className="text-white text-lg" />
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </section>
  );
}
