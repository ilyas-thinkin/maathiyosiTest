"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FiEdit, FiTrash2, FiPlus, FiX, FiSave, FiArrowLeft, FiUpload } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Testimonial = {
  id: string;
  name: string;
  role: string;
  feedback: string;
  image_url: string | null;
  display_order: number;
  row_number: number;
  is_active: boolean;
  created_at: string;
};

export default function AdminTestimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    role: "",
    feedback: "",
    image_url: "",
    row_number: 1,
    display_order: 0,
  });

  // Check admin authentication
  useEffect(() => {
    const checkAuth = () => {
      if (typeof window === "undefined") return;
      const isAdmin = localStorage.getItem("isAdmin");
      if (isAdmin !== "true") {
        router.replace("/admin-login");
      } else {
        setCheckingAuth(false);
      }
    };
    checkAuth();
  }, [router]);

  // Fetch testimonials
  useEffect(() => {
    if (!checkingAuth) fetchTestimonials();
  }, [checkingAuth]);

  const fetchTestimonials = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/testimonials", { cache: "no-store" });
      const result = await res.json();

      if (result.success && Array.isArray(result.data)) {
        setTestimonials(result.data);
      }
    } catch (err) {
      console.error("Failed to fetch testimonials:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setFormData({
      name: "",
      role: "",
      feedback: "",
      image_url: "",
      row_number: 1,
      display_order: 0,
    });
    setEditingId(null);
    setShowAddModal(true);
  };

  const handleEdit = (testimonial: Testimonial) => {
    setFormData({
      name: testimonial.name,
      role: testimonial.role,
      feedback: testimonial.feedback,
      image_url: testimonial.image_url || "",
      row_number: testimonial.row_number,
      display_order: testimonial.display_order,
    });
    setEditingId(testimonial.id);
    setShowAddModal(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("❌ Please upload an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("❌ Image size should be less than 5MB");
      return;
    }

    setUploading(true);
    try {
      // Generate unique filename
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = fileName;

      // Upload to Supabase storage
      const { data, error } = await supabase.storage
        .from("testimonial-image")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) throw error;

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from("testimonial-image")
        .getPublicUrl(filePath);

      setFormData({ ...formData, image_url: publicUrlData.publicUrl });
      alert("✅ Image uploaded successfully!");
    } catch (err: any) {
      console.error("Upload error:", err);
      alert("❌ Failed to upload image: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = "/api/admin/testimonials";
      const method = editingId ? "PUT" : "POST";
      const body = editingId
        ? { id: editingId, ...formData }
        : formData;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const result = await res.json();

      if (result.success) {
        alert(`✅ Testimonial ${editingId ? "updated" : "created"} successfully!`);
        setShowAddModal(false);
        fetchTestimonials();
      } else {
        throw new Error(result.error || "Failed to save");
      }
    } catch (err: any) {
      alert("❌ Failed to save: " + err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this testimonial?")) return;

    setDeleting(id);
    try {
      const res = await fetch(`/api/admin/testimonials?id=${id}`, {
        method: "DELETE",
      });

      const result = await res.json();

      if (result.success) {
        alert("✅ Testimonial deleted successfully!");
        fetchTestimonials();
      } else {
        throw new Error(result.error || "Failed to delete");
      }
    } catch (err: any) {
      alert("❌ Failed to delete: " + err.message);
    } finally {
      setDeleting(null);
    }
  };

  const toggleActive = async (testimonial: Testimonial) => {
    try {
      const res = await fetch("/api/admin/testimonials", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: testimonial.id,
          is_active: !testimonial.is_active,
        }),
      });

      const result = await res.json();

      if (result.success) {
        fetchTestimonials();
      } else {
        throw new Error(result.error || "Failed to toggle active status");
      }
    } catch (err: any) {
      alert("❌ Failed to toggle: " + err.message);
    }
  };

  if (checkingAuth || loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-14 w-14 border-4 border-amber-500 border-t-transparent"></div>
      </div>
    );
  }

  const row1Testimonials = testimonials.filter((t) => t.row_number === 1);
  const row2Testimonials = testimonials.filter((t) => t.row_number === 2);

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-all"
          >
            <FiArrowLeft /> Back
          </button>
          <div>
            <h1 className="text-4xl font-extrabold text-amber-600">
              Manage Testimonials
            </h1>
            <p className="text-gray-600 mt-1">
              Total: {testimonials.length} testimonials
            </p>
          </div>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-5 py-3 bg-amber-600 text-white font-semibold rounded-lg hover:bg-amber-700 transition-all"
        >
          <FiPlus /> Add New Testimonial
        </button>
      </div>

      {/* Row 1 */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Row 1 (Scrolls Left)</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <AnimatePresence>
            {row1Testimonials.map((testimonial, index) => (
              <TestimonialCard
                key={testimonial.id}
                testimonial={testimonial}
                index={index}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onToggleActive={toggleActive}
                deleting={deleting === testimonial.id}
              />
            ))}
          </AnimatePresence>
        </div>
        {row1Testimonials.length === 0 && (
          <p className="text-center text-gray-400 py-10">No testimonials in Row 1</p>
        )}
      </div>

      {/* Row 2 */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Row 2 (Scrolls Right)</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <AnimatePresence>
            {row2Testimonials.map((testimonial, index) => (
              <TestimonialCard
                key={testimonial.id}
                testimonial={testimonial}
                index={index}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onToggleActive={toggleActive}
                deleting={deleting === testimonial.id}
              />
            ))}
          </AnimatePresence>
        </div>
        {row2Testimonials.length === 0 && (
          <p className="text-center text-gray-400 py-10">No testimonials in Row 2</p>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-amber-600">
                {editingId ? "Edit Testimonial" : "Add New Testimonial"}
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FiX size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Role *
                </label>
                <input
                  type="text"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="e.g., Class 12 Student"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Feedback *
                </label>
                <textarea
                  value={formData.feedback}
                  onChange={(e) => setFormData({ ...formData, feedback: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  rows={4}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Profile Image
                </label>

                {/* Image Preview */}
                {formData.image_url && (
                  <div className="mb-3 flex items-center gap-3">
                    <img
                      src={formData.image_url}
                      alt="Preview"
                      className="w-20 h-20 rounded-full object-cover border-2 border-amber-300"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, image_url: "" })}
                      className="text-sm text-red-600 hover:text-red-700 font-semibold"
                    >
                      Remove Image
                    </button>
                  </div>
                )}

                {/* Upload Button */}
                <div className="flex gap-2">
                  <label className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 border-2 border-amber-300 rounded-lg hover:bg-amber-100 transition-all cursor-pointer font-semibold">
                    <FiUpload />
                    {uploading ? "Uploading..." : "Upload Image"}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={uploading}
                    />
                  </label>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Recommended: Square image (1:1 ratio), max 5MB
                </p>

                {/* Or URL Input */}
                <div className="mt-3">
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Or paste image URL
                  </label>
                  <input
                    type="text"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Row Number *
                  </label>
                  <select
                    value={formData.row_number}
                    onChange={(e) => setFormData({ ...formData, row_number: Number(e.target.value) })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value={1}>Row 1 (Scrolls Left)</option>
                    <option value={2}>Row 2 (Scrolls Right)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Display Order *
                  </label>
                  <input
                    type="number"
                    value={formData.display_order}
                    onChange={(e) => setFormData({ ...formData, display_order: Number(e.target.value) })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    min={0}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-5 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-amber-600 text-white font-semibold rounded-lg hover:bg-amber-700 transition-all"
                >
                  <FiSave /> {editingId ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}

function TestimonialCard({
  testimonial,
  index,
  onEdit,
  onDelete,
  onToggleActive,
  deleting,
}: {
  testimonial: Testimonial;
  index: number;
  onEdit: (t: Testimonial) => void;
  onDelete: (id: string) => void;
  onToggleActive: (t: Testimonial) => void;
  deleting: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3, delay: index * 0.02 }}
      className={`bg-white rounded-xl border-2 shadow-md p-6 flex flex-col gap-3 ${
        testimonial.is_active ? "border-amber-200" : "border-gray-200 opacity-60"
      }`}
    >
      {/* Image */}
      {testimonial.image_url && (
        <img
          src={testimonial.image_url}
          alt={testimonial.name}
          className="w-16 h-16 rounded-full object-cover border-2 border-amber-300"
        />
      )}

      {/* Content */}
      <div>
        <h3 className="font-bold text-gray-900 text-lg">{testimonial.name}</h3>
        <p className="text-sm text-amber-600 font-semibold">{testimonial.role}</p>
      </div>

      <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed">
        {testimonial.feedback}
      </p>

      {/* Meta Info */}
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <span className="bg-gray-100 px-2 py-1 rounded">Order: {testimonial.display_order}</span>
        <span className={`px-2 py-1 rounded ${testimonial.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
          {testimonial.is_active ? "Active" : "Inactive"}
        </span>
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-2">
        <button
          onClick={() => onToggleActive(testimonial)}
          className={`flex-1 px-3 py-2 text-sm font-semibold rounded-lg transition-all ${
            testimonial.is_active
              ? "bg-red-100 text-red-700 hover:bg-red-200"
              : "bg-green-100 text-green-700 hover:bg-green-200"
          }`}
        >
          {testimonial.is_active ? "Deactivate" : "Activate"}
        </button>
        <button
          onClick={() => onEdit(testimonial)}
          className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-all"
        >
          <FiEdit />
        </button>
        <button
          onClick={() => onDelete(testimonial.id)}
          disabled={deleting}
          className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-all disabled:opacity-50"
        >
          {deleting ? (
            <div className="animate-spin h-4 w-4 border-2 border-red-700 border-t-transparent rounded-full" />
          ) : (
            <FiTrash2 />
          )}
        </button>
      </div>
    </motion.div>
  );
}
