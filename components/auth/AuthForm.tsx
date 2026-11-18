"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Wrench } from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { clearAuthToken } from "@/lib/api";
import { dashboardPathForRole } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
export function AuthForm({ mode }: { mode: "sign-in" | "sign-up" }) {
  const signup = mode === "sign-up";
  const params = useSearchParams();
  const router = useRouter();
  const [role, setRole] = useState(
    params.get("role") === "technician" ? "technician" : "customer",
  );
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const rawNext = params.get("next") || "";
  const next =
    rawNext.startsWith("/") &&
    !rawNext.startsWith("//") &&
    !rawNext.includes("\\")
      ? rawNext
      : "";
  const alternate = `/${signup ? "sign-in" : "sign-up"}${next ? `?next=${encodeURIComponent(next)}` : ""}`;
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const form = new FormData(e.currentTarget);
    const name = String(form.get("name") || "").trim();
    const email = String(form.get("email") || "").trim();
    const password = String(form.get("password") || "");
    if (signup && password !== form.get("confirmPassword")) {
      setError("Your passwords don’t match.");
      return;
    }
    setBusy(true);
    try {
      clearAuthToken();
      const result = signup
        ? await authClient.signUp.email({ name, email, password, role })
        : await authClient.signIn.email({ email, password });
      if (result.error)
        throw new Error(
          result.error.message || "Unable to sign in. Please try again.",
        );
      const session = await authClient.getSession({
        query: { disableCookieCache: true },
      });
      const userRole = (session.data?.user as { role?: string } | undefined)
        ?.role;
      toast.success(
        signup ? "Your account is ready. Welcome to FixMate!" : "Welcome back!",
      );
      router.replace(next || dashboardPathForRole(userRole));
      router.refresh();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong.";
      setError(message);
      toast.error(message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="mx-auto max-w-md px-4 py-14">
      <div className="rounded-2xl border bg-card p-6 shadow-sm sm:p-8">
        <Wrench className="mb-5 h-9 w-9 text-brand-500" />
        <h1 className="text-2xl font-bold">
          {signup ? "Create your FixMate account" : "Good to see you again"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {signup
            ? "Get your essentials fixed, or help others fix theirs."
            : "Sign in to manage repairs and keep things running."}
        </p>
        <form onSubmit={submit} className="mt-7 space-y-4">
          {signup && (
            <>
              <div className="space-y-2">
                <Label htmlFor="name">Full name</Label>
                <Input
                  id="name"
                  name="name"
                  autoComplete="name"
                  required
                  minLength={2}
                  maxLength={100}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">I want to join as a</Label>
                <select
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                >
                  <option value="customer">Customer — find repairs</option>
                  <option value="technician">
                    Technician — offer services
                  </option>
                </select>
              </div>
            </>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete={signup ? "new-password" : "current-password"}
                required
                minLength={6}
                maxLength={128}
                className="pr-11"
              />
              <button
                type="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-0 top-0 p-3"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {signup && (
              <p className="text-xs text-muted-foreground">
                Use at least 6 characters.
              </p>
            )}
          </div>
          {signup && (
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                minLength={6}
              />
            </div>
          )}
          {error && (
            <p role="alert" className="text-sm text-red-600 dark:text-red-400">
              {error}
            </p>
          )}
          <Button
            disabled={busy}
            type="submit"
            className="w-full bg-brand-500 text-white hover:bg-brand-600"
          >
            {busy ? "Please wait…" : signup ? "Create account" : "Sign in"}
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          {signup ? "Already have an account?" : "New to FixMate?"}{" "}
          <Link
            href={alternate}
            className="font-medium text-brand-600 hover:underline"
          >
            {signup ? "Sign in" : "Create an account"}
          </Link>
        </p>
      </div>
    </div>
  );
}
