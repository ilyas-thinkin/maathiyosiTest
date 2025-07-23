// app/admin/add-course/page.tsx
'use client';

import { useState } from 'react';

export default function AddCoursePage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [videoUrls, setVideoUrls] = useState(['']);
  const [category, setCategory] = useState('AI');

  const handleAddVideoField = () => setVideoUrls([...videoUrls, '']);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const course = {
      title,
      description,
      videos: videoUrls,
      category,
    };

    // 👉 Save logic (e.g., POST to API route, or save to JSON)
    console.log('Submitting course:', course);
    alert('Course added! (Simulated)');
  };

  return (
    <div className="p-10 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Add New Course</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium">Course Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full mt-1 p-2 border rounded"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full mt-1 p-2 border rounded"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full mt-1 p-2 border rounded"
          >
            <option value="AI">AI</option>
            <option value="Robotics">Robotics</option>
            <option value="IoT">IoT</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium">YouTube Video Links</label>
          {videoUrls.map((url, index) => (
            <input
              key={index}
              value={url}
              onChange={(e) => {
                const newUrls = [...videoUrls];
                newUrls[index] = e.target.value;
                setVideoUrls(newUrls);
              }}
              className="w-full mt-2 p-2 border rounded"
              placeholder={`Lesson ${index + 1} URL`}
            />
          ))}
          <button
            type="button"
            onClick={handleAddVideoField}
            className="text-blue-600 mt-2 hover:underline"
          >
            + Add Another Video
          </button>
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
        >
          Save Course
        </button>
      </form>
    </div>
  );
}
