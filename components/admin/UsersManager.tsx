"use client";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useResource } from "@/hooks/useResource";
import { api } from "@/lib/api";
import type { User, Role } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  PageHeading,
  LoadState,
  EmptyState,
  ConfirmDialog,
} from "@/components/dashboard/Shared";
export function UsersManager() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const resource = useResource<User[]>(
    `/api/admin/users${role ? `?role=${role}` : ""}`,
  );
  const [target, setTarget] = useState<User | null>(null);
  const [nextRole, setNextRole] = useState<Role>("customer");
  const [busy, setBusy] = useState(false);
  const rows = (resource.data || []).filter((u) =>
    `${u.name} ${u.email}`.toLowerCase().includes(search.toLowerCase()),
  );
  async function save() {
    if (!target) return;
    setBusy(true);
    try {
      await api.patch(`/api/admin/users/${target._id || target.id}/role`, {
        role: nextRole,
      });
      toast.success("Role updated. API permissions apply immediately.");
      setTarget(null);
      resource.reload();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Unable to update role.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <PageHeading
        title="Users"
        description="Manage account roles. You cannot change your own role."
      />
      <div className="mb-6 flex flex-wrap gap-3">
        <Input
          aria-label="Search users"
          className="max-w-sm"
          placeholder="Search name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          aria-label="Filter role"
          className="h-10 rounded-md border bg-background px-3 text-sm"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="">All roles</option>
          {["customer", "technician", "admin"].map((r) => (
            <option key={r}>{r}</option>
          ))}
        </select>
      </div>
      <LoadState {...resource} retry={resource.reload} />
      {!resource.loading &&
        !resource.error &&
        (rows.length ? (
          <div className="overflow-x-auto rounded-xl border bg-card">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted">
                <tr>
                  {["Name", "Email", "Role", "Joined", "Action"].map((h) => (
                    <th key={h} className="p-4 font-medium">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((u) => (
                  <tr key={u._id || u.id} className="border-t">
                    <td className="min-w-40 p-4 font-medium">
                      {u.name}
                      {u.email === user?.email && (
                        <span className="ml-2 text-xs text-muted-foreground">
                          (you)
                        </span>
                      )}
                    </td>
                    <td className="p-4">{u.email}</td>
                    <td className="p-4 capitalize">{u.role}</td>
                    <td className="whitespace-nowrap p-4">
                      {u.createdAt ? formatDate(u.createdAt) : "—"}
                    </td>
                    <td className="p-4">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={u.email === user?.email}
                        onClick={() => {
                          setTarget(u);
                          setNextRole(u.role);
                        }}
                      >
                        Change role
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            title="No matching users"
            text="Try another name, email, or role filter."
          />
        ))}
      <ConfirmDialog
        open={!!target}
        onClose={() => setTarget(null)}
        onConfirm={save}
        busy={busy}
        title="Change account role?"
        description={`Update permissions for ${target?.name || "this user"}. Admin access allows managing users, services, and platform records.`}
      >
        <div className="space-y-2">
          <Label htmlFor="next-role">New role</Label>
          <select
            id="next-role"
            className="h-10 w-full rounded-md border bg-background px-3 text-sm"
            value={nextRole}
            onChange={(e) => setNextRole(e.target.value as Role)}
          >
            {["customer", "technician", "admin"].map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>
        </div>
      </ConfirmDialog>
    </>
  );
}
