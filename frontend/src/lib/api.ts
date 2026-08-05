// API base URL. Set VITE_API_BASE_URL to point at your FastAPI backend.
export const API_BASE_URL =
  (import.meta.env['VITE_API_BASE_URL'] as string | undefined)?.replace(/\/$/, "") ||
  "https://sebi-investor-shield-backend.onrender.com";

const TIMEOUT_MS = 20000;

export class ApiError extends Error {
  network: boolean;
  constructor(message: string, network = false) {
    super(message);
    this.network = network;
  }
}

export const UNREACHABLE_MESSAGE = "Backend not reachable. Check VITE_API_BASE_URL.";

export const DISCLAIMER =
  "Hackathon demo — results are risk guidance, not legal/financial advice.";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, { ...init, signal: controller.signal });
  } catch {
    throw new ApiError(UNREACHABLE_MESSAGE, true);
  } finally {
    clearTimeout(timer);
  }
  if (!res.ok) {
    throw new ApiError(`The server rejected the request (HTTP ${res.status}). Please try again.`);
  }
  try {
    return (await res.json()) as T;
  } catch {
    throw new ApiError("The server returned an unreadable response.");
  }
}

export type Verdict = "SAFE" | "SUSPICIOUS" | "HIGH_RISK";

export type InputType = "url" | "text" | "image" | "pdf" | "document" | "audio" | "video";

export type SourcePlatform =
  | "whatsapp"
  | "telegram"
  | "sms"
  | "email"
  | "instagram"
  | "youtube"
  | "facebook"
  | "x"
  | "news"
  | "website"
  | "other";

export const SOURCE_PLATFORMS: SourcePlatform[] = [
  "whatsapp",
  "telegram",
  "sms",
  "email",
  "instagram",
  "youtube",
  "facebook",
  "x",
  "news",
  "website",
  "other",
];

export interface AnalyzeRequest {
  input_type: InputType;
  content: string;
  source_platform: SourcePlatform | string;
  meta?: { original_filename?: string; content_mime?: string };
}

export interface AnalyzeResponse {
  verdict: Verdict;
  risk_score: number;
  trust_10?: number;
  summary: string;
  reasons: string[];
  next_steps: string[];
  signals?: Record<string, boolean | null>;
  extracted_entities: { domains: string[]; stocks: string[]; apps: string[] };
}

export interface ReportResponse {
  complaint_text: string;
  evidence_to_attach: string[];
  next_steps: string[];
}

export interface CityBreakdown {
  city: string;
  high_risk: number;
  suspicious: number;
  safe: number;
}

export interface RecentCase {
  timestamp: string;
  verdict: string;
  platform: string;
  summary: string;
  city?: string;
  domain?: string;
  keyword?: string;
}

export interface StatsResponse {
  totals: { cases: number; high_risk: number; suspicious?: number; safe?: number };
  top_domains: { domain: string; count: number }[];
  top_keywords: { keyword: string; count: number }[];
  recent_cases: RecentCase[];
  city_breakdown?: CityBreakdown[];
}

