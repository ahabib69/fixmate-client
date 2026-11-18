"use client";
import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useResource } from "@/hooks/useResource";
import type { Service } from "@/lib/types";
import { APPROVAL_STYLES } from "@/lib/constants";
import { formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { PageHeading, LoadState, EmptyState, ConfirmDialog } from "./Shared";
import { ServiceForm } from "./ServiceForm";
export function MyServices() {
  const resource = useResource<Service[]>("/api/services/mine");
  const [editing, setEditing] = useState<Service | null>(null);
  const [removing, setRemoving] = useState<Service | null>(null);
  const [busy, setBusy] = useState(false);
  const [toggling, setToggling] = useState("");
  async function toggle(service: Service) {
    setToggling(service._id);
    try {
      await api.patch(`/api/services/${service._id}/availability`, {
        isAvailable: !service.isAvailable,
      });
      toast.success("Availability updated.");
      resource.reload();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Unable to change availability.",
      );
    } finally {
      setToggling("");
    }
  }
  async function remove() {
    if (!removing) return;
    setBusy(true);
    try {
      await api.delete(`/api/services/${removing._id}`);
      toast.success("Service deleted.");
      setRemoving(null);
      resource.reload();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Unable to delete service.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <PageHeading
        title="My services"
        description="Manage listings, approval status, and availability."
      >
        <Button asChild>
          <Link href="/dashboard/technician/add-service">Add service</Link>
        </Button>
      </PageHeading>
      <LoadState {...resource} retry={resource.reload} />
      {!resource.loading &&
        !resource.error &&
        (resource.data?.length ? (
          <div className="grid gap-5 xl:grid-cols-2">
            {resource.data.map((s) => (
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
                <p className="mt-3 text-sm text-muted-foreground">
                  {s.category} · {s.serviceMode} · {s.serviceArea}
                </p>
                <p className="mt-2 font-semibold">
                  {formatPrice(s.basePrice)}{" "}
                  <span className="text-xs font-normal text-muted-foreground">
                    starting
                  </span>
                </p>
                <label className="my-5 flex items-center gap-3 text-sm">
                  <Switch
                    checked={s.isAvailable}
                    disabled={!!toggling}
                    onCheckedChange={() => toggle(s)}
                    aria-label={`Availability for ${s.title}`}
                  />
                  {s.isAvailable ? "Available for requests" : "Unavailable"}
                </label>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditing(s)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setRemoving(s)}
                  >
                    Delete
                  </Button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState
            title="Your first service belongs here"
            text="Publish what you repair, where you work, and your starting price."
          >
            <Button asChild>
              <Link href="/dashboard/technician/add-service">
                Add a service
              </Link>
            </Button>
          </EmptyState>
        ))}
      <Dialog
        open={!!editing}
        onOpenChange={(open) => {
          if (!open) setEditing(null);
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit service</DialogTitle>
            <DialogDescription>
              Save your changes to send this listing for review.
            </DialogDescription>
          </DialogHeader>
          {editing && (
            <ServiceForm
              key={editing._id}
              service={editing}
              onSaved={() => {
                setEditing(null);
                resource.reload();
              }}
            />
          )}
        </DialogContent>
      </Dialog>
      <ConfirmDialog
        open={!!removing}
        onClose={() => setRemoving(null)}
        onConfirm={remove}
        busy={busy}
        title="Delete this service?"
        description="This removes the listing permanently. Existing bookings keep their repair details."
      />
    </>
  );
}
