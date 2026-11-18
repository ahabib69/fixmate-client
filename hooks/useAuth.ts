"use client";

import { useSession } from "@/lib/auth-client";

export function useAuth() {
  const { data, isPending, refetch } = useSession();
  const rawUser = data?.user ?? null;
  const user = rawUser as
    | (typeof rawUser & {
        role?: string;
        phone?: string;
        area?: string;
        bio?: string;
      })
    | null;

  return {
    user,
    session: data?.session ?? null,
    isPending,
    isLoggedIn: !!user,
    role: user?.role || null,
    refetch,
  };
}
