import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { lazy, Suspense, useEffect, useMemo, useState } from "react";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RiskBadge } from "@/components/RiskBadge";
import { PageHeader, DemoTag } from "@/components/Page";
import { getStats, sampleStats, type RecentCase, type StatsResponse, type Verdict } from "@/lib/api";
import {
  cityHeatMap,
  clusterCampaigns,
  filterByRange,
  RANGE_LABELS,
  type RangeKey,
} from "@/lib/intel";
import { listSubmissions } from "@/lib/evidence";
import { CITY_COORDS } from "@/lib/city-coords";

const IndiaRiskMap = lazy(() => import("@/components/IndiaRiskMap"));


export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "National Dashboard & city heat map | Financial Trust Shield" },
      {
        name: "description",
        content:
          "National view of securities scam cases: verdict totals, city risk heat map, risky domains and recent cases.",
      },
      { property: "og:title", content: "National Dashboard | Financial Trust Shield" },
      {
        property: "og:description",
        content: "Aggregate intelligence on investor fraud across India.",
      },
    ],
  }),
  component: DashboardPage,
});

const RANGES: RangeKey[] = ["24h", "7d", "30d", "all"];

function DashboardPage() {
  const { data, isLoading, isError, error } = useQuery<StatsResponse>({
    queryKey: ["stats"],
    queryFn: getStats,
    retry: false,
  });
  const [range, setRange] = useState<RangeKey>("30d");
  const [local, setLocal] = useState<RecentCase[]>([]);
  const [mounted, setMounted] = useState(false);
  const [filters, setFilters] = useState({ high: true, suspicious: true, safe: true });

  useEffect(() => {
    setMounted(true);

    setLocal(
      listSubmissions().map((s) => ({
        timestamp: s.timestamp,
        verdict: s.verdict,
        platform: s.platform,
        summary: s.summary,
      })),
    );
  }, []);

  const usingDemo = isError;
  const stats = data ?? sampleStats;
  const allCases = useMemo(() => [...local, ...stats.recent_cases], [local, stats]);
  const cases = useMemo(() => filterByRange(allCases, range), [allCases, range]);

  const counts = useMemo(() => {
    const c = { high: 0, sus: 0, safe: 0 };
    for (const x of cases) {
      if (x.verdict === "HIGH_RISK") c.high += 1;
      else if (x.verdict === "SAFE") c.safe += 1;
      else c.sus += 1;
    }
    return c;
  }, [cases]);

  const heat = useMemo(() => cityHeatMap(stats, cases), [stats, cases]);
  const campaigns = useMemo(() => clusterCampaigns(stats, cases), [stats, cases]);
  const unmapped = useMemo(() => heat.rows.filter((r) => !CITY_COORDS[r.city]), [heat.rows]);
  const topCity = heat.rows[0]?.city ?? "—";


  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <PageHeader
          eyebrow="Intelligence"
          title="National Dashboard"
          subtitle="Aggregate view of scans and reports across platforms and cities."
        />
        {usingDemo && <DemoTag>Demo data</DemoTag>}
      </div>

      {isError && (
        <p className="mt-4 rounded-md bg-warn-soft px-3 py-2 text-sm text-warn">
          {error instanceof Error ? error.message : "Live stats unavailable."} Showing demo data.
        </p>
      )}
      {isLoading && <p className="mt-4 text-sm text-muted-foreground">Loading stats…</p>}

      <div className="mt-6 flex flex-wrap gap-2">
        {RANGES.map((r) => (
          <Button
            key={r}
            size="sm"
            variant={range === r ? "default" : "outline"}
            onClick={() => setRange(r)}
          >
            {RANGE_LABELS[r]}
          </Button>
        ))}
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Total cases" value={(data ? stats.totals.cases : cases.length).toLocaleString()} />
        <StatCard label="High risk" value={counts.high.toLocaleString()} tone="danger" />
        <StatCard label="Suspicious" value={counts.sus.toLocaleString()} tone="warn" />
        <StatCard label="Safe" value={counts.safe.toLocaleString()} tone="safe" />
        <StatCard label="Emerging campaigns" value={String(campaigns.length)} />
        <StatCard label="Top city" value={topCity} small />
      </div>

      <Card className="mt-6">
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2">
          <CardTitle className="text-lg">City Risk Map</CardTitle>
          {heat.estimated && <DemoTag>Estimated (Demo)</DemoTag>}
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {(
              [
                ["high", "Show High Risk"],
                ["suspicious", "Show Suspicious"],
                ["safe", "Show Safe"],
              ] as const
            ).map(([key, label]) => (
              <Button
                key={key}
                size="sm"
                variant={filters[key] ? "default" : "outline"}
                onClick={() => setFilters((f) => ({ ...f, [key]: !f[key] }))}
              >
                {label}
              </Button>
            ))}
          </div>

          {mounted ? (
            <Suspense
              fallback={
                <div className="flex h-[460px] items-center justify-center rounded-lg border text-sm text-muted-foreground">
                  Loading map…
                </div>
              }
            >
              <IndiaRiskMap rows={heat.rows} filters={filters} />
            </Suspense>
          ) : (
            <div className="flex h-[460px] items-center justify-center rounded-lg border text-sm text-muted-foreground">
              Loading map…
            </div>
          )}

          <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="size-3 rounded-full bg-danger" /> High risk dominant
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-3 rounded-full bg-warn" /> Suspicious dominant
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-3 rounded-full bg-safe" /> Safe dominant
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-muted-foreground" />
              <span className="size-3.5 rounded-full bg-muted-foreground" /> Circle size = total
              cases
            </span>
          </div>

          {heat.rows.length === 0 && (
            <p className="text-sm text-muted-foreground">No cases in this window.</p>
          )}

          {unmapped.length > 0 && (
            <div className="rounded-md border p-3">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Unmapped cities
              </p>
              <ul className="mt-2 space-y-1 text-sm">
                {unmapped.map((r) => (
                  <li key={r.city} className="flex justify-between gap-3">
                    <span>{r.city}</span>
                    <span className="text-xs text-muted-foreground">
                      {r.high_risk} high · {r.suspicious} suspicious · {r.safe} safe
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>


      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg">Top scam keywords</CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.top_keywords} margin={{ left: -10, right: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis
                dataKey="keyword"
                tick={{ fontSize: 11 }}
                stroke="var(--muted-foreground)"
                interval={0}
                height={50}
                angle={-15}
                textAnchor="end"
              />
              <YAxis tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
              <Tooltip cursor={{ fill: "var(--secondary)" }} />
              <Bar dataKey="count" fill="var(--primary)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg">Recent cases</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>Verdict</TableHead>
                <TableHead>Platform</TableHead>
                <TableHead>City</TableHead>
                <TableHead>Summary</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cases.map((c, i) => (
                <TableRow key={i}>
                  <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                    {formatTime(c.timestamp)}
                  </TableCell>
                  <TableCell>
                    <RiskBadge verdict={(c.verdict as Verdict) ?? "SUSPICIOUS"} />
                  </TableCell>
                  <TableCell className="text-sm">{c.platform}</TableCell>
                  <TableCell className="text-sm">{c.city ?? "—"}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{c.summary}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg">Top risky domains</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Domain</TableHead>
                <TableHead className="text-right">Reports</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats.top_domains.map((d) => (
                <TableRow key={d.domain}>
                  <TableCell className="font-mono text-sm">{d.domain}</TableCell>
                  <TableCell className="text-right text-sm">{d.count}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function formatTime(ts: string) {
  const d = new Date(ts);
  return Number.isNaN(d.getTime()) ? ts : d.toLocaleString();
}

function StatCard({
  label,
  value,
  tone,
  small,
}: {
  label: string;
  value: string;
  tone?: "danger" | "warn" | "safe";
  small?: boolean;
}) {
  const toneCls =
    tone === "danger"
      ? "text-danger"
      : tone === "warn"
        ? "text-warn"
        : tone === "safe"
          ? "text-safe"
          : "text-foreground";
  return (
    <Card>
      <CardContent className="pt-6">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className={`mt-2 font-bold ${small ? "break-all text-base" : "text-3xl"} ${toneCls}`}>
          {value}
        </p>
      </CardContent>
    </Card>
  );
}
