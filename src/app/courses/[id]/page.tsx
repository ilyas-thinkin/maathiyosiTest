"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "../../components/lib/supabaseClient";

type Course = {
  id: string;
  title: string;
  description?: string | null;
  thumbnail_url?: string | null;
  price: number;
};

export default function CourseDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [isPurchased, setIsPurchased] = useState(false);

  useEffect(() => {
    async function loadCourse() {
      if (!id) return;
      setLoading(true);

      const prefix = id.split("_")[0]; // c / yt
      const rawId = id.split("_")[1];

      // 1. Check user login
      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;
      if (!user) {
        router.push(`/login?redirect=/courses/${id}`);
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
        console.error("Error fetching course:", courseError.message);
      }

      if (courseData) {
        setCourse({
          id: id,
          title: courseData.title,
          description: courseData.description,
          thumbnail_url: courseData.thumbnail_url,
          price: Number(courseData.price),
        });
      }

      // 3. Check if purchased
      const { data: purchaseData } = await supabase
        .from("purchases")
        .select("id")
        .eq("user_id", user.id)
        .eq("course_id", rawId)
        .eq("source", prefix)
        .eq("status", "success")
        .maybeSingle();

      if (purchaseData) {
        setIsPurchased(true);
      }

      setLoading(false);
    }

    loadCourse();
  }, [id, router]);

  const handleEnrollNow = async () => {
    if (!course || !userId) return;

    const prefix = id.split("_")[0];
    const rawId = id.split("_")[1];

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
  };

  const handleStartLearning = () => {
    router.push(`/courses/${id}/lessons`);
  };

  if (loading) {
    return (
      <div className="p-10 text-center text-zinc-600">Loading course...</div>
    );
  }

  if (!course) {
    return (
      <div className="p-10 text-center text-zinc-600">Course not found</div>
    );
  }

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

      {isPurchased ? (
        <button
          onClick={handleStartLearning}
          className="rounded-xl bg-green-600 px-8 py-3 text-lg font-semibold text-white hover:bg-green-700 transition-colors shadow-md"
        >
          Start Learning
        </button>
      ) : (
        <button
          onClick={handleEnrollNow}
          className="rounded-xl bg-red-600 px-8 py-3 text-lg font-semibold text-white hover:bg-red-700 transition-colors shadow-md"
        >
          Enroll Now — ₹{course.price.toLocaleString("en-IN")}
        </button>
      )}
    </main>
  );
}