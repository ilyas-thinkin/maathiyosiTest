'use client';

import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { v4 as uuidv4 } from 'uuid';
import { CourseFormData, LessonInput } from './course-form.types';

export default function UploadCourseForm() {
  const supabase = createClientComponentClient();

  const [form, setForm] = useState<CourseFormData>({
    title: '',
    description: '',
    category: '',
    price: '', // ✅ added price
    thumbnail: null,
    lessons: [{ title: '', videoFile: null }]
  });

  const handleLessonChange = (index: number, field: keyof LessonInput, value: any) => {
    const updated = [...form.lessons];
    updated[index][field] = value;
    setForm({ ...form, lessons: updated });
  };

  const uploadVideo = async (file: File) => {
    const fileName = `${uuidv4()}-${file.name}`;
    const { data, error } = await supabase.storage.from('course-videos').upload(fileName, file);
    if (error) throw error;
    return data.path;
  };

  const uploadThumbnail = async (file: File) => {
    const fileName = `thumb-${uuidv4()}-${file.name}`;
    const { data, error } = await supabase.storage.from('course-videos').upload(fileName, file);
    if (error) throw error;
    return data.path;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // ✅ Upload thumbnail if provided
      const thumbPath = form.thumbnail ? await uploadThumbnail(form.thumbnail) : null;

      // ✅ Insert course WITH PRICE
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .insert({
          title: form.title,
          description: form.description,
          category: form.category,
          price: Number(form.price), // ✅ Save as number
          thumbnail_url: thumbPath
        })
        .select()
        .single();

      if (courseError) throw courseError;

      // ✅ Upload lessons
      for (const lesson of form.lessons) {
        if (!lesson.videoFile) continue;
        const videoPath = await uploadVideo(lesson.videoFile);

        const { error: lessonError } = await supabase.from('course_lessons').insert({
          course_id: courseData.id,
          title: lesson.title,
          video_url: videoPath
        });

        if (lessonError) throw lessonError;
      }

      alert('✅ Course uploaded successfully!');
      setForm({
        title: '',
        description: '',
        category: '',
        price: '',
        thumbnail: null,
        lessons: [{ title: '', videoFile: null }]
      });
    } catch (err: any) {
      console.error('Upload error:', err);
      alert('❌ Upload failed.');
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 p-8 bg-white max-w-2xl mx-auto shadow-xl rounded-xl mt-10"
    >
      <h1 className="text-3xl font-bold text-red-600 mb-6 text-center">Upload New Course</h1>

      {/* ✅ Title */}
      <div>
        <label className="block text-gray-700 font-medium mb-1">Course Title</label>
        <input
          required
          type="text"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-red-400 focus:outline-none"
        />
      </div>

      {/* ✅ Description */}
      <div>
        <label className="block text-gray-700 font-medium mb-1">Description</label>
        <textarea
          required
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          rows={4}
          className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-red-400 focus:outline-none"
        />
      </div>

      {/* ✅ Category */}
      <div>
        <label className="block text-gray-700 font-medium mb-1">Category</label>
        <input
          required
          type="text"
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
          className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-red-400 focus:outline-none"
        />
      </div>

      {/* ✅ Price */}
      <div>
        <label className="block text-gray-700 font-medium mb-1">Price (₹)</label>
        <input
          required
          type="number"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
          className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-red-400 focus:outline-none"
        />
      </div>

      {/* ✅ Thumbnail */}
      <div>
        <label className="block text-gray-700 font-medium mb-1">Thumbnail Image</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) =>
            setForm({ ...form, thumbnail: e.target.files?.[0] || null })
          }
          className="block w-full"
        />
      </div>

      {/* ✅ Lessons Section */}
      <div className="pt-4">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Lessons</h2>

        {form.lessons.map((lesson, index) => (
          <div
            key={index}
            className="border rounded-lg p-4 mb-4 bg-gray-50 shadow-sm"
          >
            <label className="block text-gray-700 font-medium mb-1">Lesson Title</label>
            <input
              required
              type="text"
              value={lesson.title}
              onChange={(e) =>
                handleLessonChange(index, 'title', e.target.value)
              }
              className="w-full border border-gray-300 rounded-md px-3 py-2 mb-2 focus:ring-2 focus:ring-red-300 focus:outline-none"
            />

            <label className="block text-gray-700 font-medium mb-1">Lesson Video</label>
            <input
              type="file"
              accept="video/*"
              onChange={(e) =>
                handleLessonChange(index, 'videoFile', e.target.files?.[0] || null)
              }
              className="block w-full"
            />
          </div>
        ))}

        <button
          type="button"
          onClick={() =>
            setForm({
              ...form,
              lessons: [...form.lessons, { title: '', videoFile: null }]
            })
          }
          className="text-red-500 font-medium hover:underline transition"
        >
          + Add Another Lesson
        </button>
      </div>

      {/* ✅ Submit Button */}
      <button
        type="submit"
        className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-6 rounded-md transition duration-200"
      >
        Upload Course
      </button>
    </form>
  );
}
    