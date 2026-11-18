const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

let cachedToken: string | null = null;
let cachedExpiry = 0;
let tokenPromise: Promise<string> | null = null;

// Ask the Next.js app for a short-lived JWT (signed from the BetterAuth session)
// and cache it briefly so we don't call /api/auth/token on every request.
export async function getAuthToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedExpiry) return cachedToken;
  if (tokenPromise) return tokenPromise;

  tokenPromise = (async () => {
    const res = await fetch("/api/auth/token", { credentials: "include" });
    if (!res.ok) throw new Error("Please log in to continue.");
    const data = await res.json();
    cachedToken = data.token;
    // Token lives 15 minutes; refresh a minute early.
    cachedExpiry = Date.now() + 14 * 60 * 1000;
    return data.token as string;
  })();

  try {
    return await tokenPromise;
  } finally {
    tokenPromise = null;
  }
}

export function clearAuthToken() {
  cachedToken = null;
  cachedExpiry = 0;
}

interface ApiOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
}

export async function apiFetch<T>(
  path: string,
  options: ApiOptions = {},
): Promise<T> {
  const token = await getAuthToken();

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const message =
      (data as { message?: string }).message ||
      "Something went wrong. Please try again.";
    const err = new Error(message) as Error & { status?: number };
    err.status = res.status;
    throw err;
  }

  return data as T;
}

// Public fetch (no token) for the services pages.
export async function publicFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message =
      (data as { message?: string }).message || "Failed to load data.";
    throw new Error(message);
  }
  return data as T;
}

export const api = {
  get: <T>(path: string) => apiFetch<T>(path, { method: "GET" }),
  post: <T>(path: string, body?: unknown) =>
    apiFetch<T>(path, { method: "POST", body }),
  patch: <T>(path: string, body?: unknown) =>
    apiFetch<T>(path, { method: "PATCH", body }),
  delete: <T>(path: string) => apiFetch<T>(path, { method: "DELETE" }),
};
