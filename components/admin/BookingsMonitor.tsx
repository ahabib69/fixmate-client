"use client";
import { useState } from "react";
import { useResource } from "@/hooks/useResource";
import type { Booking } from "@/lib/types";
import { BOOKING_STATUSES, STATUS_LABELS } from "@/lib/constants";
import { formatDate, formatPrice } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  PageHeading,
  LoadState,
  EmptyState,
  StatusBadge,
} from "@/components/dashboard/Shared";
export function BookingsMonitor() {
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [detail, setDetail] = useState<Booking | null>(null);
  const resource = useResource<Booking[]>(
    `/api/admin/bookings${status ? `?status=${status}` : ""}`,
  );
  const rows = (resource.data || []).filter((b) =>
    `${b.serviceTitle} ${b.customerName} ${b.customerEmail} ${b.technicianName} ${b._id}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );
  return (
    <>
      <PageHeading
        title="All bookings"
        description="Read-only oversight of repair requests. Workflow actions belong to the assigned customer or technician."
      >
        <Button variant="outline" onClick={resource.reload}>
          Refresh
        </Button>
      </PageHeading>
      <div className="mb-6 flex flex-wrap gap-3">
        <Input
          aria-label="Search bookings"
          className="max-w-sm"
          placeholder="Search service, customer, technician, or ID…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          aria-label="Filter status"
          className="h-10 rounded-md border bg-background px-3 text-sm"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">All statuses</option>
          {BOOKING_STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </select>
      </div>
      <LoadState {...resource} retry={resource.reload} />
      {!resource.loading &&
        !resource.error &&
        (rows.length ? (
          <div className="overflow-x-auto rounded-xl border bg-card">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted">
                <tr>
                  {[
                    "Service",
                    "Customer",
                    "Technician",
                    "Status",
                    "Amount",
                    "Payment",
                    "Details",
                  ].map((h) => (
                    <th key={h} className="p-4 font-medium">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((b) => (
                  <tr key={b._id} className="border-t">
                    <td className="min-w-48 p-4 font-medium">
                      {b.serviceTitle}
                    </td>
                    <td className="p-4">{b.customerName}</td>
                    <td className="p-4">{b.technicianName}</td>
                    <td className="p-4">
                      <StatusBadge status={b.status} />
                    </td>
                    <td className="whitespace-nowrap p-4">
                      {formatPrice(
                        b.status === "completed" ? b.finalAmount : b.basePrice,
                      )}
                      <span className="block text-xs text-muted-foreground">
                        {b.status === "completed" ? "final" : "starting"}
                      </span>
                    </td>
                    <td className="p-4">{b.paymentStatus}</td>
                    <td className="p-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setDetail(b)}
                      >
                        Inspect
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            title="No matching bookings"
            text="Try a different search or status filter."
          />
        ))}
      <Dialog
        open={!!detail}
        onOpenChange={(open) => {
          if (!open) setDetail(null);
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{detail?.serviceTitle}</DialogTitle>
            <DialogDescription>Booking {detail?._id}</DialogDescription>
          </DialogHeader>
          {detail && (
            <div className="space-y-4 text-sm">
              <p>
                <strong>Customer:</strong> {detail.customerName} ·{" "}
                {detail.customerEmail}
              </p>
              <p>
                <strong>Technician:</strong> {detail.technicianName} ·{" "}
                {detail.technicianEmail}
              </p>
              <p>
                <strong>Phone:</strong> {detail.customerPhone}
              </p>
              <p>
                <strong>Address:</strong> {detail.address}
              </p>
              <p>
                <strong>Preferred date:</strong>{" "}
                {formatDate(detail.preferredDate)}
              </p>
              <p className="whitespace-pre-wrap">
                <strong>Problem:</strong> {detail.problemDescription}
              </p>
              <h3 className="font-semibold">Status history</h3>
              <ol className="space-y-3 border-l pl-4">
                {detail.statusHistory.map((h, i) => (
                  <li key={i}>
                    <StatusBadge status={h.status} />
                    <p className="mt-1 text-xs text-muted-foreground">
                      {new Date(h.changedAt).toLocaleString()}
                    </p>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
