"use client";
import { Button } from "@/components/ui/button";
export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="px-4 py-24 text-center">
      <h1 className="text-2xl font-bold">Something interrupted this page.</h1>
      <p className="my-4 text-muted-foreground">
        Please try again. Your existing bookings won’t be changed.
      </p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
