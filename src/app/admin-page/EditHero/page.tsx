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

/* ───────────────────────────────
   INTERFACES
─────────────────────────────── */
interface HeroSlide {
  id: string;
  image_url: string;
  localFile?: File | null;
  heading: string;
  subheading: string;
  button_text: string;
  linked_course_id: string | null;
  created_at?: string;
  created_by?: string;
}

interface MuxCourse {
  id: string;
  title: string;
  description?: string;
  price?: number;
  category?: string;
  thumbnail_url?: string;
  created_at?: string;
}

/* ───────────────────────────────
   MAIN COMPONENT
─────────────────────────────── */
export default function EditHeroSlides() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [courses, setCourses] = useState<MuxCourse[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  /* ────────────── AUTH CHECK ────────────── */
  useEffect(() => {
    const isAdmin = localStorage.getItem("isAdmin");
    if (isAdmin !== "true") {
      router.replace("/admin-login");
      return;
    }
    fetchSlidesAndCourses();
  }, [router]);

  /* ────────────── FETCH HERO SLIDES + COURSES ────────────── */
  const fetchSlidesAndCourses = async () => {
    try {
      setLoading(true);

      const slidesResponse = await fetch("/api/admin/fetch-hero-slides-new");
      const slidesResult = await slidesResponse.json();

      const coursesResponse = await fetch("/api/admin/fetch-mux-courses");
      const coursesResult = await coursesResponse.json();

      if (!slidesResponse.ok || slidesResult.error)
        throw new Error(slidesResult.error || "Failed to fetch slides");

      if (!coursesResponse.ok || !coursesResult.success)
        throw new Error(coursesResult.message || "Failed to fetch courses");

      if (slidesResult.data && Array.isArray(slidesResult.data)) {
        const sortedSlides = slidesResult.data.sort(
          (a: any, b: any) =>
            new Date(a.created_at || 0).getTime() -
            new Date(b.created_at || 0).getTime()
        );
        setSlides(
          sortedSlides.map((s: any) => ({
            ...s,
            linked_course_id: s.linked_course_id || null,
            localFile: null,
          }))
        );
      } else setSlides([]);

      if (coursesResult.data && Array.isArray(coursesResult.data)) {
        setCourses(coursesResult.data);
      } else setCourses([]);
    } catch (err: any) {
      console.error("Error fetching data:", err);
      alert(`Failed to fetch data: ${err.message}`);
      setSlides([]);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  /* ────────────── HELPERS ────────────── */
  const updateSlide = (id: string, upd: Partial<HeroSlide>) => {
    setSlides((prev) => prev.map((s) => (s.id === id ? { ...s, ...upd } : s)));
  };

  const addSlide = () => {
    if (slides.length >= 7) {
      alert("Maximum 7 slides allowed.");
      return;
    }
    const newSlide: HeroSlide = {
      id: crypto.randomUUID(),
      image_url: "",
      heading: "",
      subheading: "",
      button_text: "Browse Courses",
      linked_course_id: null,
      localFile: null,
    };
    setSlides((prev) => [...prev, newSlide]);
  };

  const deleteSlide = async (id: string) => {
    if (!confirm("Are you sure you want to delete this slide?")) return;

    const slideToDelete = slides.find((s) => s.id === id);

    if (slideToDelete && !slideToDelete.localFile && slideToDelete.created_at) {
      try {
        const { error } = await supabase.from("hero_slides_new").delete().eq("id", id);
        if (error) throw error;
      } catch (err: any) {
        console.error("Error deleting slide:", err);
        alert(`Failed to delete slide: ${err.message}`);
        return;
      }
    }

    setSlides((prev) => prev.filter((s) => s.id !== id));
  };

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>, id: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("Image size should be less than 5MB");
      return;
    }
    const previewUrl = URL.createObjectURL(file);
    updateSlide(id, { localFile: file, image_url: previewUrl });
  };

  /* ────────────── VALIDATE SLIDES ────────────── */
  const validateSlides = (): boolean => {
    for (const slide of slides) {
      if (!slide.image_url || slide.image_url === "") {
        alert("Please upload an image for all slides");
        return false;
      }
      if (!slide.heading || slide.heading.trim() === "") {
        alert("Please add a heading for all slides");
        return false;
      }
      if (!slide.subheading || slide.subheading.trim() === "") {
        alert("Please add a subheading for all slides");
        return false;
      }
    }
    return true;
  };

  /* ────────────── SAVE ALL ────────────── */
  const saveAll = async () => {
    try {
      if (!validateSlides()) return;
      setSaving(true);

      // 1️⃣ Upload images via server-side API
      const uploadedSlides = await Promise.all(
        slides.map(async (slide) => {
          if (!slide.localFile) {
            const { localFile, ...slideWithoutFile } = slide;
            return slideWithoutFile;
          }

          const formData = new FormData();
          formData.append("file", slide.localFile);

          const uploadResponse = await fetch("/api/admin/upload-hero-image", {
            method: "POST",
            body: formData,
          });

          const uploadResult = await uploadResponse.json();

          if (!uploadResult.success) {
            console.error("Upload failed:", uploadResult.error);
            throw new Error(uploadResult.error || "Failed to upload image");
          }

          console.log("Uploaded image URL:", uploadResult.url);

          const { localFile, ...slideWithoutFile } = slide;
          return { ...slideWithoutFile, image_url: uploadResult.url };
        })
      );

      // 2️⃣ Log all slide columns for debugging
      uploadedSlides.forEach((s, i) => {
        console.log(`Slide ${i + 1}:`, {
          ID: s.id,
          Heading: s.heading,
          Subheading: s.subheading,
          ButtonText: s.button_text,
          LinkedCourseID: s.linked_course_id,
          ImageURL: s.image_url,
          CreatedBy: s.created_by,
        });
      });
      console.table(uploadedSlides);

      // 3️⃣ Save to database
      const response = await fetch("/api/admin/save-hero-slides-new", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(uploadedSlides),
      });

      const result = await response.json();
      if (!response.ok || !result.success)
        throw new Error(result.error || "Failed to save slides");

      alert("✅ Hero slides saved successfully!");
      setSlides(uploadedSlides.map((s) => ({ ...s, localFile: null })));
      await fetchSlidesAndCourses();
    } catch (err: any) {
      console.error("Save failed:", err);
      alert(`❌ Failed to save slides: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  /* ────────────── UI RENDER ────────────── */
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <Loader2 className="animate-spin text-rose-600 mx-auto mb-4" size={48} />
          <p className="text-gray-600">Loading slides...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto p-6 space-y-8">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <h1 className="text-4xl font-bold text-rose-600 mb-2">✏️ Manage Hero Slides</h1>
          <p className="text-gray-600">Add up to 7 hero slides for your homepage carousel</p>
        </motion.div>

        <AnimatePresence mode="popLayout">
          {slides.map((s, idx) => (
            <motion.div key={s.id} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }} className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 space-y-4 relative hover:shadow-md transition-shadow">
              <button onClick={() => deleteSlide(s.id)} className="absolute top-4 right-4 text-red-500 hover:text-red-600 transition-colors p-2" aria-label="Delete slide">
                <Trash2 size={20} />
              </button>
              <h2 className="text-lg font-semibold text-gray-800">Slide {idx + 1}</h2>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Image <span className="text-red-500">*</span></label>
                {s.image_url ? (
                  <div className="relative group">
                    <img src={s.image_url} alt={`Slide ${idx + 1} preview`} className="w-full h-48 object-cover rounded-lg border border-gray-200" />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-opacity rounded-lg" />
                  </div>
                ) : (
                  <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 border-2 border-dashed border-gray-300">
                    <div className="text-center">
                      <ImageIcon size={32} className="mx-auto mb-2" />
                      <p className="text-sm">No image uploaded</p>
                    </div>
                  </div>
                )}
                <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, s.id)} className="text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-rose-50 file:text-rose-700 hover:file:bg-rose-100 cursor-pointer" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Heading <span className="text-red-500">*</span></label>
                  <input className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent" placeholder="Enter heading" value={s.heading} onChange={(e) => updateSlide(s.id, { heading: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Button Text</label>
                  <input className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent" placeholder="Enter button text" value={s.button_text} onChange={(e) => updateSlide(s.id, { button_text: e.target.value })} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subheading <span className="text-red-500">*</span></label>
                <textarea className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent resize-none" placeholder="Enter subheading" rows={3} value={s.subheading} onChange={(e) => updateSlide(s.id, { subheading: e.target.value })} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Linked Course (Optional)</label>
                <select className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent" value={s.linked_course_id || ""} onChange={(e) => updateSlide(s.id, { linked_course_id: e.target.value || null })}>
                  <option value="">No Link</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {slides.length < 7 && (
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={addSlide} className="w-full py-3 bg-green-500 text-white rounded-lg flex items-center justify-center space-x-2 hover:bg-green-600 transition-colors font-medium shadow-sm">
            <PlusCircle size={20} />
            <span>Add New Slide</span>
          </motion.button>
        )}

        <motion.button whileHover={{ scale: saving ? 1 : 1.02 }} whileTap={{ scale: saving ? 1 : 0.98 }} onClick={saveAll} disabled={saving || slides.length === 0} className="w-full py-4 bg-rose-600 text-white font-semibold rounded-lg flex items-center justify-center space-x-2 hover:bg-rose-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md">
          {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
          <span>{saving ? "Saving..." : "Save All Slides"}</span>
        </motion.button>

        {slides.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
            <ImageIcon size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 mb-4">No slides added yet</p>
            <button onClick={addSlide} className="px-6 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors font-medium">Add Your First Slide</button>
          </div>
        )}
      </div>
    </div>
  );
}
