"use client";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import { authClient } from "@/lib/auth-client";
import { uploadImage } from "@/lib/upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { PageHeading } from "./Shared";
export function ProfileForm() {
  const { user, refetch } = useAuth();
  const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setBusy(true);
    try {
      const file = form.get("image") as File | null;
      const image = file?.size ? await uploadImage(file) : user?.image;
      await api.patch("/api/users/profile", {
        name: String(form.get("name")).trim(),
        phone: String(form.get("phone")).trim(),
        area: String(form.get("area")).trim(),
        bio: String(form.get("bio")).trim(),
        ...(image ? { image } : {}),
      });
      await authClient.getSession({ query: { disableCookieCache: true } });
      await refetch();
      toast.success("Profile updated.");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Unable to update profile.",
      );
    } finally {
      setBusy(false);
    }
  }
  if (!user) return null;
  return (
    <>
      <PageHeading
        title="Your profile"
        description="Keep your contact details up to date. Email and role cannot be edited here."
      />
      <form
        key={user.id}
        onSubmit={submit}
        className="max-w-2xl space-y-5 rounded-xl border bg-card p-6"
      >
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={user.image || undefined} alt={user.name} />
            <AvatarFallback>
              {user.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold">{user.name}</p>
            <p className="text-sm capitalize text-muted-foreground">
              {user.role}
            </p>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="name">Full name</Label>
          <Input
            id="name"
            name="name"
            defaultValue={user.name}
            minLength={2}
            maxLength={100}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" value={user.email} readOnly className="bg-muted" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            defaultValue={user.phone}
            maxLength={30}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="area">Area</Label>
          <Input
            id="area"
            name="area"
            defaultValue={user.area}
            maxLength={150}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="bio">About you</Label>
          <Textarea
            id="bio"
            name="bio"
            defaultValue={user.bio}
            maxLength={1000}
            rows={4}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="image">New profile photo</Label>
          <Input
            id="image"
            name="image"
            type="file"
            accept="image/jpeg,image/png,image/webp"
          />
          <p className="text-xs text-muted-foreground">
            Optional · JPG, PNG or WebP · Up to 5 MB
          </p>
        </div>
        <Button type="submit" disabled={busy}>
          {busy ? "Saving…" : "Save profile"}
        </Button>
      </form>
    </>
  );
}
