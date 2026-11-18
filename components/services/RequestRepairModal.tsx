"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { api } from "@/lib/api";
import type { Service } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Props {
  service: Service;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customerName: string;
  customerEmail: string;
}

export function RequestRepairModal({
  service,
  open,
  onOpenChange,
  customerName,
  customerEmail,
}: Props) {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [preferredDate, setPreferredDate] = useState("");
  const [problem, setProblem] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  function validate() {
    const next: Record<string, string> = {};
    if (!phone.trim()) next.phone = "Phone number is required.";
    if (!address.trim()) next.address = "Address is required.";
    if (!preferredDate) next.preferredDate = "Please pick a date.";
    else if (preferredDate < today)
      next.preferredDate = "Date must be today or in the future.";
    if (problem.trim().length < 20)
      next.problem = "Please describe the problem in at least 20 characters.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      await api.post("/api/bookings", {
        serviceId: service._id,
        customerPhone: phone.trim(),
        address: address.trim(),
        preferredDate,
        problemDescription: problem.trim(),
      });

      onOpenChange(false);
      setPhone("");
      setAddress("");
      setPreferredDate("");
      setProblem("");
      setErrors({});

      toast.success(
        "Repair request sent! The technician will review it shortly.",
        {
          action: {
            label: "View My Bookings",
            onClick: () => router.push("/dashboard/customer/bookings"),
          },
          duration: 6000,
        },
      );
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to send request.";
      // The server returns this exact message for duplicates - show it as-is.
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Request Repair</DialogTitle>
          <DialogDescription>
            {service.title} · Starting at ${service.basePrice}. You only pay
            after the job is completed.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Your name</Label>
              <Input value={customerName} readOnly className="bg-muted" />
            </div>
            <div className="space-y-2">
              <Label>Your email</Label>
              <Input value={customerEmail} readOnly className="bg-muted" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone number</Label>
            <Input
              id="phone"
              placeholder="e.g. +880 1700-000000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            {errors.phone && (
              <p className="text-sm text-red-600">{errors.phone}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Your address</Label>
            <Input
              id="address"
              placeholder="House, road, area"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
            {errors.address && (
              <p className="text-sm text-red-600">{errors.address}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Preferred date</Label>
            <Input
              id="date"
              type="date"
              min={today}
              value={preferredDate}
              onChange={(e) => setPreferredDate(e.target.value)}
            />
            {errors.preferredDate && (
              <p className="text-sm text-red-600">{errors.preferredDate}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="problem">Describe the problem</Label>
            <Textarea
              id="problem"
              placeholder="Tell us what is wrong, when it started, and anything else the technician should know..."
              value={problem}
              onChange={(e) => setProblem(e.target.value)}
              rows={4}
            />
            <p className="text-xs text-muted-foreground">
              {problem.trim().length}/20 minimum characters
            </p>
            {errors.problem && (
              <p className="text-sm text-red-600">{errors.problem}</p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="bg-brand-500 hover:bg-brand-600 text-white"
            >
              {submitting ? "Sending..." : "Send Request"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
