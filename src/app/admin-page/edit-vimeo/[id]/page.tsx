"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function EditVimeoCourse() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  useEffect(() => {
    // Redirect to admin page with a message
    alert("Vimeo course editing coming soon! Please delete and re-upload to make changes.");
    router.push("/admin-page");
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting...</p>
      </div>
    </div>
  );
}
