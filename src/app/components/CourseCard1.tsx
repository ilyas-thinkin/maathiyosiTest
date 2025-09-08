"use client";

import { motion } from "framer-motion";
import Image from "next/image";

type CourseCardProps = {
  id: string;
  title: string;
  thumbnailUrl?: string | null;
  price: number;
  onEnroll: (id: string) => void;
};

export default function CourseCard({
  id,
  title,
  thumbnailUrl,
  price,
  onEnroll,
}: CourseCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="group relative flex flex-col rounded-2xl bg-white/80 shadow-sm ring-1 ring-zinc-200 hover:shadow-md overflow-hidden"
    >
      <div className="relative aspect-video bg-zinc-100">
        {thumbnailUrl ? (
          <Image
            src={thumbnailUrl}
            alt={title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            sizes="(max-width: 768px) 100vw, 33vw"
            priority={false}
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center text-zinc-400 text-sm">
            No thumbnail
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3 p-4">
        <h3 className="line-clamp-2 text-lg font-semibold text-zinc-900">
          {title}
        </h3>

        <div className="mt-auto flex items-center justify-between">
          <div className="text-xl font-bold tracking-tight">
            ₹{price.toLocaleString("en-IN")}
          </div>

          <button
            onClick={() => onEnroll(id)}
            className="rounded-xl px-4 py-2 text-sm font-semibold bg-zinc-900 text-white hover:bg-zinc-800 active:bg-zinc-950 transition-colors"
            aria-label={`Enroll in ${title}`}
          >
            Enroll Now — ₹{price.toLocaleString("en-IN")}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
