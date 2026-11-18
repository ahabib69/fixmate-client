"use client";
import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
export function useResource<T>(path: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [version, setVersion] = useState(0);
  const reload = useCallback(() => setVersion((v) => v + 1), []);
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    api
      .get<T>(path)
      .then((value) => {
        if (active) setData(value);
      })
      .catch((err) => {
        if (active)
          setError(err instanceof Error ? err.message : "Unable to load data.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [path, version]);
  return { data, loading, error, reload };
}
