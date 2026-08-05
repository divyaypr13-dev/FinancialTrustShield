import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader, DemoTag } from "@/components/Page";
import { RiskBadge } from "@/components/RiskBadge";
import { analyzeStockChatter, type StockAlert } from "@/lib/intel";
import { AlertTriangle, Siren } from "lucide-react";

export const Route = createFileRoute("/alerts")({
  head: () => ({
    meta: [
      { title: "Stock manipulation alerts | Financial Trust Shield" },
      {
        name: "description",
        content:
          "Heuristic alerts for coordinated hype and pump-and-dump phrasing around Indian listed stocks.",
      },
      { property: "og:title", content: "Stock Manipulation Alerts | Financial Trust Shield" },
      {
        property: "og:description",
        content: "Early warnings for coordinated stock hype and pump campaigns.",
      },
    ],
  }),
  component: AlertsPage,
});

const LIVE_ALERTS = [
  {
    symbol: "SMEHYPE",
    level: "HIGH_RISK" as const,
    note: "Coordinated hype detected across 4 Telegram groups within 90 minutes.",
    flags: ["Insider claim", "Target-price hype", "Illiquid SME counter"],
  },
  {
    symbol: "PENNYPWR",
    level: "HIGH_RISK" as const,
    note: "Volume spike alongside 'sure shot' messaging on WhatsApp broadcast lists.",
    flags: ["Assured returns", "Urgency to buy now"],
  },
  {
    symbol: "MIDCAPX",
    level: "SUSPICIOUS" as const,
    note: "Recycled research PDF circulating with an unregistered advisory's branding.",
    flags: ["Closed-group coordination"],
  },
];

function AlertsPage() {
  const [symbol, setSymbol] = useState("");
  const [chatter, setChatter] = useState("");
  const [result, setResult] = useState<StockAlert | null>(null);
  const [error, setError] = useState<string | null>(null);

  function run() {
    setError(null);
    if (!symbol.trim()) return setError("Enter a stock ticker or company name.");
    setResult(analyzeStockChatter(symbol.trim(), chatter));
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <PageHeader
          eyebrow="Detection"
          title="Stock Manipulation Alerts"
          subtitle="Coordinated hype detection and early warnings based on message phrasing patterns."
        />
        <DemoTag>Demo engine: heuristic alerts</DemoTag>
      </div>

      <Card className="mt-8">
        <CardHeader className="flex flex-row items-center gap-2">
          <Siren className="h-5 w-5 text-danger" />
          <CardTitle className="text-lg">High-risk stock manipulation alerts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {LIVE_ALERTS.map((a) => (
            <div
              key={a.symbol}
              className="flex flex-wrap items-start justify-between gap-3 rounded-lg border border-border p-3"
            >
              <div className="min-w-0">
                <p className="font-mono text-sm font-semibold">{a.symbol}</p>
                <p className="text-xs text-muted-foreground">{a.note}</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {a.flags.map((f) => (
                    <span key={f} className="rounded bg-secondary px-2 py-0.5 text-[11px]">
                      {f}
                    </span>
                  ))}
                </div>
              </div>
              <RiskBadge verdict={a.level} />
            </div>
          ))}
          <p className="flex items-center gap-2 text-xs text-muted-foreground">
            <AlertTriangle className="h-3.5 w-3.5" /> Coordinated hype detection (MVP) — sample
            alerts for demonstration.
          </p>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg">Check a stock</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="sym">Stock ticker or company name</Label>
            <Input
              id="sym"
              placeholder="e.g. SMEHYPE"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="chatter">Paste the tip/message you saw (optional)</Label>
            <Textarea
              id="chatter"
              rows={5}
              placeholder="Sure shot multibagger, buy before market opens, insider block deal news…"
              value={chatter}
              onChange={(e) => setChatter(e.target.value)}
            />
          </div>
          {error && (
            <p className="rounded-md bg-danger-soft px-3 py-2 text-sm text-danger">{error}</p>
          )}
          <Button onClick={run}>Check manipulation risk</Button>

          {result && (
            <div className="space-y-4 rounded-lg border border-border p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="font-mono text-lg font-bold">{result.symbol}</p>
                <RiskBadge verdict={result.level} />
              </div>
              <div>
                <div className="flex items-center justify-between text-sm">
                  <span>Manipulation risk</span>
                  <span className="font-semibold">{result.score}/100</span>
                </div>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-secondary">
                  <div
                    className={`h-full ${
                      result.level === "HIGH_RISK"
                        ? "bg-danger"
                        : result.level === "SUSPICIOUS"
                          ? "bg-warn"
                          : "bg-safe"
                    }`}
                    style={{ width: `${result.score}%` }}
                  />
                </div>
              </div>
              <ul className="space-y-1 text-sm">
                {result.flags.map((f) => (
                  <li key={f.label} className="flex items-center justify-between gap-3">
                    <span className="text-muted-foreground">{f.label}</span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                        f.matched ? "bg-danger-soft text-danger" : "bg-safe-soft text-safe"
                      }`}
                    >
                      {f.matched ? "Flagged" : "Clear"}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
