import type { Verdict } from "@/lib/api";

const map: Record<Verdict, { label: string; className: string }> = {
  SAFE: { label: "Safe", className: "bg-safe-soft text-safe border-safe/30" },
  SUSPICIOUS: { label: "Suspicious", className: "bg-warn-soft text-warn border-warn/30" },
  HIGH_RISK: { label: "High Risk", className: "bg-danger-soft text-danger border-danger/30" },
};

export function RiskBadge({ verdict }: { verdict: Verdict }) {
  const v = map[verdict] ?? map.SUSPICIOUS;
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-semibold ${v.className}`}
    >
      {v.label}
    </span>
  );
}
