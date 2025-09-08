"use client";

import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { FcGoogle } from "react-icons/fc";
import { useEffect } from "react";

export default function StudentLogin() {
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session?.user) {
      router.push("/dashboard"); // if already logged in
    }
  }, [session, router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="bg-white shadow-lg rounded-2xl p-10 w-full max-w-md text-center">
        <h1 className="text-2xl font-semibold mb-4">Student Login</h1>
        <p className="text-gray-500 mb-6">Sign in to access your courses</p>

        <Button
          onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
          className="w-full flex items-center justify-center gap-2 bg-white text-black border border-gray-300 hover:bg-gray-100"
        >
          <FcGoogle size={22} /> Continue with Google
        </Button>
      </div>
    </div>
  );
}
