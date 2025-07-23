'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Image, { StaticImageData } from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

import roboticsimg from '../assets/Robotics Class Robo Hand.png';
import iotimg from '../assets/IoT image.png';
import aiimg from '../assets/AI 1.png';

// Define the type for each slide
type Slide = {
  title: string;
  description: string;
  image: 'aiimg-imported' | 'robotics-imported' | 'iotimg-imported';
};

const slides: Slide[] = [
  {
    title: 'AI for Everyone',
    description:
      'Understand artificial intelligence and machine learning with practical and relatable examples.',
    image: 'aiimg-imported',
  },
  {
    title: 'Explore Robotics',
    description:
      'Dive into robotics with hands-on projects and real-world applications.',
    image: 'robotics-imported',
  },
  {
    title: 'Build with IoT',
    description:
      'Learn how to create smart systems using the Internet of Things.',
    image: 'iotimg-imported',
  },
];

export default function HeroCarousel() {
  const [index, setIndex] = useState<number>(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const nextSlide = () => setIndex((prev) => (prev + 1) % slides.length);
  const prevSlide = () =>
    setIndex((prev) => (prev - 1 + slides.length) % slides.length);

  const { title, description, image } = slides[index];

  const getImageSrc = (): StaticImageData => {
    switch (image) {
      case 'robotics-imported':
        return roboticsimg;
      case 'iotimg-imported':
        return iotimg;
      case 'aiimg-imported':
        return aiimg;
      default:
        return aiimg;
    }
  };

  return (
    <section className="relative w-full mx-auto bg-[#f3f4f6] rounded-2xl px-6 md:px-16 lg:px-20 py-10 shadow-md overflow-hidden">
      <div className="grid max-w-screen-xl mx-auto lg:grid-cols-12 gap-8 items-center">
        {/* Text Section */}
        <div className="lg:col-span-7 min-h-[260px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={title + description}
              layout
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              <h1 className="text-4xl md:text-5xl xl:text-6xl font-light text-gray-900">
                {title}
              </h1>
              <p className="text-gray-600 text-lg md:text-xl leading-relaxed">
                {description}
              </p>
              <motion.a
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                href="#"
                className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition"
              >
                Get Started
                <ChevronRight className="ml-2 h-4 w-4" />
              </motion.a>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Image Section */}
        <div className="hidden lg:flex lg:col-span-5">
          <AnimatePresence mode="wait">
            <motion.div
              key={image}
              layout
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ duration: 0.5 }}
            >
              <Image
                src={getImageSrc()}
                alt={title}
                width={500}
                height={500}
                className="object-contain"
                priority
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation Arrows */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={prevSlide}
        className="m-10 absolute left-[-20px] top-1/2 transform -translate-y-1/2 bg-white text-gray-700 rounded-full p-3 shadow hover:bg-gray-200 z-10"
      >
        <ChevronLeft className="w-5 h-5" />
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={nextSlide}
        className="m-10 absolute right-[-20px] top-1/2 transform -translate-y-1/2 bg-white text-gray-700 rounded-full p-3 shadow hover:bg-gray-200 z-10"
      >
        <ChevronRight className="w-5 h-5" />
      </motion.button>
    </section>
  );
}
