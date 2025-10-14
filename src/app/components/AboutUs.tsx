'use client';

import React, { useRef, useEffect } from 'react';
import { motion, useAnimation, useInView } from 'framer-motion';

export default function AboutPage() {
  const ref = useRef(null);
  const inView = useInView(ref, { margin: '-100px' });
  const controls = useAnimation();

  useEffect(() => {
    if (inView) controls.start('visible');
    else controls.start('hidden');
  }, [inView, controls]);

  const animationVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1 }
  };

  return (
    <div className="bg-gradient-to-br from-white via-gray-50 to-white">
      <section ref={ref} className="relative py-20 px-6">
        <motion.div
          initial="hidden"
          animate={controls}
          variants={animationVariants}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="max-w-3xl mx-auto text-center space-y-6"
        >
          <h1 className="text-5xl md:text-6xl font-bold text-red-600">
            About Maathiyosi
          </h1>
          <p className="text-lg md:text-xl text-gray-600">
            Empowering the next generation with cutting-edge technology education. 
            We&apos;re building the future, one student at a time.
          </p>
        </motion.div>
      </section>
    </div>
  );
}
