"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { supabase } from "../components/lib/supabaseClient";

function PaymentFailedContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const transactionId = searchParams.get("transaction_id");
  const message = searchParams.get("message");

  const [purchase, setPurchase] = useState<any>(null);

  useEffect(() => {
    const fetchPurchase = async () => {
      if (!transactionId) return;

      try {
        const { data, error } = await supabase
          .from("purchase")
          .select("*")
          .eq("transaction_id", transactionId)
          .single();

        if (!error && data) {
          setPurchase(data);
        }
      } catch (err) {
        console.error("Error fetching purchase:", err);
      }
    };

    fetchPurchase();
  }, [transactionId]);

  return (
    <motion.div
      className="max-w-3xl mx-auto p-10"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="bg-white rounded-3xl shadow-2xl p-10 text-center"
        initial={{ y: 50 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <motion.div
          className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
        >
          <svg
            className="w-12 h-12 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </motion.div>

        <h1 className="text-4xl font-extrabold text-red-600 mb-4">
          Payment Failed
        </h1>

        <p className="text-xl text-gray-600 mb-8">
          {message || "We couldn't process your payment. Please try again."}
        </p>

        {transactionId && (
          <div className="bg-gray-50 rounded-xl p-6 mb-8 text-left">
            <h3 className="text-lg font-bold mb-4 text-gray-800">Transaction Details</h3>
            <div className="space-y-2 text-gray-600">
              <div className="flex justify-between">
                <span>Transaction ID:</span>
                <span className="font-mono text-sm">{transactionId}</span>
              </div>
              {purchase && (
                <>
                  <div className="flex justify-between">
                    <span>Amount:</span>
                    <span className="font-bold">₹{purchase.amount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <span className="font-semibold text-red-600 uppercase">
                      {purchase.status}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-8">
          <p className="text-gray-700">
            <strong>Need Help?</strong> If the amount was deducted from your account, 
            please contact our support team with your transaction ID.
          </p>
        </div>

        <div className="space-y-4">
          <motion.button
            onClick={() => {
              if (purchase?.course_id) {
                router.push(`/purchase?course_id=${purchase.course_id}&amount=${purchase.amount}`);
              } else {
                router.push("/courses");
              }
            }}
            className="w-full py-4 bg-[#de5252] text-white font-bold text-xl rounded-3xl shadow-lg hover:bg-[#f66]"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Try Again
          </motion.button>

          <button
            onClick={() => router.push("/courses")}
            className="w-full py-3 text-gray-600 hover:text-gray-800 font-semibold"
          >
            Back to Courses
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function PaymentFailedPage() {
  return (
    <Suspense fallback={
      <div className="max-w-3xl mx-auto p-10 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-red-600 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <PaymentFailedContent />
    </Suspense>
  );
}