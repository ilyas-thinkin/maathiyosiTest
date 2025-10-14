'use client';

import React, { useRef, useEffect } from 'react';
import { motion, useAnimation, useInView } from 'framer-motion';
import { Users, Award } from 'lucide-react';
import Image from 'next/image';

interface TeamMember {
  name: string;
  role: string;
  image: string;
  description: string;
}

const team: TeamMember[] = [
  { name: 'Mohammed Niyamathullah', role: 'Founder & CEO', image: 'https://randomuser.me/api/portraits/men/1.jpg', description: 'Former IIT professor with 15+ years in AI research and education technology.' },
  { name: 'Ilyas Ahamed', role: 'CTO & Lead Engineer', image: 'https://randomuser.me/api/portraits/men/2.jpg', description: 'Expert in educational design with experience at top tech companies.' },
  { name: 'Alwin D Raja', role: 'Manager & Operations', image: 'https://randomuser.me/api/portraits/men/3.jpg', description: 'Robotics engineer with patents in autonomous systems and IoT.' },
  { name: 'None', role: 'Lead Instructor - AI/ML', image: 'https://randomuser.me/api/portraits/men/4.jpg', description: 'Data scientist with expertise in machine learning and neural networks.' }
];

// Animation variants
const cardVariants = {
  hidden: { opacity: 0, y: 50, rotateX: 15, scale: 0.95 },
  visible: { opacity: 1, y: 0, rotateX: 0, scale: 1 }
};

export default function TeamPage() {
  const ref = useRef(null);
  const inView = useInView(ref, { margin: '-50px' });
  const controls = useAnimation();

  useEffect(() => {
    if (inView) {
      controls.start('visible');
    } else {
      controls.start('hidden');
    }
  }, [inView, controls]);

  return (
    <div className="pt-20 px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Section Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-3 rounded-full mb-8 border border-green-100">
            <Users className="w-6 h-6 text-green-600" />
            <span className="text-green-700 font-semibold text-lg">Our Team</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">Meet the Experts Behind Maathiyosi</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">Our passionate team of educators and industry experts are dedicated to your success</p>
        </motion.div>

        {/* Team Grid */}
        <div ref={ref} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {team.map((member, index) => (
            <motion.div
              key={index}
              variants={cardVariants}
              initial="hidden"
              animate={controls}
              transition={{ duration: 0.8, delay: index * 0.15, ease: 'easeOut' }}
              className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 hover:scale-105 text-center"
            >
              <div className="relative mb-6">
                <Image
                  src={member.image}
                  alt={member.name}
                  width={96}
                  height={96}
                  className="rounded-full border-4 border-gray-100 object-cover"
                />
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-br from-red-500 to-pink-600 rounded-full flex items-center justify-center">
                  <Award className="w-4 h-4 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{member.name}</h3>
              <p className="text-red-600 font-semibold mb-4">{member.role}</p>
              <p className="text-gray-600 text-sm leading-relaxed">{member.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
