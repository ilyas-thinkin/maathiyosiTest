'use client';

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "../components/lib/supabaseClient";

export default function LoginContent() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect"); // ?redirect=/something

  const handleLogin = async () => {
    try {
      setLoading(true);

      const redirectTo =
        typeof window !== "undefined" ? `${window.location.origin}/login` : "/login";

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo },
      });

      if (error) {
        alert(error.message);
        setLoading(false);
      }
    } catch (err: any) {
      console.error("Login error:", err.message || err);
      alert("Failed to initiate login. Please try again.");
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const checkUser = async () => {
      try {
        const { data, error } = await supabase.auth.getUser();

        if (error) {
          console.error("Supabase getUser error:", error.message);
          return;
        }

        const user = data?.user;
        if (user) {
          // Check if student record exists
          const { data: student, error: studentError } = await supabase
            .from("students")
            .select("*")
            .eq("id", user.id)
            .single();

          if (studentError && studentError.code !== "PGRST116") {
            console.error("Student fetch error:", studentError.message);
            return;
          }

          if (isMounted) {
            if (student) {
              router.push(redirectUrl || "/dashboard");
            } else {
              router.push("/profile-setup");
            }
          }
        }
      } catch (err: any) {
        console.error("Error checking user session:", err.message || err);
      }
    };

    checkUser();

    return () => {
      isMounted = false;
    };
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
