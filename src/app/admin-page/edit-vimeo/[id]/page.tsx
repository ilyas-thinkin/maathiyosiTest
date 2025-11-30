"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { Plus, X, GripVertical, FileVideo, FileText, Image as ImageIcon, CheckCircle, Loader2 } from "lucide-react";

type UploadProgress = {
  stage: string;
  currentItem: number;
  totalItems: number;
  currentItemName: string;
  percentage: number;
};

type Lesson = {
  id?: string;
  title: string;
  description?: string;
  vimeo_video_id?: string;
  vimeo_player_url?: string;
  document_url?: string;
  newVideoFile?: File | null;
  newDocumentFile?: File | null;
};

type Course = {
  id: string;
  title: string;
  description?: string;
  category?: string;
  price?: number;
  thumbnail_url?: string;
  vimeo_folder_id?: string;
  lessons: Lesson[];
};

export default function EditVimeoCourseePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [newLessons, setNewLessons] = useState<Lesson[]>([]);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [thumbnailUrl, setThumbnailUrl] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);

  /** Fetch course data */
  useEffect(() => {
    if (!params?.id) return;
    fetchCourse();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params?.id]);

  const fetchCourse = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/fetch-vimeo-edit-course?id=${params.id}`);
      const data = await res.json();
      if (data.error) {
        alert("Failed to fetch course: " + data.error);
        return;
      }

      console.log("Fetched course data:", data);
      console.log("Lessons data:", data.lessons);
      if (data.lessons && data.lessons.length > 0) {
        console.log("First lesson:", data.lessons[0]);
        console.log("Vimeo Player URL:", data.lessons[0].vimeo_player_url);
        console.log("Vimeo Video ID:", data.lessons[0].vimeo_video_id);
      }

      setCourse(data);
      setLessons(data.lessons || []);
      setThumbnailUrl(data.thumbnail_url || "");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCourseChange = (field: keyof Course, value: any) => {
    if (!course) return;
    setCourse({ ...course, [field]: value });
  };

  const handleLessonChange = (index: number, field: keyof Lesson, value: any) => {
    const updated = [...lessons];
    (updated[index] as any)[field] = value;
    setLessons(updated);
  };

  const handleNewLessonChange = (index: number, field: keyof Lesson, value: any) => {
    const updated = [...newLessons];
    (updated[index] as any)[field] = value;
    setNewLessons(updated);
  };

  const addNewLesson = () => {
    setNewLessons([
      ...newLessons,
      { title: "", description: "", vimeo_video_id: "", document_url: "", newVideoFile: null, newDocumentFile: null },
    ]);
  };

  const deleteLesson = (index: number, isNew: boolean = false) => {
    if (isNew) {
      const updated = [...newLessons];
      updated.splice(index, 1);
      setNewLessons(updated);
    } else {
      const updated = [...lessons];
      updated.splice(index, 1);
      setLessons(updated);
    }
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const reordered = Array.from(lessons);
    const [removed] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, removed);

    // Update local state immediately for UI responsiveness
    setLessons(reordered);
  };

  /** Upload functions */
  const uploadThumbnail = async () => {
    if (!thumbnail) return thumbnailUrl;
    const formData = new FormData();
    formData.append("file", thumbnail);
    const res = await fetch("/api/upload-thumbnail", { method: "POST", body: formData });
    const data = await res.json();
    if (!res.ok || !data.url) throw new Error("Thumbnail upload failed");
    setThumbnailUrl(data.url);
    return data.url;
  };

  const uploadLessonVideo = async (file: File, folderId: string, onProgress?: (status: string) => void) => {
    if (!file) return { videoId: "", videoUri: "", playerUrl: "" };

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

    // Update privacy settings to hide branding
    try {
      onProgress?.("Configuring privacy settings...");
      await fetch("/api/vimeo/update-privacy", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoId }),
      });
    } catch (err) {
      console.warn("Failed to update privacy settings:", err);
      // Don't fail the upload, just log the warning
    }

    return {
      videoId,
      videoUri,
      playerUrl: playerEmbedUrl,
    };
  };

  const uploadLessonDocument = async (file: File | null) => {
    if (!file) return "";
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/upload-document", { method: "POST", body: formData });
    const data = await res.json();
    if (!res.ok || !data.url) throw new Error("Document upload failed");
    return data.url;
  };

  const handleSubmit = async () => {
    if (!course) return;
    setUploading(true);
    setUploadProgress(null);

    // Count total upload steps
    const existingVideos = lessons.filter(l => l.newVideoFile).length;
    const existingDocs = lessons.filter(l => l.newDocumentFile).length;
    const newVideos = newLessons.filter(l => l.newVideoFile).length;
    const newDocs = newLessons.filter(l => l.newDocumentFile).length;
    const totalSteps = 1 + existingVideos + existingDocs + newVideos + newDocs + 1; // thumbnail + files + save

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
      // 1️⃣ Upload thumbnail if changed
      updateProgress("Uploading thumbnail", thumbnail?.name || "Using existing thumbnail");
      const finalThumbnailUrl = await uploadThumbnail();
      completedSteps++;

      // 2️⃣ Prepare all lessons with video/document uploads and order
      const updatedLessons: any[] = [];

      // Get folder ID from course or use existing one
      const folderId = course.vimeo_folder_id || "";

      // Existing lessons - now with proper ordering from drag and drop
      for (let i = 0; i < lessons.length; i++) {
        const lesson = lessons[i];

        let videoId = lesson.vimeo_video_id || "";
        let playerUrl = lesson.vimeo_player_url || "";
        let videoUri = "";

        if (lesson.newVideoFile) {
          updateProgress("Uploading video", `Lesson ${i + 1}: ${lesson.title}`);
          const videoData = await uploadLessonVideo(lesson.newVideoFile, folderId, (status) => {
            setUploadProgress(prev => prev ? {
              ...prev,
              currentItemName: `Lesson ${i + 1}: ${status}`
            } : null);
          });
          videoId = videoData.videoId;
          playerUrl = videoData.playerUrl;
          videoUri = videoData.videoUri;
          completedSteps++;
        }

        let docUrl = lesson.document_url || "";
        if (lesson.newDocumentFile) {
          updateProgress("Uploading document", `Lesson ${i + 1}: ${lesson.newDocumentFile.name}`);
          docUrl = await uploadLessonDocument(lesson.newDocumentFile);
          completedSteps++;
        }

        updatedLessons.push({
          id: lesson.id,
          title: lesson.title,
          description: lesson.description,
          vimeo_video_id: videoId,
          vimeo_player_url: playerUrl,
          document_url: docUrl,
          lesson_order: i,
        });
      }

      // New lessons
      for (let i = 0; i < newLessons.length; i++) {
        const lesson = newLessons[i];

        let videoId = "";
        let playerUrl = "";
        let videoUri = "";

        if (lesson.newVideoFile) {
          updateProgress("Uploading video", `New Lesson ${i + 1}: ${lesson.title}`);
          const videoData = await uploadLessonVideo(lesson.newVideoFile, folderId, (status) => {
            setUploadProgress(prev => prev ? {
              ...prev,
              currentItemName: `New Lesson ${i + 1}: ${status}`
            } : null);
          });
          videoId = videoData.videoId;
          playerUrl = videoData.playerUrl;
          videoUri = videoData.videoUri;
          completedSteps++;
        }

        let docUrl = "";
        if (lesson.newDocumentFile) {
          updateProgress("Uploading document", `New Lesson ${i + 1}: ${lesson.newDocumentFile.name}`);
          docUrl = await uploadLessonDocument(lesson.newDocumentFile);
          completedSteps++;
        }

        updatedLessons.push({
          title: lesson.title,
          description: lesson.description,
          vimeo_video_id: videoId,
          vimeo_player_url: playerUrl,
          document_url: docUrl,
          lesson_order: lessons.length + i,
        });
      }

      // 3️⃣ Prepare payload
      const payload = {
        id: course.id,
        title: course.title,
        description: course.description,
        category: course.category,
        price: course.price,
        thumbnail_url: finalThumbnailUrl,
        lessons: updatedLessons,
      };

      console.log("Submitting course update with lessons:", updatedLessons);

      // 4️⃣ Send to update course API
      updateProgress("Saving course", "Finalizing...");
      const res = await fetch("/api/admin/update-vimeo-course", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      completedSteps++;

      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || "Failed to update course");

      setUploadProgress({
        stage: "Complete",
        currentItem: totalSteps,
        totalItems: totalSteps,
        currentItemName: "Course updated successfully!",
        percentage: 100
      });

      alert("Course updated successfully!");
      router.push("/admin-page");
    } catch (err: any) {
      console.error("Update failed:", err);
      alert("Update failed: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <p>Loading course...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <p>Course not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-purple-600 mb-6">Edit Vimeo Course</h1>

      {/* Editable Course Details */}
      <div className="space-y-4 mb-6">
        <input
          type="text"
          placeholder="Course Title"
          className="w-full border p-3 rounded-lg"
          value={course.title}
          onChange={(e) => handleCourseChange("title", e.target.value)}
        />
        <textarea
          placeholder="Course Description"
          className="w-full border p-3 rounded-lg"
          value={course.description || ""}
          onChange={(e) => handleCourseChange("description", e.target.value)}
        />
        <input
          type="text"
          placeholder="Category"
          className="w-full border p-3 rounded-lg"
          value={course.category || ""}
          onChange={(e) => handleCourseChange("category", e.target.value)}
        />
        <input
          type="number"
          placeholder="Price"
          className="w-full border p-3 rounded-lg"
          value={course.price || ""}
          onChange={(e) => handleCourseChange("price", Number(e.target.value))}
        />
      </div>

      {/* Thumbnail */}
      <div className="mb-6 flex items-center gap-4">
        <label className="cursor-pointer flex items-center px-4 py-2 bg-gray-100 border rounded-lg hover:bg-gray-200">
          <ImageIcon className="w-5 h-5 mr-2" /> Choose Thumbnail
          <input type="file" accept="image/*" className="hidden" onChange={(e) => setThumbnail(e.target.files?.[0] || null)} />
        </label>
        {thumbnail && <span className="text-sm text-gray-600">{thumbnail.name}</span>}
        {thumbnailUrl && !thumbnail && <img src={thumbnailUrl} alt="Course Thumbnail" className="w-32 h-20 object-cover rounded" />}
      </div>

      {/* Lessons */}
      <div className="bg-white rounded-lg p-6 shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4">Existing Lessons</h2>
        <p className="text-sm text-gray-600 mb-4">Drag and drop to reorder lessons. Changes will be saved when you click "Update Course".</p>
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="lessons">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef}>
                {lessons.map((lesson, index) => (
                  <Draggable key={lesson.id || `lesson-${index}`} draggableId={`lesson-${lesson.id || index}`} index={index}>
                    {(provided) => (
                      <div
                        className="border p-4 mb-4 rounded-lg bg-gray-50"
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                      >
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center gap-2">
                            <div {...provided.dragHandleProps} className="cursor-grab">
                              <GripVertical className="text-gray-400" />
                            </div>
                            <span className="font-semibold">Lesson {index + 1}</span>
                          </div>
                          <button onClick={() => deleteLesson(index)} className="text-red-500 hover:text-red-700">
                            <X />
                          </button>
                        </div>

                        <input
                          type="text"
                          placeholder="Lesson Title"
                          className="border p-2 rounded w-full mb-2"
                          value={lesson.title}
                          onChange={(e) => handleLessonChange(index, "title", e.target.value)}
                        />
                        <textarea
                          placeholder="Lesson Description"
                          className="border p-2 rounded w-full mb-2"
                          value={lesson.description || ""}
                          onChange={(e) => handleLessonChange(index, "description", e.target.value)}
                        />

                        {/* Video preview */}
                        {(lesson.vimeo_player_url || lesson.vimeo_video_id) && !lesson.newVideoFile && (
                          <div className="mb-2">
                            <p className="text-sm text-gray-600 mb-2">Current video:</p>
                            <div className="w-full max-w-2xl rounded-lg overflow-hidden">
                              <iframe
                                src={lesson.vimeo_player_url || `https://player.vimeo.com/video/${lesson.vimeo_video_id}`}
                                width="100%"
                                height="360"
                                frameBorder="0"
                                allow="autoplay; fullscreen; picture-in-picture"
                                allowFullScreen
                                title={lesson.title}
                              />
                            </div>
                          </div>
                        )}
                        {lesson.newVideoFile && (
                          <p className="mb-2 text-sm text-green-600">New video selected: {lesson.newVideoFile.name}</p>
                        )}
                        <label className="cursor-pointer flex items-center px-4 py-2 bg-gray-100 border rounded-lg hover:bg-gray-200 mb-2">
                          <FileVideo className="w-5 h-5 mr-2" /> {lesson.newVideoFile ? "Change Video" : "Upload New Video"}
                          <input
                            type="file"
                            accept="video/*"
                            className="hidden"
                            onChange={(e) => handleLessonChange(index, "newVideoFile", e.target.files?.[0] || null)}
                          />
                        </label>

                        {/* Document preview */}
                        {lesson.document_url && !lesson.newDocumentFile && (
                          <p className="mb-2 text-sm text-gray-600">
                            Current document: <a href={lesson.document_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                              View Document
                            </a>
                          </p>
                        )}
                        {lesson.newDocumentFile && (
                          <p className="mb-2 text-sm text-green-600">New document selected: {lesson.newDocumentFile.name}</p>
                        )}
                        <label className="cursor-pointer flex items-center px-4 py-2 bg-gray-100 border rounded-lg hover:bg-gray-200">
                          <FileText className="w-5 h-5 mr-2" /> {lesson.newDocumentFile ? "Change Document" : "Upload New Document"}
                          <input
                            type="file"
                            className="hidden"
                            onChange={(e) => handleLessonChange(index, "newDocumentFile", e.target.files?.[0] || null)}
                          />
                        </label>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>

        {/* New Lessons Section */}
        {newLessons.length > 0 && (
          <>
            <h2 className="text-xl font-semibold mb-4 mt-6">New Lessons</h2>
            {newLessons.map((lesson, index) => (
              <div key={`new-lesson-${index}`} className="border p-4 mb-4 rounded-lg bg-purple-50">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold">New Lesson {index + 1}</span>
                  <button onClick={() => deleteLesson(index, true)} className="text-red-500 hover:text-red-700">
                    <X />
                  </button>
                </div>

                <input
                  type="text"
                  placeholder="Lesson Title"
                  className="border p-2 rounded w-full mb-2"
                  value={lesson.title}
                  onChange={(e) => handleNewLessonChange(index, "title", e.target.value)}
                />
                <textarea
                  placeholder="Lesson Description"
                  className="border p-2 rounded w-full mb-2"
                  value={lesson.description || ""}
                  onChange={(e) => handleNewLessonChange(index, "description", e.target.value)}
                />

                {lesson.newVideoFile && (
                  <p className="mb-2 text-sm text-green-600">Video selected: {lesson.newVideoFile.name}</p>
                )}
                <label className="cursor-pointer flex items-center px-4 py-2 bg-gray-100 border rounded-lg hover:bg-gray-200 mb-2">
                  <FileVideo className="w-5 h-5 mr-2" /> Upload Video
                  <input
                    type="file"
                    accept="video/*"
                    className="hidden"
                    onChange={(e) => handleNewLessonChange(index, "newVideoFile", e.target.files?.[0] || null)}
                  />
                </label>

                {lesson.newDocumentFile && (
                  <p className="mb-2 text-sm text-green-600">Document selected: {lesson.newDocumentFile.name}</p>
                )}
                <label className="cursor-pointer flex items-center px-4 py-2 bg-gray-100 border rounded-lg hover:bg-gray-200">
                  <FileText className="w-5 h-5 mr-2" /> Upload Document
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) => handleNewLessonChange(index, "newDocumentFile", e.target.files?.[0] || null)}
                  />
                </label>
              </div>
            ))}
          </>
        )}

        <button onClick={addNewLesson} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 mt-4">
          <Plus /> Add New Lesson
        </button>
      </div>

      {/* Upload Progress */}
      {uploading && uploadProgress && (
        <div className="mb-6 bg-white rounded-lg p-6 shadow-md border border-purple-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              {uploadProgress.stage}
            </span>
            <span className="text-sm text-gray-500">
              Step {uploadProgress.currentItem} of {uploadProgress.totalItems}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-3 mb-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-purple-500 to-purple-700 h-3 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${uploadProgress.percentage}%` }}
            />
          </div>

          {/* Current Item */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            {uploadProgress.stage === "Complete" ? (
              <CheckCircle className="w-4 h-4 text-green-500" />
            ) : (
              <Loader2 className="w-4 h-4 animate-spin text-purple-500" />
            )}
            <span className="truncate">{uploadProgress.currentItemName}</span>
          </div>

          {/* Percentage */}
          <div className="text-right mt-2">
            <span className="text-lg font-bold text-purple-600">
              {uploadProgress.percentage}%
            </span>
          </div>
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={uploading}
        className={`w-full py-3 rounded-lg text-white font-semibold ${uploading ? "bg-gray-400 cursor-not-allowed" : "bg-purple-700 hover:bg-purple-800"}`}
      >
        {uploading ? "Updating..." : "Update Course"}
      </button>
    </div>
  );
}
