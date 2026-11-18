import Link from "next/link";
import { ShieldCheck, Route, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
export const metadata = { title: "About FixMate" };
export default function AboutPage() {
  return (
    <>
      <section className="bg-navy-950 px-4 py-20 text-center text-white">
        <p className="text-sm font-medium uppercase tracking-widest text-brand-400">
          About FixMate
        </p>
        <h1 className="mx-auto mt-4 max-w-3xl text-4xl font-bold sm:text-5xl">
          A broken appliance shouldn’t disrupt your whole day.
        </h1>
        <p className="mx-auto mt-6 max-w-2xl leading-relaxed text-navy-200">
          We bring customers and repair professionals together across
          Bangladesh, with clear service information and a repair process you
          can follow.
        </p>
      </section>
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid gap-10 md:grid-cols-2">
          <h2 className="text-3xl font-bold leading-tight">
            Repair more.
            <br />
            Replace less.
          </h2>
          <div className="space-y-4 leading-relaxed text-muted-foreground">
            <p>
              When your phone stops charging or the fridge stops cooling,
              finding the right help can be harder than it should be. FixMate
              puts service descriptions, starting prices, coverage areas, and
              repair requests in one place.
            </p>
            <p>
              Customers can browse approved services and track each job.
              Technicians can focus on their work while managing availability
              and requests. Administrators review services and oversee the
              platform.
            </p>
            <p>
              All prices are shown in USD. This project uses Stripe test mode:
              test payments do not transfer real money.
            </p>
          </div>
        </div>
        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {[
            {
              icon: ShieldCheck,
              title: "Reviewed services",
              text: "Services need administrator approval before they appear publicly. Changes go back through review.",
            },
            {
              icon: Route,
              title: "Visible progress",
              text: "Follow your request from acceptance to repair and completion, with a history of status updates.",
            },
            {
              icon: CreditCard,
              title: "Payment comes last",
              text: "Pay the final amount securely through Stripe only after the technician marks the job completed.",
            },
          ].map(({ icon: Icon, title, text }) => (
            <article key={title} className="rounded-xl border p-6">
              <Icon className="h-8 w-8 text-brand-500" />
              <h3 className="mt-4 text-lg font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {text}
              </p>
            </article>
          ))}
        </div>
        <div className="mt-16 rounded-2xl bg-muted p-8 text-center">
          <h2 className="text-2xl font-bold">
            Let’s get things working again.
          </h2>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button
              asChild
              className="bg-brand-500 text-white hover:bg-brand-600"
            >
              <Link href="/services">Find a repair</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/sign-up?role=technician">Join as a technician</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
