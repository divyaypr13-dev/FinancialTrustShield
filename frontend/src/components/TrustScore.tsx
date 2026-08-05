import type { Verdict } from "@/lib/api";
import { stampFor, type SignalRow } from "@/lib/intel";
import { CheckCircle2, HelpCircle, ShieldAlert } from "lucide-react";

export function TrustDial({ score, verdict }: { score: number; verdict: Verdict }) {
  const tone =
    verdict === "SAFE" || score >= 8 ? "safe" : verdict === "SUSPICIOUS" ? "warn" : "danger";
  const ring =
    tone === "safe" ? "border-safe text-safe" : tone === "warn" ? "border-warn text-warn" : "border-danger text-danger";
  return (
    <div className="flex items-center gap-4">
      <div
        className={`grid h-24 w-24 shrink-0 place-items-center rounded-full border-8 ${ring}`}
        aria-label={`Trust Score ${score} out of 10`}
      >
        <div className="text-center leading-none">
          <span className="text-3xl font-bold">{score}</span>
          <span className="block text-[10px] font-medium opacity-70">/10</span>
        </div>
      </div>
      <div>
        <p className="text-sm font-semibold">Trust Score™</p>
        <p className="text-xs text-muted-foreground">
          Higher is safer. Computed from Communication DNA™ and Multi-layer Authentication signals.
        </p>
      </div>
    </div>
  );
}

export function TrustStamp({ verdict, score }: { verdict: Verdict; score: number }) {
  const s = stampFor(verdict, score);
  const cls =
    s.tone === "safe"
      ? "border-safe/30 bg-safe-soft text-safe"
      : s.tone === "warn"
        ? "border-warn/30 bg-warn-soft text-warn"
        : "border-danger/30 bg-danger-soft text-danger";
  return (
    <div className={`rounded-lg border px-4 py-3 ${cls}`}>
      <p className="text-sm font-semibold">{s.label}</p>
      <p className="mt-1 text-xs opacity-80">{s.note}</p>
    </div>
  );
}

export function SignalTable({ rows }: { rows: SignalRow[] }) {
  return (
    <div className="divide-y divide-border rounded-lg border border-border">
      {rows.map((r) => (
        <div key={r.key} className="flex items-start gap-3 px-4 py-3">
          {r.state === "matched" ? (
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-danger" />
          ) : r.state === "clear" ? (
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-safe" />
          ) : (
            <HelpCircle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
          )}
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">{r.label}</p>
            <p className="text-xs text-muted-foreground">{r.detail}</p>
          </div>
          <span
            className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
              r.state === "matched"
                ? "bg-danger-soft text-danger"
                : r.state === "clear"
                  ? "bg-safe-soft text-safe"
                  : "bg-secondary text-muted-foreground"
            }`}
          >
            {r.state === "matched" ? "Matched" : r.state === "clear" ? "Not matched" : "Not available in MVP"}
          </span>
        </div>
      ))}
    </div>
  );
}
