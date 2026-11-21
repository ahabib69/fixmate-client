"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { uploadImage } from "@/lib/upload";
import type { Service } from "@/lib/types";
import { CATEGORIES, SERVICE_MODES } from "@/lib/constants";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
export function ServiceForm({
  service,
  onSaved,
}: {
  service?: Service;
  onSaved?: () => void;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState("");
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const file = form.get("file") as File | null;
    const basePrice = Number(form.get("basePrice"));
    if (!Number.isFinite(basePrice) || basePrice <= 0) {
      setError("Enter a starting price greater than 0.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const image = file?.size ? await uploadImage(file) : service?.image;
      if (!image) throw new Error("Choose an image for your service.");
      const body = {
        title: String(form.get("title")).trim(),
        category: String(form.get("category")),
        description: String(form.get("description")).trim(),
        image,
        basePrice,
        estimatedDuration: String(form.get("estimatedDuration")).trim(),
        serviceMode: String(form.get("serviceMode")),
        serviceArea: String(form.get("serviceArea")).trim(),
      };
      if (service) await api.patch(`/api/services/${service._id}`, body);
      else await api.post("/api/services", body);
      toast.success(
        service
          ? "Changes saved. Your service is pending review again."
          : "Service submitted for approval.",
      );
      if (onSaved) onSaved();
      else router.push("/dashboard/technician/my-services");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unable to save service.";
      setError(message);
      toast.error(message);
    } finally {
      setBusy(false);
    }
  }
  const selectClass =
    "h-10 w-full rounded-md border bg-background px-3 text-sm";
  return (
    <form onSubmit={submit} className="space-y-5">
      <p className="rounded-lg bg-muted p-3 text-sm text-muted-foreground">
        {service
          ? "Editing sends this service back to pending review and hides it from public listings until approved."
          : "New services are reviewed by an administrator before appearing publicly."}
      </p>
      <div className="space-y-2">
        <Label htmlFor="title">Service title</Label>
        <Input
          name="title"
          id="title"
          defaultValue={service?.title}
          required
          minLength={5}
          maxLength={150}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <select
            id="category"
            name="category"
            defaultValue={service?.category || CATEGORIES[0]}
            className={selectClass}
          >
            {CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="serviceMode">Service mode</Label>
          <select
            id="serviceMode"
            name="serviceMode"
            defaultValue={service?.serviceMode || SERVICE_MODES[0]}
            className={selectClass}
          >
            {SERVICE_MODES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          name="description"
          id="description"
          rows={5}
          defaultValue={service?.description}
          required
          minLength={20}
          maxLength={5000}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="file">
          Service image {service && "(optional replacement)"}
        </Label>
        <Input
          id="file"
          name="file"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          required={!service}
          onChange={(e) => {
            const f = e.target.files?.[0];
            setPreview(f ? URL.createObjectURL(f) : "");
          }}
        />
        {preview && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={preview}
            alt="Selected service preview"
            className="h-40 w-full max-w-xs rounded-lg border object-cover"
          />
        )}
        <p className="text-xs text-muted-foreground">
          JPG, PNG or WebP · Maximum 5 MB · Uploaded through ImgBB
        </p>
        {service && (
          <a
            href={service.image}
            target="_blank"
            rel="noreferrer"
            className="text-xs text-brand-600 underline"
          >
            View current image
          </a>
        )}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="basePrice">Starting price (USD)</Label>
          <Input
            id="basePrice"
            name="basePrice"
            type="number"
            min="0.01"
            step="0.01"
            defaultValue={service?.basePrice}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="estimatedDuration">Estimated duration</Label>
          <Input
            id="estimatedDuration"
            name="estimatedDuration"
            placeholder="e.g. 1–2 hours"
            defaultValue={service?.estimatedDuration}
            required
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="serviceArea">Service area</Label>
        <Input
          id="serviceArea"
          name="serviceArea"
          placeholder="e.g. Mirpur, Dhaka"
          defaultValue={service?.serviceArea}
          required
        />
      </div>
      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}
      <Button type="submit" disabled={busy}>
        {busy
          ? "Uploading & saving…"
          : service
            ? "Save changes"
            : "Submit for approval"}
      </Button>
    </form>
  );
}
