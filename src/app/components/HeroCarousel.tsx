'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Play, Sparkles } from 'lucide-react';
import Image, { StaticImageData } from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

import roboticsimg from '../assets/Robotics Class Robo Hand.png';
import iotimg from '../assets/IoT image.png';
import aiimg from '../assets/AI 1.png';

type Slide = {
  title: string;
  description: string;
  image: 'aiimg-imported' | 'robotics-imported' | 'iotimg-imported';
  features?: string[];
};

const slides: Slide[] = [
  {
    title: 'AI for Everyone',
    description:
      'Master artificial intelligence and machine learning with hands-on projects and real-world applications.',
    image: 'aiimg-imported',
    features: ['Machine Learning', 'Neural Networks', 'Practical Projects']
  },
  {
    title: 'Explore Robotics',
    description:
      'Build and program robots with cutting-edge technology and innovative problem-solving approaches.',
    image: 'robotics-imported',
    features: ['Robot Programming', 'Sensor Integration', 'Automation']
  },
  {
    title: 'Build with IoT',
    description:
      'Create smart connected devices and learn the fundamentals of the Internet of Things ecosystem.',
    image: 'iotimg-imported',
    features: ['Smart Devices', 'Connectivity', 'Data Analytics']
  },
];

export default function HeroCarousel() {
  const [index, setIndex] = useState<number>(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const nextSlide = () => setIndex((prev) => (prev + 1) % slides.length);
  const prevSlide = () =>
    setIndex((prev) => (prev - 1 + slides.length) % slides.length);

  const { title, description, image, features } = slides[index];

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
    <section className="relative w-full mx-auto bg-gradient-to-br from-white via-gray-50 to-white rounded-3xl px-6 md:px-12 lg:px-16 py-12 md:py-16 shadow-xl overflow-hidden border border-gray-100">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(239,68,68,0.05)_0%,rgba(236,72,153,0.03)_50%,transparent_100%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(59,130,246,0.05)_0%,transparent_50%)]"></div>
      
      <div className="relative z-10 grid max-w-screen-2xl mx-auto lg:grid-cols-12 gap-12 items-center">
        {/* Text Section */}
        <div className="lg:col-span-7 min-h-[320px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={title + description}
              layout
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="space-y-6"
            >
              {/* Badge */}
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
                {title}
              </h1>
              
              <p className="text-gray-600 text-lg md:text-xl leading-relaxed max-w-2xl">
                {description}
              </p>

              {/* Features */}
              {features && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="flex flex-wrap gap-3"
                >
                  {features.map((feature, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700 border border-gray-200"
                    >
                      {feature}
                    </span>
                  ))}
                </motion.div>
              )}

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <motion.a
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  href="#"
                  className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-white bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <Play className="mr-2 h-5 w-5" />
                  Start Learning
                </motion.a>
                
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
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Image Section */}
        <div className="hidden lg:flex lg:col-span-5">
          <AnimatePresence mode="wait">
            <motion.div
              key={image}
              layout
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -50, scale: 0.9 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="relative"
            >
              <div className="relative">
                <Image
                  src={getImageSrc()}
                  alt={title}
                  width={600}
                  height={600}
                  className="object-contain drop-shadow-2xl"
                  priority
                />
                {/* Floating elements */}
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-red-400 to-pink-400 rounded-full blur-xl opacity-30 animate-pulse"></div>
                <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full blur-xl opacity-30 animate-pulse delay-1000"></div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      
      {/* Navigation Arrows */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={prevSlide}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 backdrop-blur-sm text-gray-700 rounded-full p-3 shadow-lg hover:bg-white hover:shadow-xl transition-all duration-200 border border-gray-200"
      >
        <ChevronLeft className="w-6 h-6" />
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={nextSlide}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 backdrop-blur-sm text-gray-700 rounded-full p-3 shadow-lg hover:bg-white hover:shadow-xl transition-all duration-200 border border-gray-200"
      >
        <ChevronRight className="w-6 h-6" />
      </motion.button>

      {/* Progress Indicators */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setIndex(idx)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              idx === index
                ? 'w-8 bg-gradient-to-r from-red-600 to-pink-600'
                : 'bg-gray-300 hover:bg-gray-400'
            }`}
          />
        ))}
      </div>
    </section>
  );
}