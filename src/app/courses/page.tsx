"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../components/lib/supabaseClient"; // Adjust the import path as needed

type Course = {
  id: string;
  title: string;
  description: string;
  category: string;
  thumbnail_url: string;
  topics: string[];
  created_at: string;
  price: number; // ✅ added price field
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
      <h1 className="text-3xl font-bold mb-6 text-center">📚 All Courses</h1>

      {/* ✅ Grid for cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <div
            key={course.id}
            className="border rounded-xl shadow hover:shadow-lg transition bg-white"
          >
            <img
              src={course.thumbnail_url}
              alt={course.title}
              className="w-full h-40 object-cover rounded-t-xl"
            />
            <div className="p-4">
              <h2 className="text-lg font-semibold">{course.title}</h2>
              <p className="text-sm text-gray-500">{course.category}</p>
              <p className="text-sm mt-1 line-clamp-2">{course.description}</p>

              {course.topics?.length > 0 && (
                <p className="text-xs mt-1 text-gray-600">
                  <strong>Topics:</strong> {course.topics.join(", ")}
                </p>
              )}

              {/* ✅ Display Price */}
              <p className="text-lg font-bold text-green-700 mt-3">
                ₹{course.price?.toLocaleString()}
              </p>

              <Link href={`/courses/${course.id}`}>
                <button className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                  View Course
                </button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
