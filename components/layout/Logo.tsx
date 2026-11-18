import Link from "next/link";
import { Wrench } from "lucide-react";
import { cn } from "@/lib/utils";

export function Logo({
  className,
  inverse = false,
}: {
  className?: string;
  inverse?: boolean;
}) {
  return (
    <Link href="/" className={cn("flex items-center gap-2", className)}>
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-navy-800 text-white dark:bg-brand-500">
        <Wrench className="h-5 w-5" />
      </span>
      <span
        className={cn(
          "text-xl font-bold tracking-tight",
          inverse ? "text-white" : "text-navy-900 dark:text-white",
        )}
      >
        Fix<span className="text-brand-500">Mate</span>
      </span>
    </Link>
  );
}
