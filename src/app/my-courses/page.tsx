"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClientComponentClient } from "../components/lib/supabaseClient";
import { useRouter } from "next/navigation";

type Course = {
  id: string;
  title: string;
  thumbnail_url: string;
  description: string;
};

export default function MyCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchMyCourses = async () => {
      // ✅ Check if user is logged in
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      // ✅ Get all successful purchases for this user
      const { data: purchases, error: purchaseError } = await supabase
        .from("purchase")
        .select("course_id")
        .eq("user_id", user.id)
        .eq("status", "success");

      if (purchaseError) {
        console.error("Error fetching purchases:", purchaseError);
        setLoading(false);
        return;
      }

      if (!purchases || purchases.length === 0) {
        setCourses([]);
        setLoading(false);
        return;
      }

      // ✅ Extract course IDs
      const courseIds = purchases.map((p) => p.course_id);

      // ✅ Fetch all courses the user purchased from courses_mux table
      const coursesData: Course[] = [];

      for (const courseId of courseIds) {
        try {
          const res = await fetch(`/api/admin/fetch-mux-details-course?id=${courseId}`);
          const data = await res.json();

          if (!data.error && data.id) {
            coursesData.push({
              id: data.id,
              title: data.title,
              thumbnail_url: data.thumbnail_url || "/default-thumbnail.jpg",
              description: data.description || "No description available"
            });
          }
        } catch (err) {
          console.error(`Error fetching course ${courseId}:`, err);
        }
      }

      setCourses(coursesData);
      setLoading(false);
    };

    fetchMyCourses();
  }, [supabase, router]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
        <p>Loading your courses...</p>
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="max-w-6xl mx-auto p-6 text-center">
        <h2 className="text-2xl font-bold mb-4">No Courses Purchased</h2>
        <p className="text-gray-600 mb-6">Browse our courses and start learning today.</p>
        <Link href="/courses">
          <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Browse Courses
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">My Courses</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <div key={course.id} className="bg-white rounded-xl shadow-md overflow-hidden">
            <img
              src={course.thumbnail_url || "/default-thumbnail.jpg"}
              alt={course.title}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h2 className="text-lg font-semibold mb-2">{course.title}</h2>
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">{course.description}</p>

              <Link href={`/courses/${course.id}/lessons`}>
                <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 w-full">
                  Continue Learning
                </button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
