'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Play, Sparkles, BookOpen } from 'lucide-react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

type Slide = {
  id: string;
  image_url: string;
  heading: string;
  subheading: string;
  button_text: string;
  linked_course_id: string | null;
};

export default function HeroCarousel() {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [index, setIndex] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchHeroSlides();
  }, []);

  useEffect(() => {
    if (slides.length > 0) {
      const interval = setInterval(() => {
        setIndex((prev) => (prev + 1) % slides.length);
      }, 6000);
      return () => clearInterval(interval);
    }
  }, [slides]);

  const fetchHeroSlides = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/fetch-hero-slides-new');
      const result = await res.json();

      if (!res.ok || result.error) throw new Error(result.error || 'Failed to fetch slides');

      setSlides(result.data || []);
    } catch (err: any) {
      console.error('Error fetching hero slides:', err);
      setSlides([]);
    } finally {
      setLoading(false);
    }
  };

  const nextSlide = () => setIndex((prev) => (prev + 1) % slides.length);
  const prevSlide = () =>
    setIndex((prev) => (prev - 1 + slides.length) % slides.length);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-50">
        <p className="text-gray-500">...</p>
      </div>
    );
  }

  if (slides.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-50 text-gray-500">
        No slides found
      </div>
    );
  }

  const { heading, subheading, image_url, button_text, linked_course_id } =
    slides[index];

  const courseHref = linked_course_id ? `/courses/${linked_course_id}` : '/courses';
  const primaryButtonText = button_text || 'Start Learning';

  return (
    <section className="relative w-full bg-gradient-to-br from-white via-gray-50 to-white rounded-3xl px-6 md:px-12 lg:px-16 py-12 md:py-16 shadow-xl overflow-hidden border border-gray-100 min-h-[500px]">
      {/* Background Decorations */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(239,68,68,0.05)_0%,rgba(236,72,153,0.03)_50%,transparent_100%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(59,130,246,0.05)_0%,transparent_50%)]"></div>

      <div className="relative z-10 max-w-screen-2xl mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={slides[index].id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="flex flex-col lg:grid lg:grid-cols-12 gap-12 items-center"
          >
            {/* Text Section */}
            <div className="lg:col-span-7 flex flex-col justify-center space-y-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.4 }}
                className="inline-flex items-center space-x-2 bg-gradient-to-r from-red-50 to-pink-50 px-4 py-2 rounded-full border border-red-100"
              >
                <Sparkles className="w-4 h-4 text-red-600" />
                <span className="text-sm font-medium text-red-700">Featured Course</span>
              </motion.div>

              <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent leading-tight">
                {heading}
              </h1>

              <p className="text-gray-600 text-base md:text-lg lg:text-xl max-w-2xl">
                {subheading}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mt-4">
                <motion.a
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  href={courseHref}
                  className="inline-flex items-center justify-center px-6 py-3 text-base font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl shadow-lg w-fit"
                >
                  <BookOpen className="mr-2 h-5 w-5" />
                  {primaryButtonText}
                </motion.a>

                <motion.a
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  href="/courses"
                  className="inline-flex items-center justify-center px-6 py-3 text-base font-semibold text-gray-700 bg-white hover:bg-gray-50 rounded-xl border border-gray-300 hover:border-gray-400 w-fit"
                >
                  View All Courses
                  <ChevronRight className="ml-2 h-5 w-5" />
                </motion.a>
              </div>
            </div>

            {/* Image Section */}
            <div className="lg:col-span-5 flex justify-center">
              {image_url ? (
                <Image
                  src={image_url}
                  alt={heading}
                  width={600}
                  height={600}
                  className="object-contain drop-shadow-2xl rounded-2xl"
                  priority
                />
              ) : (
                <div className="w-[300px] h-[300px] md:w-[400px] md:h-[400px] bg-gray-200 flex items-center justify-center text-gray-500 rounded-2xl">
                  No Image
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Arrows */}
      {slides.length > 1 && (
        <>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={prevSlide}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm text-gray-700 rounded-full p-2 md:p-3 shadow-lg hover:bg-white hover:shadow-xl transition-all duration-200 border border-gray-200 z-20"
          >
            <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={nextSlide}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm text-gray-700 rounded-full p-2 md:p-3 shadow-lg hover:bg-white hover:shadow-xl transition-all duration-200 border border-gray-200 z-20"
          >
            <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
          </motion.button>
        </>
      )}

      {/* Progress Dots */}
      <div className="absolute bottom-4 md:bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setIndex(idx)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              idx === index ? 'w-6 md:w-8 bg-gradient-to-r from-red-600 to-pink-600' : 'bg-gray-300 hover:bg-gray-400'
            }`}
          />
        ))}
      </div>
    </section>
  );
}
