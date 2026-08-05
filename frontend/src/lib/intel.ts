import type { AnalyzeResponse, CityBreakdown, RecentCase, StatsResponse, Verdict } from "./api";

/* ---------- Trust Score™ ---------- */

export function trustScore10(a: Pick<AnalyzeResponse, "risk_score" | "trust_10">): number {
  if (typeof a.trust_10 === "number") return Math.min(10, Math.max(0, Math.round(a.trust_10)));
  return Math.min(10, Math.max(0, Math.round((100 - (a.risk_score ?? 50)) / 10)));
}

export function stampFor(verdict: Verdict, trust: number) {
  if (verdict === "SAFE" || trust >= 8)
    return {
      label: "Financial Trust Stamp™: Eligible (Demo)",
      tone: "safe" as const,
      note: "Multi-layer Authentication passed on available signals.",
    };
  if (verdict === "SUSPICIOUS")
    return {
      label: "Trust Passport™: Needs Verification (Demo)",
      tone: "warn" as const,
      note: "Some Communication DNA™ markers could not be verified.",
    };
  return {
    label: "Communication DNA™: Mismatch Detected (Demo)",
    tone: "danger" as const,
    note: "Sender fingerprint does not match any verified intermediary.",
  };
}

/* ---------- Explainability categories ---------- */

export type SignalState = "matched" | "clear" | "unavailable";

export interface SignalRow {
  key: string;
  label: string;
  state: SignalState;
  detail: string;
}

const KEYWORD_MAP: { key: string; label: string; patterns: RegExp; detail: string }[] = [
  {
    key: "phishing",
    label: "AI Phishing signals",
    patterns: /(verify|kyc|login|password|otp|click here|update your account|suspend)/i,
    detail: "Credential-harvesting language or fake verification prompts.",
  },
  {
    key: "impersonation",
    label: "Fake website / domain impersonation",
    patterns: /(zerodha|groww|angel|upstox|nse|bse|broker|support|refund|portal)[-.]/i,
    detail: "Look-alike broker or exchange domain patterns.",
  },
  {
    key: "emotion",
    label: "Emotional manipulation (fear, urgency, greed, FOMO)",
    patterns: /(urgent|last chance|hurry|limited seats|only today|guaranteed|100%|double your)/i,
    detail: "Pressure and greed cues typical of investment fraud.",
  },
  {
    key: "stock",
    label: "Stock tip manipulation cues",
    patterns: /(target price|multibagger|jackpot|intraday tip|sure shot|pump|block deal|vip group)/i,
    detail: "Coordinated tip/pump phrasing.",
  },
  {
    key: "authority",
    label: "SEBI / authority impersonation cues",
    patterns: /(sebi|rbi|income tax|registered advisor|govt approved|regulator)/i,
    detail: "Claims of regulatory endorsement or approval.",
  },
  {
    key: "link",
    label: "Link reputation / URL anomalies",
    patterns: /(bit\.ly|tinyurl|\.xyz|\.top|\.help|\.co\/|apk|t\.me)/i,
    detail: "Shortened links, odd TLDs or direct APK downloads.",
  },
];

export function buildSignals(
  result: AnalyzeResponse,
  inputType: string,
  rawContent: string,
): SignalRow[] {
  const haystack = `${rawContent} ${result.summary} ${result.reasons.join(" ")}`;
  const backend = result.signals ?? {};

  const rows: SignalRow[] = KEYWORD_MAP.map((c) => {
    const fromBackend = backend[c.key];
    let state: SignalState;
    if (typeof fromBackend === "boolean") state = fromBackend ? "matched" : "clear";
    else if (inputType === "audio" || inputType === "video")
      state = c.patterns.test(haystack) ? "matched" : "unavailable";
    else state = c.patterns.test(haystack) ? "matched" : "clear";
    return { key: c.key, label: c.label, state, detail: c.detail };
  });

  rows.splice(3, 0, {
    key: "deepfake",
    label: "Deepfake risk (video)",
    state:
      inputType === "video"
        ? result.risk_score >= 60
          ? "matched"
          : "clear"
        : "unavailable",
    detail: "Face/lip-sync inconsistency screening — MVP heuristic only.",
  });
  rows.splice(4, 0, {
    key: "voice_clone",
    label: "Voice clone risk (audio)",
    state:
      inputType === "audio"
        ? result.risk_score >= 60
          ? "matched"
          : "clear"
        : "unavailable",
    detail: "Synthetic-speech screening — MVP heuristic only.",
  });

  return rows;
}

