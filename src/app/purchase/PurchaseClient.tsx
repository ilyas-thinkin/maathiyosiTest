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
  const [courseDescription, setCourseDescription] = useState("");

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
        // First, determine which source the course belongs to
        const sourceRes = await fetch(`/api/admin/get-course-source?id=${courseId}`);
        const sourceData = await sourceRes.json();

        if (sourceData.error || !sourceData.exists) {
          console.error("Course not found in any source");
          return;
        }

        // Fetch from the correct source
        const endpoint = sourceData.source === "mux"
          ? `/api/admin/fetch-mux-details-course?id=${courseId}`
          : `/api/admin/fetch-vimeo-details-course?id=${courseId}`;

        const res = await fetch(endpoint);
        const data = await res.json();

        if (!data.error) {
          if (!courseTitle && data.title) setCourseTitle(data.title);
          if (!courseDescription && data.description) setCourseDescription(data.description);
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
    <div className="min-h-screen bg-gradient-to-br from-[#fff5f5] via-[#ffe5e5] to-[#ffd5d5] flex items-center justify-center p-4 sm:p-6">
      <motion.div
        className="max-w-2xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Header Section */}
        <motion.div
          className="bg-gradient-to-r from-[#de5252] to-[#f66] p-6 sm:p-8 text-white text-center relative overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          {/* Background decoration */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full -translate-y-20 translate-x-20"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white rounded-full translate-y-16 -translate-x-16"></div>
          </div>

          <div className="relative z-10">
            <motion.div
              className="w-16 h-16 sm:w-20 sm:h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            >
              <ShoppingCart className="w-8 h-8 sm:w-10 sm:h-10" />
            </motion.div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">Complete Your Purchase</h1>
            <p className="text-white/90 text-xs sm:text-sm">Secure checkout powered by PhonePe</p>
          </div>
        </motion.div>

        {/* Content Section */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Course Information Card */}
          {courseTitle && (
            <motion.div
              className="bg-gradient-to-br from-[#fff5f5] to-[#ffe5e5] rounded-2xl p-6 border border-[#de5252]/20 shadow-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 bg-[#de5252] rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xl">📚</span>
                </div>
                <div className="flex-1">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Course</p>
                  <h2 className="text-xl sm:text-2xl font-bold text-[#de5252] leading-tight">{courseTitle}</h2>
                </div>
              </div>

              {courseDescription && (
                <p className="text-sm text-gray-600 leading-relaxed mt-3 pl-13">
                  {courseDescription}
                </p>
              )}
            </motion.div>
          )}

          {/* Price Card */}
          <motion.div
            className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200 shadow-sm"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Amount</p>
                <p className="text-4xl sm:text-5xl font-bold text-green-600">₹{displayAmount}</p>
              </div>
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center">
                <span className="text-3xl">💰</span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-green-200">
              <p className="text-xs text-gray-600">✓ Lifetime access included</p>
            </div>
          </motion.div>

          {/* Payment Button */}
          <motion.button
            onClick={startPayment}
            disabled={loading || !isReadyForPayment}
            className={`w-full py-5 rounded-2xl font-bold text-lg sm:text-xl shadow-lg transition-all flex items-center justify-center gap-3 ${
              loading || !isReadyForPayment
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-gradient-to-r from-[#de5252] to-[#f66] text-white hover:shadow-2xl hover:from-[#c74444] hover:to-[#e55555]"
            }`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            whileHover={!loading && isReadyForPayment ? { scale: 1.02 } : {}}
            whileTap={!loading && isReadyForPayment ? { scale: 0.98 } : {}}
          >
            {loading ? (
              <>
                <motion.div
                  className="w-6 h-6 border-3 border-white border-t-transparent rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                <span>Processing...</span>
              </>
            ) : isReadyForPayment ? (
              <>
                <CreditCard className="w-6 h-6" />
                <span>Pay Now</span>
                <ArrowRight className="w-6 h-6" />
              </>
            ) : (
              "Preparing payment..."
            )}
          </motion.button>

          {/* Error Message */}
          {error && (
            <motion.div
              className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-600 text-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <p className="font-semibold text-sm">{error}</p>
            </motion.div>
          )}

          {/* Trust Badges */}
          <motion.div
            className="space-y-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <div className="flex items-center justify-center gap-2 text-gray-500 text-xs sm:text-sm">
              <Shield className="w-4 h-4 text-green-600" />
              <span>100% Secure Payment</span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-gray-400">
              <span>✓ Money-back guarantee</span>
              <span className="hidden sm:inline">•</span>
              <span>✓ Instant access</span>
              <span className="hidden sm:inline">•</span>
              <span>✓ 24/7 support</span>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
