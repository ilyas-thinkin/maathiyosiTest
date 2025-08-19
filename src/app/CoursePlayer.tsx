"use client";

import React, { useState } from "react";

type Lesson = {
  id: string;
  title: string;
  video_url?: string;
  document_url?: string;
};

interface CoursePlayerProps {
  courseId: string;
  lessons: Lesson[];
}

export const CoursePlayer: React.FC<CoursePlayerProps> = ({ courseId, lessons }) => {
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);

  const currentLesson = lessons[currentLessonIndex];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {/* Video / Lesson Content */}
      <div className="md:col-span-3 bg-white shadow rounded-xl p-4">
        <h2 className="text-xl font-bold mb-3">{currentLesson.title}</h2>

        {/* Video */}
        {currentLesson.video_url ? (
          <div className="aspect-video mb-4">
            <iframe
              src={currentLesson.video_url}
              title={currentLesson.title}
              className="w-full h-full rounded-lg"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : (
          <p className="text-gray-500 italic">No video available for this lesson.</p>
        )}

        {/* Document */}
        {currentLesson.document_url && (
          <a
            href={currentLesson.document_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-rose-600 text-white px-4 py-2 rounded-lg hover:bg-rose-700 transition"
          >
            View Lesson Document
          </a>
        )}
      </div>

      {/* Lesson List / Sidebar */}
      <div className="bg-gray-50 rounded-xl shadow p-4 h-fit">
        <h3 className="font-semibold text-gray-700 mb-3">Lessons</h3>
        <ul className="space-y-2">
          {lessons.map((lesson, index) => (
            <li key={lesson.id}>
              <button
                onClick={() => setCurrentLessonIndex(index)}
                className={`w-full text-left px-3 py-2 rounded-lg transition ${
                  index === currentLessonIndex
                    ? "bg-rose-600 text-white"
                    : "bg-white hover:bg-gray-100"
                }`}
              >
                {lesson.title}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
