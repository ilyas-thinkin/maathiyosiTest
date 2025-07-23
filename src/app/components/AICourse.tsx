'use client';

import CoursePage from './CoursePage';

export default function AIcourse() {
  return (
    <CoursePage
      title="AI Fundamentals for Beginners"
      description="A complete beginner-friendly course on Artificial Intelligence — covering real-world concepts, applications, and tools. Designed for students, enthusiasts, and professionals alike."
      instructor="Dr. Karthik M"
      coverImage="/images/ai-banner.png"
      videos={[
        {
          title: 'Lesson 1: What is Artificial Intelligence?',
          url: 'https://www.youtube.com/embed/2ePf9rue1Ao',
        },
        {
          title: 'Lesson 2: Machine Learning Basics',
          url: 'https://www.youtube.com/embed/GwIo3gDZCVQ',
        },
        {
          title: 'Lesson 3: Deep Learning Explained',
          url: 'https://www.youtube.com/embed/aircAruvnKk',
        },
        {
          title: 'Lesson 4: Supervised vs Unsupervised Learning',
          url: 'https://www.youtube.com/embed/3CcLx6oOz3g',
        },
        {
          title: 'Lesson 5: Neural Networks Overview',
          url: 'https://www.youtube.com/embed/5u0jaA3qAGk',
        },
        {
          title: 'Lesson 6: AI in Daily Life',
          url: 'https://www.youtube.com/embed/AdHZ0I0YxCk',
        },
        {
          title: 'Lesson 7: Natural Language Processing',
          url: 'https://www.youtube.com/embed/fOvTtapxa9c',
        },
        {
          title: 'Lesson 8: Computer Vision Basics',
          url: 'https://www.youtube.com/embed/MnT1xgZgkpk',
        },
        {
          title: 'Lesson 9: AI vs Human Intelligence',
          url: 'https://www.youtube.com/embed/tCDzG0zE3Hk',
        },
        {
          title: 'Lesson 10: The Future of AI',
          url: 'https://www.youtube.com/embed/s0UeA3g0z8A',
        },
      ]}
      documents={[
        {
          name: 'AI Course Notes PDF',
          url: '/docs/ai-course-notes.pdf',
        },
        {
          name: 'Beginner Guide to AI',
          url: '/docs/ai-guide.pdf',
        },
      ]}
      curriculum={[
        { title: 'What is Artificial Intelligence?', duration: '10 mins' },
        { title: 'Machine Learning Basics', duration: '15 mins' },
        { title: 'Deep Learning Explained', duration: '18 mins' },
        { title: 'Supervised vs Unsupervised Learning', duration: '12 mins' },
        { title: 'Neural Networks Overview', duration: '14 mins' },
        { title: 'AI in Daily Life', duration: '9 mins' },
        { title: 'Natural Language Processing', duration: '16 mins' },
        { title: 'Computer Vision Basics', duration: '11 mins' },
        { title: 'AI vs Human Intelligence', duration: '8 mins' },
        { title: 'The Future of AI', duration: '10 mins' },
      ]}
    />
  );
}
