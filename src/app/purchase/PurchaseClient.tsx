// src/app/purchase/PurchaseClient.tsx
"use client";

import { useState } from "react";

interface Props {
  courseId: string;
  userId: string;
  amountInRupees: number;
}

export default function PurchaseClient({
  courseId,
  userId,
  amountInRupees,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function startPayment() {
    setLoading(true);
    setError("");

    try {
      const amountPaise = Math.round(amountInRupees * 100);

      const orderRes = await fetch("/api/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: amountPaise,
          user_id: userId,
          course_id: courseId,
          currency: "INR",
        }),
      });

      const orderJson = await orderRes.json();
      if (!orderRes.ok) throw new Error(orderJson.error);

      const { merchantOrderId } = orderJson;

      const initRes = await fetch("/api/phonepe/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          merchantOrderId,
          amount: amountPaise,
        }),
      });

      const initJson = await initRes.json();
      if (!initRes.ok) throw new Error(initJson.error);

      window.location.href = initJson.paymentLink;
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={startPayment}
        disabled={loading}
        className="px-6 py-3 bg-blue-600 text-white rounded-lg"
      >
        {loading ? "Processing…" : `Pay ₹${amountInRupees}`}
      </button>

      {error && <p className="text-red-600 mt-3">{error}</p>}
    </>
  );
}
