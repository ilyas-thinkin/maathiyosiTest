"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/app/components/lib/supabaseClient";

export default function EditCoursePage() {
  const { id } = useParams();
  const router = useRouter();

  const [course, setCourse] = useState<any>(null);
  const [lessons, setLessons] = useState<any[]>([]);
  const [newLessons, setNewLessons] = useState<any[]>([]);

  useEffect(() => {
    fetchCourse();
  }, []);

  const fetchCourse = async () => {
    const { data: courseData } = await supabase
      .from("courses")
      .select("*")
      .eq("id", id)
      .single();

    const { data: lessonData } = await supabase
      .from("course_lessons")
      .select("*")
      .eq("course_id", id);

    setCourse(courseData);
    setLessons(lessonData ?? []);
  };

  const handleLessonUpdate = async (lesson: any, index: number) => {
    let video_url = lesson.video_url;

    if (lesson.newVideoFile) {
      // Upload new video
      const path = `lesson-${lesson.id}-${Date.now()}`;
      const { error: uploadError } = await supabase.storage
        .from("course-videos")
        .upload(path, lesson.newVideoFile);

      if (uploadError) {
        alert("Upload failed: " + uploadError.message);
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from("course-videos")
        .getPublicUrl(path);
      video_url = publicUrlData.publicUrl;

      // Delete old video
      if (lesson.video_url) {
        const videoPath = lesson.video_url.split("/").pop();
        await supabase.storage.from("course-videos").remove([videoPath]);
      }
    }

    const { error } = await supabase
      .from("course_lessons")
      .update({
        title: lesson.title,
        description: lesson.description,
        duration: lesson.duration,
        video_url,
      })
      .eq("id", lesson.id);

    if (error) {
      alert("Failed to update lesson: " + error.message);
    } else {
      alert("Lesson updated!");
      fetchCourse();
    }
  };

  const handleLessonDelete = async (lessonId: string) => {
    const confirmDelete = confirm("Are you sure you want to delete this lesson?");
    if (!confirmDelete) return;

    const lesson = lessons.find((l) => l.id === lessonId);
    if (!lesson) return;

    if (lesson.video_url) {
      const videoPath = lesson.video_url.split("/").pop();
      await supabase.storage.from("course-videos").remove([videoPath]);
    }

    const { error } = await supabase
      .from("course_lessons")
      .delete()
      .eq("id", lessonId);

    if (error) {
      alert("Failed to delete lesson: " + error.message);
    } else {
      setLessons((prev) => prev.filter((l) => l.id !== lessonId));
      alert("Lesson deleted successfully.");
    }
  };

  const handleAddNewLesson = async (lesson: any, file: File) => {
    if (!file) return alert("Video is required");

    const path = `lesson-${Date.now()}`;
    const { error: uploadError } = await supabase.storage
      .from("course-videos")
      .upload(path, file);

    if (uploadError) return alert("Upload error: " + uploadError.message);

    const { data: publicUrlData } = supabase.storage
      .from("course-videos")
      .getPublicUrl(path);

    const video_url = publicUrlData.publicUrl;

    const { error: insertError } = await supabase.from("course_lessons").insert([
      {
        course_id: id,
        title: lesson.title,
        description: lesson.description,
        duration: lesson.duration,
        video_url,
      },
    ]);

    if (insertError) {
      alert("Failed to add new lesson: " + insertError.message);
    } else {
      alert("Lesson added!");
      fetchCourse();
    }
  };

  const handleSaveAllChanges = async () => {
    for (const lesson of lessons) {
      const { error } = await supabase
        .from("course_lessons")
        .update({
          title: lesson.title,
          description: lesson.description,
          duration: lesson.duration,
        })
        .eq("id", lesson.id);

      if (error) {
        alert(`Failed to update lesson: ${lesson.title}`);
        return;
      }
    }

    alert("Changes saved!");
    router.push("/admin-courses");
  };

  if (!course) return <p>Loading course...</p>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4 text-rose-600">
        Editing: {course.title}
      </h1>

      <h2 className="text-xl font-semibold mb-3">Existing Lessons</h2>
      {lessons.map((lesson, index) => (
        <div key={lesson.id} className="border p-4 rounded mb-6">
          <input
            type="text"
            value={lesson.title}
            onChange={(e) =>
              setLessons((prev) =>
                prev.map((l) =>
                  l.id === lesson.id ? { ...l, title: e.target.value } : l
                )
              )
            }
            className="border p-2 w-full mb-2"
            placeholder="Title"
          />
          <input
            type="text"
            value={lesson.description}
            onChange={(e) =>
              setLessons((prev) =>
                prev.map((l) =>
                  l.id === lesson.id
                    ? { ...l, description: e.target.value }
                    : l
                )
              )
            }
            className="border p-2 w-full mb-2"
            placeholder="Description"
          />
          <input
            type="text"
            value={lesson.duration}
            onChange={(e) =>
              setLessons((prev) =>
                prev.map((l) =>
                  l.id === lesson.id
                    ? { ...l, duration: e.target.value }
                    : l
                )
              )
            }
            className="border p-2 w-full mb-2"
            placeholder="Duration"
          />

          {lesson.video_url && (
            <video
              controls
              src={lesson.video_url}
              className="w-full h-48 mb-2 rounded"
            />
          )}

          <input
            type="file"
            accept="video/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                setLessons((prev) =>
                  prev.map((l) =>
                    l.id === lesson.id ? { ...l, newVideoFile: file } : l
                  )
                );
              }
            }}
            className="mb-2"
          />

          <div className="flex gap-4 mt-2">
            <button
              onClick={() => handleLessonUpdate(lesson, index)}
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              Update
            </button>
            <button
              onClick={() => handleLessonDelete(lesson.id)}
              className="bg-red-500 text-white px-4 py-2 rounded"
            >
              Delete
            </button>
          </div>
        </div>
      ))}

      {/* Add New Lesson */}
      <h2 className="text-xl font-semibold mb-3 mt-10">Add New Lesson</h2>
      {newLessons.map((lesson, idx) => (
        <div key={idx} className="border p-4 rounded mb-6">
          <input
            type="text"
            placeholder="Title"
            className="border p-2 w-full mb-2"
            onChange={(e) =>
              setNewLessons((prev) =>
                prev.map((l, i) => (i === idx ? { ...l, title: e.target.value } : l))
              )
            }
          />
          <input
            type="text"
            placeholder="Description"
            className="border p-2 w-full mb-2"
            onChange={(e) =>
              setNewLessons((prev) =>
                prev.map((l, i) =>
                  i === idx ? { ...l, description: e.target.value } : l
                )
              )
            }
          />
          <input
            type="text"
            placeholder="Duration"
            className="border p-2 w-full mb-2"
            onChange={(e) =>
              setNewLessons((prev) =>
                prev.map((l, i) =>
                  i === idx ? { ...l, duration: e.target.value } : l
                )
              )
            }
          />
          <input
            type="file"
            accept="video/*"
            onChange={(e) =>
              setNewLessons((prev) =>
                prev.map((l, i) =>
                  i === idx ? { ...l, file: e.target.files?.[0] } : l
                )
              )
            }
          />
          <button
            onClick={() => handleAddNewLesson(newLessons[idx], newLessons[idx].file)}
            className="bg-green-600 text-white px-4 py-2 rounded mt-2"
          >
            Upload
          </button>
        </div>
      ))}

      <button
        onClick={() => setNewLessons([...newLessons, {}])}
        className="bg-rose-600 text-white px-4 py-2 rounded mt-4"
      >
        + Add Lesson
      </button>

      <button
        onClick={handleSaveAllChanges}
        className="mx-10 bg-purple-700 text-white px-6 py-3 mt-6 rounded"
      >
        ✅ Save All Changes & Return
      </button>
    </div>
  );
}
