// src/app/checkout/page.tsx
"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "../components/lib/supabaseClient";

export default function CheckoutPage() {
  const params = useSearchParams();
  const router = useRouter();
  const courseId = params.get("course"); // prefixed id

  useEffect(() => {
    async function enroll() {
      if (!courseId) return;

      const prefix = courseId.split("_")[0];
      const rawId = courseId.split("_")[1];

      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;
      if (!user) {
        router.push("/login");
        return;
      }

      await supabase.from("purchases").insert([
        {
          user_id: user.id,
          course_id: rawId,
          source: prefix,
          status: "success",
          payment_id: "fake-" + Date.now(),
        },
      ]);

      router.replace(`/courses/${courseId}`);
    }

    enroll();
  }, [courseId, router]);

  return (
    <div className="p-10 text-center">
      Processing your enrollment...
    </div>
  );
}
