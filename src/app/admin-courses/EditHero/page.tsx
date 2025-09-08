"use client";

import { useEffect, useState, ChangeEvent } from "react";
import { supabase } from "../../components/lib/supabaseClient";
import { useRouter } from "next/navigation";

/* ────────────── TYPES ────────────── */
interface HeroSlide {
  id: string;
  image_url: string;
  heading: string;
  subheading: string;
  button_text: string;
  linked_course_id: string | null; // UI state uses "main:uuid" or "yt:uuid"
}

interface Course {
  id: string;
  title: string;
  source: "main" | "yt";
}

/* ────────────── COMPONENT ────────────── */
export default function EditHeroSlides() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [uploading, setUploading] = useState<string | null>(null);
  const router = useRouter();

  /* Fetch slides & courses */
  useEffect(() => {
    (async () => {
      const [slidesRes, mainRes, ytRes] = await Promise.all([
        supabase.from("hero_slides").select("*").order("created_at", { ascending: true }),
        supabase.from("courses").select("id, title").order("title"),
        supabase.from("courses_yt").select("id, title").order("title"),
      ]);

      if (!slidesRes.error && slidesRes.data) {
        console.log("Raw slides from DB:", slidesRes.data); // Debug log
        
        // Fixed: Only create the combined format if both source and id exist
        setSlides(
          slidesRes.data.map((s: any) => ({
            ...s,
            linked_course_id: s.linked_course_source && s.linked_course_id
              ? `${s.linked_course_source}:${s.linked_course_id}`
              : null,
          }))
        );
      }

      const merged: Course[] = [];
      if (!mainRes.error && mainRes.data) {
        merged.push(...mainRes.data.map((c) => ({ ...c, source: "main" as const })));
      }
      if (!ytRes.error && ytRes.data) {
        merged.push(...ytRes.data.map((c) => ({ ...c, source: "yt" as const })));
      }
      setCourses(merged);
    })();
  }, []);

  /* Helpers */
  const updateSlide = (id: string, upd: Partial<HeroSlide>) => {
    console.log("Updating slide:", id, upd); // Debug log
    setSlides((s) => s.map((sl) => (sl.id === id ? { ...sl, ...upd } : sl)));
  };

  const addSlide = () => {
    if (slides.length >= 7) return alert("Max 7 slides allowed.");
    setSlides((s) => [
      ...s,
      {
        id: crypto.randomUUID(),
        image_url: "",
        heading: "",
        subheading: "",
        button_text: "Browse Courses",
        linked_course_id: null,
      },
    ]);
  };

  const deleteSlide = async (id: string) => {
    if (/^[0-9a-f\-]{36}$/i.test(id)) {
      const { error } = await supabase.from("hero_slides").delete().eq("id", id);
      if (error) return alert("Could not delete slide.");
    }
    setSlides((s) => s.filter((sl) => sl.id !== id));
  };

  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>, id: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(id);

    const fileExt = file.name.split(".").pop();
    const filePath = `${Date.now()}.${fileExt}`;

    const { error: upErr } = await supabase.storage
      .from("hero-images")
      .upload(filePath, file, { upsert: true });

    if (upErr) alert(upErr.message);
    else {
      const { data } = supabase.storage.from("hero-images").getPublicUrl(filePath);
      updateSlide(id, { image_url: data.publicUrl });
    }
    setUploading(null);
  };

  /* Save */
  const saveAll = async () => {
  const payload = slides.map((s) => {
    let mainId: string | null = null;
    let ytId: string | null = null;

    if (s.linked_course_id && s.linked_course_id.includes(":")) {
      const [src, id] = s.linked_course_id.split(":");
      if (src === "main") mainId = id;
      if (src === "yt") ytId = id;
    }

    return {
      id: /^[0-9a-f\-]{36}$/i.test(s.id) ? s.id : undefined,
      image_url: s.image_url || null,
      heading: s.heading || null,
      subheading: s.subheading || null,
      button_text: s.button_text || null,
      linked_course_main_id: mainId,
      linked_course_yt_id: ytId,
    };
  });

  console.log("Payload being saved:", payload);

  const { error } = await supabase.from("hero_slides").upsert(payload, { onConflict: "id" });

  if (error) {
    console.error("Save error:", error);
    return alert("Save failed: " + error.message);
  }

  alert("Slides saved successfully!");
  router.push("/admin-courses");
};


  /* UI */
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-center text-rose-600 mb-6">
        ✏️ Edit Hero Slides
      </h1>

      {slides.map((s, idx) => (
        <div key={s.id} className="border rounded-lg p-4 mb-6 bg-gray-50">
          <h2 className="text-xl font-semibold mb-2">Slide {idx + 1}</h2>

          {/* Debug info */}
          <div className="mb-2 text-sm text-gray-600">
            Current linked_course_id: {s.linked_course_id || "null"}
          </div>

          {/* Image */}
          <label className="block mb-1 font-semibold">Image</label>
          {s.image_url && (
            <img
              src={s.image_url}
              alt="preview"
              className="w-full h-40 object-cover rounded mb-2"
            />
          )}
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleImageUpload(e, s.id)}
            disabled={uploading === s.id}
          />

          {/* Text fields */}
          <input
            className="w-full mt-2 p-2 border rounded"
            placeholder="Heading"
            value={s.heading}
            onChange={(e) => updateSlide(s.id, { heading: e.target.value })}
          />
          <textarea
            className="w-full mt-2 p-2 border rounded"
            placeholder="Subheading"
            value={s.subheading}
            onChange={(e) => updateSlide(s.id, { subheading: e.target.value })}
          />
          <input
            className="w-full mt-2 p-2 border rounded"
            placeholder="Button Text"
            value={s.button_text}
            onChange={(e) => updateSlide(s.id, { button_text: e.target.value })}
          />

          {/* Course selector */}
          <label className="block mt-2 mb-1 font-semibold">Linked Course</label>
          <select
            className="w-full mt-2 p-2 border rounded"
            value={s.linked_course_id || ""}
            onChange={(e) => {
              console.log("Course selection changed:", e.target.value); // Debug log
              updateSlide(s.id, { linked_course_id: e.target.value || null });
            }}
          >
            <option value="">No Link</option>
            {courses.map((c) => (
              <option key={`${c.source}-${c.id}`} value={`${c.source}:${c.id}`}>
                {c.source === "yt" ? `[YT] ${c.title}` : c.title}
              </option>
            ))}
          </select>

          {/* Delete */}
          <button
            onClick={() => deleteSlide(s.id)}
            className="mt-3 bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600"
          >
            Delete Slide
          </button>
        </div>
      ))}

      {/* Add & Save */}
      {slides.length < 7 && (
        <button
          onClick={addSlide}
          className="w-full py-2 mb-4 bg-green-500 text-white rounded hover:bg-green-600"
        >
          + Add Slide
        </button>
      )}

      <button
        onClick={saveAll}
        className="w-full py-2 bg-rose-600 text-white font-semibold rounded hover:bg-rose-700"
      >
        Save All Slides
      </button>

      {/* Debug info */}
      <div className="mt-4 p-4 bg-gray-100 rounded">
        <h3 className="font-semibold mb-2">Debug Info:</h3>
        <p>Total slides: {slides.length}</p>
        <p>Total courses: {courses.length}</p>
        <pre className="text-xs mt-2 overflow-auto">
          {JSON.stringify(slides.map(s => ({ id: s.id, linked_course_id: s.linked_course_id })), null, 2)}
        </pre>
      </div>
    </div>
  );
}