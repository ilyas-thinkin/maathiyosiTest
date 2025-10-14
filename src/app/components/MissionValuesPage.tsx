'use client';

import React, { useRef, useEffect, useState } from 'react';
import { motion, useAnimation, useInView } from 'framer-motion';
import { BookOpen, Users, Target, Award, Heart, Lightbulb } from 'lucide-react';

interface Stat {
  number: string;
  label: string;
  numericValue: number;
}

interface Value {
  icon: React.ReactElement;
  title: string;
  description: string;
}

const stats: Stat[] = [
  { number: '10,000+', numericValue: 10000, label: 'Students Trained' },
  { number: '100+', numericValue: 50, label: 'Educational Institution' },
  { number: '20k+', numericValue: 100, label: 'Students' },
  { number: '98%', numericValue: 95, label: 'Success Rate' }
];

const values: Value[] = [
  { icon: <Target className="w-8 h-8" />, title: 'Innovation First', description: 'We stay ahead of technology trends to provide cutting-edge education that prepares students for tomorrow.' },
  { icon: <Heart className="w-8 h-8" />, title: 'Student-Centric', description: 'Every decision we make is focused on creating the best learning experience for our students.' },
  { icon: <Award className="w-8 h-8" />, title: 'Excellence', description: 'We maintain the highest standards in course quality, instruction, and student support.' },
  { icon: <Lightbulb className="w-8 h-8" />, title: 'Practical Learning', description: 'Our hands-on approach ensures students gain real-world skills they can apply immediately.' }
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export default function MissionValuesPage() {
  const ref = useRef(null);
  const inView = useInView(ref, { margin: '-50px' });
  const controls = useAnimation();

  useEffect(() => {
    if (inView) controls.start('visible');
  }, [inView, controls]);

  return (
    <div className="bg-white">
      {/* Mission Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-red-50 to-pink-50 px-6 py-3 rounded-full border border-red-100">
              <BookOpen className="w-6 h-6 text-red-600" />
              <span className="text-red-700 font-semibold text-lg">Our Mission</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900">Democratizing Future Skills Education</h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              At Maathiyosi, we believe that every student deserves access to world-class technology education. 
              Our mission is to bridge the gap between traditional learning and the skills needed for tomorrow&apos;s jobs.
            </p>
            <p className="text-lg text-gray-600 leading-relaxed">
              Through innovative teaching methods, hands-on projects, and expert mentorship, we&apos;re preparing students to become the innovators, creators, and problem-solvers of the future.
            </p>
          </motion.div>

          <motion.div
            ref={ref}
            initial="hidden"
            animate={controls}
            variants={fadeUp}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="bg-gradient-to-br from-red-500 to-pink-600 rounded-3xl p-8 text-white">
              <div className="grid grid-cols-2 gap-8">
                {stats.map((stat, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={controls}
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      visible: { opacity: 1, y: 0, transition: { duration: 0.8, delay: index * 0.2 } }
                    }}
                    className="text-center"
                  >
                    <AnimatedStatNumber number={stat.number} delay={index * 0.2} inView={inView} />
                    <div className="text-red-100">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-50 to-purple-50 px-6 py-3 rounded-full mb-8 border border-blue-100">
            <Users className="w-6 h-6 text-blue-600" />
            <span className="text-blue-700 font-semibold text-lg">Our Values</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">What Drives Us Forward</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">Our core values shape everything we do, from course design to student support</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {values.map((value, index) => (
            <motion.div
              key={index}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl flex items-center justify-center text-white mb-6">
                {value.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">{value.title}</h3>
              <p className="text-gray-600 leading-relaxed">{value.description}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}

interface AnimatedStatNumberProps {
  number: string;
  delay: number;
  inView: boolean;
}

const AnimatedStatNumber: React.FC<AnimatedStatNumberProps> = ({ number, delay, inView }) => {
  const [count, setCount] = useState(0);
  const numericValue = parseInt(number.replace(/[^0-9]/g, ''));
  const suffix = number.replace(/[0-9]/g, '');

  useEffect(() => {
    if (!inView) {
      setCount(0);
      return;
    }

    const timer = setTimeout(() => {
      let start = 0;
      const duration = 500;
      const increment = numericValue / (duration / 20);
      const counter = setInterval(() => {
        start += increment;
        if (start >= numericValue) {
          start = numericValue;
          clearInterval(counter);
        }
        setCount(Math.floor(start));
      }, 20);

      return () => clearInterval(counter);
    }, delay * 1000);

    return () => clearTimeout(timer);
  }, [inView, numericValue, delay]);

  return (
    <div className="text-3xl md:text-4xl font-bold mb-2">
      {count.toLocaleString()}
      {suffix}
    </div>
  );
};
