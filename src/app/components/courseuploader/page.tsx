"use client";

import { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Plus, X, GripVertical, FileVideo, FileText, Image as ImageIcon } from "lucide-react";

export default function CourseUploader() {
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

  /** Upload video to Mux */
  const uploadLessonVideo = async (file: File) => {
    console.log("Uploading video for lesson:", file.name);

    const res = await fetch("/api/mux/create-upload", { method: "POST" });
    const { uploadUrl, uploadId } = await res.json();

    if (!uploadUrl) throw new Error("Failed to get Mux upload URL");

    await fetch(uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": file.type },
      body: file,
    });

    let playbackUrl = "";
    while (!playbackUrl) {
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
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }

    console.log("Mux video playback URL:", playbackUrl);
    return playbackUrl;
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
    setUploading(true);

    try {
      const finalThumbnailUrl = await uploadThumbnail();

      const lessonsData = [];
      for (const lesson of lessons) {
        const playbackUrl = lesson.videoFile
          ? await uploadLessonVideo(lesson.videoFile)
          : "";

        const documentUrl = lesson.docFile
          ? await uploadLessonDocument(lesson.docFile, lesson.title)
          : "";

        lessonsData.push({
          title: lesson.title,
          description: lesson.description,
          mux_video_id: playbackUrl,
          document_url: documentUrl,
        });
      }

      console.log("Final payload to save-course:", {
        title: courseTitle,
        description: courseDesc,
        category,
        price,
        thumbnail_url: finalThumbnailUrl,
        lessons: lessonsData,
      });

      const res = await fetch("/api/save-course", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: courseTitle,
          description: courseDesc,
          category,
          price,
          thumbnail_url: finalThumbnailUrl,
          lessons: lessonsData,
        }),
      });

      if (!res.ok) throw new Error("Failed to save course");

      alert("Course uploaded successfully!");
    } catch (err: any) {
      alert(`Upload failed: ${err.message}`);
    }

    setUploading(false);
  };

  return (
    <div className="max-w-5xl mx-auto p-8 bg-gray-50 rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold text-blue-700 mb-6">Add New Course</h1>

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

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={uploading}
        className={`mt-6 w-full py-3 rounded-lg text-white font-semibold ${
          uploading ? "bg-gray-400" : "bg-blue-700 hover:bg-blue-800"
        }`}
      >
        {uploading ? "Uploading..." : "Save Course"}
      </button>
    </div>
  );
}
