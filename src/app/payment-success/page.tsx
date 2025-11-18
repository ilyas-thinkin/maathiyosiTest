"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { supabase } from "../components/lib/supabaseClient";
import ThinkingRobotLoader from "../components/RobotThinkingLoader";

export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const transactionId = searchParams.get("transaction_id");

  const [loading, setLoading] = useState(true);
  const [purchase, setPurchase] = useState<any>(null);
  const [course, setCourse] = useState<any>(null);

  useEffect(() => {
    const fetchDetails = async () => {
      if (!transactionId) {
        setLoading(false);
        return;
      }

      try {
        // Fetch purchase details
        const { data: purchaseData, error: purchaseError } = await supabase
          .from("purchase")
          .select("*")
          .eq("transaction_id", transactionId)
          .single();

        if (purchaseError) {
          console.error("Purchase fetch error:", purchaseError);
          setLoading(false);
          return;
        }

        setPurchase(purchaseData);

        // Fetch course details
        if (purchaseData?.course_id) {
          const res = await fetch(`/api/admin/fetch-mux-details-course?id=${purchaseData.course_id}`);
          const courseData = await res.json();
          if (!courseData.error) {
            setCourse(courseData);
          }
        }
      } catch (err) {
        console.error("Error fetching details:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [transactionId]);

  if (loading) return <ThinkingRobotLoader />;

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
          className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
        >
          <svg
            className="w-12 h-12 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </motion.div>

        <h1 className="text-4xl font-extrabold text-green-600 mb-4">
          Payment Successful! 🎉
        </h1>

        <p className="text-xl text-gray-600 mb-8">
          Your course purchase has been completed successfully.
        </p>

        {purchase && (
          <div className="bg-gray-50 rounded-xl p-6 mb-8 text-left">
            <h3 className="text-lg font-bold mb-4 text-gray-800">Transaction Details</h3>
            <div className="space-y-2 text-gray-600">
              <div className="flex justify-between">
                <span>Transaction ID:</span>
                <span className="font-mono text-sm">{purchase.transaction_id}</span>
              </div>
              <div className="flex justify-between">
                <span>Amount Paid:</span>
                <span className="font-bold text-green-600">₹{purchase.amount}</span>
              </div>
              <div className="flex justify-between">
                <span>Status:</span>
                <span className="font-semibold text-green-600 uppercase">
                  {purchase.status}
                </span>
              </div>
            </div>
          </div>
        )}

        {course && (
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 mb-8">
            <h3 className="text-lg font-bold mb-2 text-gray-800">{course.title}</h3>
            <p className="text-gray-600 text-sm mb-4">
              You now have access to this course!
            </p>
          </div>
        )}

        <div className="space-y-4">
          <motion.button
            onClick={() => router.push(`/courses/${purchase?.course_id}/lessons`)}
            className="w-full py-4 bg-[#de5252] text-white font-bold text-xl rounded-3xl shadow-lg hover:bg-[#f66]"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Start Learning Now
          </motion.button>

          <button
            onClick={() => router.push("/courses")}
            className="w-full py-3 text-gray-600 hover:text-gray-800 font-semibold"
          >
            Browse More Courses
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}