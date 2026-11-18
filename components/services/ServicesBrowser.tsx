"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal } from "lucide-react";
import { publicFetch } from "@/lib/api";
import { CATEGORIES, SERVICE_MODES } from "@/lib/constants";
import type { PaginatedServices } from "@/lib/types";
import { ServiceCard } from "./ServiceCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

export function ServicesBrowser() {
  const params = useSearchParams();
  const router = useRouter();
  const query = params.toString();
  const [search, setSearch] = useState(params.get("search") || "");
  const [result, setResult] = useState<PaginatedServices | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    setSearch(params.get("search") || "");
  }, [params]);
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    publicFetch<PaginatedServices>(`/api/services?${query}`)
      .then((data) => {
        if (active) setResult(data);
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
  }, [query, retry]);
  function update(key: string, value: string) {
    const next = new URLSearchParams(query);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== "page") next.delete("page");
    router.push(`/services?${next}`);
  }
  const selectClass =
    "h-11 w-full rounded-md border bg-background px-3 text-sm";
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold">Find your repair service</h1>
      <p className="mt-2 text-muted-foreground">
        Browse approved, available services. All prices are in USD.
      </p>
      <div className="mt-8 grid gap-3 rounded-xl border bg-card p-4 md:grid-cols-2 lg:grid-cols-4">
        <form
          className="relative"
          onSubmit={(e) => {
            e.preventDefault();
            update("search", search.trim());
          }}
        >
          <Input
            aria-label="Search services"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search repairs…"
            className="h-11 pr-11"
          />
          <button
            aria-label="Submit search"
            className="absolute right-0 top-0 p-3"
          >
            <Search className="h-5 w-5" />
          </button>
        </form>
        <select
          aria-label="Category"
          className={selectClass}
          value={params.get("category") || ""}
          onChange={(e) => update("category", e.target.value)}
        >
          <option value="">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <select
          aria-label="Service mode"
          className={selectClass}
          value={params.get("serviceMode") || ""}
          onChange={(e) => update("serviceMode", e.target.value)}
        >
          <option value="">Any service mode</option>
          {SERVICE_MODES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <select
          aria-label="Sort services"
          className={selectClass}
          value={params.get("sort") || "newest"}
          onChange={(e) => update("sort", e.target.value)}
        >
          <option value="newest">Newest first</option>
          <option value="price-asc">Price: low to high</option>
          <option value="price-desc">Price: high to low</option>
        </select>
      </div>
      <div className="my-5 flex items-center justify-between text-sm text-muted-foreground">
        <span aria-live="polite">
          {loading
            ? "Finding services…"
            : `${result?.total || 0} services found`}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/services")}
        >
          <SlidersHorizontal className="mr-2 h-4 w-4" />
          Reset filters
        </Button>
      </div>
      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="h-80 rounded-xl" />
          ))}
        </div>
      ) : error ? (
        <div role="alert" className="rounded-xl border p-10 text-center">
          <h2 className="font-semibold">We couldn’t load the services</h2>
          <p className="my-3 text-sm text-muted-foreground">{error}</p>
          <Button onClick={() => setRetry((n) => n + 1)}>Try again</Button>
        </div>
      ) : !result?.data.length ? (
        <div className="rounded-xl border border-dashed p-14 text-center">
          <Search className="mx-auto mb-4 h-9 w-9 text-muted-foreground" />
          <h2 className="text-lg font-semibold">No matching services</h2>
          <p className="mt-2 text-muted-foreground">
            Try a different search or clear your filters.
          </p>
          <Button
            variant="outline"
            className="mt-5"
            onClick={() => router.push("/services")}
          >
            Clear filters
          </Button>
        </div>
      ) : (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {result.data.map((service) => (
              <ServiceCard key={service._id} service={service} />
            ))}
          </div>
          <nav
            aria-label="Service pages"
            className="mt-10 flex items-center justify-center gap-4"
          >
            <Button
              variant="outline"
              disabled={result.page <= 1}
              onClick={() => update("page", String(result.page - 1))}
            >
              Previous
            </Button>
            <span className="text-sm">
              Page {result.page} of {result.totalPages}
            </span>
            <Button
              variant="outline"
              disabled={result.page >= result.totalPages}
              onClick={() => update("page", String(result.page + 1))}
            >
              Next
            </Button>
          </nav>
        </>
      )}
    </div>
  );
}
