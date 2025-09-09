"use client";

import { useEffect, useState, ChangeEvent } from "react";
import { supabase } from "../../components/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  PlusCircle,
  Trash2,
  Image as ImageIcon,
  Save,
  Loader2,
} from "lucide-react";

/* ────────────── TYPES ────────────── */
interface HeroSlide {
  id: string;
  image_url: string;
  heading: string;
  subheading: string;
  button_text: string;
  linked_course_id: string | null;
}

interface Course {
  id: string;
  title: string;
  source: "main" | "yt";
}

export default function EditHeroSlides() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [uploading, setUploading] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const router = useRouter();

  /* ────────────── AUTH CHECK ────────────── */
  useEffect(() => {
  const checkAdmin = async () => {
    // 1. Get current session
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      router.push("/login"); // redirect if not logged in
      return;
    }

    // 2. Fetch from "users" table using session user id
    const { data: userData, error } = await supabase
      .from("users")
      .select("role, is_admin")
      .eq("id", session.user.id)
      .single();

    // 3. Check if admin
    if (error || !userData || userData.role !== "admin" || userData.is_admin !== true) {
      router.push("/not-authorized"); // redirect if not admin
      return;
    }

    // ✅ User is admin
    setIsAdmin(true);
    setLoading(false);
  };

  checkAdmin();
}, [router]);


  /* ────────────── FETCH SLIDES AND COURSES ────────────── */
  useEffect(() => {
    if (!isAdmin) return;

    (async () => {
      const [slidesRes, mainRes, ytRes] = await Promise.all([
        supabase.from("hero_slides").select("*").order("created_at", { ascending: true }),
        supabase.from("courses").select("id, title").order("title"),
        supabase.from("courses_yt").select("id, title").order("title"),
      ]);

      if (!slidesRes.error && slidesRes.data) {
        setSlides(
          slidesRes.data.map((s: any) => ({
            ...s,
            linked_course_id:
              s.linked_course_source && s.linked_course_id
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
  }, [isAdmin]);

  /* ────────────── HELPERS ────────────── */
  const updateSlide = (id: string, upd: Partial<HeroSlide>) => {
    setSlides((prev) => prev.map((s) => (s.id === id ? { ...s, ...upd } : s)));
  };

  const addSlide = () => {
    if (slides.length >= 7) return alert("Max 7 slides allowed.");
    setSlides((prev) => [
      ...prev,
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
    if (confirm("Are you sure you want to delete this slide?")) {
      if (/^[0-9a-f\-]{36}$/i.test(id)) {
        await supabase.from("hero_slides").delete().eq("id", id);
      }
      setSlides((prev) => prev.filter((s) => s.id !== id));
    }
  };

  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>, id: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(id);

    const fileExt = file.name.split(".").pop();
    const filePath = `${Date.now()}.${fileExt}`;

    const { error } = await supabase.storage
      .from("hero-images")
      .upload(filePath, file, { upsert: true });

    if (error) {
      alert(error.message);
    } else {
      const { data } = supabase.storage.from("hero-images").getPublicUrl(filePath);
      updateSlide(id, { image_url: data.publicUrl });
    }
    setUploading(null);
  };

  /* ────────────── SAVE TO SUPABASE ────────────── */
  const saveAll = async () => {
    setSaving(true);

    const payload = slides.map((s) => {
      let courseSource: string | null = null;
      let courseId: string | null = null;

      if (s.linked_course_id?.includes(":")) {
        const [src, id] = s.linked_course_id.split(":");
        courseSource = src;
        courseId = id;
      }

      return {
        id: /^[0-9a-f\-]{36}$/i.test(s.id) ? s.id : undefined,
        image_url: s.image_url || null,
        heading: s.heading || null,
        subheading: s.subheading || null,
        button_text: s.button_text || null,
        linked_course_source: courseSource,
        linked_course_id: courseId,
      };
    });

    const { error } = await supabase.from("hero_slides").upsert(payload, { onConflict: "id" });

    setSaving(false);
    if (error) return alert("Save failed: " + error.message);

    alert("Slides saved successfully!");
    router.push("/admin-courses");
  };

  /* ────────────── LOADING / UNAUTHORIZED ────────────── */
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="animate-spin text-rose-600" size={32} />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-xl text-red-500">🚫 You are not authorized to view this page.</p>
      </div>
    );
  }

  /* ────────────── UI ────────────── */
  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl font-bold text-center text-rose-600"
      >
        ✏️ Manage Hero Slides
      </motion.h1>

      <AnimatePresence>
        {slides.map((s, idx) => (
          <motion.div
            key={s.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 space-y-4 relative"
          >
            {/* Delete button */}
            <button
              onClick={() => deleteSlide(s.id)}
              className="absolute top-4 right-4 text-red-500 hover:text-red-600"
            >
              <Trash2 size={20} />
            </button>

            <h2 className="text-lg font-semibold text-gray-800">Slide {idx + 1}</h2>

            {/* Image Upload */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Image</label>
              {s.image_url ? (
                <img
                  src={s.image_url}
                  alt="preview"
                  className="w-full h-40 object-cover rounded-lg border border-gray-100"
                />
              ) : (
                <div className="w-full h-40 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 border border-gray-200">
                  <ImageIcon size={32} />
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, s.id)}
                disabled={uploading === s.id}
              />
            </div>

            {/* Text Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                className="p-2 border rounded focus:outline-none focus:ring focus:ring-rose-200"
                placeholder="Heading"
                value={s.heading}
                onChange={(e) => updateSlide(s.id, { heading: e.target.value })}
              />
              <input
                className="p-2 border rounded focus:outline-none focus:ring focus:ring-rose-200"
                placeholder="Button Text"
                value={s.button_text}
                onChange={(e) => updateSlide(s.id, { button_text: e.target.value })}
              />
            </div>
            <textarea
              className="w-full p-2 border rounded focus:outline-none focus:ring focus:ring-rose-200"
              placeholder="Subheading"
              value={s.subheading}
              onChange={(e) => updateSlide(s.id, { subheading: e.target.value })}
            />

            {/* Linked Course Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Linked Course</label>
              <select
                className="w-full mt-1 p-2 border rounded focus:outline-none focus:ring focus:ring-rose-200"
                value={s.linked_course_id || ""}
                onChange={(e) => updateSlide(s.id, { linked_course_id: e.target.value || null })}
              >
                <option value="">No Link</option>
                {courses.map((c) => (
                  <option key={`${c.source}-${c.id}`} value={`${c.source}:${c.id}`}>
                    {c.source === "yt" ? `[YT] ${c.title}` : c.title}
                  </option>
                ))}
              </select>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Add Slide Button */}
      {slides.length < 7 && (
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={addSlide}
          className="w-full py-3 bg-green-500 text-white rounded-lg flex items-center justify-center space-x-2 hover:bg-green-600 transition"
        >
          <PlusCircle size={20} />
          <span>Add Slide</span>
        </motion.button>
      )}

      {/* Save Button */}
      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={saveAll}
        disabled={saving}
        className="w-full py-3 bg-rose-600 text-white font-semibold rounded-lg flex items-center justify-center space-x-2 hover:bg-rose-700 transition disabled:opacity-50"
      >
        {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
        <span>{saving ? "Saving..." : "Save All Slides"}</span>
      </motion.button>
    </div>
  );
}
