// src/app/purchase/page.tsx
"use client";

import { Suspense } from "react";
import PurchasePage from "./PurchaseClient";

export default function Page() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center p-6">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
          <p className="mt-3 text-gray-600">Preparing payment...</p>
        </div>
      </div>
    }>
      <PurchasePage />
    </Suspense>
  );
}
