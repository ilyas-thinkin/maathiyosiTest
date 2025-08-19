"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../components/lib/supabaseClient";
import Card from "../components/AllCourseCard"; // custom card

// Shared Course type
type Course = {
  id: string;
  title: string;
  description: string;
  category: string;
  thumbnail_url: string;
  topics?: string[];
  created_at: string;
  price?: number;
  source: "normal" | "yt"; // distinguishes the type
  yt_url?: string; // for YouTube courses
};

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    const fetchCourses = async () => {
      // Fetch normal courses
      const { data: normalCourses, error: error1 } = await supabase
        .from("courses")
        .select("*")
        .order("created_at", { ascending: false });

      if (error1) console.error("Error fetching normal courses:", error1.message);

      // Fetch YouTube courses
      const { data: ytCourses, error: error2 } = await supabase
        .from("courses_yt")
        .select("*")
        .order("created_at", { ascending: false });

      if (error2) console.error("Error fetching yt courses:", error2.message);

      // Merge & normalize them
      const mergedCourses: Course[] = [
        ...(normalCourses?.map((c) => ({
          ...c,
          source: "normal" as const,
        })) || []),

        ...(ytCourses?.map((c) => ({
          ...c,
          source: "yt" as const,
          // Take actual price from table
          price: c.price,
          thumbnail_url:
            c.thumbnail_url ||
            `https://img.youtube.com/vi/${extractYouTubeId(c.yt_url)}/hqdefault.jpg`,
        })) || []),
      ];

      // Sort by newest first
      mergedCourses.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setCourses(mergedCourses);
    };

    fetchCourses();
  }, []);

  // Helper: extract YouTube video ID
  function extractYouTubeId(url: string): string {
    try {
      const match = url.match(/(?:youtube\.com\/.*v=|youtu\.be\/)([^&#?]*)/);
      return match ? match[1] : "";
    } catch {
      return "";
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-4xl font-bold mb-8 text-center text-rose-600">
        Our Courses
      </h1>

      <div className="flex flex-wrap justify-center gap-8">
        {courses.map((course) => (
          <Link
            key={`${course.source}-${course.id}`} // unique key
            href={`/courses/${course.id}?source=${course.source}`} // pass source uniformly
          >
            <Card
              title={course.title}
              description={course.description}
              price={
                course.price && course.price > 0
                  ? `₹${course.price.toLocaleString()}`
                  : "Free"
              }
              thumbnail={course.thumbnail_url}
            />
          </Link>
        ))}
      </div>
    </div>
  );
}
