"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FiEdit, FiTrash2, FiPlus, FiLogOut } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

type Course = {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  thumbnail_url: string;
  created_at: string;
  source: 'mux' | 'vimeo';
};

export default function AdminPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const router = useRouter();

  // ✅ Check admin authentication
  useEffect(() => {
    const checkAuth = () => {
      if (typeof window === "undefined") return;
      const isAdmin = localStorage.getItem("isAdmin");
      if (isAdmin !== "true") {
        router.replace("/admin-login");
      } else {
        setCheckingAuth(false);
      }
    };
    checkAuth();
  }, [router]);

  // ✅ Fetch courses once authentication passes
  useEffect(() => {
    if (!checkingAuth) fetchAllCourses();
  }, [checkingAuth]);

  // ✅ Fetch both Mux and Vimeo courses
  const fetchAllCourses = async () => {
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
      console.error("Failed to fetch courses:", err);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Delete a course
  const handleDelete = async (course: Course) => {
    if (!window.confirm(`Are you sure you want to delete "${course.title}"?`)) return;

    setDeleting(course.id);
    try {
      const endpoint = course.source === 'mux'
        ? `/api/admin/delete-mux-course?id=${course.id}`
        : `/api/admin/delete-vimeo-course?id=${course.id}`;

      const res = await fetch(endpoint, { method: "DELETE" });
      const data = await res.json();

      if (data.error) throw new Error(data.error);

      // Remove from UI
      setCourses((prev) => prev.filter((c) => c.id !== course.id));
      alert("✅ Course deleted successfully!");
    } catch (err: any) {
      alert("❌ Delete failed: " + err.message);
      console.error("Delete error:", err);
    } finally {
      setDeleting(null);
    }
  };

  // ✅ Logout
  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.clear();
      router.replace("/admin-login");
    }
  };

  // 🌀 Loading screens
  if (checkingAuth || loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-14 w-14 border-4 border-indigo-500 border-t-transparent"></div>
      </div>
    );
  }

  // ✅ Main UI
  return (
    <div className="max-w-7xl mx-auto p-6 relative pb-32">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-extrabold text-indigo-600">
          🎬 Manage Courses
        </h1>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white font-semibold rounded-lg shadow hover:bg-red-600 transition-all"
        >
          <FiLogOut /> Logout
        </button>
      </div>

      {/* Course Grid - Compact Cards */}
      {courses.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
          <AnimatePresence>
            {courses.map((course, index) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3, delay: index * 0.03 }}
                className="group bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-500 flex flex-col border border-gray-100 hover:border-indigo-500/30 hover:-translate-y-2"
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

                  {/* Action Buttons Overlay - Always Visible at Top */}
                  <div className="absolute top-2 right-2 flex gap-2">
                    <button
                      onClick={() => router.push(`/admin-page/edit-${course.source}/${course.id}`)}
                      className="bg-white/95 backdrop-blur-sm p-2 rounded-full text-indigo-600 shadow-xl hover:bg-white hover:scale-110 transition-all"
                    >
                      <FiEdit size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(course)}
                      disabled={deleting === course.id}
                      className="bg-white/95 backdrop-blur-sm p-2 rounded-full text-red-600 shadow-xl hover:bg-white hover:scale-110 transition-all disabled:opacity-50"
                    >
                      {deleting === course.id ? (
                        <div className="animate-spin h-3.5 w-3.5 border-2 border-red-600 border-t-transparent rounded-full" />
                      ) : (
                        <FiTrash2 size={14} />
                      )}
                    </button>
                  </div>

                  {/* Category badge - Positioned at Bottom */}
                  <div className="absolute bottom-2 left-2 bg-gradient-to-r from-indigo-600 to-indigo-500 backdrop-blur-sm px-2.5 py-1 rounded-full shadow-lg">
                    <p className="text-white text-[10px] font-semibold uppercase tracking-wide">{course.category}</p>
                  </div>
                </div>

                {/* Course Info */}
                <div className="p-3.5 flex flex-col gap-2">
                  <h3 className="font-bold text-gray-900 text-sm leading-snug line-clamp-2 min-h-[38px] group-hover:text-indigo-600 transition-colors duration-300">
                    {course.title}
                  </h3>
                  <p className="text-[11px] text-gray-600 line-clamp-2 leading-relaxed min-h-[32px]">
                    {course.description}
                  </p>
                  <p className="text-base font-extrabold text-indigo-600 mt-1 group-hover:scale-105 transition-transform duration-300">
                    ₹{course.price?.toLocaleString() || "0"}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <p className="text-center text-gray-400 text-lg mt-20">
          No courses available.
        </p>
      )}

      {/* Floating Buttons */}
      <button
        onClick={() => router.push("/components/courseuploader")}
        className="fixed bottom-6 right-6 flex items-center gap-2 px-5 py-3 bg-indigo-600 text-white font-bold rounded-full shadow-lg hover:bg-indigo-700 transition-all z-50"
      >
        <FiPlus className="text-xl" /> Add Mux Course
      </button>

      <button
        onClick={() => router.push("/components/vimeo-courseuploader")}
        className="fixed bottom-20 right-6 flex items-center gap-2 px-5 py-3 bg-purple-600 text-white font-bold rounded-full shadow-lg hover:bg-purple-700 transition-all z-50"
      >
        <FiPlus className="text-xl" /> Add Vimeo Course
      </button>

      <button
        onClick={() => router.push("/admin-page/EditHero")}
        className="fixed bottom-36 right-6 flex items-center gap-2 px-5 py-3 bg-gray-600 text-white font-bold rounded-full shadow-lg hover:bg-gray-700 transition-all z-50"
      >
        <FiEdit className="text-xl" /> Edit Hero
      </button>
    </div>
  );
}
