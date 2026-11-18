"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Search, ShieldCheck, BadgeCheck, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Hero() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = query.trim()
      ? `?search=${encodeURIComponent(query.trim())}`
      : "";
    router.push(`/services${params}`);
  }

  return (
    <section className="bg-navy-950 text-white">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-20">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full bg-navy-800 px-3 py-1 text-xs font-medium text-navy-100">
            <ShieldCheck className="h-4 w-4 text-brand-400" /> Repair services
            across Bangladesh
          </p>
          <h1 className="mt-5 text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
            Broken Device? Find the Right Repair
          </h1>
          <p className="mt-4 max-w-xl text-base text-navy-200 sm:text-lg">
            From cracked phone screens to ACs and fridges — book a trusted
            technician, track your repair step by step, and pay only after the
            job is done.
          </p>

          <form onSubmit={handleSearch} className="mt-7 flex max-w-lg gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for a repair, e.g. AC cleaning..."
                className="h-12 bg-white pl-10 text-slate-900"
              />
            </div>
            <Button
              type="submit"
              size="lg"
              className="h-12 bg-brand-500 hover:bg-brand-600 text-white"
            >
              Search
            </Button>
          </form>

          <div className="mt-8 flex flex-wrap gap-6 text-sm text-navy-200">
            <span className="flex items-center gap-2">
              <BadgeCheck className="h-5 w-5 text-brand-400" /> Admin-reviewed
              services
            </span>
            <span className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-brand-400" /> Home visits & shop
              drop-off
            </span>
            <span className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-brand-400" /> Pay after
              completion
            </span>
          </div>
        </div>

        <div className="relative hidden h-[420px] overflow-hidden rounded-2xl lg:block">
          <Image
            src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=1200&auto=format&fit=crop"
            alt="A person working on a laptop"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-950/60 to-transparent" />
          <div className="absolute bottom-5 left-5 right-5 rounded-xl bg-white/95 p-4 text-foreground shadow-lg">
            <p className="text-sm font-semibold">
              Your repair, one step at a time
            </p>
            <p className="text-xs text-muted-foreground">
              Track requests and pay only after completion
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
