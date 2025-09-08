"use client";

import { supabase } from "../components/lib/supabaseClient";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect"); // get redirect if present

  const handleLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin + "/login", // ensures callback comes back here
      },
    });
    if (error) {
      alert(error.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      const user = data.user;
      if (user) {
        // Check if student record exists
        const { data: student } = await supabase
          .from("students")
          .select("*")
          .eq("id", user.id)
          .single();

        if (student) {
          // If redirect param exists → go there, else → dashboard
          router.push(redirectUrl || "/dashboard");
        } else {
          router.push("/profile-setup");
        }
      }
    });
  }, [router, redirectUrl]);

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <div className="bg-white shadow-lg p-8 rounded-2xl w-96 text-center">
        <h1 className="text-2xl font-semibold mb-6">Login to Maathiyosi</h1>
        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-xl shadow"
        >
          {loading ? "Redirecting..." : "Sign in with Google"}
        </button>
      </div>
    </div>
  );
}
