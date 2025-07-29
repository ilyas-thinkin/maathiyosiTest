"use client";
import { useEffect } from "react";
import { createClientComponentClient } from "../components/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function StudentLogin() {
  const supabase = createClientComponentClient();
  const router = useRouter();

  // ✅ When component loads, check if already logged in
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.push("/"); // ✅ already logged in, send to home
      }
    };
    checkSession();
  }, [supabase, router]);

  // ✅ Handle Google login click
  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: "http://localhost:3000/", // 🔴 change to https://maathiyosi.io/ when live
      },
    });

    if (error) {
      console.error("Google login error:", error.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Student Login</h1>
      <button
        onClick={handleGoogleLogin}
        className="px-6 py-3 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 transition"
      >
        Sign in with Google
      </button>
    </div>
  );
}
