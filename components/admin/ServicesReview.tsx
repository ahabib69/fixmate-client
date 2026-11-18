"use client";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { useResource } from "@/hooks/useResource";
import { api } from "@/lib/api";
import type { Service } from "@/lib/types";
import { APPROVAL_STYLES } from "@/lib/constants";
import { formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  PageHeading,
  LoadState,
  EmptyState,
  ConfirmDialog,
} from "@/components/dashboard/Shared";
export function ServicesReview() {
  const params = useSearchParams();
  const [filter, setFilter] = useState(params.get("approvalStatus") || "");
  const [search, setSearch] = useState("");
  const resource = useResource<Service[]>(
    `/api/admin/services${filter ? `?approvalStatus=${filter}` : ""}`,
  );
  const [action, setAction] = useState<{
    service: Service;
    approvalStatus: string;
  } | null>(null);
  const [busy, setBusy] = useState(false);
  const rows = (resource.data || []).filter((s) =>
    `${s.title} ${s.technicianName} ${s.category}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );
  async function confirm() {
    if (!action) return;
    setBusy(true);
    try {
      await api.patch(`/api/admin/services/${action.service._id}/approval`, {
        approvalStatus: action.approvalStatus,
      });
      toast.success(`Service ${action.approvalStatus}.`);
      setAction(null);
      resource.reload();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Unable to review service.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <PageHeading
        title="Service reviews"
        description="Review service details before approving them for the public catalogue. Pending listings appear first."
      />
      <div className="mb-6 flex flex-wrap gap-3">
        <Input
          aria-label="Search services"
          className="max-w-sm"
          placeholder="Search title, category, or technician…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          aria-label="Filter approval status"
          className="h-10 rounded-md border bg-background px-3 text-sm"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="">All approvals</option>
          {["pending", "approved", "rejected"].map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </div>
      <LoadState {...resource} retry={resource.reload} />
      {!resource.loading &&
        !resource.error &&
        (rows.length ? (
          <div className="grid gap-5 xl:grid-cols-2">
            {rows.map((s) => (
              <article key={s._id} className="rounded-xl border bg-card p-5">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="font-semibold">{s.title}</h2>
                  <Badge
                    variant="outline"
                    className={APPROVAL_STYLES[s.approvalStatus]}
                  >
                    {s.approvalStatus}
                  </Badge>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {s.technicianName} · {s.technicianEmail}
                </p>
                <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed">
                  {s.description}
                </p>
                <dl className="my-5 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <dt className="text-xs text-muted-foreground">Category</dt>
                    <dd>{s.category}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">
                      Starting price
                    </dt>
                    <dd>{formatPrice(s.basePrice)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">
                      Mode / duration
                    </dt>
                    <dd>
                      {s.serviceMode} · {s.estimatedDuration}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">
                      Area / availability
                    </dt>
                    <dd>
                      {s.serviceArea} ·{" "}
                      {s.isAvailable ? "Available" : "Unavailable"}
                    </dd>
                  </div>
                </dl>
                <a
                  className="text-sm text-brand-600 underline"
                  href={s.image}
                  target="_blank"
                  rel="noreferrer"
                >
                  Review service image
                </a>
                <div className="mt-5 flex gap-2">
                  <Button
                    size="sm"
                    disabled={s.approvalStatus === "approved"}
                    onClick={() =>
                      setAction({ service: s, approvalStatus: "approved" })
                    }
                  >
                    Approve
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    disabled={s.approvalStatus === "rejected"}
                    onClick={() =>
                      setAction({ service: s, approvalStatus: "rejected" })
                    }
                  >
                    Reject
                  </Button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No services to review"
            text="Change the filter or check back after a technician submits a listing."
          />
        ))}
      <ConfirmDialog
        open={!!action}
        onClose={() => setAction(null)}
        onConfirm={confirm}
        busy={busy}
        title={
          action?.approvalStatus === "approved"
            ? "Approve this service?"
            : "Reject this service?"
        }
        description={
          action?.approvalStatus === "approved"
            ? "Available services will become visible publicly and customers can request repairs."
            : "The service will be hidden from public listings. Existing bookings are not changed."
        }
      />
    </>
  );
}
