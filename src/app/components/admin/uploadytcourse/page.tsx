"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useRouter } from "next/navigation";
import { LessonInputYT, CourseFormDataYT } from "./courseyt-form.types";
import { FiPlus, FiTrash } from "react-icons/fi";

export default function UploadCourseYouTube() {
  const router = useRouter();
  const [courseData, setCourseData] = useState<CourseFormDataYT>({
    title: "",
    description: "",
    category: "",
    price: "",
    thumbnail: null,
    lessons: [{ title: "", youtubeUrl: "", description: "", document: null }],
  });

  const [loading, setLoading] = useState(false);

  // Handle course field changes
  const handleCourseChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCourseData({ ...courseData, [name]: value });
  };

  // Handle thumbnail change
  const handleThumbnailChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setCourseData({ ...courseData, thumbnail: e.target.files[0] });
    }
  };

  // Handle lesson field changes
  const handleLessonChange = (index: number, field: keyof LessonInputYT, value: any) => {
    const updatedLessons = [...courseData.lessons];
    (updatedLessons[index][field] as any) = value;
    setCourseData({ ...courseData, lessons: updatedLessons });
  };

  // Add new lesson
  const addLesson = () => {
    setCourseData({
      ...courseData,
      lessons: [
        ...courseData.lessons,
        { title: "", youtubeUrl: "", description: "", document: null },
      ],
    });
  };

  // Remove lesson
  const removeLesson = (index: number) => {
    const updatedLessons = courseData.lessons.filter((_, i) => i !== index);
    setCourseData({ ...courseData, lessons: updatedLessons });
  };

  // Handle form submit
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // ✅ Get logged-in user
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        alert("You must be logged in to upload a course.");
        return;
      }

      // ✅ Upload thumbnail to Supabase storage
      let thumbnailUrl = null;
      if (courseData.thumbnail) {
        const { data: thumbData, error: thumbError } = await supabase.storage
          .from("course-thumbnails-yt")
          .upload(
            `courses_yt/${Date.now()}_${courseData.thumbnail.name}`,
            courseData.thumbnail
          );

        if (thumbError) throw thumbError;

        const { data: publicUrlData } = supabase.storage
          .from("course-thumbnails-yt")
          .getPublicUrl(thumbData.path);
        thumbnailUrl = publicUrlData.publicUrl;
      }

      // ✅ Insert course into `courses_yt`
      const { data: courseInsert, error: courseError } = await supabase
        .from("courses_yt")
        .insert([
          {
            title: courseData.title,
            description: courseData.description,
            category: courseData.category,
            price: courseData.price,
            thumbnail_url: thumbnailUrl,
            user_id: user.id,
          },
        ])
        .select()
        .single();

      if (courseError) throw courseError;

      const courseId = courseInsert.id;

      // ✅ Upload lesson documents (if any) and insert lessons
      const lessonsPayload = [];
      for (const lesson of courseData.lessons) {
        let documentUrl = null;
        if (lesson.document) {
          const { data: docData, error: docError } = await supabase.storage
            .from("lesson-documents-yt")
            .upload(
              `course_${courseId}/${Date.now()}_${lesson.document.name}`,
              lesson.document
            );

          if (docError) throw docError;

          const { data: docUrlData } = supabase.storage
            .from("lesson-documents-yt")
            .getPublicUrl(docData.path);
          documentUrl = docUrlData.publicUrl;
        }

        lessonsPayload.push({
          course_id: courseId,
          title: lesson.title,
          youtube_url: lesson.youtubeUrl,
          description: lesson.description || null,
          document_url: documentUrl,
        });
      }

      const { error: lessonsError } = await supabase
        .from("course_lessons_yt")
        .insert(lessonsPayload);

      if (lessonsError) throw lessonsError;

      alert("YouTube course uploaded successfully!");
      router.push("/admin-courses");
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Upload YouTube Course</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="title"
          placeholder="Course Title"
          value={courseData.title}
          onChange={handleCourseChange}
          className="w-full p-2 border rounded"
          required
        />
        <textarea
          name="description"
          placeholder="Course Description"
          value={courseData.description}
          onChange={handleCourseChange}
          className="w-full p-2 border rounded"
        />
        <input
          type="text"
          name="category"
          placeholder="Category"
          value={courseData.category}
          onChange={handleCourseChange}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="text"
          name="price"
          placeholder="Price (in INR)"
          value={courseData.price}
          onChange={handleCourseChange}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="file"
          onChange={handleThumbnailChange}
          className="w-full"
          accept="image/*"
        />

        <div>
          <h2 className="text-lg font-semibold mb-2">Lessons</h2>
          {courseData.lessons.map((lesson, index) => (
            <div key={index} className="space-y-2 mb-4 border p-3 rounded">
              <input
                type="text"
                placeholder="Lesson Title"
                value={lesson.title}
                onChange={(e) =>
                  handleLessonChange(index, "title", e.target.value)
                }
                className="w-full p-2 border rounded"
                required
              />
              <input
                type="text"
                placeholder="YouTube URL"
                value={lesson.youtubeUrl}
                onChange={(e) =>
                  handleLessonChange(index, "youtubeUrl", e.target.value)
                }
                className="w-full p-2 border rounded"
                required
              />
              <textarea
                placeholder="Lesson Description (optional)"
                value={lesson.description || ""}
                onChange={(e) =>
                  handleLessonChange(index, "description", e.target.value)
                }
                className="w-full p-2 border rounded"
              />
              <input
                type="file"
                accept=".pdf,.doc,.docx,.zip,.rar,.txt,.js,.ts,.py,.java,.cpp,.c,.png,.jpg,.jpeg,.gif,.ino"
                onChange={(e) =>
                  handleLessonChange(
                    index,
                    "document",
                    e.target.files ? e.target.files[0] : null
                  )
                }
                className="w-full"
              />
              <button
                type="button"
                onClick={() => removeLesson(index)}
                className="p-2 bg-red-500 text-white rounded"
              >
                <FiTrash />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addLesson}
            className="flex items-center gap-1 px-3 py-2 bg-green-600 text-white rounded"
          >
            <FiPlus /> Add Lesson
          </button>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {loading ? "Uploading..." : "Upload Course"}
        </button>
      </form>
    </div>
  );
}
