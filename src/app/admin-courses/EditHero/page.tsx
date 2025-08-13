"use client";

import { useEffect, useState, ChangeEvent } from "react";
import { supabase } from "../../components/lib/supabaseClient";
import { useRouter } from "next/navigation";

/* ─────────────────────────────  TYPES  ───────────────────────────── */
interface HeroSlide {
  id: string;
  image_url: string;
  heading: string;
  subheading: string;
  button_text: string;
  linked_course_id: string | null;
}
interface Course { id: string; title: string }

/* ─────────────────────────────  MAIN  ───────────────────────────── */
export default function EditHeroSlides() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [uploading, setUploading] = useState<string | null>(null); // slide.id being uploaded
  const router = useRouter();

  /* fetch existing slides + courses */
  useEffect(() => {
    (async () => {
      const [slidesRes, coursesRes] = await Promise.all([
        supabase.from("hero_slides").select("*").order("created_at", { ascending: true }),
        supabase.from("courses").select("id, title").order("title"),
      ]);
      if (slidesRes.error) console.error(slidesRes.error);
      else setSlides(slidesRes.data || []);
      if (coursesRes.error) console.error(coursesRes.error);
      else setCourses(coursesRes.data || []);
    })();
  }, []);

  /* ───────────────────── helpers ───────────────────── */
  const updateSlide = (id: string, upd: Partial<HeroSlide>) =>
    setSlides((s) => s.map((sl) => (sl.id === id ? { ...sl, ...upd } : sl)));

  const addSlide = () => {
    if (slides.length >= 7) return alert("Max 7 slides allowed.");
    setSlides((s) => [
      ...s,
      {
        id: crypto.randomUUID(), // temporary client-side id
        image_url: "",
        heading: "",
        subheading: "",
        button_text: "Browse Courses",
        linked_course_id: null,
      },
    ]);
  };

  const deleteSlide = async (id: string) => {
    /* if id is a real uuid we delete from db, otherwise just remove from state */
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
    const { error: upErr } = await supabase.storage.from("hero-images").upload(filePath, file, { upsert: true });
    if (upErr) alert(upErr.message);
    else {
      const { data } = supabase.storage.from("hero-images").getPublicUrl(filePath);
      updateSlide(id, { image_url: data.publicUrl });
    }
    setUploading(null);
  };

  const saveAll = async () => {
    /* upsert every slide: existing ones have real uuid; new ones have client uuid => insert */
    const { error } = await supabase.from("hero_slides").upsert(slides, { onConflict: "id" });
    if (error) return alert("Save failed.");
    alert("Saved!");
    router.push("/admin-courses");
  };

  /* ───────────────────── UI ───────────────────── */
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-center text-rose-600 mb-6">✏️ Edit Hero Slides</h1>

      {slides.map((s, idx) => (
        <div key={s.id} className="border rounded-lg p-4 mb-6 bg-gray-50">
          <h2 className="text-xl font-semibold mb-2">Slide {idx + 1}</h2>

          {/* image */}
          <label className="block mb-1 font-semibold">Image</label>
          {s.image_url && (
            <img src={s.image_url} alt="preview" className="w-full h-40 object-cover rounded mb-2" />
          )}
          <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, s.id)} disabled={uploading === s.id} />

          {/* fields */}
          <input className="w-full mt-2 p-2 border rounded" placeholder="Heading" value={s.heading} onChange={(e) => updateSlide(s.id, { heading: e.target.value })} />
          <textarea className="w-full mt-2 p-2 border rounded" placeholder="Subheading" value={s.subheading} onChange={(e) => updateSlide(s.id, { subheading: e.target.value })} />
          <input className="w-full mt-2 p-2 border rounded" placeholder="Button Text" value={s.button_text} onChange={(e) => updateSlide(s.id, { button_text: e.target.value })} />

          <select className="w-full mt-2 p-2 border rounded" value={s.linked_course_id || ""} onChange={(e) => updateSlide(s.id, { linked_course_id: e.target.value || null })}>
            <option value="">No Link</option>
            {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
          </select>

          <button onClick={() => deleteSlide(s.id)} className="mt-3 bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600">Delete Slide</button>
        </div>
      ))}

      {slides.length < 7 && (
        <button onClick={addSlide} className="w-full py-2 mb-4 bg-green-500 text-white rounded hover:bg-green-600">+ Add Slide</button>
      )}

      <button onClick={saveAll} className="w-full py-2 bg-rose-600 text-white font-semibold rounded hover:bg-rose-700">Save All Slides</button>
    </div>
  );
}