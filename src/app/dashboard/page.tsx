"use client";

import { useEffect, useState } from "react";
import { supabase } from "../components/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Pencil, LogOut, Save, X } from "lucide-react";
import { ScatterBoxLoaderComponent } from "../components/ScatterBoxLoaderComponent";

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [navigating, setNavigating] = useState(false);
  const [form, setForm] = useState({username: "", phone: "", grade: "", school_or_job: "" });

  const router = useRouter();

  useEffect(() => {
    const getData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      // Fetch user data from public.user
      const { data: userData, error } = await supabase
        .from("user")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error || !userData) {
        router.push("/profile-setup");
        return;
      }

      setUser({
        ...userData,
        name: user.user_metadata.full_name,
        avatar: user.user_metadata.avatar_url,
      });

      setForm({
        phone: userData.phone || "",
        username: userData.username || "",
        grade: userData.grade || "",
        school_or_job: userData.school_or_job || "",
      });

      setLoading(false);
    };

    getData();
  }, [router]);

  const handleLogout = async () => {
    setNavigating(true);
    await supabase.auth.signOut();
    router.push("/login");
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const { error } = await supabase
      .from("user")
      .update({
        username: form.username,
        phone: form.phone,
        grade: form.grade,
        school_or_job: form.school_or_job,
      })
      .eq("id", user.id);

    if (error) {
      alert(error.message);
    } else {
      setUser({ ...user, ...form });
      setEditing(false);
    }
  };

  if (loading || navigating) {
    return <ScatterBoxLoaderComponent />;
  }

  return (
    <div className="flex h-screen items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-100 p-4">
      <motion.div
        className="backdrop-blur-lg bg-white/30 shadow-xl rounded-3xl p-8 w-full max-w-md text-center space-y-6 border border-white/20"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        {/* Profile Avatar */}
        <motion.img
          src={user.avatar || "/default-avatar.png"}
          alt="Profile"
          className="w-24 h-24 rounded-full mx-auto border-4 border-indigo-400 shadow-lg"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4 }}
        />

        {/* Welcome Text */}
        <motion.h1
          className="text-2xl font-bold text-gray-800"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          Welcome, {user.name || "User"} 👋
        </motion.h1>

        <AnimatePresence mode="wait">
          {!editing ? (
            <motion.div
              key="view-mode"
              className="space-y-2 text-gray-700"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <p>📧 <span className="font-medium">{user.email}</span></p>
              <p>📞 {user.phone || "Not provided"}</p>
              <p>📞 {user.username || "Not provided"}</p>
              <p>🎓 {user.grade || "Not provided"}</p>
              <p>🏫 {user.school_or_job || "Not provided"}</p>
              

              <div className="flex flex-col gap-3 mt-6">
                <button
                  onClick={() => {
                    setNavigating(true);
                    router.push("/courses");
                  }}
                  className="w-full bg-[#de5252] text-white px-5 py-3 rounded-lg shadow-lg hover:bg-[#f66] transition font-semibold"
                >
                  View All Courses
                </button>
                <button
                  onClick={() => {
                    setNavigating(true);
                    router.push("/my-courses");
                  }}
                  className="w-full bg-green-600 text-white px-5 py-3 rounded-lg shadow-lg hover:bg-green-700 transition font-semibold"
                >
                  My Courses
                </button>
              </div>

              <div className="flex justify-center gap-4 mt-4">
                <button
                  onClick={() => setEditing(true)}
                  className="flex items-center gap-2 bg-indigo-500 text-white px-5 py-2 rounded-lg shadow hover:bg-indigo-600 transition"
                >
                  <Pencil size={18} /> Edit
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 bg-red-500 text-white px-5 py-2 rounded-lg shadow hover:bg-red-600 transition"
                >
                  <LogOut size={18} /> Logout
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.form
              key="edit-mode"
              onSubmit={handleUpdate}
              className="space-y-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
                <input
                type="text"
                value={form.username}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="Phone"
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-400 outline-none"
                required
              />
              <input
                type="text"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="Phone"
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-400 outline-none"
                required
              />
              <input
                type="text"
                value={form.grade}
                onChange={(e) => setForm({ ...form, grade: e.target.value })}
                placeholder="Grade"
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-400 outline-none"
                required
              />
              <input
                type="text"
                value={form.school_or_job}
                onChange={(e) =>
                  setForm({ ...form, school_or_job: e.target.value })
                }
                placeholder="School / College / Job"
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-400 outline-none"
                required
              />

              <div className="flex justify-center gap-4 mt-4">
                <button
                  type="submit"
                  className="flex items-center gap-2 bg-green-500 text-white px-5 py-2 rounded-lg shadow hover:bg-green-600 transition"
                >
                  <Save size={18} /> Save
                </button>
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="flex items-center gap-2 bg-gray-400 text-white px-5 py-2 rounded-lg shadow hover:bg-gray-500 transition"
                >
                  <X size={18} /> Cancel
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
