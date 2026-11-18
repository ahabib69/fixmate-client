import Link from "next/link";
import { MapPin, Facebook, Linkedin, Mail } from "lucide-react";
import { Logo } from "./Logo";
import { XIcon } from "@/components/icons/XIcon";
import { CATEGORIES } from "@/lib/constants";
export function Footer() {
  const url = encodeURIComponent(
    process.env.BETTER_AUTH_URL || "http://localhost:3000",
  );
  const shareClass =
    "flex h-9 w-9 items-center justify-center rounded-full bg-navy-800 transition-colors hover:bg-brand-500";
  return (
    <footer className="border-t bg-navy-950 text-navy-100">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
        <div>
          <Logo inverse />
          <p className="mt-4 text-sm text-navy-300">
            Find a repair, follow the progress, and pay only after the job is
            done.
          </p>
          <p className="mt-5 text-xs text-navy-400">Share FixMate</p>
          <div className="mt-2 flex gap-3">
            <a
              href={`https://x.com/intent/tweet?url=${url}&text=Find%20your%20next%20repair%20with%20FixMate`}
              target="_blank"
              rel="noreferrer"
              aria-label="Share on X"
              className={shareClass}
            >
              <XIcon className="h-4 w-4" />
            </a>
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${url}`}
              target="_blank"
              rel="noreferrer"
              aria-label="Share on Facebook"
              className={shareClass}
            >
              <Facebook className="h-4 w-4" />
            </a>
            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${url}`}
              target="_blank"
              rel="noreferrer"
              aria-label="Share on LinkedIn"
              className={shareClass}
            >
              <Linkedin className="h-4 w-4" />
            </a>
          </div>
        </div>
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
            Quick Links
          </h3>
          <ul className="mt-4 space-y-2 text-sm">
            {[
              ["/", "Home"],
              ["/services", "All Services"],
              ["/about", "About Us"],
              ["/sign-up?role=technician", "Join as Technician"],
            ].map(([href, label]) => (
              <li key={href}>
                <Link href={href} className="text-navy-300 hover:text-white">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
            Popular Categories
          </h3>
          <ul className="mt-4 space-y-2 text-sm">
            {CATEGORIES.slice(0, 5).map((cat) => (
              <li key={cat}>
                <Link
                  href={`/services?category=${encodeURIComponent(cat)}`}
                  className="text-navy-300 hover:text-white"
                >
                  {cat}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
            Repair questions?
          </h3>
          <p className="mt-4 flex gap-2 text-sm text-navy-300">
            <Mail className="mt-0.5 h-4 w-4 shrink-0" />
            Contact the technician using the email on their service page.
          </p>
          <Link
            href="/dashboard/customer/bookings"
            className="mt-3 inline-block text-sm text-navy-300 underline hover:text-white"
          >
            Track your booking
          </Link>
          <p className="mt-4 flex gap-2 text-sm text-navy-300">
            <MapPin className="h-4 w-4 shrink-0" />
            Built for Bangladesh · USD pricing
          </p>
          <p className="mt-3 text-xs text-navy-400">
            Demo platform · Stripe test payments only
          </p>
        </div>
      </div>
      <div className="border-t border-navy-800">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-navy-400 sm:flex-row sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} FixMate. All rights reserved.</p>
          <p>Made with care in Bangladesh.</p>
        </div>
      </div>
    </footer>
  );
}
