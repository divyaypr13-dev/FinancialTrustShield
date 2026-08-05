import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Check, Copy, Download, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader, Disclaimer, DemoTag } from "@/components/Page";
import { createReport, ApiError, UNREACHABLE_MESSAGE, type ReportResponse } from "@/lib/api";
import {
  addEvidence,
  addSubmission,
  downloadText,
  evidenceListText,
  listEvidence,
  removeEvidence,
  type EvidenceItem,
} from "@/lib/evidence";

export const Route = createFileRoute("/report")({
  head: () => ({
    meta: [
      { title: "Incident reporting & evidence locker | Financial Trust Shield" },
      {
        name: "description",
        content:
          "Guided incident report with evidence collection and attack reconstruction, ready for cybercrime and SEBI SCORES.",
      },
      { property: "og:title", content: "Incident reporting | Financial Trust Shield" },
      {
        property: "og:description",
        content: "Turn what happened into a clean, submittable fraud complaint with evidence.",
      },
    ],
  }),
  component: ReportPage,
});

const incidentTypes = [
  "Phishing link",
  "Fake stock tip group",
  "Impersonation",
  "Fake advisory",
  "Deepfake news",
  "Voice clone call",
  "Other",
];
const platforms = [
  "WhatsApp",
  "Telegram",
  "SMS",
  "Email",
  "Instagram",
  "YouTube",
  "Facebook",
  "X",
  "News",
  "Website",
  "Other",
];
const evidenceFields = [
  { key: "screenshots_saved", label: "Screenshots saved" },
  { key: "transaction_id", label: "Transaction ID" },
  { key: "phone_number", label: "Phone number" },
  { key: "url", label: "URL" },
  { key: "bank_details", label: "Bank account details" },
  { key: "email_headers", label: "Email headers" },
  { key: "social_post_link", label: "Social post link" },
] as const;

type EvidenceKey = (typeof evidenceFields)[number]["key"];

const STAGES = [
  { key: "first_contact", label: "First contact", hint: "Who contacted you, on which channel?" },
  { key: "persuasion", label: "Persuasion / manipulation", hint: "What promises or pressure were used?" },
  { key: "click_or_share", label: "Link click / credential share", hint: "What did you click or share?" },
  { key: "payment_or_loss", label: "Payment / loss", hint: "How much, to which account/UPI?" },
  { key: "aftermath", label: "Aftermath", hint: "What happened after — blocked, more demands?" },
] as const;

