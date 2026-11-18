import { Suspense } from "react";
import { AuthForm } from "@/components/auth/AuthForm";
export const metadata = { title: "Sign In | FixMate" };
export default function Page() {
  return (
    <Suspense fallback={<div className="p-12 text-center">Loading…</div>}>
      <AuthForm mode="sign-in" />
    </Suspense>
  );
}
