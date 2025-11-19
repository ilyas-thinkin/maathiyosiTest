"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../components/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { ScatterBoxLoaderComponent } from "../components/ScatterBoxLoaderComponent";

type Course = {
  id: string;
  title: string;
  thumbnail_url: string;
  description: string;
};

export default function MyCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [user, setUser] = useState<any>(null);
  const [userLoading, setUserLoading] = useState(true);
  const [navigating, setNavigating] = useState(false);
  const router = useRouter();

  // Check user session (separate useEffect like course details page)
  useEffect(() => {
    const checkUser = async () => {
      setUserLoading(true);
      try {
        const { data: authData } = await supabase.auth.getUser();
        setUser(authData?.user || null);
        console.log("My Courses: User check result:", authData?.user ? "Logged in" : "Not logged in");
      } catch (err) {
        console.error("Error checking user session:", err);
        setUser(null);
      } finally {
        setUserLoading(false);
      }
    };

    checkUser();
  }, []);

  // Fetch purchased courses (only runs when user is available)
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchMyCourses = async () => {
      console.log("My Courses: Starting to fetch courses for user:", user.id);
      setLoading(true);

      try {
        // ✅ Get all successful purchases for this user
        const { data: purchases, error: purchaseError } = await supabase
          .from("purchase")
          .select("course_id")
          .eq("user_id", user.id)
          .eq("status", "success");

        console.log("My Courses: Purchases query result:", { purchases, purchaseError });

        if (purchaseError) {
          console.error("Error fetching purchases:", purchaseError);
          setError(`Failed to fetch purchases: ${purchaseError.message}`);
          setLoading(false);
          return;
        }

        if (!purchases || purchases.length === 0) {
          console.log("My Courses: No purchases found");
          setCourses([]);
          setLoading(false);
          return;
        }

        // ✅ Extract unique course IDs
        const courseIds = [...new Set(purchases.map((p) => p.course_id))];
        console.log("My Courses: Unique Course IDs:", courseIds);

        // ✅ Fetch all courses the user purchased from courses_mux table
        const coursesData: Course[] = [];

        for (const courseId of courseIds) {
          try {
            console.log(`My Courses: Fetching course details for ${courseId}`);
            const res = await fetch(`/api/admin/fetch-mux-details-course?id=${courseId}`);

            if (!res.ok) {
              console.error(`Failed to fetch course ${courseId}: ${res.status}`);
              continue;
            }

            const data = await res.json();

            if (!data.error && data.id) {
              coursesData.push({
                id: data.id,
                title: data.title,
                thumbnail_url: data.thumbnail_url || "/default-thumbnail.jpg",
                description: data.description || "No description available"
              });
            } else {
              console.warn(`Course ${courseId} returned error or invalid data:`, data);
            }
          } catch (err) {
            console.error(`Error fetching course ${courseId}:`, err);
          }
        }

        console.log("My Courses: Final courses data:", coursesData);
        setCourses(coursesData);
        setLoading(false);
      } catch (err: any) {
        console.error("My Courses: Unexpected error:", err);
        setError(`An unexpected error occurred: ${err.message || "Unknown error"}`);
        setLoading(false);
      }
    };

    fetchMyCourses();
  }, [user]);

  // Show loader while checking user or loading courses
  if (userLoading || loading || navigating) {
    return <ScatterBoxLoaderComponent />;
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-6 text-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-4">
          <h2 className="text-2xl font-bold text-red-800 mb-2">Error Loading Courses</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // If user is not logged in
  if (!user) {
    return (
      <div className="max-w-6xl mx-auto p-6 text-center">
        <h2 className="text-2xl font-bold mb-4">Please Log In</h2>
        <p className="text-gray-600 mb-6">You need to be logged in to view your courses.</p>
        <button
          onClick={() => router.push("/login?redirect=/my-courses")}
          className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold"
        >
          Log In
        </button>
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
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
        My Courses
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {courses.map((course) => (
          <div
            key={course.id}
            onClick={() => {
              setNavigating(true);
              router.push(`/courses/${course.id}/lessons`);
            }}
            className="group cursor-pointer"
          >
            <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-red-200 hover:-translate-y-1">
              {/* Thumbnail with overlay */}
              <div className="relative overflow-hidden">
                <img
                  src={course.thumbnail_url || "/default-thumbnail.jpg"}
                  alt={course.title}
                  className="w-full h-52 object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>

              {/* Content */}
              <div className="p-5">
                <h2 className="text-xl font-bold mb-2 text-gray-900 group-hover:text-red-600 transition-colors line-clamp-1">
                  {course.title}
                </h2>
                <p className="text-gray-500 text-sm mb-4 line-clamp-2 leading-relaxed">
                  {course.description}
                </p>

                {/* Continue button */}
                <div className="flex items-center text-red-600 text-sm font-semibold group-hover:text-red-700 transition-colors">
                  <span>Continue Learning</span>
                  <svg
                    className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}