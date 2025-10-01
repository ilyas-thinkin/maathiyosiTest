'use client';

import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useRouter } from 'next/navigation';
import MuxUploader from '@mux/mux-uploader-react';
import { supabase } from '../../components/lib/supabaseClient';

type LessonForm = {
  id: string;
  title: string;
  description: string;
  muxVideoId?: string;
  documentFile?: File;
  videoProgress?: number;
  docProgress?: number;
};

export default function CourseUploader() {
  const router = useRouter();
  const [courseTitle, setCourseTitle] = useState('');
  const [courseDescription, setCourseDescription] = useState('');
  const [courseCategory, setCourseCategory] = useState('');
  const [coursePrice, setCoursePrice] = useState<number>(0);
  const [courseThumbnail, setCourseThumbnail] = useState<File | null>(null);
  const [lessons, setLessons] = useState<LessonForm[]>([]);
  const [uploading, setUploading] = useState(false);

  const addLesson = () => {
    setLessons((prev) => [
      ...prev,
      { id: uuidv4(), title: '', description: '', videoProgress: 0, docProgress: 0 },
    ]);
  };

  const removeLesson = (id: string) => {
    setLessons((prev) => prev.filter((l) => l.id !== id));
  };

  const handleLessonChange = (id: string, field: keyof LessonForm, value: string | File | number) => {
    setLessons((prev) => prev.map((l) => (l.id === id ? { ...l, [field]: value } : l)));
  };

  const uploadThumbnail = async () => {
    if (!courseThumbnail) return null;
    const fileName = `${uuidv4()}-${courseThumbnail.name}`;
    const { data, error } = await supabase.storage
      .from('course_thumbnails')
      .upload(fileName, courseThumbnail);

    if (error) throw error;

    const { data: publicData } = supabase.storage
      .from('course_thumbnails')
      .getPublicUrl(fileName);

    return publicData.publicUrl;
  };

  const handleSubmit = async () => {
    if (!courseTitle || lessons.length === 0) return alert('Add course title and at least 1 lesson');
    setUploading(true);

    try {
      const thumbnailUrl = await uploadThumbnail();

      // Insert course
      const { data: courseData, error: courseError } = await supabase
        .from('courses_mux')
        .insert({
          title: courseTitle,
          description: courseDescription,
          category: courseCategory,
          price: coursePrice,
          thumbnail_url: thumbnailUrl,
        })
        .select()
        .single();

      if (courseError) throw courseError;
      const courseId = courseData.id;

      // Upload lessons
      for (const lesson of lessons) {
        let documentUrl: string | null = null;

        if (lesson.documentFile) {
          const docName = `${uuidv4()}-${lesson.documentFile.name}`;
          const { error: docError } = await supabase.storage
            .from('lesson_documents')
            .upload(docName, lesson.documentFile);

          if (docError) throw docError;
          documentUrl = supabase.storage.from('lesson_documents').getPublicUrl(docName).data.publicUrl;
        }

        await supabase.from('course_lessons_mux').insert({
          course_id: courseId,
          title: lesson.title,
          description: lesson.description,
          mux_video_id: lesson.muxVideoId,
          document_url: documentUrl,
        });
      }

      alert('✅ Course uploaded successfully');
      setCourseTitle('');
      setCourseDescription('');
      setCourseCategory('');
      setCoursePrice(0);
      setCourseThumbnail(null);
      setLessons([]);
      router.push('/courses');
    } catch (err: any) {
      console.error('Upload error:', err);
      alert('❌ Upload failed, check console');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg space-y-6">
      <h1 className="text-2xl font-bold text-primary">Upload Course</h1>

      {/* Course Info */}
      <div className="space-y-2">
        <input
          type="text"
          placeholder="Course Title"
          className="border p-2 w-full rounded"
          value={courseTitle}
          onChange={(e) => setCourseTitle(e.target.value)}
        />
        <textarea
          placeholder="Course Description"
          className="border p-2 w-full rounded"
          value={courseDescription}
          onChange={(e) => setCourseDescription(e.target.value)}
        />
        <input
          type="text"
          placeholder="Category"
          className="border p-2 w-full rounded"
          value={courseCategory}
          onChange={(e) => setCourseCategory(e.target.value)}
        />
        <input
          type="number"
          placeholder="Price"
          className="border p-2 w-full rounded"
          value={coursePrice}
          onChange={(e) => setCoursePrice(Number(e.target.value))}
        />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => e.target.files && setCourseThumbnail(e.target.files[0])}
        />
      </div>

      {/* Lessons */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Lessons</h2>
        {lessons.map((lesson) => (
          <div key={lesson.id} className="border p-4 rounded space-y-2">
            <input
              placeholder="Lesson Title"
              className="border p-2 w-full rounded"
              value={lesson.title}
              onChange={(e) => handleLessonChange(lesson.id, 'title', e.target.value)}
            />
            <textarea
              placeholder="Lesson Description"
              className="border p-2 w-full rounded"
              value={lesson.description}
              onChange={(e) => handleLessonChange(lesson.id, 'description', e.target.value)}
            />

            {/* MuxUploader for video */}
            <MuxUploader
              endpoint="/api/mux/create-upload"
              onProgress={(p) =>
                handleLessonChange(lesson.id, 'videoProgress', Number(p) * 100)
              }
              onUploadError={(err) => console.error('Mux upload error:', err)}
              onSuccess={(event: any) =>
                handleLessonChange(lesson.id, 'muxVideoId', event.detail.uploadId)
              }
            />

            {lesson.videoProgress !== undefined && (
              <div className="w-full bg-gray-200 h-2 rounded">
                <div
                  className="bg-blue-500 h-2 rounded"
                  style={{ width: `${lesson.videoProgress}%` }}
                ></div>
              </div>
            )}

            <input
              type="file"
              accept=".pdf,.png,.jpg,.jpeg,.zip,.py,.js,.txt"
              onChange={(e) =>
                e.target.files && handleLessonChange(lesson.id, 'documentFile', e.target.files[0])
              }
            />
            {lesson.docProgress !== undefined && (
              <div className="w-full bg-gray-200 h-2 rounded">
                <div
                  className="bg-green-500 h-2 rounded"
                  style={{ width: `${lesson.docProgress}%` }}
                ></div>
              </div>
            )}

            <button
              className="bg-red-500 text-white px-4 py-2 rounded"
              onClick={() => removeLesson(lesson.id)}
            >
              Remove Lesson
            </button>
          </div>
        ))}
        <button
          className="bg-blue-500 text-white px-6 py-2 rounded"
          onClick={addLesson}
        >
          Add Lesson
        </button>
      </div>

      <button
        className="bg-green-500 text-white px-6 py-2 rounded mt-4"
        onClick={handleSubmit}
        disabled={uploading}
      >
        {uploading ? 'Uploading...' : 'Upload Course'}
      </button>
    </div>
  );
}
