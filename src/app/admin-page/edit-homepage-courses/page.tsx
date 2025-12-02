"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FiCheck, FiX, FiSave } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

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
  is_homepage?: boolean;
};

export default function EditHomepageCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourses, setSelectedCourses] = useState<Set<string>>(new Set());
  const [initialSelectedCourses, setInitialSelectedCourses] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const router = useRouter();

  // Check admin authentication
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

  // Fetch courses and homepage settings
  useEffect(() => {
    if (!checkingAuth) fetchData();
  }, [checkingAuth]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch all courses and raw homepage_courses data
      const [muxRes, vimeoRes] = await Promise.all([
        fetch("/api/admin/fetch-mux-courses", { cache: "no-store" }),
        fetch("/api/admin/fetch-vimeo-courses", { cache: "no-store" })
      ]);

      const muxResult = await muxRes.json();
      const vimeoResult = await vimeoRes.json();

      const muxCourses = (muxResult.success && Array.isArray(muxResult.data))
        ? muxResult.data.map((c: any) => ({ ...c, source: 'mux' as const }))
        : [];

      const vimeoCourses = (vimeoResult.success && Array.isArray(vimeoResult.data))
        ? vimeoResult.data.map((c: any) => ({ ...c, source: 'vimeo' as const }))
        : [];

      const allCourses = [...muxCourses, ...vimeoCourses].sort((a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setCourses(allCourses);

      // Fetch raw homepage_courses data to get course_id mappings
      const homepageRawRes = await fetch("/api/admin/homepage-courses/raw", { cache: "no-store" });
      const homepageRawResult = await homepageRawRes.json();

      // Set selected courses from homepage_courses table using course_id
      if (homepageRawResult.success && Array.isArray(homepageRawResult.data)) {
        const selected = new Set<string>(
          homepageRawResult.data.map((hc: any) => `${hc.source}-${hc.course_id}`)
        );
        setSelectedCourses(selected);
        setInitialSelectedCourses(selected); // Store initial selection
      }
    } catch (err) {
      console.error("Failed to fetch data:", err);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleCourse = (course: Course) => {
    const key = `${course.source}-${course.id}`;
    setSelectedCourses(prev => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  };

  const handleSave = async () => {
    // Validate at least one course is selected
    if (selectedCourses.size === 0) {
      alert("⚠️ Please select at least one course to display on the homepage.");
      return;
    }

    setSaving(true);
    try {
      const selectedCoursesArray = Array.from(selectedCourses).map(key => {
        // Split only on the first hyphen to separate source from UUID
        const firstHyphenIndex = key.indexOf('-');
        const source = key.substring(0, firstHyphenIndex);
        const courseId = key.substring(firstHyphenIndex + 1);

        // Validate courseId is not undefined or empty
        if (!courseId || courseId === 'undefined') {
          console.error('Invalid course key:', key);
          return null;
        }

        return { course_id: courseId, source };
      }).filter(Boolean); // Remove any null entries

      if (selectedCoursesArray.length === 0) {
        throw new Error("No valid courses selected");
      }

      const res = await fetch("/api/admin/homepage-courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courses: selectedCoursesArray })
      });

      const result = await res.json();

      if (result.success) {
        alert("✅ Homepage courses updated successfully!");
        router.push("/admin-page");
      } else {
        throw new Error(result.error || "Failed to save");
      }
    } catch (err: any) {
      alert("❌ Failed to save: " + err.message);
      console.error("Save error:", err);
    } finally {
      setSaving(false);
    }
  };

  if (checkingAuth || loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-14 w-14 border-4 border-emerald-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-extrabold text-emerald-600 mb-2">
            Edit Homepage Courses
          </h1>
          <p className="text-gray-600">
            Select which courses should appear on the homepage
          </p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-sm font-semibold text-emerald-700">
              {selectedCourses.size} selected
            </span>
            {initialSelectedCourses.size > 0 && (
              <span className="text-xs text-gray-500 bg-blue-50 px-2 py-1 rounded-full border border-blue-200">
                Currently showing: {initialSelectedCourses.size} course{initialSelectedCourses.size !== 1 ? 's' : ''}
              </span>
            )}
            {selectedCourses.size === 0 && (
              <span className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded-full border border-red-200">
                ⚠️ At least one course required
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 px-5 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-all"
          >
            <FiX /> Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || selectedCourses.size === 0}
            className="flex items-center gap-2 px-5 py-3 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                Saving...
              </>
            ) : (
              <>
                <FiSave /> Save Changes
              </>
            )}
          </button>
        </div>
      </div>

      {/* Currently Showing Courses */}
      {initialSelectedCourses.size > 0 && (
        <div className="mb-8 p-6 bg-blue-50 border border-blue-200 rounded-xl">
          <h3 className="text-lg font-bold text-blue-900 mb-3">
            Currently Showing on Homepage ({initialSelectedCourses.size} courses)
          </h3>
          <div className="flex flex-wrap gap-2">
            {courses
              .filter(course => initialSelectedCourses.has(`${course.source}-${course.id}`))
              .map(course => (
                <div
                  key={`${course.source}-${course.id}`}
                  className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-blue-300 shadow-sm"
                >
                  <span className="text-xs font-semibold text-blue-600 uppercase bg-blue-100 px-2 py-0.5 rounded">
                    {course.source}
                  </span>
                  <span className="text-sm text-gray-800 font-medium">{course.title}</span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Course Grid */}
      {courses.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <AnimatePresence>
            {courses.map((course, index) => {
              const key = `${course.source}-${course.id}`;
              const isSelected = selectedCourses.has(key);

              const isCurrentlyShowing = initialSelectedCourses.has(key);

              return (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.02 }}
                  onClick={() => toggleCourse(course)}
                  className={`group cursor-pointer bg-white rounded-xl border-2 overflow-hidden transition-all duration-300 relative flex flex-col hover:-translate-y-1 ${
                    isSelected
                      ? "border-emerald-500 shadow-lg shadow-emerald-500/20"
                      : "border-gray-200 shadow-md hover:shadow-lg"
                  }`}
                >
                  {/* Thumbnail */}
                  <div className="relative h-40 overflow-hidden bg-gradient-to-br from-emerald-50 to-teal-50">
                    <img
                      src={course.thumbnail_url || "/placeholder.png"}
                      alt={course.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent" />

                    {/* Selection indicator */}
                    <div
                      className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                        isSelected
                          ? "bg-emerald-500 scale-100"
                          : "bg-white/80 scale-90 group-hover:scale-100"
                      }`}
                    >
                      {isSelected ? (
                        <FiCheck className="text-white text-lg" />
                      ) : (
                        <div className="w-4 h-4 border-2 border-gray-400 rounded-full" />
                      )}
                    </div>

                    {/* Source badge */}
                    <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-md">
                      <p className="text-white text-xs font-semibold uppercase">{course.source}</p>
                    </div>

                    {/* Currently Showing Badge */}
                    {isCurrentlyShowing && (
                      <div className="absolute bottom-2 left-2 bg-blue-500/90 backdrop-blur-sm px-2 py-1 rounded-md">
                        <p className="text-white text-xs font-semibold">Currently on Homepage</p>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4 flex flex-col gap-2">
                    <h3 className="font-bold text-gray-900 text-sm leading-snug line-clamp-2 min-h-[40px]">
                      {course.title}
                    </h3>
                    <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                      {course.description}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-sm font-bold text-emerald-600">
                        ₹{course.price?.toLocaleString() || "0"}
                      </p>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {course.category}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      ) : (
        <p className="text-center text-gray-400 text-lg mt-20">
          No courses available.
        </p>
      )}
    </div>
  );
}
