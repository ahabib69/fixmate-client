"use client";
import Link from "next/link";
import {
  AreaChart,
  Area,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  BarChart,
  Bar,
} from "recharts";
import { useResource } from "@/hooks/useResource";
import { formatPrice } from "@/lib/utils";
import { PageHeading, LoadState } from "@/components/dashboard/Shared";
import { StatusChart } from "@/components/dashboard/StatusChart";
import { Button } from "@/components/ui/button";
interface Stats {
  totalUsers: number;
  totalTechnicians: number;
  totalCustomers: number;
  totalServices: number;
  pendingServices: number;
  approvedServices: number;
  totalBookings: number;
  completedBookings: number;
  totalRevenue: number;
  bookingsByStatus: { name: string; value: number }[];
  servicesByCategory: { name: string; value: number }[];
  revenueByMonth: { name: string; revenue: number }[];
}
const tooltipStyle = {
  background: "hsl(var(--card))",
  borderColor: "hsl(var(--border))",
  color: "hsl(var(--foreground))",
  borderRadius: 8,
};
export function AdminOverview() {
  const resource = useResource<Stats>("/api/admin/stats");
  const s = resource.data;
  return (
    <>
      <PageHeading
        title="Platform overview"
        description="Monitor service reviews, repair activity, and recorded revenue in USD."
      >
        <Button onClick={resource.reload} variant="outline">
          Refresh
        </Button>
      </PageHeading>
      <LoadState {...resource} retry={resource.reload} />
      {!resource.loading && !resource.error && s && (
        <>
          <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {[
              ["Users", s.totalUsers],
              ["Technicians", s.totalTechnicians],
              ["Customers", s.totalCustomers],
              ["Services", s.totalServices],
              ["Pending reviews", s.pendingServices],
              ["Approved services", s.approvedServices],
              ["Bookings", s.totalBookings],
              ["Completed repairs", s.completedBookings],
              ["Recorded revenue", formatPrice(s.totalRevenue)],
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl border bg-card p-5">
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="mt-3 text-3xl font-bold">{value}</p>
              </div>
            ))}
          </div>
          {s.pendingServices > 0 && (
            <div className="mb-8 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-300 bg-amber-500/10 p-4">
              <p className="text-sm">
                {s.pendingServices} services are waiting for review.
              </p>
              <Button asChild size="sm">
                <Link href="/dashboard/admin/services?approvalStatus=pending">
                  Review services
                </Link>
              </Button>
            </div>
          )}
          <section className="mb-8 rounded-xl border bg-card p-5">
            <h2 className="font-semibold">Monthly revenue · USD</h2>
            <p className="mb-6 mt-1 text-xs text-muted-foreground">
              Up to the latest 12 recorded months. Includes seeded demo
              payments.
            </p>
            {s.revenueByMonth.length ? (
              <div
                className="h-72"
                role="img"
                aria-label={s.revenueByMonth
                  .map((r) => `${r.name}: ${formatPrice(r.revenue)}`)
                  .join(", ")}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={s.revenueByMonth}
                    margin={{ left: 0, right: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="name" fontSize={11} />
                    <YAxis width={55} fontSize={11} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Area
                      dataKey="revenue"
                      name="Revenue (USD)"
                      stroke="#f97316"
                      fill="#f97316"
                      fillOpacity={0.15}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="py-20 text-center text-sm text-muted-foreground">
                Revenue appears after the first recorded payment.
              </p>
            )}
          </section>
          <div className="grid gap-8 xl:grid-cols-2">
            <StatusChart data={s.bookingsByStatus} />
            <section className="rounded-xl border bg-card p-5">
              <h2 className="mb-5 font-semibold">Services by category</h2>
              {s.servicesByCategory.length ? (
                <div
                  className="h-72"
                  role="img"
                  aria-label={s.servicesByCategory
                    .map((r) => `${r.name}: ${r.value}`)
                    .join(", ")}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={s.servicesByCategory}
                      layout="vertical"
                      margin={{ left: 0, right: 20 }}
                    >
                      <XAxis type="number" allowDecimals={false} />
                      <YAxis
                        type="category"
                        dataKey="name"
                        width={110}
                        fontSize={11}
                      />
                      <Tooltip contentStyle={tooltipStyle} />
                      <Bar
                        dataKey="value"
                        name="Services"
                        fill="#6366f1"
                        radius={[0, 5, 5, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="py-20 text-center text-sm text-muted-foreground">
                  No services yet.
                </p>
              )}
            </section>
          </div>
        </>
      )}
    </>
  );
}
