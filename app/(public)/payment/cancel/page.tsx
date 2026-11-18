import Link from "next/link";
import { Button } from "@/components/ui/button";
export default function Page() {
  return (
    <div className="mx-auto max-w-lg px-4 py-24 text-center">
      <h1 className="text-3xl font-bold">Checkout cancelled</h1>
      <p className="my-5 text-muted-foreground">
        This checkout wasn’t completed. Your booking is still available in My
        Bookings, where you can check its payment status and try again.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button asChild className="bg-brand-500 text-white hover:bg-brand-600">
          <Link href="/dashboard/customer/bookings">Try Again</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/">Back to Home</Link>
        </Button>
      </div>
    </div>
  );
}
