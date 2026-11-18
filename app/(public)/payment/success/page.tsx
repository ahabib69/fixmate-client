import { Suspense } from "react";
import { PaymentResult } from "@/components/payments/PaymentResult";
export default function Page() {
  return (
    <Suspense
      fallback={<div className="p-16 text-center">Loading payment…</div>}
    >
      <PaymentResult />
    </Suspense>
  );
}
