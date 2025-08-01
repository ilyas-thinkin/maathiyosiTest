"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../components/lib/supabaseClient";
import { createClientComponentClient } from "../../components/lib/supabaseClient";
import { motion } from "framer-motion";

type Course = {
  id: string;
  title: string;
  description: string;
  category: string;
  thumbnail_url: string;
  topics: string[];
  created_at: string;
  price: number;
};

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const supabaseAuth = createClientComponentClient();

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [alreadyPurchased, setAlreadyPurchased] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(false);

  // ✅ Fetch course details
  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const { data, error } = await supabase
          .from("courses")
          .select("*")
          .eq("id", params.id)
          .single();

        if (error) {
          setError(error.message);
          return;
        }
        setCourse(data as Course);

        // ✅ Check if user has already purchased
        const { data: { user } } = await supabaseAuth.auth.getUser();
        if (user) {
          const { data: purchase } = await supabase
            .from("purchases")
            .select("*")
            .eq("user_id", user.id)
            .eq("course_id", params.id)
            .maybeSingle();

          if (purchase) {
            setAlreadyPurchased(true);
          }
        }
      } catch (err) {
        setError("Failed to fetch course");
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [params.id, supabaseAuth]);

  // ✅ Handle Enroll / Start Learning
  const handleEnroll = async () => {
    setButtonLoading(true);

    const { data: { user } } = await supabaseAuth.auth.getUser();
    if (!user) {
      router.push("/student-login");
      return;
    }

    if (!alreadyPurchased) {
      const { error } = await supabase
        .from("purchases")
        .insert([{ user_id: user.id, course_id: params.id }]);

      if (error) {
        console.error("Error enrolling:", error.message);
        setButtonLoading(false);
        return;
      }
    }

    router.push(`/courses/${params.id}/lessons`);
  };

  // ✅ Loading state
  if (loading) {
    return (
      <div className="max-w-3xl mx-auto p-6 flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-rose-400 border-t-transparent mb-4"></div>
        <p className="text-gray-600 text-sm font-medium">Loading course details...</p>
      </div>
    );
  }

  // ✅ Error state
  if (error || !course) {
    return (
      <div className="max-w-3xl mx-auto p-6 text-center">
        <h2 className="text-lg text-red-600 mb-3">
          {error || "Course not found"}
        </h2>
        <Link href="/courses">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            className="px-4 py-2 bg-rose-500 text-white rounded-lg shadow hover:shadow-md hover:bg-rose-600 transition"
          >
            ← Back to Courses
          </motion.button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100"
      >
        {/* ✅ Thumbnail */}
        {course.thumbnail_url ? (
          <motion.img
            src={course.thumbnail_url}
            alt={course.title}
            className="w-full h-56 object-cover"
            whileHover={{ scale: 1.03 }}
            transition={{ duration: 0.3 }}
          />
        ) : (
          <div className="w-full h-56 bg-gray-200 flex items-center justify-center text-gray-500">
            No Image Available
          </div>
        )}

        {/* ✅ Content */}
        <div className="p-5">
          {/* ✅ Title & Price */}
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-gray-900">{course.title}</h1>
            <p className="text-xl font-semibold text-rose-600">
              ₹{course.price?.toLocaleString()}
            </p>
          </div>

          {/* ✅ Info box */}
          <div className="bg-rose-50 p-3 rounded-lg mb-5 text-sm">
            <p className="text-gray-700">
              <span className="font-semibold">📂 Category:</span> {course.category}
            </p>
            <p className="text-gray-700 mt-1">
              <span className="font-semibold">📅 Created:</span>{" "}
              {new Date(course.created_at).toLocaleDateString()}
            </p>
          </div>

          {/* ✅ Description */}
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-gray-800 mb-1">
              📝 Description
            </h2>
            <p className="text-gray-700 text-sm leading-relaxed">{course.description}</p>
          </div>

          {/* ✅ Topics */}
          {course.topics?.length > 0 && (
            <div className="mb-5">
              <h2 className="text-lg font-semibold text-gray-800 mb-1">
                📚 Topics Covered
              </h2>
              <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                {course.topics.map((topic, index) => (
                  <li key={index}>{topic}</li>
                ))}
              </ul>
            </div>
          )}

          {/* ✅ Buttons */}
          <div className="mt-6 flex flex-col sm:flex-row justify-between gap-3">
            <Link href="/courses" className="w-full sm:w-auto">
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 4px 14px rgba(0,0,0,0.1)" }}
                whileTap={{ scale: 0.97 }}
                className="w-full px-4 py-2 bg-gray-200 text-gray-800 text-sm font-medium rounded-lg hover:bg-gray-300 transition"
              >
                ← Back to Courses
              </motion.button>
            </Link>

            <motion.button
              onClick={handleEnroll}
              disabled={buttonLoading}
              whileHover={{ scale: 1.05, boxShadow: "0 4px 14px rgba(0,0,0,0.15)" }}
              whileTap={{ scale: 0.97 }}
              className={`w-full sm:w-auto px-5 py-2 text-sm font-semibold text-white rounded-lg shadow transition ${
                alreadyPurchased
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-rose-500 hover:bg-rose-600"
              } disabled:opacity-50`}
            >
              {buttonLoading
                ? "Processing..."
                : alreadyPurchased
                ? "Start Learning"
                : "Enroll Now"}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
