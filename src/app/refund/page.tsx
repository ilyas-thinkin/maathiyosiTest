"use client";

export default function RefundPage() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Refund & Cancellation Policy</h1>

      <h2 className="text-xl font-semibold mt-6 mb-2">1. Course Purchases</h2>
      <p className="mb-4">
        Once a course is purchased, access is granted immediately. 
        Due to the nature of digital products, <strong>we do not offer refunds</strong> 
         once a course has been accessed or downloaded.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">2. Duplicate Payments</h2>
      <p className="mb-4">
        If you are charged twice for the same course, please email 
        <strong> info@thinkinlab.com </strong> with payment proof. 
        We will initiate a refund within 7 working days.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">3. Technical Issues</h2>
      <p className="mb-4">
        If you face any technical issues that prevent you from accessing 
        purchased content, our support team will resolve it or provide 
        an alternative solution.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">4. Contact Us</h2>
      <p className="mb-4">
        For refund or cancellation-related queries, please contact us at 
        <strong> info@thinkinlab.com</strong>.
      </p>
    </div>
  );
}