function post<T>(path: string, body: unknown): Promise<T> {
  return request<T>(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export function analyze(payload: AnalyzeRequest) {
  return post<AnalyzeResponse>("/analyze", payload);
}

export function createReport(payload: Record<string, unknown>) {
  return post<ReportResponse>("/report", payload);
}

export function getStats(): Promise<StatsResponse> {
  return request<StatsResponse>("/stats");
}

/* ---------- Demo fallbacks, only shown when the API fails ---------- */

export const sampleAnalysis: AnalyzeResponse = {
  verdict: "HIGH_RISK",
  risk_score: 87,
  summary:
    "This link mimics a registered broker domain and pushes an urgent 'guaranteed return' stock tip. Strong indicators of a securities phishing scam.",
  reasons: [
    "Look-alike domain registered 6 days ago, not a SEBI-registered intermediary",
    "Promises guaranteed or fixed returns, which is prohibited",
    "Urgency language pressuring immediate payment",
    "Asks users to install an APK outside official app stores",
  ],
  next_steps: [
    "Do not click the link or install any app it offers",
    "Verify the entity on the SEBI intermediary registry",
    "Report the number/handle on the platform and block it",
    "If money was already sent, file a complaint within 24 hours",
  ],
  extracted_entities: {
    domains: ["angeloone-invest.co"],
    stocks: ["RELIANCE", "ADANIENT"],
    apps: ["ProTrade Pro APK"],
  },
};

export const sampleReport: ReportResponse = {
  complaint_text: `To,
The Cyber Crime Cell / SEBI SCORES

Subject: Complaint regarding a securities-related phishing fraud

I wish to report a fraudulent investment scheme that I encountered. I was contacted via the platform mentioned below and was induced to act on unsolicited stock recommendations promising assured returns.

Sincerely,
[Your name, contact number, and address]`,
  evidence_to_attach: [
    "Screenshots of the full chat/message thread including sender ID",
    "Transaction IDs and bank statement entries for all transfers",
    "The suspicious URL(s) in plain text",
    "Phone numbers, UPI IDs and email addresses used by the fraudster",
  ],
  next_steps: [
    "File the complaint on the National Cyber Crime Reporting Portal",
    "Submit the same complaint on SEBI SCORES for securities-related fraud",
    "Inform your bank immediately to attempt a transaction freeze",
  ],
};

export const sampleStats: StatsResponse = {
  totals: { cases: 1284, high_risk: 417, suspicious: 502, safe: 365 },
  top_domains: [
    { domain: "angeloone-invest.co", count: 96 },
    { domain: "sebi-refund-portal.in", count: 71 },
    { domain: "ipo-allotment-now.xyz", count: 54 },
    { domain: "zerodha-support.help", count: 38 },
  ],
  top_keywords: [
    { keyword: "guaranteed returns", count: 214 },
    { keyword: "IPO allotment", count: 168 },
    { keyword: "VIP group", count: 141 },
    { keyword: "AI trading bot", count: 122 },
    { keyword: "SEBI approved", count: 97 },
    { keyword: "install APK", count: 83 },
  ],
  recent_cases: [
    {
      timestamp: new Date(Date.now() - 2 * 3600e3).toISOString(),
      verdict: "HIGH_RISK",
      platform: "WhatsApp",
      summary: "Fake VIP trading group promising 300% monthly returns",
      city: "Mumbai",
      domain: "angeloone-invest.co",
      keyword: "guaranteed returns",
    },
    {
      timestamp: new Date(Date.now() - 6 * 3600e3).toISOString(),
      verdict: "SUSPICIOUS",
      platform: "Telegram",
      summary: "Unregistered advisory sharing small-cap tips with paid plans",
      city: "Delhi",
      keyword: "VIP group",
    },
    {
      timestamp: new Date(Date.now() - 20 * 3600e3).toISOString(),
      verdict: "HIGH_RISK",
      platform: "SMS",
      summary: "Phishing link impersonating a broker's KYC update page",
      city: "Bengaluru",
      domain: "zerodha-support.help",
      keyword: "SEBI approved",
    },
    {
      timestamp: new Date(Date.now() - 3 * 24 * 3600e3).toISOString(),
      verdict: "HIGH_RISK",
      platform: "YouTube",
      summary: "Deepfake video of a market expert promoting an AI trading bot",
      city: "Hyderabad",
      keyword: "AI trading bot",
    },
    {
      timestamp: new Date(Date.now() - 5 * 24 * 3600e3).toISOString(),
      verdict: "SUSPICIOUS",
      platform: "Instagram",
      summary: "Influencer pushing pre-IPO allotment at a discount",
      city: "Pune",
      keyword: "IPO allotment",
    },
    {
      timestamp: new Date(Date.now() - 12 * 24 * 3600e3).toISOString(),
      verdict: "SAFE",
      platform: "Email",
      summary: "Genuine exchange circular, no action needed",
      city: "Chennai",
    },
    {
      timestamp: new Date(Date.now() - 16 * 24 * 3600e3).toISOString(),
      verdict: "HIGH_RISK",
      platform: "Telegram",
      summary: "Coordinated pump campaign on an illiquid small-cap counter",
      city: "Kolkata",
      keyword: "guaranteed returns",
    },
  ],
};
