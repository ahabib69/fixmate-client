"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "./useAuth";
import { dashboardPathForRole } from "@/lib/constants";

// Guards a page by role. While the session is loading it does nothing
// (so a page reload never flashes a login redirect), then sends
// logged-out users to /sign-in and wrong-role users to their own dashboard.
export function useRequireRole(requiredRole?: string) {
  const { user, isPending, role } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isPending) return;

    if (!user) {
      const next = pathname ? encodeURIComponent(pathname) : "";
      router.replace(next ? `/sign-in?next=${next}` : "/sign-in");
      return;
    }

    if (requiredRole && role !== requiredRole) {
      router.replace(dashboardPathForRole(role));
    }
  }, [user, isPending, role, requiredRole, router, pathname]);

  return { user, isPending, role };
}
