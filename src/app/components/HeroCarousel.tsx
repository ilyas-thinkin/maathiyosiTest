'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, BookOpen, Sparkles } from 'lucide-react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../components/lib/supabaseClient';

type Slide = {
  id: string;
  image_url: string | null;
  heading: string;
  subheading: string;
  button_text: string;
  linked_course_id: string | null;
};

export default function HeroCarousel() {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [index, setIndex] = useState<number>(0);

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
      const { data, error } = await supabase
        .from('hero_slides')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Filter slides to only those linking to Mux courses
      const muxSlides = (data as Slide[]).filter(
        (slide) => slide.linked_course_id
      );

      setSlides(muxSlides);
    } catch (err: any) {
      console.error('Error fetching hero slides:', err.message);
    }
  };

  const nextSlide = () => setIndex((prev) => (prev + 1) % slides.length);
  const prevSlide = () =>
    setIndex((prev) => (prev - 1 + slides.length) % slides.length);

  if (slides.length === 0) return null;

  const { heading, subheading, image_url, button_text, linked_course_id } =
    slides[index];

  const courseHref = linked_course_id ? `/courses/${linked_course_id}` : '/courses';
  const primaryButtonText = button_text || 'Start Learning';

  return (
    <section className="relative w-full mx-auto max-w-screen-2xl overflow-hidden">
      {/* Background layers */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-gray-50"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(59,130,246,0.05),transparent_70%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(236,72,153,0.05),transparent_60%)]"></div>

      <div className="relative z-10 px-6 md:px-12 lg:px-16 py-16">
        <AnimatePresence mode="wait">
          <motion.div
            key={heading + subheading}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            {/* Desktop Grid */}
            <div className="hidden lg:grid lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-6 space-y-8">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2, duration: 0.4 }}
                  className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-full"
                >
                  <Sparkles className="w-4 h-4 text-blue-600 mr-2" />
                  <span className="text-sm font-medium text-blue-700">Featured Course</span>
                </motion.div>

                <h1 className="text-4xl md:text-5xl font-bold leading-tight bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
                  {heading}
                </h1>

                <p className="text-lg text-gray-600 max-w-xl leading-relaxed">
                  {subheading}
                </p>

                <div className="flex flex-wrap gap-4 pt-4">
                  <motion.a
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    href={courseHref}
                    className="inline-flex items-center px-8 py-4 text-base font-semibold text-white bg-gradient-to-r from-indigo-600 to-blue-600 rounded-xl shadow-lg hover:shadow-xl hover:from-indigo-700 hover:to-blue-700 transition-all duration-300"
                  >
                    <BookOpen className="mr-2 h-5 w-5" />
                    {primaryButtonText}
                  </motion.a>

                  <motion.a
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    href="/courses"
                    className="inline-flex items-center px-8 py-4 text-base font-semibold bg-white text-gray-700 rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:bg-gray-50 transition-all duration-300"
                  >
                    View All Courses
                    <ChevronRight className="ml-2 h-5 w-5" />
                  </motion.a>
                </div>
              </div>

              <div className="lg:col-span-6 flex justify-center relative">
                {image_url ? (
                  <Image
                    src={image_url}
                    alt={heading}
                    width={600}
                    height={600}
                    className="rounded-3xl object-contain drop-shadow-2xl"
                    priority
                  />
                ) : (
                  <div className="w-[600px] h-[600px] bg-gray-200 flex items-center justify-center text-gray-500 rounded-3xl">
                    No Image
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Layout */}
            <div className="lg:hidden flex flex-col items-center text-center space-y-6">
              <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-full">
                <Sparkles className="w-4 h-4 text-blue-600 mr-2" />
                <span className="text-sm font-medium text-blue-700">Featured Course</span>
              </div>

              <h1 className="text-3xl font-bold leading-tight bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
                {heading}
              </h1>

              <p className="text-gray-600 text-base max-w-md">
                {subheading}
              </p>

              {image_url ? (
                <Image
                  src={image_url}
                  alt={heading}
                  width={300}
                  height={300}
                  className="object-contain drop-shadow-xl rounded-2xl"
                  priority
                />
              ) : (
                <div className="w-[300px] h-[300px] bg-gray-200 flex items-center justify-center text-gray-500 rounded-2xl">
                  No Image
                </div>
              )}

              <div className="flex flex-col gap-4 w-full max-w-sm">
                <motion.a
                  whileHover={{ scale: 1.05, boxShadow: "0 20px 25px -5px rgba(79, 70, 229, 0.3)" }}
                  whileTap={{ scale: 0.95 }}
                  href={courseHref}
                  className="inline-flex items-center justify-center px-6 py-3 text-base font-semibold text-white bg-gradient-to-r from-indigo-600 to-blue-600 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <BookOpen className="mr-2 h-5 w-5" />
                  {primaryButtonText}
                </motion.a>

                <motion.a
                  whileHover={{ scale: 1.05, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.05)" }}
                  whileTap={{ scale: 0.95 }}
                  href="/courses"
                  className="inline-flex items-center justify-center px-6 py-3 text-base font-semibold bg-white text-gray-700 rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:bg-gray-50 transition-all duration-300"
                >
                  View All Courses
                  <ChevronRight className="ml-2 h-5 w-5" />
                </motion.a>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {slides.length > 1 && (
        <>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={prevSlide}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-md border border-gray-200 text-gray-700 p-3 rounded-full shadow-md hover:shadow-lg transition-all duration-300 z-20"
          >
            <ChevronLeft className="w-6 h-6" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={nextSlide}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-md border border-gray-200 text-gray-700 p-3 rounded-full shadow-md hover:shadow-lg transition-all duration-300 z-20"
          >
            <ChevronRight className="w-6 h-6" />
          </motion.button>
        </>
      )}

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-2 z-20">
        {slides.map((_, idx) => (
          <motion.button
            key={idx}
            onClick={() => setIndex(idx)}
            whileHover={{ scale: 1.2 }}
            className={`h-2 rounded-full transition-all duration-300 ${
              idx === index ? 'w-6 bg-indigo-600' : 'w-2 bg-gray-300'
            }`}
          />
        ))}
      </div>
    </section>
  );
}