/* ---------- City heat map ---------- */

const FALLBACK_CITIES = [
  "Mumbai",
  "Delhi",
  "Bengaluru",
  "Hyderabad",
  "Chennai",
  "Pune",
  "Kolkata",
  "Ahmedabad",
];

export interface HeatMapResult {
  rows: CityBreakdown[];
  estimated: boolean;
}

export function cityHeatMap(stats: StatsResponse, cases: RecentCase[]): HeatMapResult {
  if (stats.city_breakdown?.length) return { rows: stats.city_breakdown, estimated: false };

  const map = new Map<string, CityBreakdown>();
  cases.forEach((c, i) => {
    const city = c.city ?? FALLBACK_CITIES[i % FALLBACK_CITIES.length]!;
    const row = map.get(city) ?? { city, high_risk: 0, suspicious: 0, safe: 0 };
    if (c.verdict === "HIGH_RISK") row.high_risk += 1;
    else if (c.verdict === "SAFE") row.safe += 1;
    else row.suspicious += 1;
    map.set(city, row);
  });
  const rows = [...map.values()].sort(
    (a, b) => b.high_risk + b.suspicious - (a.high_risk + a.suspicious),
  );
  return { rows, estimated: true };
}

export type RangeKey = "24h" | "7d" | "30d" | "all";

export const RANGE_LABELS: Record<RangeKey, string> = {
  "24h": "Last 24h",
  "7d": "Last 7 days",
  "30d": "Last 30 days",
  all: "All time",
};

export function filterByRange(cases: RecentCase[], range: RangeKey): RecentCase[] {
  if (range === "all") return cases;
  const hours = range === "24h" ? 24 : range === "7d" ? 24 * 7 : 24 * 30;
  const cutoff = Date.now() - hours * 3600e3;
  return cases.filter((c) => {
    const t = new Date(c.timestamp).getTime();
    return Number.isNaN(t) ? true : t >= cutoff;
  });
}

/* ---------- Campaign clustering ---------- */

export interface Campaign {
  id: string;
  name: string;
  indicator: string;
  indicatorType: "keyword" | "domain";
  cases: RecentCase[];
  cities: string[];
  highRisk: number;
  mitigation: string;
}

function titleCase(s: string) {
  return s.replace(/\b\w/g, (m) => m.toUpperCase());
}

export function clusterCampaigns(stats: StatsResponse, cases: RecentCase[]): Campaign[] {
  const buckets = new Map<string, Campaign>();

  const add = (indicator: string, type: "keyword" | "domain", c: RecentCase) => {
    const id = `${type}:${indicator.toLowerCase()}`;
    const existing =
      buckets.get(id) ??
      ({
        id,
        name: `${titleCase(indicator)} Campaign`,
        indicator,
        indicatorType: type,
        cases: [],
        cities: [],
        highRisk: 0,
        mitigation: "",
      } as Campaign);
    existing.cases.push(c);
    if (c.city && !existing.cities.includes(c.city)) existing.cities.push(c.city);
    if (c.verdict === "HIGH_RISK") existing.highRisk += 1;
    buckets.set(id, existing);
  };

  const keywords = stats.top_keywords.map((k) => k.keyword);
  const domains = stats.top_domains.map((d) => d.domain);

  for (const c of cases) {
    const text = `${c.summary} ${c.keyword ?? ""} ${c.domain ?? ""}`.toLowerCase();
    const domain = domains.find((d) => text.includes(d.toLowerCase())) ?? c.domain;
    const keyword =
      keywords.find((k) => text.includes(k.toLowerCase())) ?? c.keyword ?? undefined;
    if (domain) add(domain, "domain", c);
    else if (keyword) add(keyword, "keyword", c);
  }

  return [...buckets.values()]
    .map((c) => ({
      ...c,
      mitigation:
        c.indicatorType === "domain"
          ? `Advise investors to avoid ${c.indicator}. Publish a takedown request and add the domain to broker/ISP blocklists. Push an SMS/app advisory in ${c.cities.join(", ") || "affected regions"}.`
          : `Publish an advisory on the "${c.indicator}" theme. Ask platforms to demote related groups/posts and remind investors that assured returns are prohibited.`,
    }))
    .sort((a, b) => b.cases.length - a.cases.length);
}

