"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ScatterBoxLoaderComponent } from "../components/ScatterBoxLoaderComponent";

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
  const [navigating, setNavigating] = useState(false);
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

  if (loading || navigating) {
    return <ScatterBoxLoaderComponent />;
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-[#de5252] to-[#f66] bg-clip-text text-transparent">
          Explore Our Courses
        </h1>
        <p className="text-gray-600 text-lg">Discover premium learning experiences tailored for you</p>
      </div>

      {courses.length === 0 ? (
        <p className="text-center text-gray-400">No courses available.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <AnimatePresence>
            {courses.map((course, index) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.9 }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
                onClick={() => {
                  setNavigating(true);
                  router.push(`/courses/${course.id}`);
                }}
                className="group cursor-pointer bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-[#de5252]/30"
              >
                {/* Portrait Thumbnail */}
                <div className="relative h-64 overflow-hidden bg-gradient-to-br from-[#fff5f5] to-[#ffe5e5]">
                  <img
                    src={course.thumbnail_url || "/placeholder.png"}
                    alt={course.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  {/* Premium overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#de5252]/90 via-[#de5252]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  {/* Price badge */}
                  <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg">
                    <p className="text-[#de5252] font-bold text-sm">₹{course.price?.toLocaleString() || "0"}</p>
                  </div>

                  {/* Category badge */}
                  <div className="absolute top-4 left-4 bg-[#de5252]/90 backdrop-blur-sm px-3 py-1.5 rounded-full">
                    <p className="text-white text-xs font-semibold uppercase tracking-wide">{course.category}</p>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-[#de5252] transition-colors duration-300">
                    {course.title}
                  </h2>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed">
                    {course.description}
                  </p>

                  {/* View Details Link */}
                  <div className="flex items-center text-[#de5252] font-semibold text-sm group-hover:text-[#f66] transition-colors">
                    <span>View Details</span>
                    <svg
                      className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </div>
                </div>

                {/* Premium bottom accent */}
                <div className="h-1 bg-gradient-to-r from-[#de5252] to-[#f66] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
