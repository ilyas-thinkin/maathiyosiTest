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

// First row testimonials
const testimonialsRow1: Testimonial[] = [
  {
    name: "Arun Kumar",
    role: "Class 11 Student",
    feedback:
      "Maathiyosi has completely changed how I learn physics. The video explanations are so clear, and I can learn at my own pace!",
    image: "https://randomuser.me/api/portraits/men/32.jpg",
  },
  {
    name: "Priya Sharma",
    role: "Class 12 Student",
    feedback:
      "The best decision I made for my board exam preparation. The structured courses and practice problems helped me score 95%!",
    image: "https://randomuser.me/api/portraits/women/44.jpg",
  },
  {
    name: "Karthik Reddy",
    role: "Engineering Student",
    feedback:
      "As an engineering student, Maathiyosi's advanced math courses have been invaluable. The concepts are explained brilliantly!",
    image: "https://randomuser.me/api/portraits/men/76.jpg",
  },
  {
    name: "Divya Nair",
    role: "Class 10 Student",
    feedback:
      "I was struggling with algebra, but Maathiyosi made it so easy to understand. Now it's my favorite subject!",
    image: "https://randomuser.me/api/portraits/women/68.jpg",
  },
  {
    name: "Rahul Mehta",
    role: "NEET Aspirant",
    feedback:
      "The biology and chemistry courses are exceptional. The detailed explanations helped me crack NEET with a great score!",
    image: "https://randomuser.me/api/portraits/men/45.jpg",
  },
  {
    name: "Sneha Iyer",
    role: "Class 9 Student",
    feedback:
      "Learning has never been this fun! The interactive lessons and quizzes keep me engaged and help me remember better.",
    image: "https://randomuser.me/api/portraits/women/12.jpg",
  },
];

// Second row testimonials
const testimonialsRow2: Testimonial[] = [
  {
    name: "Vijay Krishnan",
    role: "JEE Aspirant",
    feedback:
      "Maathiyosi's JEE preparation courses are top-notch. The problem-solving techniques and shortcuts are game-changers!",
    image: "https://randomuser.me/api/portraits/men/90.jpg",
  },
  {
    name: "Ananya Das",
    role: "Class 12 Student",
    feedback:
      "The chemistry courses here are amazing! Complex reactions are broken down so well that I actually enjoy studying now.",
    image: "https://randomuser.me/api/portraits/women/25.jpg",
  },
  {
    name: "Rohan Singh",
    role: "Class 11 Student",
    feedback:
      "Best online learning platform I've used. The teachers are excellent, and the study materials are comprehensive.",
    image: "https://randomuser.me/api/portraits/men/54.jpg",
  },
  {
    name: "Meera Patel",
    role: "Class 10 Student",
    feedback:
      "My grades improved significantly after joining Maathiyosi. The practice tests really helped me prepare for exams!",
    image: "https://randomuser.me/api/portraits/women/33.jpg",
  },
  {
    name: "Arjun Desai",
    role: "Engineering Student",
    feedback:
      "The advanced calculus and linear algebra courses are perfectly designed for college-level learning. Highly recommend!",
    image: "https://randomuser.me/api/portraits/men/67.jpg",
  },
  {
    name: "Lakshmi Menon",
    role: "Class 12 Student",
    feedback:
      "Thanks to Maathiyosi, I'm confident about my board exams. The revision modules and mock tests are extremely helpful!",
    image: "https://randomuser.me/api/portraits/women/51.jpg",
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
