"use client";

import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { supabase } from "../../../components/lib/supabaseClient";
import { useRouter, useParams } from "next/navigation";
import { FiPlus, FiTrash } from "react-icons/fi";

interface LessonInputYT {
  title: string;
  youtubeUrl: string;
  description?: string;
  duration?: string;
  document?: File | null;
  documentUrl?: string;
}

interface CourseFormDataYT {
  title: string;
  description: string;
  category: string;
  price: string;
  thumbnail: File | null;
  thumbnailUrl?: string;
  lessons: LessonInputYT[];
}

export default function EditCourseYouTube() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [courseData, setCourseData] = useState<CourseFormDataYT>({
    title: "",
    description: "",
    category: "",
    price: "",
    thumbnail: null,
    thumbnailUrl: "",
    lessons: [{ title: "", youtubeUrl: "", description: "", duration: "", document: null }],
  });

  const [loading, setLoading] = useState(false);

  // ✅ Fetch existing course + lessons
  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      const { data: course, error: courseError } = await supabase
        .from("courses_yt")
        .select("*")
        .eq("id", id)
        .single();

      if (courseError || !course) {
        console.error(courseError);
        return;
      }

      const { data: lessons, error: lessonsError } = await supabase
        .from("course_lessons_yt")
        .select("*")
        .eq("course_id", id);

      if (lessonsError) {
        console.error(lessonsError);
        return;
      }

      setCourseData({
        title: course.title,
        description: course.description,
        category: course.category,
        price: course.price,
        thumbnail: null,
        thumbnailUrl: course.thumbnail_url,
        lessons:
          lessons?.map((l: any) => ({
            title: l.title,
            youtubeUrl: l.youtube_url,
            description: l.description || "",
            duration: l.duration || "",
            document: null,
            documentUrl: l.document_url || "",
          })) || [],
      });
    };

    fetchData();
  }, [id]);

  // ✅ Handle course field changes
  const handleCourseChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setCourseData({ ...courseData, [name]: value });
  };

  // ✅ Handle thumbnail change
  const handleThumbnailChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setCourseData({ ...courseData, thumbnail: e.target.files[0] });
    }
  };

  // ✅ Handle lesson field changes
  const handleLessonChange = (
    index: number,
    field: keyof LessonInputYT,
    value: string | File | null
  ) => {
    const updatedLessons = [...courseData.lessons];
    (updatedLessons[index][field] as any) = value;
    setCourseData({ ...courseData, lessons: updatedLessons });
  };

  // ✅ Add new lesson
  const addLesson = () => {
    setCourseData({
      ...courseData,
      lessons: [
        ...courseData.lessons,
        { title: "", youtubeUrl: "", description: "", duration: "", document: null },
      ],
    });
  };

  // ✅ Remove lesson
  const removeLesson = (index: number) => {
    const updatedLessons = courseData.lessons.filter((_, i) => i !== index);
    setCourseData({ ...courseData, lessons: updatedLessons });
  };

  // ✅ Handle submit (update)
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // ✅ Upload new thumbnail if selected
      let thumbnailUrl = courseData.thumbnailUrl || null;
      if (courseData.thumbnail) {
        const { data: thumbData, error: thumbError } = await supabase.storage
          .from("course-thumbnails-yt")
          .upload(
            `courses_yt/${Date.now()}_${courseData.thumbnail.name}`,
            courseData.thumbnail,
            { upsert: true }
          );

        if (thumbError) throw thumbError;

        const { data: publicUrlData } = supabase.storage
          .from("course-thumbnails-yt")
          .getPublicUrl(thumbData.path);
        thumbnailUrl = publicUrlData.publicUrl;
      }

      // ✅ Update course
      const { error: courseError } = await supabase
        .from("courses_yt")
        .update({
          title: courseData.title,
          description: courseData.description,
          category: courseData.category,
          price: courseData.price,
          thumbnail_url: thumbnailUrl,
        })
        .eq("id", id);

      if (courseError) throw courseError;

      // ✅ Delete existing lessons and re-insert (simplest sync method)
      await supabase.from("course_lessons_yt").delete().eq("course_id", id);

      // ✅ Upload lesson documents (if any) and prepare payload
      const lessonsPayload = [];
      for (const lesson of courseData.lessons) {
        let docUrl = lesson.documentUrl || null;
        if (lesson.document) {
          const { data: docData, error: docError } = await supabase.storage
            .from("course-documents-yt")
            .upload(`lessons/${Date.now()}_${lesson.document.name}`, lesson.document, {
              upsert: true,
            });

          if (docError) throw docError;

          const { data: publicUrlData } = supabase.storage
            .from("course-documents-yt")
            .getPublicUrl(docData.path);
          docUrl = publicUrlData.publicUrl;
        }

        lessonsPayload.push({
          course_id: id,
          title: lesson.title,
          youtube_url: lesson.youtubeUrl,
          description: lesson.description,
          duration: lesson.duration,
          document_url: docUrl,
        });
      }

      const { error: lessonsError } = await supabase
        .from("course_lessons_yt")
        .insert(lessonsPayload);

      if (lessonsError) throw lessonsError;

      alert("YouTube course updated successfully!");
      router.push("/admin-courses");
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Edit YouTube Course</h1>
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
          required
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
        {courseData.thumbnailUrl && (
          <img
            src={courseData.thumbnailUrl}
            alt="Current thumbnail"
            className="w-40 rounded mb-2"
          />
        )}
        <input
          type="file"
          onChange={handleThumbnailChange}
          className="w-full"
          accept="image/*"
        />

        <div>
          <h2 className="text-lg font-semibold mb-2">Lessons</h2>
          {courseData.lessons.map((lesson, index) => (
            <div key={index} className="space-y-2 border p-3 rounded mb-3">
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
                value={lesson.description}
                onChange={(e) =>
                  handleLessonChange(index, "description", e.target.value)
                }
                className="w-full p-2 border rounded"
              />
              <input
                type="text"
                placeholder="Duration (e.g. 10:30)"
                value={lesson.duration}
                onChange={(e) =>
                  handleLessonChange(index, "duration", e.target.value)
                }
                className="w-full p-2 border rounded"
              />
              {lesson.documentUrl && (
                <a
                  href={lesson.documentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline"
                >
                  View Current Document
                </a>
              )}
              <input
                type="file"
                accept=".pdf,.doc,.docx,.txt,.js,.ts,.py,.java,.cpp"
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
          {loading ? "Updating..." : "Update Course"}
        </button>
      </form>
    </div>
  );
}
