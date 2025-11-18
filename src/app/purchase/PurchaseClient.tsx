// src/app/purchase/PurchaseClient.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
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
    <>
      <button
        onClick={startPayment}
        disabled={loading || !isReadyForPayment}
        className="px-6 py-3 bg-blue-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading
          ? "Processing…"
          : isReadyForPayment
            ? `Pay ₹${displayAmount}`
            : "Preparing payment…"}
      </button>

      {error && <p className="text-red-600 mt-3">{error}</p>}
    </>
  );
}
