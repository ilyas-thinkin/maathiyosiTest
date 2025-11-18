// src/app/purchase/PurchaseClient.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ShoppingCart, CreditCard, Shield, ArrowRight } from "lucide-react";
import { supabase } from "../components/lib/supabaseClient";

interface Props {
  courseId?: string;
  userId?: string;
  amountInRupees?: number;
}

export default function PurchaseClient(props: Props = {}) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [courseId, setCourseId] = useState(props.courseId || "");
  const [userId, setUserId] = useState(props.userId || "");
  const [amountInRupees, setAmountInRupees] = useState<number | null>(
    typeof props.amountInRupees === "number" ? props.amountInRupees : null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [courseTitle, setCourseTitle] = useState("");

  // Derive data from search params (if props are not provided)
  useEffect(() => {
    if (!props.courseId) {
      const courseIdQuery = searchParams.get("course_id");
      if (courseIdQuery) {
        setCourseId(courseIdQuery);
      }
    }

    if (props.amountInRupees === undefined) {
      const amountQuery = searchParams.get("amount");
      if (amountQuery) {
        const parsedAmount = Number(amountQuery);
        if (!Number.isNaN(parsedAmount)) {
          setAmountInRupees(parsedAmount);
        }
      }
    }

    if (!courseTitle) {
      const titleQuery = searchParams.get("title");
      if (titleQuery) {
        setCourseTitle(decodeURIComponent(titleQuery));
      }
    }
  }, [props.courseId, props.amountInRupees, searchParams, courseTitle]);

  useEffect(() => {
    // Fetch user details
    const fetchUserDetails = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUserId((prev) => prev || user.id);
          setUserEmail(user.email || "");
          setUserName(user.user_metadata?.full_name || user.email?.split("@")[0] || "User");
        }

        // Also try to get from user table
        const { data: userData } = await supabase
          .from("user")
          .select("username, email")
          .eq("id", user?.id || userId)
          .single();

        if (userData) {
          if (userData.email) setUserEmail(userData.email);
          if (userData.username) setUserName(userData.username);
        }
      } catch (err) {
        console.error("Error fetching user details:", err);
      }
    };

    fetchUserDetails();
  }, [userId]);

  // Fetch course info if we have courseId but missing title or amount
  useEffect(() => {
    const fetchCourseInfo = async () => {
      if (!courseId || (amountInRupees !== null && courseTitle)) return;

      try {
        const res = await fetch(`/api/admin/fetch-mux-details-course?id=${courseId}`);
        const data = await res.json();

        if (!data.error) {
          if (!courseTitle && data.title) setCourseTitle(data.title);
          if (amountInRupees === null && typeof data.price === "number") {
            setAmountInRupees(data.price);
          }
        }
      } catch (err) {
        console.error("Failed to fetch course info:", err);
      }
    };

    fetchCourseInfo();
  }, [courseId, amountInRupees, courseTitle]);

  const isReadyForPayment = useMemo(() => {
    return Boolean(courseId && userId && amountInRupees !== null && amountInRupees > 0);
  }, [courseId, userId, amountInRupees]);

  const displayAmount = amountInRupees ?? 0;

  async function startPayment() {
    if (!courseId || !userId) {
      setError("Missing required information. Please reload the page.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Call PhonePe V2 initiate API
      // Backend will fetch course price from database
      const initRes = await fetch("/api/phonepe/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId,
          userId,
        }),
      });

      const initJson = await initRes.json();

      console.log("PhonePe V2 Payment initiation response:", initJson);

      if (!initRes.ok) {
        const errorMessage = initJson.message || initJson.error || initJson.details?.message || "Failed to initiate payment";
        throw new Error(errorMessage);
      }

      if (!initJson.success || !initJson.paymentUrl) {
        throw new Error(initJson.message || "Payment URL not received from server");
      }

      // Redirect to PhonePe payment page
      console.log("Redirecting to PhonePe payment page:", initJson.paymentUrl);
      console.log("Transaction ID:", initJson.transactionId);
      console.log("Amount:", initJson.amount);
      window.location.href = initJson.paymentUrl;
    } catch (err: any) {
      setError(err.message || "An error occurred. Please try again.");
      console.error("PhonePe V2 Payment initiation error:", err);
      setLoading(false);
    }
    // Don't set loading to false here as we're redirecting
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fff5f5] to-[#ffe5e5] flex items-center justify-center p-6">
      <motion.div
        className="max-w-md w-full bg-white rounded-3xl shadow-2xl overflow-hidden"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header Section */}
        <motion.div
          className="bg-gradient-to-r from-[#de5252] to-[#f66] p-8 text-white text-center"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <motion.div
            className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4"
            whileHover={{ scale: 1.1, rotate: 360 }}
            transition={{ duration: 0.6 }}
          >
            <ShoppingCart size={40} />
          </motion.div>
          <h1 className="text-3xl font-bold mb-2">Complete Your Purchase</h1>
          <p className="text-white/90 text-sm">Secure payment powered by PhonePe</p>
        </motion.div>

        {/* Content Section */}
        <div className="p-8 space-y-6">
          {/* Course Details */}
          {courseTitle && (
            <motion.div
              className="bg-[#fff5f5] rounded-2xl p-6 border-2 border-[#de5252]/20"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <h3 className="text-sm font-semibold text-gray-600 mb-2">Course</h3>
              <p className="text-xl font-bold text-[#de5252]">{courseTitle}</p>
            </motion.div>
          )}

          {/* User Details */}
          {userName && (
            <motion.div
              className="space-y-3"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <div className="flex items-center gap-3 text-gray-700">
                <div className="w-10 h-10 bg-[#de5252]/10 rounded-full flex items-center justify-center">
                  <span className="text-[#de5252] font-bold">👤</span>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Student</p>
                  <p className="font-semibold">{userName}</p>
                </div>
              </div>
              {userEmail && (
                <div className="flex items-center gap-3 text-gray-700">
                  <div className="w-10 h-10 bg-[#de5252]/10 rounded-full flex items-center justify-center">
                    <span className="text-[#de5252] font-bold">📧</span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="font-semibold text-sm">{userEmail}</p>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Amount Display */}
          <motion.div
            className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-green-200"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <p className="text-sm text-gray-600 mb-1">Total Amount</p>
            <p className="text-4xl font-bold text-green-600">₹{displayAmount}</p>
          </motion.div>

          {/* Payment Button */}
          <motion.button
            onClick={startPayment}
            disabled={loading || !isReadyForPayment}
            className={`w-full py-4 rounded-2xl font-bold text-xl shadow-lg transition-all flex items-center justify-center gap-3 ${
              loading || !isReadyForPayment
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-gradient-to-r from-[#de5252] to-[#f66] text-white hover:shadow-2xl hover:scale-105"
            }`}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            whileHover={!loading && isReadyForPayment ? { scale: 1.05 } : {}}
            whileTap={!loading && isReadyForPayment ? { scale: 0.95 } : {}}
          >
            {loading ? (
              <>
                <motion.div
                  className="w-6 h-6 border-3 border-white border-t-transparent rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                Processing...
              </>
            ) : isReadyForPayment ? (
              <>
                <CreditCard size={24} />
                Pay ₹{displayAmount}
                <ArrowRight size={24} />
              </>
            ) : (
              "Preparing payment..."
            )}
          </motion.button>

          {/* Error Message */}
          {error && (
            <motion.div
              className="bg-red-50 border-2 border-red-200 rounded-xl p-4 text-red-600 text-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <p className="font-semibold">{error}</p>
            </motion.div>
          )}

          {/* Security Badge */}
          <motion.div
            className="flex items-center justify-center gap-2 text-gray-500 text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            <Shield size={18} className="text-green-600" />
            <span>Secure payment • Lifetime access • Money-back guarantee</span>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
