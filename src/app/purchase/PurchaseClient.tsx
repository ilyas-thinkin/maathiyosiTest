"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "../components/lib/supabaseClient";
import ThinkingRobotLoader from "../components/RobotThinkingLoader";

export default function PurchaseClient() {
  const params = useSearchParams();
  const router = useRouter();

  const course_id = params.get("course_id");
  const amount = params.get("amount");

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const startPurchase = async () => {
      if (!course_id || !amount) {
        alert("Invalid purchase link.");
        router.push("/");
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push(`/login?redirect=/purchase?course_id=${course_id}&amount=${amount}`);
        return;
      }

      try {
        const res = await fetch("/api/phonepe/initiate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            course_id,
            amount,
            user_id: user.id,
          }),
        });

        const data = await res.json();
        if (!data.success) {
          alert("Failed to initiate payment. Try again.");
          router.push(`/courses/${course_id}`);
          return;
        }

        window.location.href = data.redirectUrl;
      } catch (err) {
        alert("Something went wrong. Try again.");
        router.push(`/courses/${course_id}`);
      } finally {
        setLoading(false);
      }
    };

    startPurchase();
  }, [course_id, amount, router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <ThinkingRobotLoader />
    </div>
  );
}
