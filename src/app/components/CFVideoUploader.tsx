"use client";

import React, { useState, ChangeEvent } from "react";
import { CloudflareDirectUploadResponse } from "../../types/video";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

interface VideoUploaderProps {
  courseId: string;
  onUploadComplete?: (videoUid: string) => void;
}

const VideoUploader: React.FC<VideoUploaderProps> = ({ courseId, onUploadComplete }) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [videoUID, setVideoUID] = useState<string | null>(null);

  const supabase = createClientComponentClient();

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file first.");
      return;
    }

    setUploading(true);
    setProgress(0);

    try {
      // Step 1: Get Cloudflare direct upload URL
      const res = await fetch("/api/cloudflare/direct-upload", {
        method: "POST",
      });

      if (!res.ok) {
        throw new Error("Failed to get Cloudflare direct upload URL");
      }

      const data: CloudflareDirectUploadResponse = await res.json();

      // Step 2: Upload video directly to Cloudflare
      const upload = await fetch(data.uploadURL, {
        method: "PUT",
        body: file,
      });

      if (!upload.ok) {
        throw new Error("Upload to Cloudflare failed");
      }

      setVideoUID(data.uid);

      // Step 3: Save metadata to Supabase
      const { error } = await supabase.from("course_lessons").insert([
        {
          course_id: courseId,
          title: file.name,
          video_uid: data.uid,
        },
      ]);

      if (error) {
        console.error("Supabase insert error:", error);
        alert("Upload successful, but saving to database failed!");
      } else {
        alert("Video uploaded and saved successfully!");
      }

      // Callback if parent needs to know
      if (onUploadComplete) {
        onUploadComplete(data.uid);
      }
    } catch (error) {
      console.error(error);
      alert("Error uploading video");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-6 border rounded-lg shadow-md max-w-md">
      <h2 className="text-lg font-bold mb-4">Upload Video</h2>
      <input
        type="file"
        onChange={handleFileChange}
        className="mb-4 block w-full text-sm"
        accept="video/*"
      />
      <button
        onClick={handleUpload}
        disabled={uploading}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
      >
        {uploading ? "Uploading..." : "Upload"}
      </button>

      {progress > 0 && uploading && (
        <div className="mt-3 w-full bg-gray-200 rounded">
          <div
            className="bg-green-500 text-xs text-white text-center rounded"
            style={{ width: `${progress}%` }}
          >
            {progress}%
          </div>
        </div>
      )}

      {videoUID && (
        <div className="mt-4 p-3 bg-green-100 rounded">
          <p className="text-sm">Video uploaded successfully!</p>
          <p className="font-mono text-xs">UID: {videoUID}</p>
          <iframe
            src={`https://iframe.videodelivery.net/${videoUID}`}
            className="w-full h-64 mt-2 rounded"
            allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
            allowFullScreen
          />
        </div>
      )}
    </div>
  );
};

export default VideoUploader;