function ReportPage() {
  const [incidentType, setIncidentType] = useState("Phishing link");
  const [platform, setPlatform] = useState("WhatsApp");
  const [amount, setAmount] = useState("");
  const [when, setWhen] = useState("");
  const [description, setDescription] = useState("");
  const [evidence, setEvidence] = useState<Record<EvidenceKey, boolean>>({
    screenshots_saved: false,
    transaction_id: false,
    phone_number: false,
    url: false,
    bank_details: false,
    email_headers: false,
    social_post_link: false,
  });
  const [steps, setSteps] = useState<Record<string, string>>({});
  const [locker, setLocker] = useState<EvidenceItem[]>([]);
  const [submitToDashboard, setSubmitToDashboard] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [result, setResult] = useState<ReportResponse | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setLocker(listEvidence());
    const raw = sessionStorage.getItem("sis:prefill");
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as { description?: string; platform?: string };
      if (parsed.description) setDescription(parsed.description);
      if (parsed.platform) {
        const match = platforms.find((p) => p.toLowerCase() === parsed.platform!.toLowerCase());
        if (match) setPlatform(match);
      }
    } catch {
      /* ignore malformed prefill */
    }
    sessionStorage.removeItem("sis:prefill");
  }, []);

  function onAttach(files: FileList | null) {
    if (!files?.length) return;
    let next = locker;
    for (const f of Array.from(files)) {
      next = addEvidence({
        kind: "file",
        label: f.name,
        detail: `${(f.size / 1024).toFixed(0)} KB · ${f.type || "unknown type"}`,
        filename: f.name,
        mime: f.type,
        size: f.size,
      });
    }
    setLocker(next);
  }

  const reconstruction = STAGES.filter((s) => steps[s.key]?.trim()).map(
    (s, i) => `${i + 1}. ${s.label}: ${steps[s.key]!.trim()}`,
  );

  async function onGenerate() {
    setError(null);
    setNotice(null);
    if (description.trim().length < 20)
      return setError("Please describe what happened in at least 20 characters.");
    if (amount && (Number(amount) < 0 || Number.isNaN(Number(amount))))
      return setError("Amount lost must be a positive number.");

    setLoading(true);
    setResult(null);
    try {
      const data = await createReport({
        incident_type: incidentType,
        platform,
        amount_lost: amount ? Number(amount) : 0,
        incident_datetime: when,
        description: description.trim(),
        evidence,
        reconstruction: {
          steps: STAGES.map((s) => ({ stage: s.key, notes: steps[s.key] ?? "" })),
        },
      });
      setResult(data);
      if (submitToDashboard) {
        addSubmission({
          timestamp: new Date().toISOString(),
          verdict: "HIGH_RISK",
          platform,
          summary: `${incidentType} — ${description.trim().slice(0, 90)}`,
          amount_lost: amount ? Number(amount) : 0,
        });
        setNotice("Summary stored locally and added to the National Dashboard (Demo).");
      }
    } catch (e) {
      setError(e instanceof ApiError ? e.message : UNREACHABLE_MESSAGE);
    } finally {
      setLoading(false);
    }
  }

  async function copyText() {
    if (!result) return;
    await navigator.clipboard.writeText(result.complaint_text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10">
      <PageHeader
        eyebrow="Response"
        title="Incident Reporting"
        subtitle="Guided incident details, evidence collection and attack reconstruction — output is a copy-ready complaint."
      />

      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="text-lg">A. Incident details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Incident type</Label>
              <Select value={incidentType} onValueChange={setIncidentType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {incidentTypes.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Platform used</Label>
              <Select value={platform} onValueChange={setPlatform}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {platforms.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Amount lost (₹, optional)</Label>
              <Input
                id="amount"
                type="number"
                min={0}
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="when">Date &amp; time (optional)</Label>
              <Input
                id="when"
                type="datetime-local"
                value={when}
                onChange={(e) => setWhen(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="desc">What happened? Paste the message / describe steps.</Label>
            <Textarea
              id="desc"
              rows={8}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="I received a message on WhatsApp claiming…"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2">
          <CardTitle className="text-lg">B. Evidence Locker</CardTitle>
          <DemoTag>Stored in this browser</DemoTag>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="attach">
              Attach screenshots, PDFs, documents, audio or video
            </Label>
            <Input
              id="attach"
              type="file"
              multiple
              accept="image/*,application/pdf,.doc,.docx,audio/*,video/*"
              onChange={(e) => onAttach(e.target.files)}
            />
            <p className="text-xs text-muted-foreground">
              Files are recorded as evidence metadata only in this demo — the file contents stay on
              your device.
            </p>
          </div>

          <div className="space-y-3">
            <Label>Evidence checklist</Label>
            <div className="grid gap-3 sm:grid-cols-2">
              {evidenceFields.map((f) => (
                <label key={f.key} className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={evidence[f.key]}
                    onCheckedChange={(v) => setEvidence((e) => ({ ...e, [f.key]: Boolean(v) }))}
                  />
                  {f.label}
                </label>
              ))}
            </div>
          </div>

          {locker.length > 0 && (
            <div className="space-y-2">
              <Label>Collected items ({locker.length})</Label>
              <ul className="divide-y divide-border rounded-lg border border-border">
                {locker.map((i) => (
                  <li key={i.id} className="flex items-start gap-3 px-3 py-2 text-sm">
                    <span className="mt-0.5 rounded bg-secondary px-1.5 py-0.5 text-[10px] font-semibold uppercase">
                      {i.kind}
                    </span>
                    <span className="min-w-0 flex-1 break-words">
                      {i.label}
                      {i.detail && (
                        <span className="block text-xs text-muted-foreground">{i.detail}</span>
                      )}
                    </span>
                    <button
                      aria-label="Remove evidence item"
                      onClick={() => setLocker(removeEvidence(i.id))}
                      className="text-muted-foreground transition-colors hover:text-danger"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
              <Button
                size="sm"
                variant="outline"
                onClick={() => downloadText("evidence-list.txt", evidenceListText(locker))}
              >
                <Download className="mr-2 h-4 w-4" /> Download evidence list
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg">C. Attack Reconstruction</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {STAGES.map((s, i) => (
            <div key={s.key} className="space-y-2">
              <Label htmlFor={s.key}>
                {i + 1}. {s.label}
              </Label>
              <Textarea
                id={s.key}
                rows={2}
                placeholder={s.hint}
                value={steps[s.key] ?? ""}
                onChange={(e) => setSteps((p) => ({ ...p, [s.key]: e.target.value }))}
              />
            </div>
          ))}

          {reconstruction.length > 0 && (
            <div>
              <Label>Reconstructed timeline</Label>
              <pre className="mt-2 whitespace-pre-wrap rounded-lg bg-secondary p-4 font-mono text-xs leading-relaxed">
                {reconstruction.join("\n")}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardContent className="space-y-4 pt-6">
          <label className="flex items-center justify-between gap-4">
            <span className="text-sm">
              Submit summary to National Dashboard <DemoTag />
              <span className="block text-xs text-muted-foreground">
                Stores an anonymised summary in this browser and lists it on the dashboard.
              </span>
            </span>
            <Switch checked={submitToDashboard} onCheckedChange={setSubmitToDashboard} />
          </label>

          {error && (
            <p className="rounded-md bg-danger-soft px-3 py-2 text-sm text-danger">{error}</p>
          )}

          <Button onClick={onGenerate} disabled={loading} className="w-full sm:w-auto">
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? "Generating…" : "Generate Report"}
          </Button>
        </CardContent>
      </Card>

      {notice && (
        <p className="mt-4 rounded-md bg-safe-soft px-3 py-2 text-sm text-safe">{notice}</p>
      )}

      {result && (
        <Card className="mt-6">
          <CardHeader className="flex flex-row items-center justify-between gap-3">
            <CardTitle className="text-lg">Copy-ready complaint text</CardTitle>
            <Button size="sm" variant="outline" onClick={copyText}>
              {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
              {copied ? "Copied" : "Copy"}
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            <pre className="max-h-96 overflow-auto whitespace-pre-wrap rounded-lg bg-secondary p-4 font-mono text-xs leading-relaxed">
              {result.complaint_text}
            </pre>

            <section>
              <h2 className="text-sm font-semibold">Evidence to attach</h2>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                {result.evidence_to_attach.map((e, i) => (
                  <li key={i}>{e}</li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className="text-sm font-semibold">Next steps</h2>
              <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-muted-foreground">
                {result.next_steps.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ol>
              <div className="mt-3 flex flex-wrap gap-3 text-sm">
                <a
                  className="text-primary underline underline-offset-4"
                  href="https://cybercrime.gov.in"
                  target="_blank"
                  rel="noreferrer"
                >
                  National Cyber Crime Reporting Portal
                </a>
                <a
                  className="text-primary underline underline-offset-4"
                  href="https://scores.sebi.gov.in"
                  target="_blank"
                  rel="noreferrer"
                >
                  SEBI SCORES
                </a>
                <Link className="text-primary underline underline-offset-4" to="/recovery">
                  AI Recovery Assistant
                </Link>
              </div>
            </section>
            <Disclaimer />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
