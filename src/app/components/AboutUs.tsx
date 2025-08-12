'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Users, Target, Award, Heart, BookOpen, Lightbulb } from 'lucide-react';
import Image from 'next/image';

interface Stat {
  number: string;
  label: string;
}

interface Value {
  icon: React.ReactElement;
  title: string;
  description: string;
}

interface TeamMember {
  name: string;
  role: string;
  image: string;
  description: string;
}

export default function AboutUs() {
  const stats: Stat[] = [
    { number: '10,000+', label: 'Students Enrolled' },
    { number: '50+', label: 'Expert Instructors' },
    { number: '100+', label: 'Courses Available' },
    { number: '95%', label: 'Success Rate' }
  ];

  const values: Value[] = [
    {
      icon: <Target className="w-8 h-8" />,
      title: 'Innovation First',
      description:
        'We stay ahead of technology trends to provide cutting-edge education that prepares students for tomorrow.'
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: 'Student-Centric',
      description:
        'Every decision we make is focused on creating the best learning experience for our students.'
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: 'Excellence',
      description:
        'We maintain the highest standards in course quality, instruction, and student support.'
    },
    {
      icon: <Lightbulb className="w-8 h-8" />,
      title: 'Practical Learning',
      description:
        'Our hands-on approach ensures students gain real-world skills they can apply immediately.'
    }
  ];

  const team: TeamMember[] = [
    {
      name: 'Mohammed Niyamathullah',
      role: 'Founder & CEO',
      image: 'https://randomuser.me/api/portraits/men/1.jpg',
      description:
        'Former IIT professor with 15+ years in AI research and education technology.'
    },
    {
      name: 'Ilyas Ahamed',
      role: 'CTO & Lead Engineer',
      image: 'https://randomuser.me/api/portraits/men/2.jpg',
      description:
        'Expert in educational design with experience at top tech companies.'
    },
    {
      name: 'Alwin D Raja',
      role: 'Manager & Operations',
      image: 'https://randomuser.me/api/portraits/men/3.jpg',
      description:
        'Robotics engineer with patents in autonomous systems and IoT.'
    },
    {
      name: 'None',
      role: 'Lead Instructor - AI/ML',
      image: 'https://randomuser.me/api/portraits/men/4.jpg',
      description:
        'Data scientist with expertise in machine learning and neural networks.'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-white">
      {/* Hero Section */}
      <section className="relative py-20 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(239,68,68,0.1)_0%,transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(59,130,246,0.1)_0%,transparent_50%)]" />

        <div className="relative z-10 max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
                About Maathiyosi
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Empowering the next generation with cutting-edge technology education.
              We&apos;re building the future, one student at a time.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-red-50 to-pink-50 px-6 py-3 rounded-full border border-red-100">
              <BookOpen className="w-6 h-6 text-red-600" />
              <span className="text-red-700 font-semibold text-lg">Our Mission</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
              Democratizing Future Skills Education
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              At Maathiyosi, we believe that every student deserves access to world-class technology education. 
              Our mission is to bridge the gap between traditional learning and the skills needed for tomorrow&apos;s jobs.
            </p>
            <p className="text-lg text-gray-600 leading-relaxed">
              Through innovative teaching methods, hands-on projects, and expert mentorship, we&apos;re preparing
              students to become the innovators, creators, and problem-solvers of the future.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="bg-gradient-to-br from-red-500 to-pink-600 rounded-3xl p-8 text-white">
              <div className="grid grid-cols-2 gap-8">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-3xl md:text-4xl font-bold mb-2">{stat.number}</div>
                    <div className="text-red-100">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full blur-xl opacity-30" />
          </motion.div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-50 to-purple-50 px-6 py-3 rounded-full mb-8 border border-blue-100">
              <Users className="w-6 h-6 text-blue-600" />
              <span className="text-blue-700 font-semibold text-lg">Our Values</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">What Drives Us Forward</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our core values shape everything we do, from course design to student support
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl flex items-center justify-center text-white mb-6">
                  {value.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{value.title}</h3>
                <p className="text-gray-600 leading-relaxed">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-3 rounded-full mb-8 border border-green-100">
              <Users className="w-6 h-6 text-green-600" />
              <span className="text-green-700 font-semibold text-lg">Our Team</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">Meet the Experts Behind Maathiyosi</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our passionate team of educators and industry experts are dedicated to your success
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 text-center"
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
      </section>
    </div>
  );
}