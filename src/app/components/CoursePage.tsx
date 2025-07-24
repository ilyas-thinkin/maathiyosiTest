'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import Image from 'next/image';

interface Video {
  title: string;
  url: string;
}

interface Document {
  name: string;
  url: string;
}

interface Lesson {
  title: string;
  duration: string;
}

interface CoursePageProps {
  title: string;
  description: string;
  instructor: string;
  coverImage: string;
  videos: Video[];
  documents: Document[];
  curriculum: Lesson[];
}

export default function CoursePage({
  title,
  description,
  instructor,
  coverImage,
  videos,
  documents,
  curriculum,
}: CoursePageProps) {
  const [activeTab, setActiveTab] = useState('videos');

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 grid md:grid-cols-12 gap-10">
      {/* Left: Course Content */}
      <div className="md:col-span-8 space-y-10">
        <div className="space-y-4">
          <h1 className="text-4xl font-semibold text-gray-900">{title}</h1>
          <p className="text-gray-700 text-lg">{description}</p>
          <p className="text-sm text-gray-500">Instructor: {instructor}</p>
          <Image
            src={coverImage}
            alt="Course Cover"
            width={800}
            height={400}
            className="rounded-xl object-cover w-full h-[300px]"
          />
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex gap-6 text-gray-700 font-medium">
            {['videos', 'documents', 'structure'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-2 ${
                  activeTab === tab
                    ? 'border-b-2 border-red-500 text-red-600'
                    : 'hover:text-red-500'
                } capitalize`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'videos' && (
          <div className="space-y-6">
            {videos.map((video, i) => (
              <div key={i} className="space-y-2">
                <h3 className="text-lg font-medium">{video.title}</h3>
                <video
                  controls
                  className="w-full rounded-lg shadow-md"
                  height={400}
                >
                  <source src={video.url} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'documents' && (
          <ul className="list-disc pl-6 space-y-3">
            {documents.map((doc, i) => (
              <li key={i}>
                <a
                  href={doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  📄 {doc.name}
                </a>
              </li>
            ))}
          </ul>
        )}

        {activeTab === 'structure' && (
          <div className="space-y-4">
            {curriculum.map((lesson, i) => (
              <details
                key={i}
                className="bg-gray-100 rounded-lg px-4 py-3 cursor-pointer"
              >
                <summary className="flex justify-between items-center font-medium text-gray-800">
                  {lesson.title}
                  <ChevronDown className="w-4 h-4" />
                </summary>
                <p className="text-sm text-gray-600 mt-2">Duration: {lesson.duration}</p>
              </details>
            ))}
          </div>
        )}
      </div>

      {/* Right Sidebar */}
      <aside className="md:col-span-4 space-y-6">
        <div className="bg-white rounded-xl shadow p-6 border">
          <h3 className="text-xl font-semibold mb-4">Enroll This Course</h3>
          <button className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 rounded-lg transition cursor-pointer">
            Enroll Now
          </button>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-700 space-y-2">
          <p>📦 Lifetime Access</p>
          <p>🌐 Online Learning</p>
          <p>📄 Downloadable Resources</p>
          <p>💬 Community Support</p>
        </div>
      </aside>
    </div>
  );
}
