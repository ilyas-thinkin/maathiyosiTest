"use client";

import { useEffect, useState } from "react";
import { supabase } from "../components/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ phone: "", grade: "", school_or_job: "" });

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

      // Get student details
      const { data: student } = await supabase
        .from("students")
        .select("*")
        .eq("id", user.id)
        .single();

      if (!student) {
        router.push("/profile-setup"); // force setup if missing
      } else {
        setStudent({ ...student, name: user.user_metadata.full_name, avatar: user.user_metadata.avatar_url });
        setForm({
          phone: student.phone || "",
          grade: student.grade || "",
          school_or_job: student.school_or_job || "",
        });
      }
      setLoading(false);
    };

    getData();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!student) return;

    const { error } = await supabase
      .from("students")
      .update({
        phone: form.phone,
        grade: form.grade,
        school_or_job: form.school_or_job,
      })
      .eq("id", student.id);

    if (error) {
      alert(error.message);
    } else {
      setStudent({ ...student, ...form });
      setEditing(false);
    }
  };

  if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;

  return (
    <div className="flex h-screen flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-purple-100">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md text-center space-y-6">
        {/* Avatar */}
        <img
          src={student.avatar}
          alt="Profile"
          className="w-24 h-24 rounded-full mx-auto border-4 border-blue-500 shadow"
        />

        {/* Welcome */}
        <h1 className="text-2xl font-bold text-gray-800">
          Welcome, {student.name || "Student"} 👋
        </h1>

        {!editing ? (
          <div className="space-y-2 text-gray-600">
            <p>📧 {student.email}</p>
            <p>📞 {student.phone}</p>
            <p>🎓 {student.grade}</p>
            <p>🏫 {student.school_or_job}</p>

            <div className="flex justify-center gap-4 mt-4">
              <button
                onClick={() => setEditing(true)}
                className="bg-blue-500 text-white px-5 py-2 rounded-lg shadow hover:bg-blue-600"
              >
                Edit
              </button>
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-5 py-2 rounded-lg shadow hover:bg-red-600"
              >
                Logout
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleUpdate} className="space-y-3">
            <input
              type="text"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="Phone"
              className="w-full border rounded-lg px-3 py-2"
              required
            />
            <input
              type="text"
              value={form.grade}
              onChange={(e) => setForm({ ...form, grade: e.target.value })}
              placeholder="Grade"
              className="w-full border rounded-lg px-3 py-2"
              required
            />
            <input
              type="text"
              value={form.school_or_job}
              onChange={(e) => setForm({ ...form, school_or_job: e.target.value })}
              placeholder="School / College / Job"
              className="w-full border rounded-lg px-3 py-2"
              required
            />

            <div className="flex justify-center gap-4 mt-4">
              <button
                type="submit"
                className="bg-green-500 text-white px-5 py-2 rounded-lg shadow hover:bg-green-600"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="bg-gray-400 text-white px-5 py-2 rounded-lg shadow hover:bg-gray-500"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
