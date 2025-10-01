"use client";

import { motion } from "framer-motion";

export default function AboutUs() {
  return (
    <div className="bg-white text-gray-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-[#de5252] text-white py-20">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-5xl mx-auto px-6 text-center"
        >
          <h1 className="text-5xl font-bold mb-6">About Maathiyosi</h1>
          <p className="text-lg leading-relaxed max-w-3xl mx-auto">
            Empowering the next generation with cutting-edge technology education. 
            We're building the future, one student at a time.
          </p>
        </motion.div>

        {/* Animated Background Circles */}
        <motion.div
          animate={{ y: [0, 20, 0] }}
          transition={{ repeat: Infinity, duration: 6 }}
          className="absolute -top-16 -left-16 w-48 h-48 bg-white/20 rounded-full blur-2xl"
        />
        <motion.div
          animate={{ y: [0, -20, 0] }}
          transition={{ repeat: Infinity, duration: 8 }}
          className="absolute -bottom-20 -right-20 w-72 h-72 bg-white/10 rounded-full blur-3xl"
        />
      </section>

      {/* Mission Section */}
      <section className="py-20 max-w-6xl mx-auto px-6 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-4xl font-bold text-[#de5252] mb-6"
        >
          Our Mission
        </motion.h2>
        <p className="text-lg text-gray-700 max-w-4xl mx-auto leading-relaxed">
          At Maathiyosi, we believe that every student deserves access to 
          world-class technology education. Our mission is to bridge the 
          gap between traditional learning and the skills needed for tomorrow's jobs.
          <br /><br />
          Through innovative teaching methods, hands-on projects, and expert mentorship, 
          we're preparing students to become the innovators, creators, and 
          problem-solvers of the future.
        </p>
      </section>

      {/* Stats Section */}
      <section className="bg-gray-50 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto px-6 text-center">
          {[
            { number: "10,000+", label: "Students Enrolled" },
            { number: "50+", label: "Expert Instructors" },
            { number: "100+", label: "Courses Available" },
            { number: "95%", label: "Success Rate" },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: i * 0.2 }}
              className="bg-white rounded-2xl shadow-md p-8 hover:shadow-xl transition"
            >
              <h3 className="text-3xl font-bold text-[#de5252]">{stat.number}</h3>
              <p className="text-gray-600 mt-2">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 max-w-6xl mx-auto px-6">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-4xl font-bold text-center text-[#de5252] mb-12"
        >
          Our Values
        </motion.h2>

        <div className="grid md:grid-cols-2 gap-10">
          {[
            {
              title: "Innovation First",
              desc: "We stay ahead of technology trends to provide cutting-edge education that prepares students for tomorrow.",
            },
            {
              title: "Student-Centric",
              desc: "Every decision we make is focused on creating the best learning experience for our students.",
            },
            {
              title: "Excellence",
              desc: "We maintain the highest standards in course quality, instruction, and student support.",
            },
            {
              title: "Practical Learning",
              desc: "Our hands-on approach ensures students gain real-world skills they can apply immediately.",
            },
          ].map((value, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: i % 2 === 0 ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: i * 0.2 }}
              className="bg-white p-8 rounded-2xl shadow-md border-l-4 border-[#de5252] hover:shadow-xl transition"
            >
              <h3 className="text-2xl font-semibold text-[#de5252] mb-4">{value.title}</h3>
              <p className="text-gray-700">{value.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
