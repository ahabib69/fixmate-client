import Link from "next/link";
import { Button } from "@/components/ui/button";
export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 text-center">
      <div>
        <p className="font-semibold text-brand-500">404</p>
        <h1 className="mt-3 text-3xl font-bold">
          This page needs a little fixing.
        </h1>
        <p className="my-5 text-muted-foreground">
          The page may have moved, or the link is no longer available.
        </p>
        <Button asChild>
          <Link href="/">Back to FixMate</Link>
        </Button>
      </div>
    </main>
  );
}
