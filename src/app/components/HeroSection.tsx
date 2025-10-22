"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, Rocket } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function HeroSection() {
  const [hovered, setHovered] = useState(false);
  const router = useRouter();

  return (
    <section className="relative overflow-hidden w-full bg-gradient-to-r from-[#fffafa] via-[#fef2f2] to-[#ffffff] py-20 px-6 md:px-20 flex flex-col-reverse md:flex-row items-center justify-between gap-12">
      {/* Left Content */}
      <motion.div
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center md:text-left max-w-xl"
      >
        <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 leading-tight tracking-tight font-sans">
          Learn. Build. <br />
          <span className="text-[#de5252]">Think Differently.</span>
        </h1>

        <p className="text-gray-600 mt-5 text-lg md:text-xl font-light max-w-md mx-auto md:mx-0">
          <span className="font-semibold text-[#de5252]">maathiyosi.io</span> helps
          you master cutting-edge technologies — from AI and Web3 to
          full-stack development — through real-world, hands-on learning.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
          {/* Primary Button → /login */}
          <button
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onClick={() => router.push("/login")}
            className="group bg-[#de5252] hover:bg-[#c24343] text-white font-semibold py-3.5 px-10 rounded-full shadow-md flex items-center justify-center gap-2 transition-all duration-300 hover:shadow-lg relative cursor-pointer"
          >
            <span>Start Learning</span>
            {hovered ? (
              <Rocket className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
            ) : (
              <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
            )}
          </button>

          {/* Secondary Button → /courses */}
          <button
            onClick={() => router.push("/courses")}
            className="border border-[#de5252] text-[#de5252] hover:bg-[#fff1f1] font-semibold py-3.5 px-10 rounded-full transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
          >
            Browse Courses
          </button>
        </div>
      </motion.div>

      {/* Right Illustration */}
      <motion.div
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        className="flex justify-center md:justify-end"
      >
        <Image
          src="/himg.png"
          alt="Learning Illustration"
          width={500}
          height={400}
          className="drop-shadow-2xl max-w-full h-auto"
          priority
        />
      </motion.div>
    </section>
  );
}
