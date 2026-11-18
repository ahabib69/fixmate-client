"use client";
import Link from "next/link";
import { useResource } from "@/hooks/useResource";
import type { Booking } from "@/lib/types";
import { formatPrice, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { PageHeading, LoadState, StatusBadge } from "./Shared";
import { StatusChart } from "./StatusChart";
interface TechnicianStats {
  totalServices: number;
  approvedServices: number;
  pendingRequests: number;
  totalRequests: number;
  completedJobs: number;
  totalEarnings: number;
  statusBreakdown: { name: string; value: number }[];
}
export function Overview({ technician = false }: { technician?: boolean }) {
  const resource = useResource<Booking[] | TechnicianStats>(
    technician ? "/api/bookings/technician/stats" : "/api/bookings/my",
  );
  const bookings = Array.isArray(resource.data) ? resource.data : [];
  const stats = !Array.isArray(resource.data) ? resource.data : null;
  const cards = technician
    ? [
        ["Services", stats?.totalServices || 0],
        ["Approved services", stats?.approvedServices || 0],
        ["New requests", stats?.pendingRequests || 0],
        ["Completed jobs", stats?.completedJobs || 0],
        ["Paid earnings", formatPrice(stats?.totalEarnings || 0)],
        ["Total requests", stats?.totalRequests || 0],
      ]
    : [
        ["Total bookings", bookings.length],
        [
          "Active repairs",
          bookings.filter((b) =>
            ["requested", "accepted", "in-progress"].includes(b.status),
          ).length,
        ],
        ["Completed", bookings.filter((b) => b.status === "completed").length],
        [
          "Awaiting payment",
          bookings.filter(
            (b) => b.status === "completed" && b.paymentStatus === "unpaid",
          ).length,
        ],
        [
          "Total paid",
          formatPrice(
            bookings
              .filter((b) => b.paymentStatus === "paid")
              .reduce((sum, b) => sum + b.finalAmount, 0),
          ),
        ],
      ];
  const breakdown = technician
    ? stats?.statusBreakdown || []
    : bookings
        .map((b) => b.status)
        .filter((s, i, all) => all.indexOf(s) === i)
        .map((name) => ({
          name,
          value: bookings.filter((b) => b.status === name).length,
        }));
  return (
    <>
      <PageHeading
        title={technician ? "Your repair business" : "Your repairs at a glance"}
        description={
          technician
            ? "Keep an eye on requests, services, and paid earnings."
            : "Track your repair activity and see what needs attention."
        }
      >
        <Button asChild>
          <Link
            href={
              technician ? "/dashboard/technician/add-service" : "/services"
            }
          >
            {technician ? "Add a service" : "Find a repair"}
          </Link>
        </Button>
      </PageHeading>
      <LoadState {...resource} retry={resource.reload} />
      {!resource.loading && !resource.error && (
        <>
          <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {cards.map(([label, value]) => (
              <div key={label} className="rounded-xl border bg-card p-5">
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="mt-3 text-3xl font-bold">{value}</p>
              </div>
            ))}
          </div>
          <StatusChart data={breakdown} />
          {technician ? (
            <Button asChild variant="outline" className="mt-6">
              <Link href="/dashboard/technician/requests">
                Manage incoming requests
              </Link>
            </Button>
          ) : (
            <section className="mt-8 rounded-xl border bg-card p-5">
              <h2 className="font-semibold">Recent bookings</h2>
              {bookings.length ? (
                bookings.slice(0, 5).map((b) => (
                  <div
                    key={b._id}
                    className="flex flex-wrap items-center justify-between gap-3 border-b py-4 last:border-0"
                  >
                    <div>
                      <p className="font-medium">{b.serviceTitle}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(b.createdAt)}
                      </p>
                    </div>
                    <StatusBadge status={b.status} />
                  </div>
                ))
              ) : (
                <p className="py-6 text-sm text-muted-foreground">
                  Your first repair starts with finding a service.
                </p>
              )}
              <Button asChild variant="link" className="px-0">
                <Link href="/dashboard/customer/bookings">
                  View all bookings
                </Link>
              </Button>
            </section>
          )}
        </>
      )}
    </>
  );
}
