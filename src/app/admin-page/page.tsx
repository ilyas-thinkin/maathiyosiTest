"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FiEdit, FiTrash2, FiPlus } from "react-icons/fi";
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

export default function AdminPage() {
  const [courses, setCourses] = useState<MuxCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setLoading(true);
    console.log("Fetching Mux courses...");
    try {
      const res = await fetch("/api/admin/fetch-mux-courses");
      const data = await res.json();
      console.log("API response:", data);

      if (!data || data.error) {
        console.error("Error fetching courses:", data?.error);
        setCourses([]);
      } else {
        console.log("Fetched courses:", data);
        setCourses(data);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this course?");
    if (!confirmDelete) return;

    setDeleting(id);
    try {
      console.log("Deleting course with ID:", id);
      const res = await fetch(`/api/admin/delete-mux-course?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      console.log("Delete response:", data);

      if (data.error) throw new Error(data.error);

      // Animate out before removing
      setCourses((prev) => prev.filter((c) => c.id !== id));
      alert("Course deleted successfully!");
    } catch (err: any) {
      console.error("Delete error:", err);
      alert("Delete failed: " + err.message);
    } finally {
      setDeleting(null);
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
        🎬 Manage Mux Courses
      </h1>

      {courses.length === 0 ? (
        <p className="text-center text-gray-400">No Mux courses available.</p>
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
                className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-3xl shadow-xl overflow-hidden hover:scale-105 hover:shadow-2xl transition-transform duration-300 relative"
              >
                <div className="relative h-48 overflow-hidden rounded-t-3xl">
                  <img
                    src={course.thumbnail_url || "/placeholder.png"}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 right-3 flex gap-2">
                    <button
                      onClick={() => router.push(`/admin-page/edit-mux/${course.id}`)}
                      className="bg-indigo-600 p-2 rounded-full text-white shadow hover:bg-indigo-700 transition-all"
                    >
                      <FiEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(course.id)}
                      disabled={deleting === course.id}
                      className="bg-red-500 p-2 rounded-full text-white shadow hover:bg-red-600 transition-all disabled:opacity-50"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
                <div className="p-5">
                  <h2 className="text-xl font-bold text-indigo-800 line-clamp-1">{course.title}</h2>
                  <p className="text-sm text-gray-500 mt-1">{course.category}</p>
                  <p className="text-gray-700 mt-2 line-clamp-3">{course.description}</p>
                  <p className="text-lg font-semibold text-purple-600 mt-3">
                    ₹{course.price?.toLocaleString() || "0"}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <button
        onClick={() => router.push("/components/courseuploader")}
        className="fixed bottom-6 right-6 flex items-center gap-2 px-5 py-3 bg-indigo-600 text-white font-bold rounded-full shadow-lg hover:bg-indigo-700 transition-all"
      >
        <FiPlus className="text-xl" /> Add New Mux Course
      </button>
    </div>
  );
}
