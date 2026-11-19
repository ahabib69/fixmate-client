"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useResource } from "@/hooks/useResource";
import type { Payment } from "@/lib/types";
import { formatDate, formatPrice } from "@/lib/utils";
import { PageHeading, LoadState, EmptyState } from "./Shared";
export function PaymentsList() {
  const resource = useResource<Payment[]>("/api/payments/my");
  return (
    <>
      <PageHeading
        title="My payments"
        description="Your completed Stripe payments, all in USD."
      />
      <LoadState {...resource} retry={resource.reload} />
      {!resource.loading &&
        !resource.error &&
        (resource.data?.length ? (
          <>
            <div className="mb-6 rounded-xl border bg-card p-5">
              <p className="text-sm text-muted-foreground">Total paid</p>
              <p className="mt-2 text-3xl font-bold">
                {formatPrice(
                  resource.data.reduce((sum, p) => sum + p.amount, 0),
                )}
              </p>
            </div>
            <div className="overflow-x-auto rounded-xl border">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted">
                  <tr>
                    {[
                      "Service",
                      "Technician",
                      "Amount",
                      "Date",
                      "Transaction",
                    ].map((h) => (
                      <th key={h} className="whitespace-nowrap p-4 font-medium">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {resource.data.map((p) => (
                    <tr key={p._id} className="border-t">
                      <td className="min-w-48 p-4 font-medium">
                        {p.serviceTitle}
                      </td>
                      <td className="p-4">{p.technicianName}</td>
                      <td className="p-4">{formatPrice(p.amount)}</td>
                      <td className="whitespace-nowrap p-4">
                        {formatDate(p.paidAt)}
                      </td>
                      <td className="p-4 font-mono text-xs">
                        {p.transactionId || p.stripeSessionId}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <EmptyState
            title="No payments yet"
            text="After a repair is completed, pay from My Bookings. Your receipt will appear here."
          >
            <Button asChild className="bg-brand-500 text-white hover:bg-brand-600">
              <Link href="/dashboard/customer/bookings">Go to My Bookings</Link>
            </Button>
          </EmptyState>
        ))}
    </>
  );
}
