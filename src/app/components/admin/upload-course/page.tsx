"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";
import { v4 as uuidv4 } from "uuid";
import { useRouter } from "next/navigation";

type Lesson = {
  title: string;
  videoFile: File | null;
  description?: string;
  duration?: string;
};

const UploadCourse = () => {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState(""); // ✅ Added price state
  const [topics, setTopics] = useState("");
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([{ title: "", videoFile: null }]);
  const [loading, setLoading] = useState(false);

  const addLesson = () => {
    setLessons([...lessons, { title: "", videoFile: null }]);
  };

  const updateLesson = (index: number, field: keyof Lesson, value: any) => {
    const updated = [...lessons];
    updated[index][field] = value;
    setLessons(updated);
  };

  // Prevent navigation during upload
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (loading) {
        e.preventDefault();
        e.returnValue = "Uploading in progress. Are you sure you want to leave?";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [loading]);

  const handleUpload = async () => {
  if (
    !title ||
    !description ||
    !topics ||
    !category ||
    !price ||
    !thumbnailFile ||
    lessons.some((l) => !l.title || !l.videoFile)
  ) {
    alert("Please fill all fields including category, price and lessons.");
    return;
  }

  setLoading(true);
  const courseId = uuidv4();
  const timestamp = new Date().toISOString();

  try {
    // Upload thumbnail
    const thumbPath = `thumbnails/${courseId}-${thumbnailFile.name}`;
    const { error: thumbError } = await supabase.storage
      .from("course-videos")
      .upload(thumbPath, thumbnailFile, {
        cacheControl: "3600",
        upsert: false,
      });

    if (thumbError) throw new Error("Thumbnail upload failed: " + thumbError.message);

    const { data: thumbUrlData } = supabase.storage
      .from("course-videos")
      .getPublicUrl(thumbPath);
    const thumbnailUrl = thumbUrlData.publicUrl;

    // Insert course
    const { error: courseError } = await supabase.from("courses").insert([
      {
        id: courseId,
        created_at: timestamp,
        title,
        description,
        category,
        topics: topics.split(",").map((t) => t.trim()),
        thumbnail_url: thumbnailUrl,
        price: Number(price),
      },
    ]);

    if (courseError) throw new Error("Course insert failed: " + courseError.message);

    // Upload lessons
    for (const [i, lesson] of lessons.entries()) {
      const videoPath = `videos/${courseId}/lesson-${i + 1}-${uuidv4()}-${lesson.videoFile?.name}`;

      const { error: videoError } = await supabase.storage
        .from("course-videos")
        .upload(videoPath, lesson.videoFile!, {
          upsert: false,
        });

      if (videoError) throw new Error(`Lesson ${i + 1} video upload failed: ${videoError.message}`);

      // ✅ Store only the file path, not signed URL
      const { error: lessonError } = await supabase.from("course_lessons").insert([
        {
          course_id: courseId,
          title: lesson.title,
          video_url: videoPath, // ✅ just the path
          description: lesson.description || "",
          duration: lesson.duration || "",
        },
      ]);

      if (lessonError) throw new Error(`Lesson ${i + 1} DB insert failed: ${lessonError.message}`);
    }

    alert("✅ Course uploaded successfully!");
    router.push("/admin/dashboard");
  } catch (err: any) {
    console.error(err);
    alert("❌ Upload failed: " + err.message);
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6 relative">
      {loading && (
        <div className="fixed top-0 left-0 right-0 bottom-0 bg-black/30 flex items-center justify-center z-50">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent"></div>
        </div>
      )}

      <h1 className="text-2xl font-bold text-center">Upload New Course</h1>

      <input
        type="text"
        placeholder="Course Title"
        className="w-full border p-2 rounded"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <textarea
        placeholder="Course Description"
        className="w-full border p-2 rounded"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <input
        type="text"
        placeholder="Category (e.g. Programming, Math)"
        className="w-full border p-2 rounded"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
      />

      {/* ✅ Added price input field */}
      <input
        type="number"
        placeholder="Price (₹)"
        className="w-full border p-2 rounded"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
      />

      <input
        type="text"
        placeholder="Topics (comma separated)"
        className="w-full border p-2 rounded"
        value={topics}
        onChange={(e) => setTopics(e.target.value)}
      />

      <label className="block text-sm font-medium mt-4">Thumbnail Image</label>
      <input
        type="file"
        accept="image/*"
        className="w-full"
        onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)}
      />

      <hr />

      <h2 className="text-xl font-semibold">Lessons</h2>

      {lessons.map((lesson, idx) => (
        <div
          key={idx}
          className="border p-4 mb-4 rounded bg-gray-50 space-y-2"
        >
          <input
            type="text"
            placeholder={`Lesson ${idx + 1} Title`}
            className="w-full border p-2 rounded"
            value={lesson.title}
            onChange={(e) => updateLesson(idx, "title", e.target.value)}
          />
          <label className="block text-sm">Video File</label>
          <input
            type="file"
            accept="video/*"
            className="w-full"
            onChange={(e) =>
              updateLesson(idx, "videoFile", e.target.files?.[0] || null)
            }
          />
          <input
            type="text"
            placeholder="Description (optional)"
            className="w-full border p-2 rounded"
            onChange={(e) =>
              updateLesson(idx, "description", e.target.value)
            }
          />
          <input
            type="text"
            placeholder="Duration (e.g. 5min)"
            className="w-full border p-2 rounded"
            onChange={(e) => updateLesson(idx, "duration", e.target.value)}
          />
        </div>
      ))}

      <button
        onClick={addLesson}
        className="bg-gray-200 py-1 px-4 rounded hover:bg-gray-300"
      >
        + Add Lesson
      </button>

      <button
        onClick={handleUpload}
        className="bg-blue-600 text-white py-2 px-6 rounded hover:bg-blue-700 block w-full"
        disabled={loading}
      >
        Upload Course
      </button>
    </div>
  );
};

export default UploadCourse;