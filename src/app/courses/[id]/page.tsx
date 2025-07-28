// app/courses/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "../../components/lib/supabaseClient"; // Adjust the import path as needed

const CourseDetail = () => {
  const { id } = useParams();
  const [course, setCourse] = useState<any>(null);
  const [lessons, setLessons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourseAndLessons = async () => {
      if (!id) return;
      setLoading(true);

      const { data: courseData, error: courseError } = await supabase
        .from("courses")
        .select("*")
        .eq("id", id)
        .single();

      const { data: lessonData, error: lessonError } = await supabase
        .from("course_lessons")
        .select("*")
        .eq("course_id", id);

      if (courseError || lessonError) {
        console.error("Error loading course or lessons", courseError || lessonError);
      } else {
        setCourse(courseData);
        setLessons(lessonData);
      }

      setLoading(false);
    };

    fetchCourseAndLessons();
  }, [id]);

  if (loading) return <p className="text-center py-10">Loading...</p>;
  if (!course) return <p className="text-center py-10">Course not found</p>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">{course.title}</h1>
      <p className="text-gray-600 mb-6">{course.description}</p>

      {lessons.length === 0 ? (
        <p>No lessons available.</p>
      ) : (
        <div className="space-y-6">
          {lessons.map((lesson, index) => (
            <div key={lesson.id} className="border rounded-lg p-4 bg-white shadow">
              <h2 className="text-xl font-semibold mb-2">
                Lesson {index + 1}: {lesson.title}
              </h2>
              <p className="text-gray-700 mb-2">
                {lesson.description || "No description available."}
              </p>
              <p className="text-sm text-gray-500 mb-3">Duration: {lesson.duration || "N/A"}</p>
              <video
                src={lesson.video_url}
                controls
                className="w-full rounded"
                controlsList="nodownload"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CourseDetail;
