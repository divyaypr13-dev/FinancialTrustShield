import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { FolderPlus, LifeBuoy, Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RiskBadge } from "@/components/RiskBadge";
import { Disclaimer, DemoTag } from "@/components/Page";
import { SignalTable, TrustDial, TrustStamp } from "@/components/TrustScore";
import {
  analyze,
  ApiError,
  SOURCE_PLATFORMS,
  UNREACHABLE_MESSAGE,
  type AnalyzeResponse,
  type InputType,
} from "@/lib/api";
import { buildSignals, trustScore10 } from "@/lib/intel";
import { addEvidence } from "@/lib/evidence";

export const Route = createFileRoute("/scan")({
  head: () => ({
    meta: [
      { title: "Multi-modal scan & Trust Score™ | Financial Trust Shield" },
      {
        name: "description",
        content:
          "Scan links, messages, screenshots, documents, audio and video for securities fraud and get a Trust Score™ with next steps.",
      },
      { property: "og:title", content: "Check before you click | Financial Trust Shield" },
      {
        property: "og:description",
        content: "Multi-modal scam detection with Trust Score™ and Financial Trust Stamp™.",
      },
    ],
  }),
  component: ScanPage,
});

type Mode = "url" | "text" | "image" | "pdf" | "audio" | "video" | "social";

const MODES: { key: Mode; label: string; inputType: InputType; file?: string; hint: string }[] = [
  { key: "url", label: "URL", inputType: "url", hint: "Paste a suspicious link." },
  { key: "text", label: "Text", inputType: "text", hint: "Paste a message, email or post." },
  { key: "image", label: "Screenshot", inputType: "image", file: "image/*", hint: "Upload a chat or website screenshot." },
  { key: "pdf", label: "PDF / Doc", inputType: "pdf", file: ".pdf,.doc,.docx,application/pdf", hint: "Upload a research report or offer document." },
  { key: "audio", label: "Audio", inputType: "audio", file: "audio/*", hint: "Upload a call recording or voice note." },
  { key: "video", label: "Video", inputType: "video", file: "video/*", hint: "Upload a video tip or endorsement clip." },
  { key: "social", label: "Social / News link", inputType: "url", hint: "Paste a social post or news article link." },
];

const MVP_NOTICE =
  "MVP mode: file analysis not enabled yet; generating trust score using metadata + heuristics.";

function ScanPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("url");
  const [url, setUrl] = useState("");
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [platform, setPlatform] = useState<string>("other");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [result, setResult] = useState<AnalyzeResponse | null>(null);
  const [analyzedContent, setAnalyzedContent] = useState("");
  const [saved, setSaved] = useState(false);

  const active = MODES.find((m) => m.key === mode)!;

  function readFileAsBase64(f: File) {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result).split(",")[1] ?? "");
      reader.onerror = () => reject(new Error("Could not read the file"));
      reader.readAsDataURL(f);
    });
  }

  async function onAnalyze() {
    setError(null);
    setNotice(null);
    setSaved(false);

    let content = "";
    if (mode === "url" || mode === "social") {
      const v = url.trim();
      if (!v) return setError("Please paste a link to analyze.");
      if (!/^https?:\/\/\S+\.\S+/i.test(v))
        return setError("That doesn't look like a valid link. Include http:// or https://");
      content = v;
    } else if (mode === "text") {
      const v = text.trim();
      if (v.length < 15) return setError("Please paste at least 15 characters of the message.");
      content = v;
    } else {
      if (!file) return setError("Please choose a file first.");
      if (file.size > 10 * 1024 * 1024) return setError("File must be smaller than 10 MB.");
      content = await readFileAsBase64(file);
      if (mode !== "image") setNotice(MVP_NOTICE);
    }

    setLoading(true);
    setResult(null);
    const label = file && mode !== "url" && mode !== "text" && mode !== "social"
      ? `${active.label}: ${file.name}`
      : content;
    setAnalyzedContent(label);
    try {
      const data = await analyze({
        input_type: active.inputType,
        content,
        source_platform: platform,
        ...(file ? { meta: { original_filename: file.name, content_mime: file.type } } : {}),
      });
      setResult(data);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : UNREACHABLE_MESSAGE);
    } finally {
      setLoading(false);
    }
  }

  function prefill() {
    if (!result) return null;
    const description = `Content analyzed (${active.label}): ${analyzedContent}\n\nAssessment: ${result.summary}\n\nTop reasons:\n${result.reasons
      .slice(0, 3)
      .map((r) => `- ${r}`)
      .join("\n")}`;
    return { description, platform, verdict: result.verdict, summary: result.summary };
  }

  function goToReport() {
    const p = prefill();
    if (!p) return;
    sessionStorage.setItem("sis:prefill", JSON.stringify(p));
    navigate({ to: "/report" });
  }

  function goToRecovery() {
    const p = prefill();
    if (!p) return;
    sessionStorage.setItem("fts:recovery", JSON.stringify(p));
    navigate({ to: "/recovery" });
  }

  function saveEvidence() {
    if (!result) return;
    addEvidence({
      kind: file ? "file" : mode === "text" ? "text" : "url",
      label: analyzedContent.slice(0, 160) || active.label,
      detail: `${result.verdict} · risk ${result.risk_score}/100 · ${result.summary}`,
      ...(file ? { filename: file.name, mime: file.type, size: file.size } : {}),
    });
    setSaved(true);
  }

  const trust = result ? trustScore10(result) : 0;

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10">
      <div className="text-center">
        <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          <ShieldCheck className="h-3.5 w-3.5" /> Check before you click
        </span>
        <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
          Multi-Modal Scan &amp; Trust Score™
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground sm:text-base">
          Verify links, messages, documents, audio and video with Communication DNA™ and Multi-layer
          Authentication checks.
        </p>
      </div>

      <Disclaimer className="mt-6" />

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg">Analyze something suspicious</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <Tabs value={mode} onValueChange={(v) => { setMode(v as Mode); setFile(null); }}>
            <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1">
              {MODES.map((m) => (
                <TabsTrigger key={m.key} value={m.key} className="text-xs">
                  {m.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {MODES.map((m) => (
              <TabsContent key={m.key} value={m.key} className="mt-4 space-y-2">
                <Label htmlFor={`in-${m.key}`}>{m.hint}</Label>
                {m.key === "text" ? (
                  <Textarea
                    id="in-text"
                    rows={7}
                    placeholder="Join our VIP group, guaranteed 300% returns this month…"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                  />
                ) : m.file ? (
                  <>
                    <Input
                      id={`in-${m.key}`}
                      type="file"
                      accept={m.file}
                      onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                    />
                    {file && <p className="text-xs text-muted-foreground">Selected: {file.name}</p>}
                    {m.key !== "image" && (
                      <p className="flex items-center gap-2 text-xs text-muted-foreground">
                        <DemoTag>MVP</DemoTag> {MVP_NOTICE}
                      </p>
                    )}
                  </>
                ) : (
                  <Input
                    id={`in-${m.key}`}
                    placeholder={
                      m.key === "social"
                        ? "https://t.me/vip_stock_signals/1234"
                        : "https://ipo-allotment-now.xyz/claim"
                    }
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                  />
                )}
              </TabsContent>
            ))}
          </Tabs>

          <div className="space-y-2">
            <Label>Where did you receive it?</Label>
            <Select value={platform} onValueChange={setPlatform}>
              <SelectTrigger className="w-full sm:w-64">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SOURCE_PLATFORMS.map((p) => (
                  <SelectItem key={p} value={p} className="capitalize">
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {error && (
            <p className="rounded-md bg-danger-soft px-3 py-2 text-sm text-danger">{error}</p>
          )}

          <Button onClick={onAnalyze} disabled={loading} className="w-full sm:w-auto">
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? "Analyzing…" : "Analyze"}
          </Button>
        </CardContent>
      </Card>

      {notice && (
        <p className="mt-4 rounded-md bg-warn-soft px-3 py-2 text-sm text-warn">{notice}</p>
      )}

      {result && (
        <Card className="mt-6">
          <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3">
            <CardTitle className="text-lg">Result</CardTitle>
            <RiskBadge verdict={result.verdict} />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-5 sm:grid-cols-2 sm:items-center">
              <TrustDial score={trust} verdict={result.verdict} />
              <TrustStamp verdict={result.verdict} score={trust} />
            </div>

            <div>
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Risk score (0–100)</span>
                <span className="font-semibold">{result.risk_score}/100</span>
              </div>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-secondary">
                <div
                  className={`h-full rounded-full ${
                    result.verdict === "HIGH_RISK"
                      ? "bg-danger"
                      : result.verdict === "SUSPICIOUS"
                        ? "bg-warn"
                        : "bg-safe"
                  }`}
                  style={{ width: `${Math.min(100, Math.max(0, result.risk_score))}%` }}
                />
              </div>
              <p className="mt-3 text-sm text-muted-foreground">{result.summary}</p>
            </div>

            <section>
              <h2 className="text-sm font-semibold">Why this Trust Score™?</h2>
              <div className="mt-2">
                <SignalTable rows={buildSignals(result, active.inputType, analyzedContent)} />
              </div>
            </section>

            <section>
              <h2 className="text-sm font-semibold">Why flagged</h2>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                {result.reasons.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className="text-sm font-semibold">
                {result.verdict === "HIGH_RISK"
                  ? "Immediate containment steps"
                  : "Recommended prevention steps"}
              </h2>
              <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-muted-foreground">
                {result.next_steps.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ol>
            </section>

            {(result.extracted_entities?.domains?.length ||
              result.extracted_entities?.stocks?.length ||
              result.extracted_entities?.apps?.length) > 0 && (
              <section>
                <h2 className="text-sm font-semibold">Detected entities</h2>
                <div className="mt-2 flex flex-wrap gap-2">
                  {[
                    ...(result.extracted_entities.domains ?? []),
                    ...(result.extracted_entities.stocks ?? []),
                    ...(result.extracted_entities.apps ?? []),
                  ].map((e, i) => (
                    <span key={i} className="rounded-md bg-secondary px-2 py-1 text-xs">
                      {e}
                    </span>
                  ))}
                </div>
              </section>
            )}

            <div className="flex flex-wrap gap-3">
              <Button variant="outline" onClick={goToReport}>
                Generate Incident Report
              </Button>
              <Button variant="outline" onClick={goToRecovery}>
                <LifeBuoy className="mr-2 h-4 w-4" /> Open AI Recovery Assistant
              </Button>
              <Button variant="secondary" onClick={saveEvidence}>
                <FolderPlus className="mr-2 h-4 w-4" />
                {saved ? "Added to Evidence Locker" : "Add to Evidence Locker"}
              </Button>
            </div>

            <Disclaimer />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
