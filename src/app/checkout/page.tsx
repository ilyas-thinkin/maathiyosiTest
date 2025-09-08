"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "../components/lib/supabaseClient";

export const dynamic = "force-dynamic"; // Prevent static prerendering

export default function CheckoutPage() {
  const params = useSearchParams();
  const router = useRouter();

  const [status, setStatus] = useState<"loading" | "error" | "success">("loading");
  const [message, setMessage] = useState<string>("Processing your enrollment...");

  const courseId = params.get("course"); // expected format: yt_123 or c_456

  useEffect(() => {
    async function enroll() {
      if (!courseId) {
        setStatus("error");
        setMessage("No course selected. Please try again.");
        return;
      }

      const [prefix, rawId] = courseId.split("_");

      if (!prefix || !rawId) {
        setStatus("error");
        setMessage("Invalid course ID format.");
        return;
      }

      try {
        // Get logged-in user
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError || !userData?.user) {
          router.push("/login");
          return;
        }

        const user = userData.user;

        // Check if purchase already exists
        const { data: existingPurchase, error: existingError } = await supabase
          .from("purchases")
          .select("id")
          .eq("user_id", user.id)
          .eq("course_id", rawId)
          .eq("source", prefix)
          .single();

        if (existingError && existingError.code !== "PGRST116") {
          throw new Error("Failed to check existing purchase");
        }

        if (existingPurchase) {
          // Already purchased, redirect directly
          router.replace(`/courses/${courseId}`);
          return;
        }

        // Insert new purchase
        const { error: insertError } = await supabase.from("purchases").insert([
          {
            user_id: user.id,
            course_id: rawId,
            source: prefix,
            status: "success",
            payment_id: "fake-" + Date.now(),
          },
        ]);

        if (insertError) throw insertError;

        setStatus("success");
        setMessage("Enrollment successful! Redirecting to your course...");
        
        // Redirect after short delay
        setTimeout(() => {
          router.replace(`/courses/${courseId}`);
        }, 1500);
      } catch (err: any) {
        console.error("Checkout error:", err.message || err);
        setStatus("error");
        setMessage("Something went wrong during enrollment. Please try again.");
      }
    }

    enroll();
  }, [courseId, router]);

  return (
    <div className="p-10 text-center">
      <p
        className={`text-lg font-medium ${
          status === "error" ? "text-red-600" : "text-zinc-800"
        }`}
      >
        {message}
      </p>
    </div>
  );
}
