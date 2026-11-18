"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { dashboardPathForRole } from "@/lib/constants";
import { DashboardSidebar } from "@/components/layout/DashboardSidebar";
import { DashboardTopbar } from "@/components/layout/DashboardTopbar";
import { Skeleton } from "@/components/ui/skeleton";

// Which role each dashboard section needs. /dashboard/profile is open to all roles.
function requiredRoleFor(pathname: string): string | null {
  if (pathname.startsWith("/dashboard/customer")) return "customer";
  if (pathname.startsWith("/dashboard/technician")) return "technician";
  if (pathname.startsWith("/dashboard/admin")) return "admin";
  return null;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isPending, role } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (isPending) return;

    if (!user) {
      const next = pathname ? encodeURIComponent(pathname) : "";
      router.replace(next ? `/sign-in?next=${next}` : "/sign-in");
      return;
    }

    const needed = requiredRoleFor(pathname || "");
    if (needed && role !== needed) {
      router.replace(dashboardPathForRole(role));
    }
  }, [user, isPending, role, pathname, router]);

  // While checking the session, show a loader instead of flashing a redirect.
  // This keeps a page reload from ever bouncing a logged-in user to login.
  if (isPending || !user) {
    return (
      <div className="flex min-h-screen">
        <div className="hidden w-64 border-r p-4 lg:block">
          <Skeleton className="h-10 w-32" />
          <div className="mt-8 space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
        <div className="flex-1 p-6">
          <Skeleton className="h-10 w-full" />
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
          </div>
          <Skeleton className="mt-6 h-64 w-full" />
        </div>
      </div>
    );
  }

  const needed = requiredRoleFor(pathname || "");
  if (needed && role !== needed) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-muted-foreground">
          Redirecting to your dashboard...
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <DashboardSidebar
        role={role}
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardTopbar onOpenMobile={() => setMobileOpen(true)} />
        <main className="flex-1 bg-muted/30 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
