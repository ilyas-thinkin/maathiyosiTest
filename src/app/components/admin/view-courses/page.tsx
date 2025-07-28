"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

type Course = {
  id: string;
  title: string;
  description: string;
  category: string;
  thumbnail_url: string;
  topics: string[];
  created_at: string;
};

type Lesson = {
  id: string;
  course_id: string;
  title: string;
  video_url: string;
  description?: string;
  duration?: string;
};

const ViewCourses = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [expandedCourseId, setExpandedCourseId] = useState<string | null>(null);
  const [lessonsMap, setLessonsMap] = useState<Record<string, Lesson[]>>({});
  const [loadingLessons, setLoadingLessons] = useState<string | null>(null);

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

  const toggleLessons = async (courseId: string) => {
    if (expandedCourseId === courseId) {
      setExpandedCourseId(null);
      return;
    }

    setExpandedCourseId(courseId);

    if (!lessonsMap[courseId]) {
      setLoadingLessons(courseId);
      const { data, error } = await supabase
        .from("course_lessons")
        .select("*")
        .eq("course_id", courseId);

      setLoadingLessons(null);

      if (error) {
        console.error("Error fetching lessons:", error.message);
        return;
      }

      setLessonsMap((prev) => ({ ...prev, [courseId]: data as Lesson[] }));
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 text-center">Uploaded Courses</h1>

      {courses.map((course) => (
        <div
          key={course.id}
          className="border rounded-lg shadow p-4 mb-6 bg-white"
        >
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <img
              src={course.thumbnail_url}
              alt={course.title}
              className="w-full sm:w-40 h-28 object-cover rounded"
            />
            <div className="flex-1">
              <h2 className="text-lg font-semibold">{course.title}</h2>
              <p className="text-sm text-gray-500">{course.category}</p>
              <p className="text-sm mt-1">{course.description}</p>
              <p className="text-sm mt-1 text-gray-600">
                <strong>Topics:</strong> {course.topics?.join(", ")}
              </p>
              <button
                onClick={() => toggleLessons(course.id)}
                className="mt-3 text-blue-600 underline text-sm"
              >
                {expandedCourseId === course.id
                  ? "Hide Lessons"
                  : "View Lessons"}
              </button>
            </div>
          </div>

          {expandedCourseId === course.id && (
            <div className="mt-4 border-t pt-4">
              {loadingLessons === course.id ? (
                <p>Loading lessons...</p>
              ) : (
                <>
                  {lessonsMap[course.id]?.length > 0 ? (
                    lessonsMap[course.id].map((lesson, idx) => (
                      <div
                        key={lesson.id}
                        className="mb-3 border p-3 rounded bg-gray-50"
                      >
                        <h3 className="font-medium">
                          Lesson {idx + 1}: {lesson.title}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {lesson.description || "No description"}
                        </p>
                        <p className="text-sm text-gray-500 mb-1">
                          Duration: {lesson.duration || "N/A"}
                        </p>
                        <video
                          src={lesson.video_url}
                          controls
                          controlsList="nodownload"
                          className="w-full rounded mt-2"
                          onContextMenu={(e) => e.preventDefault()}
                        >
                          Your browser does not support the video tag.
                        </video>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No lessons found.</p>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ViewCourses;
