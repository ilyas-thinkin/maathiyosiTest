"use client";

import { useState, useEffect } from "react";
import { supabase } from "../components/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function ProfileSetup() {
    const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [grade, setGrade] = useState("");
  const [schoolJob, setSchoolJob] = useState("");
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUser(data.user);
      } else {
        router.push("/login");
      }
    });
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const { error } = await supabase.from("user").insert([
      {
        id: user.id,
        username: user.user_metadata.full_name || "",
        email: user.email,
        phone,
        grade,
        school_or_job: schoolJob,
      },
    ]);

    if (error) {
      alert(error.message);
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <div className="bg-white shadow-md rounded-xl p-6 w-96">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img
            src="/images/Maathiyosi_Logo_Rect.png"
            alt="Maathiyosi"
            className="h-12 object-contain"
          />
        </div>
        <h1 className="text-xl font-semibold mb-4">Complete Your Profile</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
            <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full border px-3 py-2 rounded-lg"
            required
          />
          <input
            type="text"
            placeholder="Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full border px-3 py-2 rounded-lg"
            required
          />
          <input
            type="text"
            placeholder="Grade"
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
            className="w-full border px-3 py-2 rounded-lg"
            required
          />
          <input
            type="text"
            placeholder="School / College / Job"
            value={schoolJob}
            onChange={(e) => setSchoolJob(e.target.value)}
            className="w-full border px-3 py-2 rounded-lg"
            required
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
          >
            Save & Continue
          </button>
        </form>
      </div>
    </div>
  );
}
