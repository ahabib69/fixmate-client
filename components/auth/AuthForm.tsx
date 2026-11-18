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
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
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
    const confirm = String(form.get("confirmPassword") || "");
    const errors: Record<string, string> = {};
    if (signup && name.length < 2) errors.name = "Please enter your full name.";
    if (!email) errors.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      errors.email = "Please enter a valid email address.";
    if (!password) errors.password = "Password is required.";
    else if (signup) {
      if (password.length < 6)
        errors.password = "Password must be at least 6 characters.";
      else if (!/[A-Z]/.test(password))
        errors.password = "Password needs at least one uppercase letter.";
      else if (!/[a-z]/.test(password))
        errors.password = "Password needs at least one lowercase letter.";
    }
    if (signup && !errors.password && password !== confirm)
      errors.confirmPassword = "Your passwords don’t match.";
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;
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
        <form onSubmit={submit} noValidate className="mt-7 space-y-4">
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
                {fieldErrors.name && (
                <p className="text-xs text-red-600 dark:text-red-400">{fieldErrors.name}</p>
              )}
              </div>
              <div className="space-y-2">
                <Label>I want to join as a</Label>
                <div className="grid grid-cols-2 gap-3" role="radiogroup">
                  {[
                    { value: "customer", title: "Customer", text: "Find repairs" },
                    { value: "technician", title: "Technician", text: "Offer services" },
                  ].map((option) => (
                    <label
                      key={option.value}
                      className={`cursor-pointer rounded-lg border p-3 text-sm transition-colors ${
                        role === option.value
                          ? "border-brand-500 bg-brand-500/10"
                          : "hover:border-brand-500/50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="role"
                        value={option.value}
                        checked={role === option.value}
                        onChange={() => setRole(option.value)}
                        className="sr-only"
                      />
                      <span className="block font-semibold">{option.title}</span>
                      <span className="text-xs text-muted-foreground">
                        {option.text}
                      </span>
                    </label>
                  ))}
                </div>
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
            {fieldErrors.email && (
                <p className="text-xs text-red-600 dark:text-red-400">{fieldErrors.email}</p>
              )}
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
            {fieldErrors.password && (
                <p className="text-xs text-red-600 dark:text-red-400">{fieldErrors.password}</p>
              )}
            {signup && !fieldErrors.password && (
              <p className="text-xs text-muted-foreground">
                At least 6 characters, with one uppercase and one lowercase letter.
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
              {fieldErrors.confirmPassword && (
                <p className="text-xs text-red-600 dark:text-red-400">{fieldErrors.confirmPassword}</p>
              )}
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
