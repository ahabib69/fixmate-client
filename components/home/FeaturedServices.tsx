"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { publicFetch } from "@/lib/api";
import type { Service } from "@/lib/types";
import { ServiceCard } from "@/components/services/ServiceCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export function FeaturedServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    publicFetch<Service[]>("/api/services/latest")
      .then(setServices)
      .catch(() => setServices([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Featured Services
          </h2>
          <p className="mt-2 text-muted-foreground">
            The newest repairs from technicians on FixMate.
          </p>
        </div>
        <Button
          variant="outline"
          asChild
          className="hidden shrink-0 sm:inline-flex"
        >
          <Link href="/services">
            View all <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>

      {loading ? (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-xl border">
              <Skeleton className="h-48 w-full rounded-none" />
              <div className="space-y-3 p-4">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : services.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed p-10 text-center">
          <p className="font-medium">No services yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            New technician services will appear here soon.
          </p>
          <Button
            asChild
            className="mt-4 bg-brand-500 hover:bg-brand-600 text-white"
          >
            <Link href="/services">Browse Services</Link>
          </Button>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <ServiceCard key={service._id} service={service} />
          ))}
        </div>
      )}

      <div className="mt-8 text-center sm:hidden">
        <Button variant="outline" asChild>
          <Link href="/services">
            View all services <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </section>
  );
}
