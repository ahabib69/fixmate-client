"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ClipboardList,
  CreditCard,
  PlusCircle,
  Wrench,
  Inbox,
  Users,
  Briefcase,
  ArrowLeftRight,
  User,
  ChevronsLeft,
  ChevronsRight,
  Home,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "./Logo";

interface SidebarProps {
  role: string | null;
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

function linksForRole(role: string | null) {
  if (role === "technician") {
    return [
      {
        href: "/dashboard/technician",
        label: "Overview",
        icon: LayoutDashboard,
      },
      {
        href: "/dashboard/technician/add-service",
        label: "Add Service",
        icon: PlusCircle,
      },
      {
        href: "/dashboard/technician/my-services",
        label: "My Services",
        icon: Wrench,
      },
      {
        href: "/dashboard/technician/requests",
        label: "Requests",
        icon: Inbox,
      },
    ];
  }
  if (role === "admin") {
    return [
      { href: "/dashboard/admin", label: "Overview", icon: LayoutDashboard },
      { href: "/dashboard/admin/users", label: "Users", icon: Users },
      { href: "/dashboard/admin/services", label: "Services", icon: Briefcase },
      {
        href: "/dashboard/admin/bookings",
        label: "Bookings",
        icon: ClipboardList,
      },
      {
        href: "/dashboard/admin/transactions",
        label: "Transactions",
        icon: ArrowLeftRight,
      },
    ];
  }
  return [
    { href: "/dashboard/customer", label: "Overview", icon: LayoutDashboard },
    {
      href: "/dashboard/customer/bookings",
      label: "My Bookings",
      icon: ClipboardList,
    },
    {
      href: "/dashboard/customer/payments",
      label: "My Payments",
      icon: CreditCard,
    },
  ];
}

export function DashboardSidebar({
  role,
  collapsed,
  onToggle,
  mobileOpen,
  onCloseMobile,
}: SidebarProps) {
  const pathname = usePathname();
  const links = linksForRole(role);

  const content = (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center justify-between border-b px-4">
        {!collapsed && <Logo />}
        {collapsed && (
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-navy-800 text-white dark:bg-brand-500">
            <Wrench className="h-5 w-5" />
          </span>
        )}
        <button
          onClick={onToggle}
          className="hidden rounded-md p-1.5 text-muted-foreground hover:bg-accent lg:block"
          aria-label="Toggle sidebar"
        >
          {collapsed ? (
            <ChevronsRight className="h-5 w-5" />
          ) : (
            <ChevronsLeft className="h-5 w-5" />
          )}
        </button>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {links.map((link) => {
          const active = pathname === link.href;
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onCloseMobile}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-navy-800 text-white dark:bg-brand-500"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground",
                collapsed && "justify-center px-2",
              )}
              title={collapsed ? link.label : undefined}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span>{link.label}</span>}
            </Link>
          );
        })}

        <div className="my-3 border-t" />

        <Link
          href="/dashboard/profile"
          onClick={onCloseMobile}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
            pathname === "/dashboard/profile"
              ? "bg-navy-800 text-white dark:bg-brand-500"
              : "text-muted-foreground hover:bg-accent hover:text-foreground",
            collapsed && "justify-center px-2",
          )}
          title={collapsed ? "Profile" : undefined}
        >
          <User className="h-5 w-5 shrink-0" />
          {!collapsed && <span>Profile</span>}
        </Link>

        <Link
          href="/"
          onClick={onCloseMobile}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
            collapsed && "justify-center px-2",
          )}
          title={collapsed ? "Back to site" : undefined}
        >
          <Home className="h-5 w-5 shrink-0" />
          {!collapsed && <span>Back to site</span>}
        </Link>
      </nav>

      <div className="border-t p-3 text-xs text-muted-foreground">
        {!collapsed && <p>FixMate Dashboard</p>}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "sticky top-0 hidden h-screen shrink-0 border-r bg-background transition-all lg:block",
          collapsed ? "w-[72px]" : "w-64",
        )}
      >
        {content}
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={onCloseMobile}
          />
          <aside className="absolute inset-y-0 left-0 w-64 border-r bg-background">
            {content}
          </aside>
        </div>
      )}
    </>
  );
}
