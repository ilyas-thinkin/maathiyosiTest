"use client";

import { useEffect, useState } from "react";
import { supabase } from "../components/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { FiEdit, FiTrash2, FiPlus, FiImage } from "react-icons/fi";
import { motion } from "framer-motion";

type Course = {
  id: string;
  title?: string;
  description?: string;
  price?: number;
  category?: string;
  thumbnail_url?: string;
  created_at?: string;
  type: "mux" | "youtube";
};

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const { data: muxCourses, error: muxErr } = await supabase
        .from("courses_mux")
        .select("*");
      const { data: ytCourses, error: ytErr } = await supabase
        .from("courses_yt")
        .select("*");

      console.log("Mux Courses Raw:", muxCourses, "Error:", muxErr);
      console.log("YouTube Courses Raw:", ytCourses, "Error:", ytErr);

      const allCourses: Course[] = [
        ...(muxCourses?.map((c) => ({ ...c, type: "mux" as const })) || []),
        ...(ytCourses?.map((c) => ({ ...c, type: "youtube" as const })) || []),
      ];

      console.log("All Courses Mapped:", allCourses);

      // Sort by created_at descending, fallback if undefined
      allCourses.sort((a, b) => {
        if (!a.created_at) return 1;
        if (!b.created_at) return -1;
        return a.created_at > b.created_at ? -1 : 1;
      });

      setCourses(allCourses);
    } catch (err) {
      console.error("Error fetching courses:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, type: "mux" | "youtube") => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete this ${type === "youtube" ? "YouTube" : "Mux"} course?`
    );
    if (!confirmDelete) return;

    setDeleting(id);

    try {
      if (type === "mux") {
        const { data: course, error: courseError } = await supabase
          .from("courses_mux")
          .select("thumbnail_url")
          .eq("id", id)
          .single();
        if (courseError) throw courseError;

        if (course?.thumbnail_url) {
          const thumbnailPath = course.thumbnail_url.split("/storage/v1/object/public/")[1];
          if (thumbnailPath) {
            await supabase.storage.from("course_thumbnails").remove([thumbnailPath]);
          }
        }

        await supabase.from("courses_mux").delete().eq("id", id);
      } else {
        await supabase.from("courses_yt").delete().eq("id", id);
      }

      setCourses(courses.filter((c) => c.id !== id));
      alert("Course deleted successfully!");
    } catch (error: any) {
      console.error("Error during deletion:", error.message);
      alert("Deletion failed: " + error.message);
    }

    setDeleting(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-rose-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 relative">
      <h1 className="text-4xl font-bold text-rose-600 text-center mb-8">
        📚 Admin – Manage Courses
      </h1>

      {courses.length === 0 ? (
        <p className="text-center text-gray-500">No courses available.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course) => (
            <motion.div
              key={course.id}
              whileHover={{ y: -5 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-2xl shadow-md hover:shadow-xl overflow-hidden border border-gray-100"
            >
              <div className="relative">
                <img
                  src={course.thumbnail_url || "/placeholder.png"}
                  alt={course.title || "No Title"}
                  className="w-full h-40 object-cover"
                />
              </div>
              <div className="p-5 flex flex-col h-full">
                <h2 className="text-lg font-semibold text-gray-900">{course.title || "Untitled"}</h2>
                <p className="text-sm text-gray-500">{course.category || "Uncategorized"}</p>
                <p className="text-sm text-gray-700 mt-2 line-clamp-2">{course.description || "No description"}</p>
                <p className="text-lg font-bold text-rose-600 mt-3">
                  ₹{course.price?.toLocaleString() || "0"}
                </p>
                <div className="flex justify-between items-center mt-4">
                  <button
                    onClick={() =>
                      router.push(
                        course.type === "youtube"
                          ? `/admin-courses/edityt/${course.id}`
                          : `/admin-courses/edit-mux/${course.id}`
                      )
                    }
                    className="flex items-center gap-2 px-3 py-1.5 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-all"
                  >
                    <FiEdit /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(course.id, course.type)}
                    disabled={deleting === course.id}
                    className="flex items-center gap-2 px-3 py-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all disabled:opacity-50"
                  >
                    {deleting === course.id ? "Deleting..." : (<><FiTrash2 /> Delete</>)}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Floating Buttons */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-4">
        <button
          onClick={() => router.push("/components/admin/upload-course")}
          className="flex items-center gap-2 px-4 py-2 bg-rose-600 text-white font-semibold rounded-full shadow-lg hover:bg-rose-700 transition-all"
        >
          <FiPlus className="text-xl" /> Add Course
        </button>

        <button
          onClick={() => router.push("/components/admin/uploadytcourse")}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white font-semibold rounded-full shadow-lg hover:bg-green-700 transition-all"
        >
          <FiPlus className="text-xl" /> Add Course with YouTube
        </button>

        <button
          onClick={() => router.push("/admin-courses/EditHero")}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-semibold rounded-full shadow-lg hover:bg-indigo-700 transition-all"
        >
          <FiImage className="text-xl" /> Edit Hero Section
        </button>
      </div>
    </div>
  );
}
