"use client";
import {
  BarChart,
  Bar,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { BOOKING_STATUSES, STATUS_LABELS } from "@/lib/constants";
const colors = [
  "#3b82f6",
  "#6366f1",
  "#f59e0b",
  "#22c55e",
  "#ef4444",
  "#6b7280",
];
export function StatusChart({
  data,
}: {
  data: { name: string; value: number }[];
}) {
  const rows = BOOKING_STATUSES.map((status, i) => ({
    name: STATUS_LABELS[status],
    value: data.find((d) => d.name === status)?.value || 0,
    color: colors[i],
  }));
  return (
    <section className="rounded-xl border bg-card p-5">
      <h2 className="mb-5 font-semibold">Repairs by status</h2>
      {rows.some((r) => r.value > 0) ? (
        <div
          className="h-72 w-full"
          role="img"
          aria-label={rows.map((r) => `${r.name}: ${r.value}`).join(", ")}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={rows} margin={{ bottom: 25 }}>
              <XAxis
                dataKey="name"
                fontSize={11}
                angle={-20}
                textAnchor="end"
                interval={0}
              />
              <YAxis allowDecimals={false} width={30} />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--card))",
                  borderColor: "hsl(var(--border))",
                  borderRadius: 8,
                  color: "hsl(var(--foreground))",
                }}
              />
              <Bar dataKey="value" name="Repairs" radius={[5, 5, 0, 0]}>
                {rows.map((r) => (
                  <Cell key={r.name} fill={r.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <p className="py-16 text-center text-sm text-muted-foreground">
          Your repair activity will appear here.
        </p>
      )}
    </section>
  );
}
