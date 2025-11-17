"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { supabase } from "../../components/lib/supabaseClient";
import ThinkingRobotLoader from "../../components/RobotThinkingLoader";

type Lesson = {
  id: string;
  title: string;
  video_url?: string;
  lesson_order?: number; // Add lesson_order field
};

type Course = {
  id: string;
  title: string;
  description?: string;
  category?: string;
  price?: number;
  thumbnail_url?: string;
  lessons?: Lesson[];
};

export default function CourseDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [courseLoading, setCourseLoading] = useState(true);
  const [userLoading, setUserLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  // Fetch course data
  useEffect(() => {
    if (!params?.id) return;

    const fetchCourse = async () => {
      setCourseLoading(true);
      try {
        const res = await fetch(`/api/admin/fetch-mux-details-course?id=${params.id}`);
        const data = await res.json();
        
        // Sort lessons by lesson_order if it exists
        if (data.lessons && Array.isArray(data.lessons)) {
          data.lessons.sort((a: Lesson, b: Lesson) => {
            const orderA = a.lesson_order ?? 999;
            const orderB = b.lesson_order ?? 999;
            return orderA - orderB;
          });
        }
        
        setCourse(data.error ? null : data);
      } catch (err) {
        console.error(err);
        setCourse(null);
      } finally {
        setCourseLoading(false);
      }
    };

    fetchCourse();
  }, [params?.id]);

  // Check user session
  useEffect(() => {
    const checkUser = async () => {
      setUserLoading(true);
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        setUser(user);
      } catch (err) {
        console.error("Error checking user session:", err);
        setUser(null);
      } finally {
        setUserLoading(false);
      }
    };
    checkUser();
  }, []);

  // Show loader while either course or user is loading
  if (courseLoading || userLoading) return <ThinkingRobotLoader />;

  if (!course) return <p className="p-6 font-semibold text-red-600">Course not found.</p>;

  return (
    <motion.div
      className="max-w-6xl mx-auto p-10 bg-[#fff5f5] rounded-3xl shadow-2xl"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      {/* Header */}
      <motion.h1
        className="text-5xl font-extrabold mb-6 text-[#de5252] leading-tight"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >
        {course.title}
      </motion.h1>

      {/* Thumbnail */}
      {course.thumbnail_url && (
        <motion.img
          src={course.thumbnail_url}
          alt={course.title}
          className="w-full h-36 object-cover rounded-xl shadow-lg mb-6"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        />
      )}

      {/* Course Info */}
      <motion.div
        className="mb-6 space-y-2 text-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
      >
        {course.description && <p className="text-gray-800">{course.description}</p>}
        {course.category && <p className="font-semibold text-[#a63b3b]">Category: {course.category}</p>}
        {course.price !== undefined && <p className="font-semibold text-[#a67c3b]">Price: ₹{course.price}</p>}
      </motion.div>

      {/* Lessons */}
      <motion.div
        className="mb-8"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.1 } },
        }}
      >
        <h2 className="text-3xl font-bold mb-4 text-[#de5252]">Course Topics</h2>
        <ul className="space-y-4">
          {course.lessons && course.lessons.length > 0 ? (
            course.lessons.map((lesson, index) => (
              <motion.li
                key={lesson.id}
                className="p-4 rounded-xl bg-white shadow-md hover:shadow-2xl cursor-pointer font-medium border-l-4 border-[#de5252] hover:bg-[#ffe5e5] transition-all duration-300"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.03 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                {index + 1}. {lesson.title}
              </motion.li>
            ))
          ) : (
            <li className="text-gray-500">No topics available.</li>
          )}
        </ul>
      </motion.div>

      {/* Enroll / Login Button */}
      {user ? (
        <motion.button
          onClick={() => router.push(`/courses/${course.id}/lessons`)}
          className="w-full py-5 rounded-3xl text-white font-bold bg-[#de5252] hover:bg-[#f66] shadow-xl hover:shadow-2xl transform transition-all duration-300 text-2xl"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Enroll Now
        </motion.button>
      ) : (
        <motion.button
          onClick={() => router.push(`/login?redirect=/courses/${course.id}`)}
          className="w-full py-5 rounded-3xl text-white font-bold bg-indigo-500 hover:bg-indigo-600 shadow-xl hover:shadow-2xl transform transition-all duration-300 text-2xl"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Login / Sign Up
        </motion.button>
      )}
    </motion.div>
  );
}