"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../components/lib/supabaseClient";
import { motion } from "framer-motion";

type DbCourse = {
  id: string | number;
  title: string;
  price: number;
  thumbnail_url?: string | null;
};

type UnifiedCourse = {
  id: string;
  rawId: string | number;
  title: string;
  price: number;
  thumbnailUrl?: string | null;
};


export default function HomePageCourses() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<UnifiedCourse[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);

        // Fetch courses
        const { data: normal, error: errNormal } = await supabase
          .from("courses")
          .select("id, title, price, thumbnail_url")
          .order("created_at", { ascending: false } as any);

        if (errNormal) throw errNormal;

        const { data: yt, error: errYt } = await supabase
          .from("courses_yt")
          .select("id, title, price, thumbnail_url")
          .order("created_at", { ascending: false } as any);

        if (errYt) throw errYt;

        // Normalize data
        const normMapped: UnifiedCourse[] =
          (normal as DbCourse[] | null)?.map((c) => ({
            id: `c_${c.id}`,
            rawId: c.id,
            title: c.title,
            price: Number(c.price ?? 0),
            thumbnailUrl: c.thumbnail_url ?? null,
          })) ?? [];

        const ytMapped: UnifiedCourse[] =
          (yt as DbCourse[] | null)?.map((c) => ({
            id: `yt_${c.id}`,
            rawId: c.id,
            title: c.title,
            price: Number(c.price ?? 0),
            thumbnailUrl: c.thumbnail_url ?? null,
          })) ?? [];

        const merged = [...normMapped, ...ytMapped];

        if (!cancelled) setCourses(merged);
      } catch (e: any) {
        if (!cancelled) setError(e?.message || "Failed to load courses");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const skeletons = useMemo(() => new Array(8).fill(0).map((_, i) => i), []);

  const handleClick = (id: string) => {
    router.push(`/courses/${encodeURIComponent(id)}`);
  };

  return (
    <section className="mx-auto max-w-7xl px-4 py-12">
      <div className="mb-8 text-center">
        <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-red-600 to-red-400 text-transparent bg-clip-text">
          Explore Our Courses
        </h2>
        <p className="mt-3 text-zinc-600 text-lg">
          Learn, grow, and unlock your potential 🚀
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-300 bg-red-50 p-4 text-red-800 shadow-sm">
          {error}
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {skeletons.map((i) => (
            <div
              key={i}
              className="animate-pulse rounded-2xl overflow-hidden border border-zinc-200 bg-white shadow-sm"
            >
              <div className="aspect-video bg-zinc-100" />
              <div className="p-4 space-y-3">
                <div className="h-5 bg-zinc-200 rounded w-3/4" />
                <div className="h-5 bg-zinc-200 rounded w-1/2" />
                <div className="h-8 bg-red-100 rounded w-24" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8"
        >
          {courses.slice(0, 8).map((course) => (
            <motion.div
              key={course.id}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleClick(course.id)}
              className="cursor-pointer rounded-2xl overflow-hidden border border-zinc-200 bg-white shadow-md hover:shadow-xl transition-all duration-300 group flex flex-col"
            >
              {/* Thumbnail */}
              <div className="relative aspect-video overflow-hidden">
                <img
                  src={course.thumbnailUrl || "/default-thumb.jpg"}
                  alt={course.title}
                  className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>

              {/* Content */}
              <div className="flex flex-col flex-grow p-5">
                <h3 className="text-lg font-semibold text-zinc-900 group-hover:text-red-600 transition-colors duration-300">
                  {course.title}
                </h3>
                <p className="mt-2 text-sm text-zinc-500 flex-grow">
                  Tap to explore and enroll instantly.
                </p>

                {/* Price + Button */}
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-lg font-bold text-red-600">
                    ₹{course.price}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // prevent card click firing
                      handleClick(course.id);
                    }}
                    className="px-4 py-2 rounded-lg bg-red-600 text-white font-medium shadow-md hover:bg-red-700 transition-colors"
                  >
                    Enroll Now
                  </button>
                </div>
              </div>
            </motion.div>
          ))}

          {/* Empty state */}
          {courses.length === 0 && !error && (
            <div className="col-span-full rounded-2xl border border-zinc-200 p-8 text-center text-zinc-600">
              No courses available right now.
            </div>
          )}
        </motion.div>
      )}
    </section>
  );
}
