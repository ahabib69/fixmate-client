"use client";
import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { useResource } from "@/hooks/useResource";
import { api } from "@/lib/api";
import type { Booking } from "@/lib/types";
import { BOOKING_STATUSES, STATUS_LABELS } from "@/lib/constants";
import { formatDate, formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  ConfirmDialog,
} from "./Shared";
export function BookingsManager({
  technician = false,
}: {
  technician?: boolean;
}) {
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const resource = useResource<Booking[]>(
    `/api/bookings/${technician ? "technician" : "my"}${status ? `?status=${status}` : ""}`,
  );
  const [detail, setDetail] = useState<Booking | null>(null);
  const [action, setAction] = useState<{
    booking: Booking;
    status: string;
  } | null>(null);
  const [amount, setAmount] = useState("");
  const [busy, setBusy] = useState(false);
  const [paying, setPaying] = useState("");
  const rows = (resource.data || []).filter((b) =>
    `${b.serviceTitle} ${technician ? b.customerName : b.technicianName}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );
  async function confirm() {
    if (!action) return;
    if (
      action.status === "completed" &&
      (!Number.isFinite(Number(amount)) || Number(amount) <= 0)
    ) {
      toast.error("Enter a final amount greater than 0.");
      return;
    }
    setBusy(true);
    try {
      if (action.status === "cancelled")
        await api.patch(`/api/bookings/${action.booking._id}/cancel`);
      else
        await api.patch(`/api/bookings/${action.booking._id}/status`, {
          status: action.status,
          ...(action.status === "completed"
            ? { finalAmount: Number(amount) }
            : {}),
        });
      toast.success("Booking updated.");
      setAction(null);
      resource.reload();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Unable to update booking.",
      );
    } finally {
      setBusy(false);
    }
  }
  async function pay(booking: Booking) {
    setPaying(booking._id);
    try {
      const result = await api.post<{ url: string }>(
        "/api/payments/create-checkout-session",
        { bookingId: booking._id },
      );
      if (!result.url) throw new Error("Checkout could not be opened.");
      window.location.assign(result.url);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Unable to open checkout.",
      );
      setPaying("");
    }
  }
  function start(booking: Booking, next: string) {
    setAmount(String(booking.finalAmount || booking.basePrice));
    setAction({ booking, status: next });
  }
  return (
    <>
      <PageHeading
        title={technician ? "Incoming requests" : "My bookings"}
        description={
          technician
            ? "Review requests and move accepted jobs through the repair process."
            : "Track repairs, review updates, and pay once a job is completed."
        }
      >
        <Button variant="outline" onClick={resource.reload}>
          Refresh
        </Button>
      </PageHeading>
      <div className="mb-6 flex flex-wrap gap-3">
        <Input
          className="max-w-sm"
          aria-label="Search bookings"
          placeholder={
            technician
              ? "Search service or customer…"
              : "Search service or technician…"
          }
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          aria-label="Filter by status"
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
          <div className="space-y-4">
            {rows.map((b) => (
              <article key={b._id} className="rounded-xl border bg-card p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="font-semibold">{b.serviceTitle}</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {technician ? b.customerName : b.technicianName} ·
                      Preferred: {formatDate(b.preferredDate)}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Requested {formatDate(b.createdAt)}
                    </p>
                  </div>
                  <StatusBadge status={b.status} />
                </div>
                <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm">
                  <p>
                    {b.status === "completed"
                      ? "Final amount"
                      : "Starting price"}
                    :{" "}
                    <strong>
                      {formatPrice(
                        b.status === "completed" ? b.finalAmount : b.basePrice,
                      )}
                    </strong>
                  </p>
                  <p>
                    Payment:{" "}
                    <Badge
                      variant="outline"
                      className={
                        b.paymentStatus === "paid"
                          ? "border-green-200 bg-green-100 text-green-800 dark:border-green-900 dark:bg-green-950 dark:text-green-300"
                          : "border-orange-200 bg-orange-100 text-orange-800 dark:border-orange-900 dark:bg-orange-950 dark:text-orange-300"
                      }
                    >
                      {b.paymentStatus === "paid" ? "Paid" : "Unpaid"}
                    </Badge>
                  </p>
                </div>
                <div className="mt-5 flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setDetail(b)}
                  >
                    View details
                  </Button>
                  {!technician && b.status === "requested" && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => start(b, "cancelled")}
                    >
                      Cancel request
                    </Button>
                  )}
                  {!technician &&
                    b.status === "completed" &&
                    b.paymentStatus === "unpaid" && (
                      <Button
                        size="sm"
                        disabled={!!paying}
                        onClick={() => pay(b)}
                      >
                        {paying === b._id ? "Opening Stripe…" : "Pay Now"}
                      </Button>
                    )}
                  {technician && b.status === "requested" && (
                    <>
                      <Button size="sm" onClick={() => start(b, "accepted")}>
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => start(b, "rejected")}
                      >
                        Reject
                      </Button>
                    </>
                  )}
                  {technician && b.status === "accepted" && (
                    <Button size="sm" onClick={() => start(b, "in-progress")}>
                      Start repair
                    </Button>
                  )}
                  {technician && b.status === "in-progress" && (
                    <Button size="sm" onClick={() => start(b, "completed")}>
                      Complete repair
                    </Button>
                  )}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No bookings to show"
            text="Try another filter, or check back once a new request arrives."
          >
            {!technician && (
              <Button asChild>
                <Link href="/services">Browse services</Link>
              </Button>
            )}
          </EmptyState>
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
            <DialogDescription>
              Repair details and status history
            </DialogDescription>
          </DialogHeader>
          {detail && (
            <div className="space-y-5 text-sm">
              <StatusBadge status={detail.status} />
              <dl className="grid gap-3">
                <div>
                  <dt className="text-muted-foreground">Customer</dt>
                  <dd>
                    {detail.customerName} · {detail.customerEmail}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Technician</dt>
                  <dd>{detail.technicianName}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Contact</dt>
                  <dd>{detail.customerPhone}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Address</dt>
                  <dd>{detail.address}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Preferred date</dt>
                  <dd>{formatDate(detail.preferredDate)}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Problem</dt>
                  <dd className="whitespace-pre-wrap">
                    {detail.problemDescription}
                  </dd>
                </div>
              </dl>
              <div>
                <h3 className="mb-3 font-semibold">Status history</h3>
                <ol className="space-y-3 border-l pl-4">
                  {detail.statusHistory.map((entry, index) => (
                    <li key={index}>
                      <StatusBadge status={entry.status} />
                      <p className="mt-1 text-xs text-muted-foreground">
                        {formatDate(entry.changedAt)} ·{" "}
                        {new Date(entry.changedAt).toLocaleTimeString()}
                      </p>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      <ConfirmDialog
        open={!!action}
        onClose={() => setAction(null)}
        onConfirm={confirm}
        busy={busy}
        title={
          action?.status === "completed"
            ? "Complete this repair?"
            : `${({ accepted: "Accept", rejected: "Reject", "in-progress": "Start work on", cancelled: "Cancel" } as Record<string, string>)[action?.status || ""] || "Update"} this request?`
        }
        description={
          action?.status === "completed"
            ? "Set the agreed final amount in USD. The customer can pay after you confirm."
            : "This updates the booking and its status history. This action cannot be undone."
        }
      >
        {action?.status === "completed" && (
          <div className="space-y-2">
            <Label htmlFor="finalAmount">Final amount (USD)</Label>
            <Input
              id="finalAmount"
              type="number"
              min="0.01"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
        )}
      </ConfirmDialog>
    </>
  );
}
