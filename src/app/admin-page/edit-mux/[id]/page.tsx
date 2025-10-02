"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import dynamic from "next/dynamic";
import { Plus, X, GripVertical, FileVideo, FileText, Image as ImageIcon } from "lucide-react";

const MuxPlayer = dynamic(() => import("@mux/mux-player-react"), { ssr: false });

type Lesson = {
  id?: string;
  title: string;
  description?: string;
  mux_video_id?: string;
  video_url?: string;
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
  lessons: Lesson[];
};

export default function EditCoursePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [newLessons, setNewLessons] = useState<Lesson[]>([]);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [thumbnailUrl, setThumbnailUrl] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  /** Fetch course data */
  useEffect(() => {
    if (!params?.id) return;
    fetchCourse();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params?.id]);

  const fetchCourse = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/fetch-mux-edit-course?id=${params.id}`);
      const data = await res.json();
      if (data.error) {
        alert("Failed to fetch course: " + data.error);
        return;
      }
      
      console.log("Fetched course data:", data);
      console.log("Lessons data:", data.lessons);
      if (data.lessons && data.lessons.length > 0) {
        console.log("First lesson:", data.lessons[0]);
        console.log("Video URL:", data.lessons[0].video_url);
        console.log("Mux Video ID:", data.lessons[0].mux_video_id);
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
      { title: "", description: "", mux_video_id: "", document_url: "", newVideoFile: null, newDocumentFile: null },
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

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const reordered = Array.from(lessons);
    const [removed] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, removed);

    // Update local state immediately for UI responsiveness
    setLessons(reordered);

    // Persist order changes to database
    try {
      const updates = reordered
        .filter(lesson => lesson.id) // Only update lessons that have IDs
        .map((lesson, index) => ({
          id: lesson.id!,
          lesson_order: index,
        }));

      console.log("Sending lesson order updates:", updates);

      const res = await fetch("/api/admin/update-lesson-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessons: updates }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        console.error("Failed to update order:", data.error);
        alert("Failed to save lesson order. Please try again.");
        // Revert to original order on failure
        fetchCourse();
      } else {
        console.log("Lesson order updated successfully");
      }
    } catch (err) {
      console.error("Error updating order:", err);
      alert("Error saving lesson order. Please try again.");
      // Revert to original order on failure
      fetchCourse();
    }
  };

  /** Extract Mux playback ID from URL */
  const extractMuxPlaybackId = (url: string): string | null => {
    if (!url) return null;
    // Extract playback ID from URL like https://stream.mux.com/{playbackId}.m3u8
    const match = url.match(/stream\.mux\.com\/([^/.]+)/);
    return match ? match[1] : null;
  };

  /** Delete old Mux video */
  const deleteMuxVideo = async (videoUrl: string) => {
    const playbackId = extractMuxPlaybackId(videoUrl);
    if (!playbackId) {
      console.log("No playback ID found in URL:", videoUrl);
      return;
    }
    
    try {
      console.log("Deleting Mux video with playback ID:", playbackId);
      const res = await fetch("/api/mux/delete-asset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playbackId }),
      });
      
      if (!res.ok) {
        console.error("Failed to delete Mux video:", await res.text());
      } else {
        console.log("Successfully deleted Mux video");
      }
    } catch (err) {
      console.error("Error deleting Mux video:", err);
    }
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

  const uploadLessonVideo = async (file: File, oldVideoUrl?: string) => {
    if (!file) return "";
    
    // Delete old video if it exists
    if (oldVideoUrl) {
      await deleteMuxVideo(oldVideoUrl);
    }
    
    const res = await fetch("/api/mux/create-upload", { method: "POST" });
    const { uploadUrl, uploadId } = await res.json();
    if (!uploadUrl) throw new Error("Failed to get Mux upload URL");

    await fetch(uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": file.type },
      body: file,
    });

    let playbackUrl = "";
    let attempts = 0;
    const maxAttempts = 40; // 2 minutes max
    
    while (!playbackUrl && attempts < maxAttempts) {
      const assetRes = await fetch("/api/mux/get-asset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uploadId }),
      });
      const assetData = await assetRes.json();
      if (assetRes.status === 200 && assetData.playbackUrl) {
        playbackUrl = assetData.playbackUrl;
        break;
      }
      attempts++;
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }
    
    if (!playbackUrl) {
      throw new Error("Video processing timed out");
    }
    
    return playbackUrl;
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

    try {
      // 1️⃣ Upload thumbnail if changed
      const finalThumbnailUrl = await uploadThumbnail();

      // 2️⃣ Prepare all lessons with video/document uploads and order
      const updatedLessons: any[] = [];

      // Existing lessons
      for (let i = 0; i < lessons.length; i++) {
        const lesson = lessons[i];
        const oldVideoUrl = lesson.video_url || lesson.mux_video_id || "";
        const videoUrl = lesson.newVideoFile
          ? await uploadLessonVideo(lesson.newVideoFile, oldVideoUrl)
          : oldVideoUrl;
        const docUrl = lesson.newDocumentFile
          ? await uploadLessonDocument(lesson.newDocumentFile)
          : lesson.document_url || "";

        updatedLessons.push({
          id: lesson.id,
          title: lesson.title,
          description: lesson.description,
          mux_video_id: videoUrl,
          document_url: docUrl,
          lesson_order: i,
        });
      }

      // New lessons
      for (let i = 0; i < newLessons.length; i++) {
        const lesson = newLessons[i];
        const videoUrl = lesson.newVideoFile ? await uploadLessonVideo(lesson.newVideoFile) : "";
        const docUrl = lesson.newDocumentFile ? await uploadLessonDocument(lesson.newDocumentFile) : "";

        updatedLessons.push({
          title: lesson.title,
          description: lesson.description,
          mux_video_id: videoUrl,
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

      // 4️⃣ Send to update course API
      const res = await fetch("/api/admin/update-mux-course", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || "Failed to update course");

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
      <h1 className="text-3xl font-bold text-indigo-600 mb-6">Edit Course</h1>

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
                        {(lesson.video_url || lesson.mux_video_id) && !lesson.newVideoFile && (
                          <div className="mb-2">
                            <p className="text-sm text-gray-600 mb-2">Current video:</p>
                            <MuxPlayer
                              playbackId={
                                lesson.video_url 
                                  ? (lesson.video_url.includes('stream.mux.com') 
                                      ? lesson.video_url.split('/').pop()?.replace('.m3u8', '') || lesson.video_url
                                      : lesson.video_url)
                                  : (lesson.mux_video_id?.includes('stream.mux.com')
                                      ? lesson.mux_video_id.split('/').pop()?.replace('.m3u8', '') || lesson.mux_video_id
                                      : lesson.mux_video_id || '')
                              }
                              metadata={{
                                video_title: lesson.title,
                              }}
                              streamType="on-demand"
                              className="w-full max-w-2xl rounded-lg"
                            />
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
              <div key={`new-lesson-${index}`} className="border p-4 mb-4 rounded-lg bg-blue-50">
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

      <button
        onClick={handleSubmit}
        disabled={uploading}
        className={`w-full py-3 rounded-lg text-white font-semibold ${uploading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-700 hover:bg-blue-800"}`}
      >
        {uploading ? "Updating..." : "Update Course"}
      </button>
    </div>
  );
}