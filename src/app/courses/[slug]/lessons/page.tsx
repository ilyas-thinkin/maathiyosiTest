"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../../../components/lib/supabaseClient";
import { ScatterBoxLoaderComponent } from "../../../components/ScatterBoxLoaderComponent";

// Dynamic import for React wrapper
const MuxPlayer = dynamic(() => import("@mux/mux-player-react"), { ssr: false });

type Lesson = {
  id: string;
  title: string;
  description?: string;
  video_url?: string;
  mux_video_id?: string;
  vimeo_player_url?: string;
  vimeo_video_id?: string;
  document_url?: string;
  lesson_order?: number;
};

type Course = {
  id: string;
  title: string;
  lessons?: Lesson[];
  source?: 'mux' | 'vimeo';
};

export default function CourseLessonsPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [courseId, setCourseId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [hasAccess, setHasAccess] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [openLesson, setOpenLesson] = useState<string | null>(null);
  const [viewDoc, setViewDoc] = useState<string | null>(null);

  // Check user authentication
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);

        if (!user) {
          // Not logged in, redirect to login
          router.push(`/login?redirect=/courses/${params.slug}/lessons`);
        }
      } catch (err) {
        console.error("Auth check error:", err);
        router.push(`/login?redirect=/courses/${params.slug}/lessons`);
      }
    };

    checkAuth();
  }, [params.slug, router]);

  // Resolve slug to courseId
  useEffect(() => {
    const resolveSlugToCourseId = async () => {
      if (!params?.slug) {
        setCheckingAccess(false);
        return;
      }

      try {
        const res = await fetch(`/api/admin/get-course-by-slug?slug=${params.slug}`);
        const data = await res.json();

        if (data.error || !data.id) {
          console.error("Course not found for slug:", params.slug);
          setCourseId(null);
          setCheckingAccess(false);
          return;
        }

        setCourseId(data.id);
      } catch (err) {
        console.error("Error resolving slug to courseId:", err);
        setCourseId(null);
        setCheckingAccess(false);
      }
    };

    resolveSlugToCourseId();
  }, [params?.slug]);

  // Check if user has purchased the course
  useEffect(() => {
    const checkPurchase = async () => {
      if (!user || !courseId) {
        setCheckingAccess(false);
        return;
      }

      setCheckingAccess(true);
      try {
        const { data, error } = await supabase
          .from("purchase")
          .select("id, status")
          .eq("user_id", user.id)
          .eq("course_id", courseId)
          .eq("status", "success")
          .maybeSingle();

        if (data) {
          setHasAccess(true);
        } else {
          // User hasn't purchased, redirect to course details
          router.push(`/courses/${params.slug}`);
        }
      } catch (err) {
        console.error("Purchase check error:", err);
        router.push(`/courses/${params.slug}`);
      } finally {
        setCheckingAccess(false);
      }
    };

    checkPurchase();
  }, [user, courseId, router, params.slug]);

  // Fetch course + lessons (only if user has access)
  useEffect(() => {
    if (!courseId || !hasAccess) return;

    const fetchCourse = async () => {
      setLoading(true);
      try {
        // First, determine which source the course belongs to
        const sourceRes = await fetch(`/api/admin/get-course-source?id=${courseId}`);
        const sourceData = await sourceRes.json();

        if (sourceData.error || !sourceData.exists) {
          console.error("Course not found in any source");
          setCourse(null);
          setLoading(false);
          return;
        }

        // Fetch from the correct source
        const endpoint = sourceData.source === "mux"
          ? `/api/admin/fetch-mux-details-course?id=${courseId}`
          : `/api/admin/fetch-vimeo-details-course?id=${courseId}`;

        const res = await fetch(endpoint);
        const data = await res.json();

        // Sort lessons by lesson_order if it exists
        if (data.lessons && Array.isArray(data.lessons)) {
          data.lessons.sort((a: Lesson, b: Lesson) => {
            const orderA = a.lesson_order ?? 999;
            const orderB = b.lesson_order ?? 999;
            return orderA - orderB;
          });
        }

        // Add source information to the course object
        setCourse(data.error ? null : { ...data, source: sourceData.source });
      } catch (err) {
        console.error(err);
        setCourse(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [courseId, hasAccess]);

  // Extract Mux playback ID from URL
  const extractMuxPlaybackId = (url: string | undefined): string | null => {
    if (!url) return null;
    const match = url.match(/stream\.mux\.com\/([^/.]+)/);
    return match ? match[1] : null;
  };

  // Show loader while checking access or loading course
  if (checkingAccess || loading) return <ScatterBoxLoaderComponent />;

  // If no access after check, show unauthorized message (shouldn't reach here due to redirects)
  if (!hasAccess) {
    return (
      <div className="max-w-2xl mx-auto p-10 text-center">
        <h1 className="text-3xl font-bold text-red-600 mb-4">Access Denied</h1>
        <p className="text-gray-700 mb-6">
          You need to purchase this course to access the lessons.
        </p>
        <button
          onClick={() => router.push(`/courses/${params.slug}`)}
          className="px-6 py-3 bg-[#de5252] text-white rounded-lg hover:bg-[#f66]"
        >
          View Course Details
        </button>
      </div>
    );
  }

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
            const playbackId = extractMuxPlaybackId(videoUrl);
            const isOpen = openLesson === lesson.id;
            const isDocView = viewDoc === lesson.id;

            return (
              <div key={lesson.id} className="p-4">
                {/* Lesson Title */}
                <button
                  onClick={() => {
                    setOpenLesson(isOpen ? null : lesson.id);
                    setViewDoc(null);
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
                      {/* Left: Description / Document */}
                      <motion.div
                        className="space-y-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        {!isDocView ? (
                          <>
                            <h3 className="text-xl font-bold text-gray-800">{lesson.title}</h3>
                            {lesson.description && (
                              <p className="text-gray-600 text-sm leading-relaxed">{lesson.description}</p>
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
                            {/* Check if document is an image or gif */}
                            {lesson.document_url && /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(lesson.document_url) ? (
                              <div className="w-full h-[400px] border rounded-lg shadow-md overflow-hidden flex items-center justify-center bg-gray-50">
                                <img
                                  src={lesson.document_url}
                                  alt={`Document for ${lesson.title}`}
                                  className="max-w-full max-h-full object-contain"
                                />
                              </div>
                            ) : (
                              <iframe
                                src={lesson.document_url || ""}
                                className="w-full h-[400px] border rounded-lg shadow-md"
                                title={`Document for ${lesson.title}`}
                              />
                            )}
                          </>
                        )}
                      </motion.div>

                      {/* Right: Video */}
                      <div className="w-full">
                        {/* Render Vimeo Player */}
                        {lesson.vimeo_player_url ? (
                          <div
                            className="w-full aspect-video rounded-lg overflow-hidden shadow-md relative"
                            onContextMenu={(e) => e.preventDefault()}
                            style={{ userSelect: 'none' }}
                          >
                            <iframe
                              src={`${lesson.vimeo_player_url}?h=0&title=0&byline=0&portrait=0&sidedock=0&badge=0&autopause=0&player_id=0&app_id=0&color=de5252`}
                              className="w-full h-full rounded-lg pointer-events-auto"
                              frameBorder="0"
                              allow="autoplay; fullscreen; picture-in-picture"
                              allowFullScreen
                              title={lesson.title}
                              style={{ pointerEvents: 'auto' }}
                            />
                            {/* Invisible overlay to block right-click on video */}
                            <div
                              className="absolute inset-0 pointer-events-none"
                              onContextMenu={(e) => e.preventDefault()}
                            />
                          </div>
                        ) : playbackId ? (
                          /* Render Mux Player */
                          <div className="w-full aspect-video rounded-lg overflow-hidden shadow-md">
                            <MuxPlayer
                              playbackId={playbackId}
                              streamType="on-demand"
                              metadata={{ video_title: lesson.title }}
                              className="w-full h-full rounded-lg overflow-hidden"
                              autoPlay={false}
                              // Correct way to pass default-controls
                              {...({ "default-controls": true } as any)}
                              style={{
                                "--primary-color": "#de5252",
                                "--progress-bar-color": "#de5252",
                                "--progress-bar-background-color": "#f3f4f6",
                                "--controls-backdrop-color": "rgba(0,0,0,0.5)",
                                "--controls-backdrop-filter": "blur(6px)",
                              } as React.CSSProperties}
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
          <p className="text-gray-500 text-center font-medium">No lessons available</p>
        )}
      </div>
    </motion.div>
  );
}
