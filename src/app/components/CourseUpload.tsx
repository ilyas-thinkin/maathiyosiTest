'use client';

import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { v4 as uuidv4 } from 'uuid';

type LessonForm = {
  id: string;
  title: string;
  description: string;
  videoFile?: File;
  documentFile?: File;
};

export default function CourseUpload() {
  const supabase = createClientComponentClient();

  const [courseTitle, setCourseTitle] = useState('');
  const [courseDescription, setCourseDescription] = useState('');
  const [courseCategory, setCourseCategory] = useState('');
  const [coursePrice, setCoursePrice] = useState<number>(0);
  const [lessons, setLessons] = useState<LessonForm[]>([]);

  const addLesson = () => {
    setLessons([...lessons, { id: uuidv4(), title: '', description: '' }]);
  };

  const removeLesson = (id: string) => {
    setLessons(lessons.filter((l) => l.id !== id));
  };

  const handleLessonChange = (
    id: string,
    field: keyof LessonForm,
    value: string | File
  ) => {
    setLessons(
      lessons.map((l) =>
        l.id === id ? { ...l, [field]: value } : l
      )
    );
  };

  const handleSubmit = async () => {
    try {
      // 1️⃣ Insert course
      const { data: courseData, error: courseError } = await supabase
        .from('course_cf')
        .insert([
          {
            title: courseTitle,
            description: courseDescription,
            category: courseCategory,
            price: coursePrice,
          },
        ])
        .select()
        .single();

      if (courseError || !courseData) throw courseError;

      const courseId = courseData.id;

      // 2️⃣ Upload lessons sequentially
      for (const lesson of lessons) {
        let videoUID: string | null = null;
        let documentURL: string | null = null;

        // Upload video to Cloudflare
        if (lesson.videoFile) {
          // 2a. Get direct upload URL from your API
          const res = await fetch('/api/cloudflare/direct-upload', {
            method: 'POST',
          });
          const data = await res.json();
          const { uploadURL, uid } = data;

          // 2b. Upload video directly to Cloudflare
          const formData = new FormData();
          formData.append('file', lesson.videoFile);

          const uploadRes = await fetch(uploadURL, {
            method: 'POST',
            body: formData,
          });

          if (!uploadRes.ok) throw new Error('Cloudflare video upload failed');
          videoUID = uid;
        }

        // Upload document to Supabase storage
        if (lesson.documentFile) {
          const fileExt = lesson.documentFile.name.split('.').pop();
          const fileName = `${uuidv4()}.${fileExt}`;

          const { error: docError } = await supabase.storage
            .from('lesson_documents')
            .upload(fileName, lesson.documentFile);

          if (docError) throw docError;

          const { data } = supabase.storage
            .from('lesson_documents')
            .getPublicUrl(fileName);

          documentURL = data.publicUrl;
        }

        // Insert lesson record
        const { error: lessonError } = await supabase.from('course_lesson_cf').insert([
          {
            course_id: courseId,
            title: lesson.title,
            description: lesson.description,
            video_uid: videoUID,
            document_url: documentURL,
          },
        ]);

        if (lessonError) throw lessonError;
      }

      alert('Course and lessons uploaded successfully!');

      // Reset form
      setCourseTitle('');
      setCourseDescription('');
      setCourseCategory('');
      setCoursePrice(0);
      setLessons([]);
    } catch (error) {
      console.error(error);
      alert('Error uploading course. Check console.');
    }
  };

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Upload Course</h1>

      {/* Course Info */}
      <div className="mb-4">
        <input
          placeholder="Course Title"
          className="border p-2 w-full mb-2"
          value={courseTitle}
          onChange={(e) => setCourseTitle(e.target.value)}
        />
        <textarea
          placeholder="Course Description"
          className="border p-2 w-full mb-2"
          value={courseDescription}
          onChange={(e) => setCourseDescription(e.target.value)}
        />
        <input
          placeholder="Category"
          className="border p-2 w-full mb-2"
          value={courseCategory}
          onChange={(e) => setCourseCategory(e.target.value)}
        />
        <input
          type="number"
          placeholder="Price"
          className="border p-2 w-full mb-2"
          value={coursePrice}
          onChange={(e) => setCoursePrice(Number(e.target.value))}
        />
      </div>

      {/* Lessons */}
      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-2">Lessons</h2>
        {lessons.map((lesson, idx) => (
          <div key={lesson.id} className="border p-2 mb-2">
            <input
              placeholder="Lesson Title"
              className="border p-2 w-full mb-1"
              value={lesson.title}
              onChange={(e) =>
                handleLessonChange(lesson.id, 'title', e.target.value)
              }
            />
            <textarea
              placeholder="Lesson Description"
              className="border p-2 w-full mb-1"
              value={lesson.description}
              onChange={(e) =>
                handleLessonChange(lesson.id, 'description', e.target.value)
              }
            />
            <input
              type="file"
              accept="video/*"
              className="mb-1"
              onChange={(e) =>
                e.target.files &&
                handleLessonChange(lesson.id, 'videoFile', e.target.files[0])
              }
            />
            <input
              type="file"
              accept=".pdf,.png,.jpg,.jpeg,.zip,.py,.js,.txt"
              className="mb-1"
              onChange={(e) =>
                e.target.files &&
                handleLessonChange(lesson.id, 'documentFile', e.target.files[0])
              }
            />
            <button
              className="bg-red-500 text-white px-2 py-1 mt-1"
              onClick={() => removeLesson(lesson.id)}
            >
              Remove Lesson
            </button>
          </div>
        ))}
        <button
          className="bg-blue-500 text-white px-4 py-2"
          onClick={addLesson}
        >
          Add Lesson
        </button>
      </div>

      {/* Submit */}
      <button
        className="bg-green-500 text-white px-6 py-2"
        onClick={handleSubmit}
      >
        Upload Course
      </button>
    </div>
  );
}
