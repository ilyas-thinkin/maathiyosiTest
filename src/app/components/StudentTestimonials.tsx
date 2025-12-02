"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";

type Testimonial = {
  name: string;
  role: string;
  feedback: string;
  image: string;
};

function Row({
  items,
  direction,
  duration,
  paused,
  setPaused,
  hoveredIndex,
  setHoveredIndex,
}: {
  items: Testimonial[];
  direction: "left" | "right";
  duration: number;
  paused: boolean;
  setPaused: (v: boolean) => void;
  hoveredIndex: number | null;
  setHoveredIndex: (v: number | null) => void;
}) {
  const loopItems = [...items, ...items];

  return (
    
    <div className="relative w-full overflow-visible py-4">
        
      <div
        className="flex gap-6 items-stretch"
        style={{
          width: "max-content",
          animationName: direction === "left" ? "marquee" : "marquee-reverse",
          animationDuration: `${duration}s`,
          animationTimingFunction: "linear",
          animationIterationCount: "infinite",
          animationPlayState: paused ? "paused" : "running",
          willChange: "transform",
        }}
      >
        {loopItems.map((t, idx) => (
          <motion.div
            key={idx}
            onMouseEnter={() => {
              setPaused(true);
              setHoveredIndex(idx);
            }}
            onMouseLeave={() => {
              setPaused(false);
              setHoveredIndex(null);
            }}
            animate={{
              scale: hoveredIndex === idx ? 1.08 : 1,
              opacity:
                hoveredIndex === null
                  ? 1
                  : hoveredIndex === idx
                  ? 1
                  : 0.35,
            }}
            transition={{ duration: 0.28 }}
            style={{
              zIndex: hoveredIndex === idx ? 40 : 10,
            }}
            className="bg-gradient-to-br from-[#de5252] to-[#c94444] text-white rounded-2xl p-6 w-80 flex-shrink-0 flex flex-col justify-between shadow-md overflow-hidden"
          >
            <div className="flex gap-1 mb-3">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={16}
                  className="text-yellow-300 fill-yellow-300"
                />
              ))}
            </div>
            <p
              className="mb-5 text-sm leading-relaxed"
              style={{
                display: "-webkit-box",
                WebkitLineClamp: 4,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              “{t.feedback}”
            </p>
            <div className="flex items-center gap-3 mt-auto">
              <img
                src={t.image}
                alt={t.name}
                className="w-10 h-10 rounded-full border-2 border-white/30 object-cover flex-shrink-0"
              />
              <div>
                <div className="font-semibold text-sm">{t.name}</div>
                <div className="text-xs text-white/80">{t.role}</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        @keyframes marquee-reverse {
          0% {
            transform: translateX(-50%);
          }
          100% {
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
}

export default function TestimonialsSlider() {
  const [pausedTop, setPausedTop] = useState(false);
  const [pausedBottom, setPausedBottom] = useState(false);
  const [hoveredTop, setHoveredTop] = useState<number | null>(null);
  const [hoveredBottom, setHoveredBottom] = useState<number | null>(null);
  const [testimonialsRow1, setTestimonialsRow1] = useState<Testimonial[]>([]);
  const [testimonialsRow2, setTestimonialsRow2] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const res = await fetch("/api/admin/testimonials?active=true");
        const result = await res.json();

        if (result.success && Array.isArray(result.data)) {
          // Filter and map testimonials by row
          const row1 = result.data
            .filter((t: any) => t.row_number === 1)
            .sort((a: any, b: any) => a.display_order - b.display_order)
            .map((t: any) => ({
              name: t.name,
              role: t.role,
              feedback: t.feedback,
              image: t.image_url || "https://via.placeholder.com/100",
            }));

          const row2 = result.data
            .filter((t: any) => t.row_number === 2)
            .sort((a: any, b: any) => a.display_order - b.display_order)
            .map((t: any) => ({
              name: t.name,
              role: t.role,
              feedback: t.feedback,
              image: t.image_url || "https://via.placeholder.com/100",
            }));

          setTestimonialsRow1(row1);
          setTestimonialsRow2(row2);
        }
      } catch (err) {
        console.error("Failed to fetch testimonials:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTestimonials();
  }, []);

  if (loading) {
    return (
      <section className="bg-white py-12 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#de5252] border-t-transparent"></div>
      </section>
    );
  }

  return (
    <section className="bg-white py-12 overflow-hidden space-y-6">

        <h2 className="text-[#de5252] text-4xl font-bold text-center mb-10">
  Student Testimonials
</h2>



      <Row
        items={testimonialsRow1}
        direction="left"
        duration={40} // slower
        paused={pausedTop}
        setPaused={setPausedTop}
        hoveredIndex={hoveredTop}
        setHoveredIndex={setHoveredTop}
      />
      <Row
        items={testimonialsRow2}
        direction="right"
        duration={45} // slower
        paused={pausedBottom}
        setPaused={setPausedBottom}
        hoveredIndex={hoveredBottom}
        setHoveredIndex={setHoveredBottom}
      />
    </section>
  );
}
