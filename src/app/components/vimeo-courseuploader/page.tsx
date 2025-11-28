"use client";

import { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Plus, X, GripVertical, FileVideo, FileText, Image as ImageIcon, CheckCircle, Loader2 } from "lucide-react";

type UploadProgress = {
  stage: string;
  currentItem: number;
  totalItems: number;
  currentItemName: string;
  percentage: number;
};

export default function VimeoCourseUploader() {
  const [courseTitle, setCourseTitle] = useState("");
  const [courseDesc, setCourseDesc] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");

  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [thumbnailUrl, setThumbnailUrl] = useState("");

  const [lessons, setLessons] = useState<
    { title: string; description: string; videoFile: File | null; docFile: File | null; playbackUrl: string }[]
  >([]);

  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);

  /** Add new lesson */
  const addLesson = () => {
    setLessons([
      ...lessons,
      { title: "", description: "", videoFile: null, docFile: null, playbackUrl: "" },
    ]);
  };

  /** Delete lesson */
  const deleteLesson = (index: number) => {
    const updated = [...lessons];
    updated.splice(index, 1);
    setLessons(updated);
  };

  /** Handle input changes */
  const handleLessonChange = (index: number, field: string, value: any) => {
    const updated = [...lessons];
    (updated[index] as any)[field] = value;
    setLessons(updated);
  };

  /** Drag and drop reorder handler */
  const onDragEnd = (result: any) => {
    if (!result.destination) return;

    const reordered = Array.from(lessons);
    const [removed] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, removed);
    setLessons(reordered);
  };

  /** Upload Thumbnail */
  const uploadThumbnail = async () => {
    if (!thumbnail) return null;
    const formData = new FormData();
    formData.append("file", thumbnail);

    const res = await fetch("/api/upload-thumbnail", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    if (data.url) setThumbnailUrl(data.url);
    return data.url;
  };

  /** Upload video to Vimeo with progress tracking */
  const uploadLessonVideo = async (file: File, folderId: string, onProgress?: (status: string) => void) => {
    console.log("Uploading video for lesson:", file.name);
    onProgress?.("Getting upload URL...");

    const res = await fetch("/api/vimeo/create-upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fileName: file.name,
        fileSize: file.size,
        folderId: folderId,
      }),
    });

    const { uploadUrl, videoUri, playerEmbedUrl } = await res.json();

    if (!uploadUrl) throw new Error("Failed to get Vimeo upload URL");

    onProgress?.("Uploading video to Vimeo...");

    // Use XMLHttpRequest for upload progress
    await new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("PATCH", uploadUrl, true);
      xhr.setRequestHeader("Tus-Resumable", "1.0.0");
      xhr.setRequestHeader("Upload-Offset", "0");
      xhr.setRequestHeader("Content-Type", "application/offset+octet-stream");

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          onProgress?.(`Uploading: ${percent}%`);
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve();
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      };

      xhr.onerror = () => reject(new Error("Upload failed"));
      xhr.send(file);
    });

    onProgress?.("Processing video...");

    const videoId = videoUri.split('/').pop();

    return {
      videoId,
      videoUri,
      playerUrl: playerEmbedUrl,
    };
  };

  /** Upload document */
  const uploadLessonDocument = async (file: File, lessonTitle: string) => {
    console.log("Uploading document for lesson:", lessonTitle);

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload-document", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    if (!res.ok || !data.url) {
      throw new Error(`Document upload failed for lesson: ${lessonTitle}`);
    }

    console.log("Document uploaded successfully:", data.url);
    return data.url;
  };

  /** Submit form */
  const handleSubmit = async () => {
    if (!courseTitle.trim()) {
      alert("Course title is required");
      return;
    }

    setUploading(true);
    setUploadProgress(null);

    // Count total upload steps
    const totalSteps = 1 + // thumbnail
      1 + // create folder
      lessons.filter(l => l.videoFile).length + // videos
      lessons.filter(l => l.docFile).length + // documents
      1; // save course

    let completedSteps = 0;

    const updateProgress = (stage: string, itemName: string) => {
      setUploadProgress({
        stage,
        currentItem: completedSteps + 1,
        totalItems: totalSteps,
        currentItemName: itemName,
        percentage: Math.round((completedSteps / totalSteps) * 100)
      });
    };

    try {
      // 1️⃣ Upload course thumbnail
      updateProgress("Uploading thumbnail", thumbnail?.name || "No thumbnail");
      let finalThumbnailUrl = "";
      if (thumbnail) {
        finalThumbnailUrl = await uploadThumbnail();
      }
      completedSteps++;

      // 2️⃣ Create Vimeo folder for this course
      updateProgress("Creating Vimeo folder", courseTitle);
      const folderRes = await fetch("/api/vimeo/create-folder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folderName: courseTitle }),
      });

      const { folderId, folderUri } = await folderRes.json();
      if (!folderId) throw new Error("Failed to create Vimeo folder");
      completedSteps++;

      // 3️⃣ Upload lessons (video + document) and preserve order
      const lessonsData = [];
      for (let i = 0; i < lessons.length; i++) {
        const lesson = lessons[i];

        // Upload video if selected
        let videoData: any = null;
        if (lesson.videoFile) {
          updateProgress("Uploading video", `Lesson ${i + 1}: ${lesson.title || lesson.videoFile.name}`);
          videoData = await uploadLessonVideo(lesson.videoFile, folderId, (status) => {
            setUploadProgress(prev => prev ? {
              ...prev,
              currentItemName: `Lesson ${i + 1}: ${status}`
            } : null);
          });
          completedSteps++;
        }

        // Upload document if selected
        let documentUrl = "";
        if (lesson.docFile) {
          updateProgress("Uploading document", `Lesson ${i + 1}: ${lesson.docFile.name}`);
          documentUrl = await uploadLessonDocument(lesson.docFile, lesson.title);
          completedSteps++;
        }

        lessonsData.push({
          title: lesson.title,
          description: lesson.description,
          vimeo_video_id: videoData?.videoId || '',
          vimeo_video_uri: videoData?.videoUri || '',
          vimeo_player_url: videoData?.playerUrl || '',
          document_url: documentUrl,
          lesson_order: i, // preserve order from drag-and-drop
        });
      }

      // 4️⃣ Prepare payload
      const payload = {
        title: courseTitle,
        description: courseDesc,
        category,
        price,
        thumbnail_url: finalThumbnailUrl,
        vimeo_folder_id: folderId,
        vimeo_folder_uri: folderUri,
        lessons: lessonsData,
      };

      console.log("Uploading Vimeo course payload:", payload);

      // Send to save-vimeo-course API
      updateProgress("Saving course", "Finalizing...");
      const res = await fetch("/api/admin/create-vimeo-course", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      completedSteps++;

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to save course");
      }

      setUploadProgress({
        stage: "Complete",
        currentItem: totalSteps,
        totalItems: totalSteps,
        currentItemName: "Vimeo course uploaded successfully!",
        percentage: 100
      });

      alert("Vimeo course uploaded successfully!");
      // Optional: Reset form or redirect
      setCourseTitle("");
      setCourseDesc("");
      setCategory("");
      setPrice("");
      setThumbnail(null);
      setThumbnailUrl("");
      setLessons([]);
      setUploadProgress(null);
    } catch (err: any) {
      console.error("Vimeo course upload failed:", err);
      alert(`Upload failed: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-8 bg-gray-50 rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold text-purple-700 mb-6">Add New Vimeo Course</h1>

      {/* Course Info */}
      <div className="space-y-4 mb-6">
        <input
          type="text"
          placeholder="Course Title"
          className="w-full border p-3 rounded-lg"
          value={courseTitle}
          onChange={(e) => setCourseTitle(e.target.value)}
        />
        <textarea
          placeholder="Course Description"
          className="w-full border p-3 rounded-lg"
          value={courseDesc}
          onChange={(e) => setCourseDesc(e.target.value)}
        />
        <input
          type="text"
          placeholder="Category"
          className="w-full border p-3 rounded-lg"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />
        <input
          type="number"
          placeholder="Price"
          className="w-full border p-3 rounded-lg"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />

        {/* Thumbnail Upload */}
        <div>
          <label className="font-semibold block mb-2">Course Thumbnail</label>
          <div className="flex items-center gap-4">
            <label className="cursor-pointer flex items-center px-4 py-2 bg-gray-100 border rounded-lg hover:bg-gray-200">
              <ImageIcon className="w-5 h-5 mr-2" />
              Choose Image
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => setThumbnail(e.target.files ? e.target.files[0] : null)}
              />
            </label>
            {thumbnail && <p className="text-sm text-gray-600">{thumbnail.name}</p>}
          </div>
        </div>
      </div>

      {/* Lessons */}
      <div className="bg-white rounded-lg p-6 shadow-md">
        <h2 className="text-xl font-semibold mb-4">Lessons</h2>
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="lessons">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef}>
                {lessons.map((lesson, index) => (
                  <Draggable key={index} draggableId={`lesson-${index}`} index={index}>
                    {(provided) => (
                      <div
                        className="border p-4 mb-4 rounded-lg bg-gray-50 flex flex-col gap-3"
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div {...provided.dragHandleProps} className="cursor-grab">
                              <GripVertical className="text-gray-400" />
                            </div>
                            <span className="font-semibold">Lesson {index + 1}</span>
                          </div>
                          <button
                            onClick={() => deleteLesson(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X />
                          </button>
                        </div>

                        <input
                          type="text"
                          placeholder="Lesson Title"
                          className="w-full border p-2 rounded"
                          value={lesson.title}
                          onChange={(e) => handleLessonChange(index, "title", e.target.value)}
                        />
                        <textarea
                          placeholder="Lesson Description"
                          className="w-full border p-2 rounded"
                          value={lesson.description}
                          onChange={(e) => handleLessonChange(index, "description", e.target.value)}
                        />

                        {/* Video upload */}
                        <div className="flex items-center gap-4">
                          <label className="cursor-pointer flex items-center px-4 py-2 bg-gray-100 border rounded-lg hover:bg-gray-200">
                            <FileVideo className="w-5 h-5 mr-2" />
                            Choose Video
                            <input
                              type="file"
                              accept="video/*"
                              className="hidden"
                              onChange={(e) =>
                                handleLessonChange(
                                  index,
                                  "videoFile",
                                  e.target.files ? e.target.files[0] : null
                                )
                              }
                            />
                          </label>
                          {lesson.videoFile && <p className="text-sm text-gray-600">{lesson.videoFile.name}</p>}
                        </div>

                        {/* Document upload */}
                        <div className="flex items-center gap-4">
                          <label className="cursor-pointer flex items-center px-4 py-2 bg-gray-100 border rounded-lg hover:bg-gray-200">
                            <FileText className="w-5 h-5 mr-2" />
                            Choose Document
                            <input
                              type="file"
                              className="hidden"
                              onChange={(e) =>
                                handleLessonChange(
                                  index,
                                  "docFile",
                                  e.target.files ? e.target.files[0] : null
                                )
                              }
                            />
                          </label>
                          {lesson.docFile && <p className="text-sm text-gray-600">{lesson.docFile.name}</p>}
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>

        <button
          onClick={addLesson}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 mt-4"
        >
          <Plus /> Add Lesson
        </button>
      </div>

      {/* Upload Progress */}
      {uploading && uploadProgress && (
        <div className="mt-6 bg-white rounded-lg p-6 shadow-md border border-purple-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              {uploadProgress.stage}
            </span>
            <span className="text-sm font-medium text-purple-700">
              {uploadProgress.percentage}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
            <div
              className="bg-purple-600 h-2.5 rounded-full transition-all"
              style={{ width: `${uploadProgress.percentage}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-500">{uploadProgress.currentItemName}</p>
        </div>
      )}

      {/* Upload Button */}
      <button
        onClick={handleSubmit}
        disabled={uploading}
        className="mt-6 bg-purple-700 hover:bg-purple-800 disabled:bg-gray-400 text-white px-8 py-3 rounded-lg font-semibold flex items-center gap-2"
      >
        {uploading ? (
          <>
            <Loader2 className="animate-spin" />
            Uploading...
          </>
        ) : (
          <>
            <CheckCircle />
            Upload Vimeo Course
          </>
        )}
      </button>
    </div>
  );
}
