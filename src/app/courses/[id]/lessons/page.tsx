'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClientComponentClient } from '../../../components/lib/supabaseClient';
import { CoursePlayer } from '../../../CoursePlayer'; // ✅ adjust path if needed

export default function LessonsPage() {
  const router = useRouter();
  const params = useParams();
  const supabase = createClientComponentClient();

  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  // ✅ Extract courseId safely
  const courseId = typeof params.id === 'string' ? params.id : '';

  useEffect(() => {
    const checkAccess = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push('/student-login');
        return;
      }

      // ✅ Check purchase
      const { data: purchase } = await supabase
        .from('purchases')
        .select('*')
        .eq('user_id', user.id)
        .eq('course_id', courseId)
        .maybeSingle();

      if (!purchase) {
        router.push(`/courses/${courseId}`);
        return;
      }

      setAuthorized(true);
      setLoading(false);
    };

    if (courseId) {
      checkAccess();
    } else {
      router.push('/');
    }
  }, [supabase, courseId, router]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-rose-500 border-t-transparent mx-auto mb-4"></div>
        <p className="text-gray-600">Loading lessons...</p>
      </div>
    );
  }

  if (!authorized) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <p className="text-red-600 font-semibold">
          You don’t have access to this course.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-rose-600 text-center">
        🎥 Course Lessons
      </h1>

      {/* ✅ CoursePlayer handles fetching + playing lessons securely */}
      {courseId && <CoursePlayer courseId={courseId} />}
    </div>
  );
}
