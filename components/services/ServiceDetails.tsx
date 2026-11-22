"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { SafeImage } from "./SafeImage";
import { useRouter } from "next/navigation";
import { Clock, MapPin, Wrench, ArrowLeft, ShieldCheck } from "lucide-react";
import { publicFetch } from "@/lib/api";
import type { Service } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RequestRepairModal } from "./RequestRepairModal";

export function ServiceDetails({ id }: { id: string }) {
  const { user, isPending } = useAuth();
  const router = useRouter();
  const [service, setService] = useState<Service | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    let active = true;
    publicFetch<Service>(`/api/services/${encodeURIComponent(id)}`)
      .then((data) => {
        if (active) setService(data);
      })
      .catch((err) => {
        if (active) setError(err.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id]);
  if (loading)
    return (
      <div className="mx-auto max-w-6xl space-y-6 px-4 py-12">
        <Skeleton className="h-80 w-full" />
        <Skeleton className="h-12 w-2/3" />
      </div>
    );
  if (error || !service)
    return (
      <div className="px-4 py-24 text-center">
        <h1 className="text-2xl font-bold">This service isn’t available</h1>
        <p className="my-4 text-muted-foreground">
          {error || "It may have been removed or is awaiting approval."}
        </p>
        <Button asChild>
          <Link href="/services">Browse other repairs</Link>
        </Button>
      </div>
    );
  const canRequest =
    !user ||
    (user.role === "customer" && user.email !== service.technicianEmail);
  const tech = service.technician;
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <Link
        href="/services"
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        All services
      </Link>
      <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
        <article>
          <div className="relative h-64 overflow-hidden rounded-xl sm:h-96">
            <SafeImage
              src={service.image}
              alt={service.title}
              sizes="(max-width: 1024px) 100vw, 760px"
              className="object-cover"
              priority
            />
          </div>
          <Badge variant="secondary" className="mt-6">
            {service.category}
          </Badge>
          <h1 className="mt-3 text-3xl font-bold">{service.title}</h1>
          <h2 className="mt-8 text-xl font-semibold">About this repair</h2>
          <p className="mt-3 whitespace-pre-line leading-relaxed text-muted-foreground">
            {service.description}
          </p>
          <div className="mt-8 rounded-xl border p-5">
            <h2 className="font-semibold">What happens next?</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Send your request with the issue and a preferred date. Your
              technician will review it, accept or decline, and update the job
              as it progresses. The final amount is set when the work is
              completed. No payment is collected before completion.
            </p>
          </div>
        </article>
        <aside className="h-fit rounded-xl border bg-card p-6 lg:sticky lg:top-24">
          <p className="text-sm text-muted-foreground">Starting from</p>
          <p className="mt-1 text-4xl font-bold">
            {formatPrice(service.basePrice)}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            USD · Final amount confirmed after repair
          </p>
          <div className="my-6 space-y-4 text-sm">
            <p className="flex gap-2">
              <Wrench className="h-5 w-5 shrink-0 text-brand-500" />
              {service.serviceMode}
            </p>
            <p className="flex gap-2">
              <Clock className="h-5 w-5 shrink-0 text-brand-500" />
              {service.estimatedDuration}
            </p>
            <p className="flex gap-2">
              <MapPin className="h-5 w-5 shrink-0 text-brand-500" />
              {service.serviceArea}
            </p>
          </div>
          <div className="mb-6 border-t pt-5">
            <p className="text-xs text-muted-foreground">Your technician</p>
            <div className="mt-3 flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage
                  src={tech?.image || undefined}
                  alt={service.technicianName}
                />
                <AvatarFallback>
                  {service.technicianName.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="font-semibold">{service.technicianName}</p>
                {tech?.area && (
                  <p className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3 shrink-0" />
                    {tech.area}
                  </p>
                )}
              </div>
            </div>
            {tech?.bio && (
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {tech.bio}
              </p>
            )}
            <a
              className="mt-3 block break-all text-xs text-brand-600 underline"
              href={`mailto:${service.technicianEmail}`}
            >
              {service.technicianEmail}
            </a>
            <p className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="h-4 w-4" />
              Service approved by FixMate
            </p>
          </div>
          <Button
            className="w-full bg-brand-500 text-white hover:bg-brand-600"
            disabled={isPending || !canRequest}
            onClick={() =>
              user
                ? setOpen(true)
                : router.push(
                    `/sign-in?next=${encodeURIComponent(`/services/${id}`)}`,
                  )
            }
          >
            {isPending
              ? "Loading…"
              : user
                ? "Request Repair"
                : "Sign in to request repair"}
          </Button>
          {!canRequest && (
            <p className="mt-3 text-xs text-muted-foreground">
              Only customers can send repair requests. You cannot request your
              own service.
            </p>
          )}
        </aside>
      </div>
      {user && (
        <RequestRepairModal
          service={service}
          open={open}
          onOpenChange={setOpen}
          customerName={user.name}
          customerEmail={user.email}
        />
      )}
    </div>
  );
}
