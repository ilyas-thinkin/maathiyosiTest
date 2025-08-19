'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { PlayCircle } from 'lucide-react';
import { supabase } from '@/app/components/lib/supabaseClient'; // ✅ uses env vars

type Props = {
  courseId: string;
};

type Lesson = {
  id: string;
  title: string;
  description: string | null;
  video_url: string | null; // stored as path like "videos/uuid/lesson1.mp4"
  course_id: string;
};

export const CoursePlayer = ({ courseId }: Props) => {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  // ✅ Public bucket URL
  const PUBLIC_VIDEO_URL =
    'https://kcvghsnlzythcublawvf.supabase.co/storage/v1/object/public/course-videos/';

  useEffect(() => {
    const fetchLessons = async () => {
      const { data, error } = await supabase
        .from('course_lessons')
        .select('*')
        .eq('course_id', courseId);

      if (error) {
        console.error('Error fetching lessons:', error.message);
      } else {
        setLessons(data || []);
      }

      setLoading(false);
    };

    fetchLessons();
  }, [courseId]);

  if (loading) {
    return (
      <div className="text-center text-gray-600 py-8">
        <div className="animate-spin h-10 w-10 border-4 border-rose-500 border-t-transparent rounded-full mx-auto mb-4" />
        Loading lessons...
      </div>
    );
  }

  if (lessons.length === 0) {
    return (
      <div className="text-center text-gray-500 italic">
        No lessons available yet.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {lessons.map((lesson) => (
        <motion.div
          key={lesson.id}
          whileHover={{ y: -2 }}
          className="border border-gray-200 rounded-xl p-4 shadow-sm bg-white"
        >
          {/* Title */}
          <div
            className="flex items-center justify-between cursor-pointer"
            onClick={() =>
              setExpanded((prev) => (prev === lesson.id ? null : lesson.id))
            }
          >
            <h2 className="text-lg font-semibold text-gray-800">
              {lesson.title}
            </h2>
            <PlayCircle
              size={26}
              className={`transition-colors ${
                expanded === lesson.id ? 'text-rose-500' : 'text-gray-400'
              }`}
            />
          </div>

          {/* Content */}
          {expanded === lesson.id && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-4 space-y-4"
            >
              {lesson.description && (
                <p className="text-gray-700">{lesson.description}</p>
              )}

              {lesson.video_url ? (
                <div className="rounded overflow-hidden border shadow-sm">
                  <video
                    controls
                    controlsList="nodownload" // ✅ disables download
                    className="w-full aspect-video"
                    src={
                      lesson.video_url.startsWith('http')
                        ? lesson.video_url
                        : `${PUBLIC_VIDEO_URL}${lesson.video_url}`
                    }
                  />
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic">
                  No video uploaded for this lesson.
                </p>
              )}
            </motion.div>
          )}
        </motion.div>
      ))}
    </div>
  );
};
