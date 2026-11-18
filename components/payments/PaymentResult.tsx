"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import type { Payment } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
export function PaymentResult() {
  const params = useSearchParams();
  const sessionId = params.get("session_id");
  const { user, isPending } = useAuth();
  const [payment, setPayment] = useState<Payment | null>(null);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [checking, setChecking] = useState(true);
  useEffect(() => {
    if (isPending || !user || user.role !== "customer" || !sessionId) return;
    let active = true;
    setChecking(true);
    setError("");
    api
      .get<{ payment: Payment | null }>(
        `/api/payments/verify?session_id=${encodeURIComponent(sessionId)}`,
      )
      .then((result) => {
        if (!result.payment)
          throw new Error(
            "Payment is not available yet. Please retry in a moment.",
          );
        if (active) setPayment(result.payment);
      })
      .catch((err) => {
        if (active)
          setError(
            err instanceof Error ? err.message : "Unable to verify payment.",
          );
      })
      .finally(() => {
        if (active) setChecking(false);
      });
    return () => {
      active = false;
    };
  }, [isPending, user?.id, user?.role, sessionId, attempt]);
  const next = `/payment/success?session_id=${encodeURIComponent(sessionId || "")}`;
  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center">
      <div className="rounded-2xl border bg-card p-8">
        {isPending ? (
          <Loader2 className="mx-auto h-10 w-10 animate-spin" />
        ) : !user ? (
          <>
            <h1 className="text-2xl font-bold">
              Sign in to verify your payment
            </h1>
            <p className="my-4 text-sm text-muted-foreground">
              Use the customer account that paid for the repair.
            </p>
            <Button asChild>
              <Link href={`/sign-in?next=${encodeURIComponent(next)}`}>
                Sign in
              </Link>
            </Button>
          </>
        ) : user.role !== "customer" ? (
          <p>
            Payment receipts are available to the customer who made the payment.
          </p>
        ) : !sessionId ? (
          <>
            <AlertCircle className="mx-auto h-10 w-10 text-amber-500" />
            <h1 className="mt-4 text-2xl font-bold">
              Missing payment reference
            </h1>
            <p className="mt-3 text-muted-foreground">
              Check My Payments for your receipt.
            </p>
          </>
        ) : checking ? (
          <>
            <Loader2 className="mx-auto h-10 w-10 animate-spin" />
            <h1 className="mt-4 text-xl font-bold">Confirming your payment…</h1>
          </>
        ) : error ? (
          <>
            <AlertCircle className="mx-auto h-10 w-10 text-amber-500" />
            <h1 className="mt-4 text-2xl font-bold">
              We couldn’t confirm it yet
            </h1>
            <p role="alert" className="my-4 text-sm text-muted-foreground">
              {error}
            </p>
            <Button onClick={() => setAttempt((v) => v + 1)}>
              Try verification again
            </Button>
          </>
        ) : (
          <>
            <CheckCircle2 className="mx-auto h-12 w-12 text-green-600" />
            <h1 className="mt-4 text-2xl font-bold">Payment confirmed</h1>
            <p className="mt-3 text-muted-foreground">
              Thanks for choosing FixMate.
            </p>
            <p className="mt-5 font-semibold">{payment?.serviceTitle}</p>
            <p className="mt-2 text-3xl font-bold">
              {formatPrice(payment?.amount || 0)}
            </p>
            <p className="mt-4 break-all font-mono text-xs text-muted-foreground">
              {payment?.transactionId || payment?.stripeSessionId}
            </p>
          </>
        )}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button asChild variant="outline">
            <Link href="/dashboard/customer/bookings">My bookings</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/dashboard/customer/payments">My payments</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
