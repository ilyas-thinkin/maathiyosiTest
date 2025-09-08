"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "../../../components/lib/supabaseClient";

type Lesson = {
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  duration: string | null;
  youtube_url: string | null;
  document_url: string | null;
};

type Course = {
  id: string;
  title: string;
  description?: string | null;
  thumbnail_url?: string | null;
  price: number;
};

// ✅ Clean YouTube embed with no-branding
function getYouTubeEmbedUrl(url: string) {
  try {
    const urlObj = new URL(url);

    let videoId = "";
    if (urlObj.hostname === "youtu.be") {
      videoId = urlObj.pathname.slice(1);
    } else if (urlObj.searchParams.get("v")) {
      videoId = urlObj.searchParams.get("v") || "";
    }

    if (videoId) {
      // ✅ Most clean embed setup
      return `https://www.youtube.com/embed/${videoId}?modestbranding=1&rel=0&controls=0&disablekb=1&iv_load_policy=3&showinfo=0`;
    }

    return url; // fallback
  } catch {
    return url;
  }
}

export default function CourseLessonsPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params?.id as string;

  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [isPurchased, setIsPurchased] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!courseId) return;
      
      setLoading(true);

      const prefix = courseId.split("_")[0]; // c / yt
      const rawId = courseId.split("_")[1];

      // 1. Check user authentication
      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;
      
      setAuthChecked(true);
      
      if (!user) {
        setLoading(false);
        return;
      }
      
      setUserId(user.id);

      // 2. Fetch course info
      const table = prefix === "c" ? "courses" : "courses_yt";
      const { data: courseData, error: courseError } = await supabase
        .from(table)
        .select("id, title, description, thumbnail_url, price")
        .eq("id", rawId)
        .single();

      if (courseError) {
        console.error("Error fetching course:", courseError);
        setLoading(false);
        return;
      }

      if (courseData) {
        setCourse({
          id: courseId,
          title: courseData.title,
          description: courseData.description,
          thumbnail_url: courseData.thumbnail_url,
          price: Number(courseData.price),
        });
      }

      // 3. Check if purchased
      const sourceValue = prefix === "c" ? "regular" : prefix === "yt" ? "yt" : prefix;
      const { data: purchaseData } = await supabase
        .from("purchases")
        .select("id")
        .eq("user_id", user.id)
        .eq("course_id", rawId)
        .eq("source", sourceValue)
        .eq("status", "success")
        .maybeSingle();

      if (purchaseData) {
        setIsPurchased(true);
        
        // 4. Fetch lessons only if purchased
        const lessonsTable = prefix === "c" ? "course_lessons" : "course_lessons_yt";
        const { data: lessonsData, error: lessonsError } = await supabase
          .from(lessonsTable)
          .select("*")
          .eq("course_id", rawId)
          .order("created_at", { ascending: true });

        if (lessonsError) {
          console.error("Error fetching lessons:", lessonsError);
        } else {
          setLessons(lessonsData || []);
          if (lessonsData && lessonsData.length > 0) {
            setSelectedLesson(lessonsData[0]);
          }
        }
      }

      setLoading(false);
    };

    fetchData();
  }, [courseId, router]);

  const handleLogin = () => {
    router.push(`/login?redirect=/courses/${courseId}/lessons`);
  };

  const handlePurchase = () => {
    router.push(`/courses/${courseId}`);
  };

  const handleEnrollNow = async () => {
    if (!course || !userId) return;

    const prefix = courseId.split("_")[0];
    const rawId = courseId.split("_")[1];

    const { error } = await supabase.from("purchases").insert([
      {
        user_id: userId,
        course_id: rawId,
        source: prefix,
        status: "success",
        payment_id: "test-" + Date.now(),
      },
    ]);

    if (error) {
      alert("Failed to enroll: " + error.message);
      return;
    }

    setIsPurchased(true);
    
    // Fetch lessons after successful purchase
    const lessonsTable = prefix === "c" ? "course_lessons" : "course_lessons_yt";
    const { data: lessonsData, error: lessonsError } = await supabase
      .from(lessonsTable)
      .select("*")
      .eq("course_id", rawId)
      .order("created_at", { ascending: true });

    if (lessonsError) {
      console.error("Error fetching lessons:", lessonsError);
    } else {
      setLessons(lessonsData || []);
      if (lessonsData && lessonsData.length > 0) {
        setSelectedLesson(lessonsData[0]);
      }
    }
  };

  if (loading) {
    return <p className="p-6 text-center">Loading...</p>;
  }

  // Show login prompt if user is not authenticated
  if (authChecked && !userId) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-10">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-zinc-900 mb-4">
            Login Required
          </h1>
          <p className="text-zinc-600 mb-6">
            You need to be logged in to access course lessons.
          </p>
          <button
            onClick={handleLogin}
            className="rounded-xl bg-blue-600 px-8 py-3 text-lg font-semibold text-white hover:bg-blue-700 transition-colors shadow-md"
          >
            Login
          </button>
        </div>
      </main>
    );
  }

  // Show purchase prompt if user hasn't purchased the course
  if (authChecked && userId && !isPurchased && course) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-10">
        <div className="mb-8">
          {course.thumbnail_url && (
            <img
              src={course.thumbnail_url}
              alt={course.title}
              className="w-full rounded-xl mb-6"
            />
          )}
          <h1 className="text-3xl font-bold text-zinc-900">{course.title}</h1>
          {course.description && (
            <p className="mt-3 text-zinc-600 text-lg leading-relaxed">
              {course.description}
            </p>
          )}
        </div>

        <div className="text-center">
          <h2 className="text-2xl font-bold text-zinc-900 mb-4">
            Purchase Required
          </h2>
          <p className="text-zinc-600 mb-6">
            You need to purchase this course to access the lessons.
          </p>
          <div className="space-x-4">
            <button
              onClick={handleEnrollNow}
              className="rounded-xl bg-red-600 px-8 py-3 text-lg font-semibold text-white hover:bg-red-700 transition-colors shadow-md"
            >
              Enroll Now — ₹{course.price.toLocaleString("en-IN")}
            </button>
            <button
              onClick={handlePurchase}
              className="rounded-xl bg-gray-600 px-8 py-3 text-lg font-semibold text-white hover:bg-gray-700 transition-colors shadow-md"
            >
              View Course Details
            </button>
          </div>
        </div>
      </main>
    );
  }

  // Show course not found if course data couldn't be loaded
  if (authChecked && !course) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-10">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-zinc-900 mb-4">
            Course Not Found
          </h1>
          <p className="text-zinc-600 mb-6">
            The requested course could not be found.
          </p>
          <button
            onClick={() => router.push('/courses')}
            className="rounded-xl bg-blue-600 px-8 py-3 text-lg font-semibold text-white hover:bg-blue-700 transition-colors shadow-md"
          >
            Browse All Courses
          </button>
        </div>
      </main>
    );
  }

  // Show no lessons message if user has purchased but no lessons exist
  if (isPurchased && lessons.length === 0) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-10">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-zinc-900 mb-4">
            {course?.title}
          </h1>
          <p className="text-zinc-600 mb-6">
            No lessons are available for this course yet.
          </p>
          <button
            onClick={() => router.push('/courses')}
            className="rounded-xl bg-blue-600 px-8 py-3 text-lg font-semibold text-white hover:bg-blue-700 transition-colors shadow-md"
          >
            Browse Other Courses
          </button>
        </div>
      </main>
    );
  }

  // Main lessons view (user is authenticated and has purchased the course)
  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-1/4 bg-gray-100 p-4 overflow-y-auto border-r">
        <div className="mb-4">
          <button
            onClick={() => router.push('/courses')}
            className="text-blue-600 hover:text-blue-800 text-sm mb-2"
          >
            ← Back to Courses
          </button>
          <h2 className="text-xl font-bold">{course?.title}</h2>
          <p className="text-sm text-gray-600 mt-1">Lessons</p>
        </div>
        <ul className="space-y-2">
          {lessons.map((lesson) => (
            <li
              key={lesson.id}
              className={`p-2 cursor-pointer rounded-md ${
                selectedLesson?.id === lesson.id
                  ? "bg-blue-500 text-white"
                  : "bg-white hover:bg-gray-200"
              }`}
              onClick={() => setSelectedLesson(lesson)}
            >
              <p className="font-medium">{lesson.title}</p>
              {lesson.duration && (
                <p className="text-sm text-gray-600">{lesson.duration}</p>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* Lesson Player */}
      <div className="flex-1 p-6 overflow-y-auto">
        {selectedLesson ? (
          <div>
            <h1 className="text-2xl font-bold">{selectedLesson.title}</h1>
            {selectedLesson.description && (
              <p className="mt-2 text-gray-700">{selectedLesson.description}</p>
            )}

            {selectedLesson.youtube_url && (
              <div
                className="mt-4 w-full aspect-video rounded-lg shadow-md"
                onContextMenu={(e) => e.preventDefault()} // ✅ disable right-click
              >
                <iframe
                  className="w-full h-full rounded-lg pointer-events-auto"
                  src={getYouTubeEmbedUrl(selectedLesson.youtube_url)}
                  allow="autoplay; encrypted-media"
                  allowFullScreen
                  sandbox="allow-scripts allow-same-origin allow-presentation"
                  style={{ pointerEvents: "auto" }}
                ></iframe>
              </div>
            )}

            {selectedLesson.document_url && (
              <a
                href={selectedLesson.document_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-block text-blue-600 underline"
              >
                📄 View Document
              </a>
            )}
          </div>
        ) : (
          <p>Select a lesson to start learning.</p>
        )}
      </div>
    </div>
  );
}