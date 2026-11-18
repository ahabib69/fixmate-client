import { Suspense } from "react";
import { ServicesBrowser } from "@/components/services/ServicesBrowser";
export const metadata = { title: "Repair Services | FixMate" };
export default function ServicesPage() {
  return (
    <Suspense
      fallback={<div className="p-12 text-center">Loading services…</div>}
    >
      <ServicesBrowser />
    </Suspense>
  );
}
