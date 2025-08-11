"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";

type Testimonial = {
  name: string;
  role: string;
  feedback: string;
  image: string;
};

const testimonials: Testimonial[] = [
  {
    name: "Sarah Thompson",
    role: "Project Manager",
    feedback:
      "This AI product has transformed the way I manage my daily tasks. It’s intuitive, fast, and incredibly accurate!",
    image: "https://randomuser.me/api/portraits/women/44.jpg",
  },
  {
    name: "Michael Chen",
    role: "Software Developer",
    feedback:
      "I was skeptical at first, but this AI tool saved me hours of work. The automation features are a game-changer.",
    image: "https://randomuser.me/api/portraits/men/32.jpg",
  },
  {
    name: "Emily Rodriguez",
    role: "Data Analyst",
    feedback:
      "The AI’s ability to analyze data and provide insights is unmatched. It’s like having a personal assistant 24/7.",
    image: "https://randomuser.me/api/portraits/women/68.jpg",
  },
  {
    name: "David Patel",
    role: "IT Consultant",
    feedback:
      "I’ve never seen an AI product this user-friendly. It integrated seamlessly into my workflow from day one.",
    image: "https://randomuser.me/api/portraits/men/76.jpg",
  },
  {
    name: "Olivia Harper",
    role: "Marketing Specialist",
    feedback:
      "This AI has boosted my productivity tenfold. The predictive features are spot-on and so helpful.",
    image: "https://randomuser.me/api/portraits/women/12.jpg",
  },
  {
    name: "James Carter",
    role: "Operations Manager",
    feedback:
      "The customer support paired with the AI product is phenomenal. It delivers results every single time.",
    image: "https://randomuser.me/api/portraits/men/90.jpg",
  },
];

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

  return (
    <section className="bg-white py-12 overflow-hidden space-y-6">

        <h2 className="text-[#de5252] text-4xl font-bold text-center mb-10">
  Testimonials
</h2>



      <Row
        items={testimonials}
        direction="left"
        duration={40} // slower
        paused={pausedTop}
        setPaused={setPausedTop}
        hoveredIndex={hoveredTop}
        setHoveredIndex={setHoveredTop}
      />
      <Row
        items={testimonials}
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
