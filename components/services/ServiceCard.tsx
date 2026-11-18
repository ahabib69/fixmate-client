import Link from "next/link";
import { SafeImage } from "./SafeImage";
import { MapPin, Clock, User } from "lucide-react";
import type { Service } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function ServiceCard({ service }: { service: Service }) {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border bg-card shadow-sm transition-shadow hover:shadow-md">
      <div className="relative h-48 w-full shrink-0">
        <SafeImage
          src={service.image}
          alt={service.title}
          className="object-cover"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />
        <Badge className="absolute left-3 top-3 bg-navy-800/90 text-white hover:bg-navy-800">
          {service.category}
        </Badge>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-2 text-base font-semibold leading-snug">
          {service.title}
        </h3>

        <div className="mt-3 space-y-1.5 text-sm text-muted-foreground">
          <p className="flex items-center gap-1.5">
            <Clock className="h-4 w-4 shrink-0" /> {service.serviceMode} ·{" "}
            {service.estimatedDuration}
          </p>
          <p className="flex items-center gap-1.5">
            <MapPin className="h-4 w-4 shrink-0" /> {service.serviceArea}
          </p>
          <p className="flex items-center gap-1.5">
            <User className="h-4 w-4 shrink-0" /> {service.technicianName}
          </p>
        </div>

        <div className="mt-auto flex items-center justify-between pt-4">
          <p className="text-lg font-bold text-navy-800 dark:text-white">
            {formatPrice(service.basePrice)}
            <span className="ml-1 text-xs font-normal text-muted-foreground">
              starting
            </span>
          </p>
          <Button
            size="sm"
            asChild
            className="bg-brand-500 hover:bg-brand-600 text-white"
          >
            <Link href={`/services/${service._id}`}>View Details</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
