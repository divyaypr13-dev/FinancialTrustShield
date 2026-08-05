import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader, DemoTag } from "@/components/Page";
import { getStats, sampleStats, type StatsResponse } from "@/lib/api";
import { emergingPatterns, predictPattern } from "@/lib/intel";
import { TrendingUp, Radar, Sparkle } from "lucide-react";

export const Route = createFileRoute("/analytics")({
  head: () => ({
    meta: [
      { title: "Threat analytics & pattern prediction | Financial Trust Shield" },
      {
        name: "description",
        content:
          "Keyword, domain and platform trends with emerging scam reports and next-theme prediction.",
      },
      { property: "og:title", content: "Threat Analytics | Financial Trust Shield" },
      {
        property: "og:description",
        content: "Trends, emerging scam patterns and early warning signals.",
      },
    ],
  }),
  component: AnalyticsPage,
});

function AnalyticsPage() {
  const { data, isError } = useQuery<StatsResponse>({
    queryKey: ["stats"],
    queryFn: getStats,
    retry: false,
  });
  const stats = data ?? sampleStats;

  const platformTrends = useMemo(() => {
    const map = new Map<string, number>();
    for (const c of stats.recent_cases)
      map.set(c.platform, (map.get(c.platform) ?? 0) + 1);
    return [...map.entries()].map(([platform, count]) => ({ platform, count })).sort((a, b) => b.count - a.count);
  }, [stats]);

  const patterns = useMemo(() => emergingPatterns(stats, stats.recent_cases), [stats]);
  const prediction = useMemo(() => predictPattern(patterns), [patterns]);

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <PageHeader
          eyebrow="Intelligence"
          title="Threat Analytics"
          subtitle="Trends across keywords, domains and platforms, plus heuristic pattern prediction."
        />
        {isError && <DemoTag>Demo data</DemoTag>}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Keyword trends</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.top_keywords} margin={{ left: -10, right: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="keyword" tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" interval={0} height={50} angle={-20} textAnchor="end" />
                <YAxis tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                <Tooltip cursor={{ fill: "var(--secondary)" }} />
                <Bar dataKey="count" fill="var(--primary)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Domain trends</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {stats.top_domains.map((d) => {
              const max = Math.max(...stats.top_domains.map((x) => x.count), 1);
              return (
                <div key={d.domain}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-mono text-xs">{d.domain}</span>
                    <span className="text-xs text-muted-foreground">{d.count}</span>
                  </div>
                  <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-secondary">
                    <div className="h-full bg-danger" style={{ width: `${(d.count / max) * 100}%` }} />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Platform trends</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {platformTrends.map((p) => {
              const max = Math.max(...platformTrends.map((x) => x.count), 1);
              return (
                <div key={p.platform}>
                  <div className="flex items-center justify-between text-sm">
                    <span>{p.platform}</span>
                    <span className="text-xs text-muted-foreground">{p.count}</span>
                  </div>
                  <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-secondary">
                    <div className="h-full bg-primary" style={{ width: `${(p.count / max) * 100}%` }} />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <Radar className="h-5 w-5 text-warn" />
            <CardTitle className="text-lg">Emerging scam reports</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {patterns.length === 0 && (
              <p className="text-sm text-muted-foreground">No new patterns detected.</p>
            )}
            {patterns.map((p) => (
              <div key={p.theme} className="rounded-lg border border-border p-3">
                <p className="text-sm font-semibold">{p.theme}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Triggered by “{p.evidence}” · {p.volume} signals
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Sparkle className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Pattern Prediction</CardTitle>
          </div>
          <DemoTag>Heuristic engine</DemoTag>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-primary">
              Next likely scam theme
            </p>
            <p className="mt-1 text-xl font-bold">{prediction.nextTheme}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Confidence: {prediction.confidence}
            </p>
          </div>
          <div>
            <h2 className="text-sm font-semibold">Early warning signals</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
              {prediction.signals.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
