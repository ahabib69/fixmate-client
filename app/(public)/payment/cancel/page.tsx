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
      <Button asChild>
        <Link href="/dashboard/customer/bookings">Back to my bookings</Link>
      </Button>
    </div>
  );
}
