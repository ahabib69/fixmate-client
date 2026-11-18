import { Suspense } from "react";
import { ServicesReview } from "@/components/admin/ServicesReview";
export default function Page() {
  return (
    <Suspense fallback={<div>Loading reviews…</div>}>
      <ServicesReview />
    </Suspense>
  );
}
