import { Suspense } from "react";
import { AuthForm } from "@/components/auth/AuthForm";
export const metadata = { title: "Create Account | FixMate" };
export default function Page() {
  return (
    <Suspense fallback={<div className="p-12 text-center">Loading…</div>}>
      <AuthForm mode="sign-up" />
    </Suspense>
  );
}
