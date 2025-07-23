'use client';

import Card from './Card';

const courseData = [
  {
    title: 'AI Fundamentals',
    description: 'Intro to AI concepts and tools',
    price: '₹499',
    badge: 'Popular',
    imageBg: '#7c3aed',
  },
  {
    title: 'Robotics Starter',
    description: 'Build your first robot',
    price: '₹799',
    badge: 'NEW',
    imageBg: '#8b5cf6',
  },
  {
    title: '3D Design',
    description: 'Learn to create in 3D',
    price: '₹599',
    badge: 'Top Rated',
    imageBg: '#a78bfa',
  },
  {
    title: 'Python for Kids',
    description: 'Programming made easy',
    price: '₹399',
    badge: 'Trending',
    imageBg: '#6366f1',
  },
];

const CourseSection = () => {
  return (
    <section className="w-full px-4 md:px-12 py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-semibold text-slate-800 mb-10 text-center">
          Explore Our Courses
        </h2>
        <div className="grid gap-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 place-items-center">
          {courseData.map((course, idx) => (
            <Card key={idx} {...course} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default CourseSection;