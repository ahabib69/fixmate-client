"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { dashboardPathForRole } from "@/lib/constants";
export default function Page() {
  const { role, isPending } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (!isPending) router.replace(dashboardPathForRole(role));
  }, [role, isPending, router]);
  return (
    <p className="text-sm text-muted-foreground">Opening your dashboard…</p>
  );
}
