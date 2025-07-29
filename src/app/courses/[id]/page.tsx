"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../components/lib/supabaseClient";
import { createClientComponentClient } from "../../components/lib/supabaseClient";

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

    // 1️⃣ Check if logged in
    const { data: { user } } = await supabaseAuth.auth.getUser();
    if (!user) {
      router.push("/student-login");
      return;
    }

    // 2️⃣ If not purchased, insert purchase record
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

    // 3️⃣ Redirect to lessons page
    router.push(`/courses/${params.id}/lessons`);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p>Loading course details...</p>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <h2 className="text-xl text-red-600 mb-4">Error: {error || "Course not found"}</h2>
        <Link href="/courses">
          <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Back to Courses
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {course.thumbnail_url ? (
          <img
            src={course.thumbnail_url}
            alt={course.title}
            className="w-full h-64 object-cover"
          />
        ) : (
          <div className="w-full h-64 bg-gray-200 flex items-center justify-center">
            <span className="text-gray-500">No Image Available</span>
          </div>
        )}

        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <h1 className="text-3xl font-bold">{course.title}</h1>
            <p className="text-2xl font-bold text-green-700">
              ₹{course.price?.toLocaleString() || "Price not set"}
            </p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <p className="text-gray-700 mb-2">
              <span className="font-semibold">Category:</span> {course.category}
            </p>
            <p className="text-gray-700">
              <span className="font-semibold">Created:</span>{" "}
              {new Date(course.created_at).toLocaleDateString()}
            </p>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Description</h2>
            <p className="text-gray-700">{course.description}</p>
          </div>

          {course.topics?.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-2">Topics Covered</h2>
              <ul className="list-disc list-inside text-gray-700">
                {course.topics.map((topic, index) => (
                  <li key={index}>{topic}</li>
                ))}
              </ul>
            </div>
          )}

          {/* ✅ Buttons */}
          <div className="mt-8 flex justify-between">
            <Link href="/courses">
              <button className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700">
                Back to Courses
              </button>
            </Link>

            <button
              onClick={handleEnroll}
              disabled={buttonLoading}
              className={`px-6 py-2 ${
                alreadyPurchased ? "bg-green-600 hover:bg-green-700" : "bg-blue-600 hover:bg-blue-700"
              } text-white rounded disabled:opacity-50`}
            >
              {buttonLoading
                ? "Processing..."
                : alreadyPurchased
                ? "Start Learning"
                : "Enroll Now"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
