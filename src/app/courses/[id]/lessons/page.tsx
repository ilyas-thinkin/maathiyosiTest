"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import ThinkingRobotLoader from "../../../components/RobotThinkingLoader";

const MuxPlayer = dynamic(() => import("@mux/mux-player-react"), { ssr: false });

type Lesson = {
  id: string;
  title: string;
  description?: string;
  video_url?: string;
  mux_video_id?: string;
  document_url?: string;
};

type Course = {
  id: string;
  title: string;
  lessons?: Lesson[];
};

export default function CourseLessonsPage() {
  const params = useParams<{ id: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [openLesson, setOpenLesson] = useState<string | null>(null);
  const [viewDoc, setViewDoc] = useState<string | null>(null);

  useEffect(() => {
    if (!params?.id) return;

    const fetchCourse = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/fetch-mux-details-course?id=${params.id}`);
        const data = await res.json();
        setCourse(data.error ? null : data);
      } catch (err) {
        console.error(err);
        setCourse(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [params?.id]);

  const extractMuxPlaybackId = (url: string): string | null => {
    if (!url) return null;
    const match = url.match(/stream\.mux\.com\/([^/.]+)/);
    return match ? match[1] : null;
  };

  if (loading) return <ThinkingRobotLoader />;
  if (!course) return <p className="p-6 font-semibold text-red-600">Course not found.</p>;

  return (
    <motion.div
      className="max-w-7xl mx-auto p-6 bg-white rounded-2xl shadow-lg"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <motion.h1
        className="text-3xl font-bold mb-6 text-[#de5252] text-center"
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.5 }}
      >
        {course.title} - Lessons
      </motion.h1>

      <div className="divide-y divide-gray-200 border rounded-xl">
        {course.lessons && course.lessons.length > 0 ? (
          course.lessons.map((lesson, index) => {
            const videoUrl = lesson.mux_video_id || lesson.video_url;
            const playbackId = videoUrl ? extractMuxPlaybackId(videoUrl) : null;
            const isOpen = openLesson === lesson.id;
            const isDocView = viewDoc === lesson.id;

            return (
              <div key={lesson.id} className="p-4">
                {/* Title Row */}
                <button
                  onClick={() => {
                    setOpenLesson(isOpen ? null : lesson.id);
                    setViewDoc(null); // reset doc view when switching
                  }}
                  className="flex justify-between items-center w-full text-left"
                >
                  <span className="text-lg font-semibold text-[#de5252]">
                    {index + 1}. {lesson.title}
                  </span>
                  <span className="text-gray-500">{isOpen ? "▲" : "▼"}</span>
                </button>

                {/* Expandable Content */}
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      {/* Left side: details or document */}
                      <motion.div
                        className="space-y-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        {!isDocView ? (
                          <>
                            <h3 className="text-xl font-bold text-gray-800">
                              {lesson.title}
                            </h3>
                            {lesson.description && (
                              <p className="text-gray-600 text-sm leading-relaxed">
                                {lesson.description}
                              </p>
                            )}

                            {lesson.document_url && (
                              <button
                                onClick={() => setViewDoc(lesson.id)}
                                className="inline-block px-4 py-2 text-sm rounded-lg bg-[#de5252] text-white hover:bg-[#f66] transition-colors"
                              >
                                📄 View Document
                              </button>
                            )}
                          </>
                        ) : (
                          <>
                            <div className="flex justify-between items-center mb-2">
                              <h3 className="text-lg font-semibold text-gray-800">
                                {lesson.title} - Document
                              </h3>
                              <button
                                onClick={() => setViewDoc(null)}
                                className="px-2 py-1 text-sm rounded bg-gray-300 hover:bg-gray-400"
                              >
                                Hide Document
                              </button>
                            </div>
                            <iframe
                              src={lesson.document_url || ""}
                              className="w-full h-[400px] border rounded-lg shadow-md"
                            />
                          </>
                        )}
                      </motion.div>

                      {/* Right side: video */}
                      <div className="w-full">
                        {playbackId ? (
                          <div className="w-full aspect-video rounded-lg overflow-hidden shadow-md">
                            <MuxPlayer
                              playbackId={playbackId}
                              streamType="on-demand"
                              metadata={{ video_title: lesson.title }}
                              className="w-full h-full"
                              autoPlay={false}
                              controls
                            />
                          </div>
                        ) : (
                          <p className="text-xs text-red-500">No video available</p>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })
        ) : (
          <p className="text-gray-500 text-center font-medium">
            No lessons available
          </p>
        )}
      </div>
    </motion.div>
  );
}
