'use client';

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "../components/lib/supabaseClient";
import { motion } from "framer-motion";
import { LogIn } from "lucide-react";

export default function LoginContent() {
  const [loading, setLoading] = useState(false);
  const [checkingUser, setCheckingUser] = useState(true);
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
      setCheckingUser(true);
      try {
        // ✅ Step 1: Get current session
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error) {
          console.error("Supabase getUser error:", error.message);
          setCheckingUser(false);
          return;
        }

        // ❌ No active session, stop here
        if (!user) {
          setCheckingUser(false);
          return;
        }

        // ✅ Step 2: Check if the user exists in the "user" table
        const { data: userRecord, error: userError } = await supabase
          .from("user")
          .select("*")
          .eq("id", user.id)
          .single();

        if (userError && userError.code !== "PGRST116") {
          console.error("Error fetching user:", userError.message);
          setCheckingUser(false);
          return;
        }

        // ✅ Step 3: Decide where to redirect
        if (isMounted) {
          if (userRecord) {
            // Existing user -> Dashboard
            router.push(redirectUrl || "/dashboard");
          } else {
            // New user -> Profile Setup
            router.push("/profile-setup");
          }
        }
      } catch (err: any) {
        console.error("Error checking user session:", err.message || err);
      } finally {
        setCheckingUser(false);
      }
    };

    checkUser();

    return () => {
      isMounted = false;
    };
  }, [router, redirectUrl]);

  return (
    <div className="flex h-screen items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-100">
      <motion.div
        className="backdrop-blur-lg bg-white/30 shadow-xl rounded-3xl p-8 w-full max-w-sm text-center border border-white/20"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        {/* Logo Section */}
        <motion.div
          className="mb-6 flex flex-col items-center space-y-3"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <img
            src="/logo.png"
            alt="Maathiyosi Logo"
            className="w-20 h-20 rounded-full shadow-lg border-2 border-indigo-400"
          />
          <h1 className="text-2xl font-bold text-gray-800">Welcome to Maathiyosi</h1>
          <p className="text-gray-600 text-sm">Your learning journey starts here!</p>
        </motion.div>

        {/* Show loader while checking user */}
        {checkingUser ? (
          <p className="text-gray-500 text-sm">Checking session...</p>
        ) : (
          <motion.button
            onClick={handleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-xl shadow transition-transform transform hover:scale-105 active:scale-95"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <LogIn size={20} />
            {loading ? "Redirecting..." : "Sign in with Google"}
          </motion.button>
        )}

        {/* Footer Note */}
        <motion.p
          className="text-gray-500 text-xs mt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          By signing in, you agree to our{" "}
          <span className="underline cursor-pointer hover:text-indigo-600">
            Terms & Privacy Policy
          </span>
        </motion.p>
      </motion.div>
    </div>
  );
}
