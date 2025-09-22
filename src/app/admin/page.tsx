import React from 'react';
import CFVideoUploader from '../components/CFVideoUploader';

export default function AdminPage() {
  const courseId = 'your-course-cf-id'; // replace with actual course_cf id

  return (
    <div className="max-w-3xl mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard - Cloudflare Courses</h1>
      <CFVideoUploader courseId={courseId} />
    </div>
  );
}
