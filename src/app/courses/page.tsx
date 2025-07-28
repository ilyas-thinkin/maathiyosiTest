// app/courses/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../components/lib/supabaseClient"; // Adjust the import path as needed
import Card from "../components/Card"; // adjust path if needed

const ViewCourses = () => {
  const [courses, setCourses] = useState<any[]>([]);

  useEffect(() => {
    const fetchCourses = async () => {
      const { data, error } = await supabase.from("courses").select("*");
      if (error) {
        console.error("Error fetching courses:", error.message);
      } else {
        setCourses(data);
      }
    };

    fetchCourses();
  }, []);

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">All Courses</h1>
      <div className="flex flex-wrap gap-6 justify-center">
        {courses.map((course) => (
          <Link key={course.id} href={`/courses/${course.id}`}>
            <div className="group cursor-pointer">
              <Card
                title={course.title}
                description={course.description}
                price="FREE"
                badge="Start"
                imageBg="#fcd34d"
              />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ViewCourses;
