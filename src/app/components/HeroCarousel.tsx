'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Play, Sparkles } from 'lucide-react';
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
  const { data, error } = await supabase
    .from('hero_slides') // <-- updated
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching hero slides:', error.message);
  } else {
    setSlides(data as Slide[]);
  }
};


  const nextSlide = () => setIndex((prev) => (prev + 1) % slides.length);
  const prevSlide = () =>
    setIndex((prev) => (prev - 1 + slides.length) % slides.length);

  if (slides.length === 0) {
    return null; // Or a loading spinner
  }

  const { heading, subheading, image_url, button_text, linked_course_id } =
    slides[index];

  return (
    <section className="relative w-full mx-auto bg-gradient-to-br from-white via-gray-50 to-white rounded-3xl px-6 md:px-12 lg:px-16 py-12 md:py-16 shadow-xl overflow-hidden border border-gray-100">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(239,68,68,0.05)_0%,rgba(236,72,153,0.03)_50%,transparent_100%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(59,130,246,0.05)_0%,transparent_50%)]"></div>
      
      <div className="relative z-10 max-w-screen-2xl mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={heading + subheading}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            {/* Mobile/Tablet Layout: Image first, then content */}
            <div className="lg:hidden">
              {/* Image Section - Mobile/Tablet */}
              <div className="flex justify-center mb-8">
                <motion.div
                  key={image_url || 'placeholder'}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="relative w-full max-w-sm md:max-w-md"
                >
                  {image_url ? (
                    <Image
                      src={image_url}
                      alt={heading}
                      width={400}
                      height={400}
                      className="object-contain drop-shadow-2xl w-full h-auto"
                      priority
                    />
                  ) : (
                    <div className="w-full aspect-square bg-gray-200 flex items-center justify-center text-gray-500 rounded-2xl">
                      No Image
                    </div>
                  )}
                  {/* Floating elements for mobile */}
                  <div className="absolute -top-2 -right-2 w-12 h-12 bg-gradient-to-br from-red-400 to-pink-400 rounded-full blur-xl opacity-30 animate-pulse"></div>
                  <div className="absolute -bottom-2 -left-2 w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full blur-xl opacity-30 animate-pulse delay-1000"></div>
                </motion.div>
              </div>

              {/* Content Section - Mobile/Tablet */}
              <div className="text-center space-y-6">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2, duration: 0.4 }}
                  className="inline-flex items-center space-x-2 bg-gradient-to-r from-red-50 to-pink-50 px-4 py-2 rounded-full border border-red-100"
                >
                  <Sparkles className="w-4 h-4 text-red-600" />
                  <span className="text-sm font-medium text-red-700">Featured Course</span>
                </motion.div>

                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent leading-tight">
                  {heading}
                </h1>
                
                <p className="text-gray-600 text-base md:text-lg leading-relaxed max-w-2xl mx-auto">
                  {subheading}
                </p>

                <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center">
                  {linked_course_id && (
                    <motion.a
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      href={`/courses/${linked_course_id}`}
                      className="inline-flex items-center justify-center px-6 py-3 text-base font-semibold text-white bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      <Play className="mr-2 h-4 w-4" />
                      {button_text || 'Start Learning'}
                    </motion.a>
                  )}
                  
                  <motion.a
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    href="/courses"
                    className="inline-flex items-center justify-center px-6 py-3 text-base font-semibold text-gray-700 bg-white hover:bg-gray-50 rounded-xl transition-all duration-200 border border-gray-300 hover:border-gray-400"
                  >
                    View All Courses
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </motion.a>
                </div>
              </div>
            </div>

            {/* Desktop Layout: Side by side */}
            <div className="hidden lg:grid lg:grid-cols-12 gap-12 items-center">
              {/* Text Section - Desktop */}
              <div className="lg:col-span-7 min-h-[320px]">
                <div className="space-y-6">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2, duration: 0.4 }}
                    className="inline-flex items-center space-x-2 bg-gradient-to-r from-red-50 to-pink-50 px-4 py-2 rounded-full border border-red-100"
                  >
                    <Sparkles className="w-4 h-4 text-red-600" />
                    <span className="text-sm font-medium text-red-700">Featured Course</span>
                  </motion.div>

                  <h1 className="text-4xl md:text-5xl xl:text-6xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent leading-tight">
                    {heading}
                  </h1>
                  
                  <p className="text-gray-600 text-lg md:text-xl leading-relaxed max-w-2xl">
                    {subheading}
                  </p>

                  <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    {linked_course_id && (
                      <motion.a
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        href={`/courses/${linked_course_id}`}
                        className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-white bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
                      >
                        <Play className="mr-2 h-5 w-5" />
                        {button_text || 'Start Learning'}
                      </motion.a>
                    )}
                    
                    <motion.a
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      href="/courses"
                      className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-gray-700 bg-white hover:bg-gray-50 rounded-xl transition-all duration-200 border border-gray-300 hover:border-gray-400"
                    >
                      View All Courses
                      <ChevronRight className="ml-2 h-5 w-5" />
                    </motion.a>
                  </div>
                </div>
              </div>

              {/* Image Section - Desktop */}
              <div className="lg:col-span-5">
                <motion.div
                  key={image_url || 'placeholder'}
                  initial={{ opacity: 0, x: 50, scale: 0.9 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -50, scale: 0.9 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="relative"
                >
                  {image_url ? (
                    <Image
                      src={image_url}
                      alt={heading}
                      width={600}
                      height={600}
                      className="object-contain drop-shadow-2xl"
                      priority
                    />
                  ) : (
                    <div className="w-[600px] h-[600px] bg-gray-200 flex items-center justify-center text-gray-500 rounded-2xl">
                      No Image
                    </div>
                  )}
                  {/* Floating elements for desktop */}
                  <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-red-400 to-pink-400 rounded-full blur-xl opacity-30 animate-pulse"></div>
                  <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full blur-xl opacity-30 animate-pulse delay-1000"></div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Arrows */}
      {slides.length > 1 && (
        <>
          {/* LEFT ARROW */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={prevSlide}
              className="absolute left-2 top-1/2 -translate-x-1 -translate-y-1/2
                        bg-white/90 backdrop-blur-sm text-gray-700 rounded-full
                        p-2 md:p-3 shadow-lg hover:bg-white hover:shadow-xl
                        transition-all duration-200 border border-gray-200 z-20"
            >
              <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
            </motion.button>

            {/* RIGHT ARROW */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={nextSlide}
              className="absolute right-2 top-1/2 translate-x-1 -translate-y-1/2
                        bg-white/90 backdrop-blur-sm text-gray-700 rounded-full
                        p-2 md:p-3 shadow-lg hover:bg-white hover:shadow-xl
                        transition-all duration-200 border border-gray-200 z-20"
            >
              <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
            </motion.button>
        </>
      )}

      {/* Progress Indicators */}
      <div className="absolute bottom-4 md:bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setIndex(idx)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              idx === index
                ? 'w-6 md:w-8 bg-gradient-to-r from-red-600 to-pink-600'
                : 'bg-gray-300 hover:bg-gray-400'
            }`}
          />
        ))}
      </div>
    </section>
  );
}