"use client";
import { useState } from "react";
import { useResource } from "@/hooks/useResource";
import type { Payment } from "@/lib/types";
import { formatDate, formatPrice } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import {
  PageHeading,
  LoadState,
  EmptyState,
} from "@/components/dashboard/Shared";
export function Transactions() {
  const resource = useResource<{ payments: Payment[]; totalRevenue: number }>(
    "/api/admin/payments",
  );
  const [search, setSearch] = useState("");
  const rows = (resource.data?.payments || []).filter((p) =>
    `${p.serviceTitle} ${p.customerEmail} ${p.technicianName} ${p.transactionId} ${p.stripeSessionId}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );
  return (
    <>
      <PageHeading
        title="Transactions"
        description="Recorded Stripe payments in USD. Seeded demo transactions are included in totals."
      />
      <LoadState {...resource} retry={resource.reload} />
      {!resource.loading && !resource.error && resource.data && (
        <>
          <div className="mb-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border bg-card p-5">
              <p className="text-sm text-muted-foreground">
                Total recorded revenue
              </p>
              <p className="mt-3 text-3xl font-bold">
                {formatPrice(resource.data.totalRevenue)}
              </p>
            </div>
            <div className="rounded-xl border bg-card p-5">
              <p className="text-sm text-muted-foreground">Payments recorded</p>
              <p className="mt-3 text-3xl font-bold">
                {resource.data.payments.length}
              </p>
            </div>
          </div>
          <Input
            className="mb-6 max-w-md"
            aria-label="Search transactions"
            placeholder="Search service, customer, or transaction…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {rows.length ? (
            <div className="overflow-x-auto rounded-xl border bg-card">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted">
                  <tr>
                    {[
                      "Service",
                      "Customer",
                      "Technician",
                      "Amount",
                      "Paid",
                      "Transaction / session",
                    ].map((h) => (
                      <th key={h} className="whitespace-nowrap p-4 font-medium">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((p) => (
                    <tr key={p._id} className="border-t">
                      <td className="min-w-48 p-4 font-medium">
                        {p.serviceTitle}
                      </td>
                      <td className="p-4">
                        {p.customerName}
                        <span className="block text-xs text-muted-foreground">
                          {p.customerEmail}
                        </span>
                      </td>
                      <td className="p-4">{p.technicianName}</td>
                      <td className="p-4">{formatPrice(p.amount)}</td>
                      <td className="whitespace-nowrap p-4">
                        {formatDate(p.paidAt)}
                      </td>
                      <td className="p-4 font-mono text-xs">
                        <p>{p.transactionId || "—"}</p>
                        <p className="mt-1 text-muted-foreground">
                          {p.stripeSessionId}
                        </p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              title="No matching transactions"
              text="Try another search. New completed payments appear here on refresh."
            />
          )}
        </>
      )}
    </>
  );
}
