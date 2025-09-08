"use client";

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      <p className="mb-4">Last Updated: [Insert Date]</p>

      <h2 className="text-xl font-semibold mt-6 mb-2">1. Information We Collect</h2>
      <p className="mb-4">
        We may collect personal details like your name, email, phone number, 
        grade/job title, and payment details (processed securely by Razorpay/UPI).
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">2. How We Use Information</h2>
      <p className="mb-4">
        - To provide and improve courses <br />
        - To process secure payments <br />
        - To personalize your experience <br />
        - To comply with legal obligations
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">3. Sharing of Information</h2>
      <p className="mb-4">
        We do not sell your data. Information may be shared with trusted 
        service providers and legal authorities when required.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">4. Data Security</h2>
      <p className="mb-4">
        Your data is stored securely with encryption. Payments are handled 
        by secure gateways; we do not store card/UPI details.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">5. Your Rights</h2>
      <p className="mb-4">
        You can request to access, update, or delete your personal data by 
        emailing us at <strong>support@maathiyosi.io</strong>.
      </p>
    </div>
  );
}
