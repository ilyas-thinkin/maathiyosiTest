// src/app/checkout/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { supabase } from "../components/lib/supabaseClient";

function CheckoutPage() {
  const params = useSearchParams();
  const router = useRouter();
  const courseId = params?.get("course"); // safely access query param
  const [processing, setProcessing] = useState(true);

  useEffect(() => {
    async function enroll() {
      if (!courseId) return;

      const parts = courseId.split("_");
      if (parts.length < 2) {
        console.error("Invalid course ID format:", courseId);
        setProcessing(false);
        return;
      }

      const prefix = parts[0];
      const rawId = parts[1];

      // ✅ Check if user is logged in
      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;
      if (!user) {
        router.push(`/login?redirect=/checkout?course=${courseId}`);
        return;
      }

      // ✅ Enroll the user by inserting into purchases
      const { error } = await supabase.from("purchases").insert([
        {
          user_id: user.id,
          course_id: rawId,
          source: prefix,
          status: "success",
          payment_id: "fake-" + Date.now(),
        },
      ]);

      if (error) {
        console.error("Failed to insert purchase:", error.message);
        setProcessing(false);
        return;
      }

      // Redirect to course page after successful enrollment
      router.replace(`/courses/${courseId}`);
    }

    enroll();
  }, [courseId, router]);

  return (
    <div className="p-10 text-center">
      {processing ? "Processing your enrollment..." : "Something went wrong."}
    </div>
  );
}

// ✅ Dynamic import to prevent SSR
export default dynamic(() => Promise.resolve(CheckoutPage), {
  ssr: false,
});
