'use client';

import { useState } from 'react';
import { supabase } from '../lib/supabaseClient'; // Adjust the import path as needed

export default function VideoUploader() {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');

  const handleUpload = async () => {
    if (!videoFile) return;
    setUploading(true);

    const fileName = `${Date.now()}-${videoFile.name}`;

    const { data, error } = await supabase.storage
      .from('course-videos') // ✅ Use your existing bucket name
      .upload(fileName, videoFile);

    if (error) {
      console.error('Upload error:', error);
    } else {
      const { data: publicUrlData } = supabase.storage
        .from('course-videos')
        .getPublicUrl(fileName);

      setVideoUrl(publicUrlData.publicUrl);
    }

    setUploading(false);
  };

  return (
    <div className="space-y-4">
      <input
        type="file"
        accept="video/*"
        onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
      />
      <button
        onClick={handleUpload}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        disabled={uploading}
      >
        {uploading ? 'Uploading...' : 'Upload Video'}
      </button>

      {videoUrl && (
        <div>
          <p className="text-green-600">Uploaded!</p>
          <video src={videoUrl} controls className="w-full mt-2" />
        </div>
      )}
    </div>
  );
}
