import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader, DemoTag } from "@/components/Page";
import { RiskBadge } from "@/components/RiskBadge";
import { getStats, sampleStats, type StatsResponse, type Verdict } from "@/lib/api";
import { clusterCampaigns } from "@/lib/intel";
import { Check, Copy, Users } from "lucide-react";

export const Route = createFileRoute("/campaigns")({
  head: () => ({
    meta: [
      { title: "Campaign monitoring | Financial Trust Shield" },
      {
        name: "description",
        content:
          "Clustered scam campaigns with shared indicators, affected cities and recommended mitigation messaging.",
      },
      { property: "og:title", content: "Campaign Monitoring | Financial Trust Shield" },
      {
        property: "og:description",
        content: "Track coordinated investor-fraud campaigns and their indicators.",
      },
    ],
  }),
  component: CampaignsPage,
});

function CampaignsPage() {
  const { data, isError } = useQuery<StatsResponse>({
    queryKey: ["stats"],
    queryFn: getStats,
    retry: false,
  });
  const stats = data ?? sampleStats;
  const campaigns = useMemo(() => clusterCampaigns(stats, stats.recent_cases), [stats]);
  const [copied, setCopied] = useState<string | null>(null);

  async function copy(id: string, text: string) {
    await navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <PageHeader
          eyebrow="Intelligence"
          title="Campaign Monitoring"
          subtitle="Cases are clustered by shared domain or keyword to reveal coordinated campaigns."
        />
        {isError && <DemoTag>Demo data</DemoTag>}
      </div>

      {campaigns.length === 0 && (
        <p className="mt-8 text-sm text-muted-foreground">No campaigns detected yet.</p>
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {campaigns.map((c) => (
          <Card key={c.id}>
            <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Users className="h-4 w-4 text-primary" />
                {c.name}
              </CardTitle>
              <RiskBadge verdict={(c.highRisk > 0 ? "HIGH_RISK" : "SUSPICIOUS") as Verdict} />
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="rounded-md bg-secondary px-2 py-1">
                  {c.cases.length} linked cases
                </span>
                <span className="rounded-md bg-secondary px-2 py-1">{c.highRisk} high risk</span>
                <span className="rounded-md bg-secondary px-2 py-1 font-mono">{c.indicator}</span>
              </div>

              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Top indicators
                </h3>
                <ul className="mt-1 list-disc space-y-1 pl-5 text-muted-foreground">
                  <li>
                    Shared {c.indicatorType}: <span className="font-mono">{c.indicator}</span>
                  </li>
                  {c.cases.slice(0, 3).map((x, i) => (
                    <li key={i}>{x.summary}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Affected cities
                </h3>
                <p className="mt-1 text-muted-foreground">
                  {c.cities.length ? c.cities.join(", ") : "Not available in MVP"}
                </p>
              </div>

              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Recommended mitigation message
                </h3>
                <p className="mt-1 rounded-md bg-secondary p-3 text-xs leading-relaxed">
                  {c.mitigation}
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-2"
                  onClick={() => copy(c.id, c.mitigation)}
                >
                  {copied === c.id ? (
                    <Check className="mr-2 h-4 w-4" />
                  ) : (
                    <Copy className="mr-2 h-4 w-4" />
                  )}
                  {copied === c.id ? "Copied" : "Copy advisory"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
