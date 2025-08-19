"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../components/lib/supabaseClient";
import Card from "../components/AllCourseCard"; // ✅ import updated card

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

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    const fetchCourses = async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching courses:", error.message);
        return;
      }

      setCourses(data as Course[]);
    };

    fetchCourses();
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-4xl font-bold mb-8 text-center text-rose-600">
        Our Courses
      </h1>

      <div className="flex flex-wrap justify-center gap-8">
        {courses.map((course) => (
          <Link key={course.id} href={`/courses/${course.id}`}>
            <Card
              title={course.title}
              description={course.description}
              price={`₹${course.price?.toLocaleString()}`}
              thumbnail={course.thumbnail_url}  // ✅ pass thumbnail here
            />
          </Link>
        ))}
      </div>
    </div>
  );
}
