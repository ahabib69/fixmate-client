import Link from "next/link";
import {
  Search,
  Wrench,
  CreditCard,
  Smartphone,
  Laptop,
  Wind,
  Refrigerator,
  Tv,
  WashingMachine,
  Zap,
  ArrowRight,
  Send,
  ShieldCheck,
  ClipboardCheck,
  Wallet,
  BadgeCheck,
} from "lucide-react";
import { Hero } from "@/components/home/Hero";
import { FeaturedServices } from "@/components/home/FeaturedServices";
import { CATEGORIES } from "@/lib/constants";
import { Button } from "@/components/ui/button";

const icons = [Smartphone, Laptop, Wind, Refrigerator, Tv, WashingMachine, Zap];
export default function HomePage() {
  return (
    <>
      <Hero />
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold">What needs fixing?</h2>
        <p className="mt-2 text-muted-foreground">
          Find the right help for your everyday essentials.
        </p>
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
          {CATEGORIES.map((category, i) => {
            const Icon = icons[i];
            return (
              <Link
                key={category}
                href={`/services?category=${encodeURIComponent(category)}`}
                className="flex flex-col items-center gap-3 rounded-xl border p-5 text-center text-sm font-medium transition-colors hover:border-brand-500 hover:bg-brand-500/5"
              >
                <Icon className="h-7 w-7 text-brand-500" />
                {category}
              </Link>
            );
          })}
        </div>
      </section>
      <FeaturedServices />
      <section className="bg-muted/50 py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-3xl font-bold">
            How FixMate works
          </h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: Search,
                title: "Find a service",
                text: "Compare repair options by category, area, and starting price.",
              },
              {
                icon: Send,
                title: "Send a request",
                text: "Describe the problem, pick a date, and send your repair request.",
              },
              {
                icon: Wrench,
                title: "Technician fixes it",
                text: "Follow every status update from your dashboard until the job is done.",
              },
              {
                icon: CreditCard,
                title: "Pay after completion",
                text: "Review the final amount and pay securely through Stripe only after the work is completed.",
              },
            ].map(({ icon: Icon, title, text }, i) => (
              <div key={title} className="rounded-xl border bg-card p-6">
                <Icon className="h-8 w-8 text-brand-500" />
                <p className="mt-5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Step {i + 1}
                </p>
                <h3 className="mt-2 text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <h2 className="text-center text-3xl font-bold">Why choose FixMate</h2>
        <p className="mx-auto mt-2 max-w-2xl text-center text-muted-foreground">
          Repairs should feel safe and clear from the first request to the final
          payment.
        </p>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: ShieldCheck,
              title: "Verified technicians",
              text: "Every service is reviewed and approved by an admin before it goes live.",
            },
            {
              icon: ClipboardCheck,
              title: "Track every job",
              text: "See each step from requested to completed, with no guessing.",
            },
            {
              icon: Wallet,
              title: "Pay after service",
              text: "You pay only when the work is delivered, never before.",
            },
            {
              icon: BadgeCheck,
              title: "Secure payments",
              text: "Payments are handled by Stripe, and every transaction is recorded.",
            },
          ].map(({ icon: Icon, title, text }) => (
            <div key={title} className="rounded-xl border bg-card p-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand-500/10">
                <Icon className="h-6 w-6 text-brand-500" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {text}
              </p>
            </div>
          ))}
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-navy-900 p-8 text-white sm:p-12">
          <h2 className="text-3xl font-bold">
            Good with repairs? Put your skills to work.
          </h2>
          <p className="mt-3 max-w-xl text-navy-200">
            Join as a technician, publish your services for review, and manage
            requests in one place.
          </p>
          <Button
            asChild
            className="mt-6 bg-brand-500 text-white hover:bg-brand-600"
          >
            <Link href="/sign-up?role=technician">
              Become a technician <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
}
