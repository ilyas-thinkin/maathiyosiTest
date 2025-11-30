"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ScatterBoxLoaderComponent } from "../components/ScatterBoxLoaderComponent";

type Course = {
  id: string;
  slug: string;
  title: string;
  description: string;
  price: number;
  category: string;
  thumbnail_url: string;
  created_at: string;
  source: 'mux' | 'vimeo';
};

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [navigating, setNavigating] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      // Fetch Mux courses
      const muxRes = await fetch("/api/admin/fetch-mux-courses", { cache: "no-store" });
      const muxResult = await muxRes.json();
      const muxCourses = (muxResult.success && Array.isArray(muxResult.data))
        ? muxResult.data.map((c: any) => ({ ...c, source: 'mux' as const }))
        : [];

      // Fetch Vimeo courses
      const vimeoRes = await fetch("/api/admin/fetch-vimeo-courses", { cache: "no-store" });
      const vimeoResult = await vimeoRes.json();
      const vimeoCourses = (vimeoResult.success && Array.isArray(vimeoResult.data))
        ? vimeoResult.data.map((c: any) => ({ ...c, source: 'vimeo' as const }))
        : [];

      // Combine and sort by created_at
      const allCourses = [...muxCourses, ...vimeoCourses].sort((a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setCourses(allCourses);
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
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
          <AnimatePresence>
            {courses.map((course, index) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3, delay: index * 0.03 }}
                className="group bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-500 flex flex-col border border-gray-100 hover:border-[#de5252]/30 hover:-translate-y-2 cursor-pointer"
                onClick={() => {
                  setNavigating(true);
                  router.push(`/courses/${course.slug}`);
                }}
              >
                {/* Square Thumbnail */}
                <div className="relative aspect-square overflow-hidden rounded-t-xl">
                  <img
                    src={course.thumbnail_url || "/placeholder.png"}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  {/* Gradient overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  {/* Category badge */}
                  <div className="absolute top-2 left-2 bg-gradient-to-r from-[#de5252] to-[#f66] backdrop-blur-sm px-2.5 py-1 rounded-full shadow-lg">
                    <p className="text-white text-[10px] font-semibold uppercase tracking-wide">{course.category}</p>
                  </div>
                </div>

                {/* Content */}
                <div className="p-3.5 flex flex-col gap-2">
                  {/* Title */}
                  <h3 className="font-bold text-gray-900 text-sm leading-snug line-clamp-2 min-h-[38px] group-hover:text-[#de5252] transition-colors duration-300">
                    {course.title}
                  </h3>

                  {/* Description */}
                  <p className="text-[11px] text-gray-600 line-clamp-2 leading-relaxed min-h-[32px]">
                    {course.description}
                  </p>

                  {/* Price */}
                  <p className="text-base font-extrabold text-[#de5252] mt-1 group-hover:scale-105 transition-transform duration-300">
                    ₹{course.price?.toLocaleString() || "0"}
                  </p>

                  {/* View Course Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setNavigating(true);
                      router.push(`/courses/${course.slug}`);
                    }}
                    className="w-full bg-gradient-to-r from-[#de5252] to-[#f66] hover:from-[#f66] hover:to-[#de5252] text-white font-semibold py-2 text-xs rounded-lg shadow-md hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                  >
                    View Course
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
