'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "./lib/supabaseClient";
import { motion } from "framer-motion";
import { Clock, Star, Users, BookOpen, ArrowRight } from "lucide-react";

type Course = {
  id: string;
  title: string;
  description: string;
  category: string;
  thumbnail_url: string;
  topics: string[];
  created_at: string;
  price: number;
  updated_at: string;
};

export default function HomePageCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRandomCourses = async () => {
      try {
        // First, get all courses
        const { data: allCourses, error } = await supabase
          .from("courses")
          .select("*");

        if (error) {
          console.error("Error fetching courses:", error.message);
          return;
        }

        // Shuffle the array and take first 4 courses
        const shuffled = [...(allCourses as Course[])].sort(() => 0.5 - Math.random());
        const randomCourses = shuffled.slice(0, 4);

        setCourses(randomCourses);
      } catch (error) {
        console.error("Unexpected error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRandomCourses();
  }, []);

  if (loading) {
    return (
      <section className="py-20 px-6 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center space-x-2 bg-red-50 px-4 py-2 rounded-full mb-6">
              <BookOpen className="w-5 h-5 text-red-600 animate-pulse" />
              <span className="text-red-700 font-semibold">Loading Courses</span>
            </div>
            <h2 className="text-4xl font-bold mb-4 text-gray-900">Featured Courses</h2>
            <p className="text-gray-600 text-lg">Discovering amazing learning opportunities...</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-gray-200 h-48 rounded-xl mb-4"></div>
                <div className="bg-gray-200 h-6 rounded mb-2"></div>
                <div className="bg-gray-200 h-4 rounded mb-2"></div>
                <div className="bg-gray-200 h-4 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 px-6 bg-gradient-to-b from-white to-gray-50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(239,68,68,0.03)_0%,transparent_50%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(59,130,246,0.03)_0%,transparent_50%)]"></div>
      
      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-red-50 to-pink-50 px-6 py-3 rounded-full mb-8 border border-red-100">
            <BookOpen className="w-6 h-6 text-red-600" />
            <span className="text-red-700 font-semibold text-lg">Featured Courses</span>
          </div>
          <h2 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
              Discover Our Courses
            </span>
          </h2>
          <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            Explore our handpicked selection of courses designed to accelerate your learning journey and boost your career
          </p>
        </motion.div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {courses.map((course, index) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: index * 0.15 }}
              className="group"
            >
              <Link href={`/courses/${course.id}`}>
                <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 overflow-hidden border border-gray-100 h-full flex flex-col">
                  {/* Course Image */}
                  <div className="relative h-52 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                    <img
                      src={course.thumbnail_url || '/placeholder-course.jpg'}
                      alt={course.title}
                      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                    
                    {/* Badge */}
                    <div className="absolute top-4 left-4">
                      <span className="bg-gradient-to-r from-red-600 to-pink-600 text-white px-4 py-2 rounded-full text-xs font-bold shadow-lg">
                        FEATURED
                      </span>
                    </div>

                    {/* Category */}
                    <div className="absolute bottom-4 left-4">
                      <span className="bg-white/95 backdrop-blur-sm text-gray-800 px-3 py-1.5 rounded-full text-xs font-semibold shadow-md border border-white/50">
                        {course.category || 'Technology'}
                      </span>
                    </div>

                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-red-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>

                  {/* Course Content */}
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-red-600 transition-colors duration-300 leading-tight">
                        {course.title}
                      </h3>
                      
                      <p className="text-gray-600 mb-6 line-clamp-3 leading-relaxed text-base">
                        {course.description}
                      </p>

                      {/* Course Stats */}
                      <div className="flex items-center justify-between text-sm text-gray-500 mb-6">
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4 text-red-500" />
                          <span className="font-medium">Self-paced</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span className="font-medium">4.8</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Users className="w-4 h-4 text-blue-500" />
                          <span className="font-medium">2.5k+</span>
                        </div>
                      </div>
                    </div>

                    {/* Course Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="text-2xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
                        ₹{course.price?.toLocaleString() || '999'}
                      </div>
                      <button className="bg-gradient-to-r from-red-600 to-pink-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:from-red-700 hover:to-pink-700 transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center space-x-2">
                        <span>Enroll Now</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-center mt-20"
        >
          <Link
            href="/courses"
            className="inline-flex items-center space-x-3 bg-gradient-to-r from-red-600 to-pink-600 text-white px-8 py-4 rounded-xl font-bold hover:from-red-700 hover:to-pink-700 transition-all duration-200 transform hover:scale-105 shadow-2xl text-lg"
          >
            <span>Explore All Courses</span>
            <BookOpen className="w-6 h-6" />
          </Link>
          <p className="text-gray-500 mt-4 text-base">
            Discover 50+ courses across various technologies
          </p>
        </motion.div>
      </div>
    </section>
  );
}