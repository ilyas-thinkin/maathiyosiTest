'use client';

import { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useRouter } from 'next/navigation';

type LessonForm = {
  id: string;
  title: string;
  description: string;
  videoFile?: File;
  documentFile?: File;
  videoProgress?: number;
  docProgress?: number;
};

export default function CourseUploaderPage() {
  const router = useRouter();

  const [courseTitle, setCourseTitle] = useState('');
  const [courseDescription, setCourseDescription] = useState('');
  const [courseCategory, setCourseCategory] = useState('');
  const [coursePrice, setCoursePrice] = useState<number>(0);
  const [lessons, setLessons] = useState<LessonForm[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loggedInAdmin, setLoggedInAdmin] = useState<{ id: string; name: string } | null>(null);

  // ✅ Check for admin session from localStorage
  useEffect(() => {
    const adminId = localStorage.getItem('adminId');
    const adminName = localStorage.getItem('adminName');
    const isAdmin = localStorage.getItem('isAdmin');

    if (isAdmin === 'true' && adminId && adminName) {
      setLoggedInAdmin({ id: adminId, name: adminName });
    } else {
      setLoggedInAdmin(null);
    }
  }, []);

  const addLesson = () => {
    setLessons((prev) => [
      ...prev,
      { id: uuidv4(), title: '', description: '', videoProgress: 0, docProgress: 0 },
    ]);
  };

  const removeLesson = (id: string) => {
    setLessons((prev) => prev.filter((l) => l.id !== id));
  };

  const handleLessonChange = (id: string, field: keyof LessonForm, value: string | File) => {
    setLessons((prev) => prev.map((l) => (l.id === id ? { ...l, [field]: value } : l)));
  };

  const uploadFileWithProgress = (
    file: File,
    uploadURL: string,
    onProgress: (p: number) => void
  ) => {
    return new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', uploadURL);
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const percent = Math.round((e.loaded / e.total) * 100);
          onProgress(percent);
        }
      };
      xhr.onload = () => (xhr.status === 200 ? resolve() : reject('Upload failed'));
      xhr.onerror = () => reject('Upload error');

      const formData = new FormData();
      formData.append('file', file);
      xhr.send(formData);
    });
  };

  const createCourse = async () => {
    const res = await fetch('/api/admin/course', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        adminId: loggedInAdmin?.id,
        title: courseTitle,
        description: courseDescription,
        category: courseCategory,
        price: coursePrice,
      }),
    });

    const result = await res.json();
    if (!res.ok) {
      alert('Error creating course: ' + result.error);
      return null;
    }

    return result.data.id;
  };

  const handleSubmit = async () => {
    if (!loggedInAdmin) return alert('⚠️ You must be logged in as admin');
    if (!courseTitle) return alert('Course title required');
    if (lessons.length === 0) return alert('Add at least one lesson');

    setUploading(true);

    try {
      const courseId = await createCourse();
      if (!courseId) throw new Error('Failed to create course');

      for (const lesson of lessons) {
        let videoUID: string | null = null;
        let documentFileName: string | null = null;
        let documentURL: string | null = null;

        // ✅ Video upload
        if (lesson.videoFile) {
          const res = await fetch('/api/cloudflare/direct-upload', { method: 'POST' });
          const { uploadURL, uid } = await res.json();

          await uploadFileWithProgress(lesson.videoFile, uploadURL, (p) => {
            setLessons((prev) =>
              prev.map((l) => (l.id === lesson.id ? { ...l, videoProgress: p } : l))
            );
          });
          videoUID = uid;
        }

        // ✅ Document upload to Supabase bucket
        if (lesson.documentFile) {
          documentFileName = lesson.documentFile.name;
          const arrayBuffer = await lesson.documentFile.arrayBuffer();
          const base64 = Buffer.from(arrayBuffer).toString('base64');

          // Call backend API to upload document and get public URL
          const docRes = await fetch('/api/admin/lesson', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              adminId: loggedInAdmin.id,
              courseId,
              title: lesson.title,
              description: lesson.description,
              video_uid: videoUID,
              documentFileName,
              documentBase64: base64,
            }),
          });

          const docJson = await docRes.json();
          if (!docRes.ok) throw docJson.error;
          documentURL = docJson.data.document_url;
        } else {
          // If no document, still insert lesson
          const insertRes = await fetch('/api/admin/lesson', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              adminId: loggedInAdmin.id,
              courseId,
              title: lesson.title,
              description: lesson.description,
              video_uid: videoUID,
              documentFileName: null,
              documentBase64: null,
            }),
          });
          const insertJson = await insertRes.json();
          if (!insertRes.ok) throw insertJson.error;
          documentURL = insertJson.data.document_url;
        }
      }

      alert('✅ Course and lessons uploaded successfully!');
      setCourseTitle('');
      setCourseDescription('');
      setCourseCategory('');
      setCoursePrice(0);
      setLessons([]);
      router.push('/courses');
    } catch (err: any) {
      console.error('Upload error:', err);
      alert('❌ Error uploading course. Check console.');
    } finally {
      setUploading(false);
    }
  };

  if (!loggedInAdmin) {
    return (
      <div className="p-4 text-center">
        <p className="text-red-500 text-lg">
          ⚠️ You must be logged in as an admin to access this page.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Upload Course</h1>

      {/* Course Info */}
      <div className="mb-4 space-y-2">
        <input
          placeholder="Course Title"
          className="border p-2 w-full"
          value={courseTitle}
          onChange={(e) => setCourseTitle(e.target.value)}
        />
        <textarea
          placeholder="Course Description"
          className="border p-2 w-full"
          value={courseDescription}
          onChange={(e) => setCourseDescription(e.target.value)}
        />
        <input
          placeholder="Category"
          className="border p-2 w-full"
          value={courseCategory}
          onChange={(e) => setCourseCategory(e.target.value)}
        />
        <input
          type="number"
          placeholder="Price"
          className="border p-2 w-full"
          value={coursePrice}
          onChange={(e) => setCoursePrice(Number(e.target.value))}
        />
      </div>

      {/* Lessons */}
      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-2">Lessons</h2>
        {lessons.map((lesson) => (
          <div key={lesson.id} className="border p-2 mb-2 space-y-1">
            <input
              placeholder="Lesson Title"
              className="border p-2 w-full"
              value={lesson.title}
              onChange={(e) => handleLessonChange(lesson.id, 'title', e.target.value)}
            />
            <textarea
              placeholder="Lesson Description"
              className="border p-2 w-full"
              value={lesson.description}
              onChange={(e) => handleLessonChange(lesson.id, 'description', e.target.value)}
            />
            <input
              type="file"
              accept="video/*"
              onChange={(e) =>
                e.target.files && handleLessonChange(lesson.id, 'videoFile', e.target.files[0])
              }
            />
            {lesson.videoProgress !== undefined && (
              <div className="w-full bg-gray-200 h-2">
                <div
                  className="bg-blue-500 h-2"
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
              <div className="w-full bg-gray-200 h-2">
                <div
                  className="bg-green-500 h-2"
                  style={{ width: `${lesson.docProgress}%` }}
                ></div>
              </div>
            )}
            <button
              className="bg-red-500 text-white px-2 py-1 mt-1"
              onClick={() => removeLesson(lesson.id)}
            >
              Remove Lesson
            </button>
          </div>
        ))}
        <button className="bg-blue-500 text-white px-4 py-2" onClick={addLesson}>
          Add Lesson
        </button>
      </div>

      <button
        className="bg-green-500 text-white px-6 py-2"
        onClick={handleSubmit}
        disabled={uploading}
      >
        {uploading ? 'Uploading...' : 'Upload Course'}
      </button>
    </div>
  );
}