/* ---------- Emerging patterns + prediction ---------- */

const EMERGING_RULES = [
  { match: /ai (trading )?bot|algo bot/i, theme: "AI trading bot campaign" },
  { match: /guaranteed|assured return/i, theme: "Assured-returns advisory fraud" },
  { match: /sebi approved|registered advisor/i, theme: "Regulator impersonation wave" },
  { match: /ipo|allotment|pre-ipo/i, theme: "Pre-IPO allotment scam" },
  { match: /vip group|tip group|telegram/i, theme: "Closed tip-group pump" },
  { match: /apk|install app/i, theme: "Malicious trading APK distribution" },
  { match: /deepfake|video of/i, theme: "Deepfake endorsement scam" },
];

export interface EmergingPattern {
  theme: string;
  evidence: string;
  volume: number;
}

export function emergingPatterns(stats: StatsResponse, cases: RecentCase[]): EmergingPattern[] {
  const out = new Map<string, EmergingPattern>();
  const items = [
    ...stats.top_keywords.map((k) => ({ text: k.keyword, count: k.count })),
    ...cases.map((c) => ({ text: `${c.summary} ${c.keyword ?? ""}`, count: 1 })),
  ];
  for (const rule of EMERGING_RULES) {
    const hits = items.filter((i) => rule.match.test(i.text));
    if (!hits.length) continue;
    out.set(rule.theme, {
      theme: rule.theme,
      evidence: hits[0]!.text,
      volume: hits.reduce((s, h) => s + h.count, 0),
    });
  }
  return [...out.values()].sort((a, b) => b.volume - a.volume);
}

export interface Prediction {
  nextTheme: string;
  confidence: "Low" | "Medium" | "High";
  signals: string[];
}

export function predictPattern(patterns: EmergingPattern[]): Prediction {
  const top = patterns[0];
  if (!top)
    return {
      nextTheme: "No dominant theme detected yet",
      confidence: "Low",
      signals: ["Insufficient recent volume to project a trend."],
    };
  const total = patterns.reduce((s, p) => s + p.volume, 0) || 1;
  const share = top.volume / total;
  return {
    nextTheme: top.theme,
    confidence: share > 0.45 ? "High" : share > 0.25 ? "Medium" : "Low",
    signals: [
      `"${top.evidence}" is the highest-volume indicator in the current window.`,
      ...patterns.slice(1, 4).map((p) => `Secondary rise: ${p.theme} (${p.volume} signals).`),
      "Expect messaging to migrate to encrypted groups and short-lived look-alike domains.",
    ],
  };
}

/* ---------- Stock manipulation heuristics ---------- */

const PUMP_PATTERNS: { label: string; match: RegExp; weight: number }[] = [
  { label: "Assured / guaranteed return language", match: /guarantee|assured|100%|risk[- ]free/i, weight: 30 },
  { label: "Target-price hype", match: /target|multibagger|10x|double|jackpot/i, weight: 20 },
  { label: "Urgency to buy now", match: /today only|buy now|last chance|before market opens/i, weight: 20 },
  { label: "Closed-group coordination", match: /vip|premium group|telegram|whatsapp group/i, weight: 15 },
  { label: "Insider / block-deal claim", match: /insider|block deal|operator|inside news/i, weight: 25 },
  { label: "Illiquid small-cap focus", match: /penny|sme|small[- ]cap|microcap/i, weight: 15 },
];

export interface StockAlert {
  symbol: string;
  score: number;
  level: Verdict;
  flags: { label: string; matched: boolean }[];
}

export function analyzeStockChatter(symbol: string, chatter: string): StockAlert {
  const flags = PUMP_PATTERNS.map((p) => ({ label: p.label, matched: p.match.test(chatter) }));
  const score = Math.min(
    100,
    PUMP_PATTERNS.reduce((s, p, i) => s + (flags[i]!.matched ? p.weight : 0), 0),
  );
  const level: Verdict = score >= 60 ? "HIGH_RISK" : score >= 30 ? "SUSPICIOUS" : "SAFE";
  return { symbol: symbol.toUpperCase(), score, level, flags };
}
