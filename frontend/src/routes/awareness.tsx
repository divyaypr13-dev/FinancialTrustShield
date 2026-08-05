import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { PageHeader } from "@/components/Page";
import { AlertTriangle, BadgeCheck, Fingerprint, Lock, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/awareness")({
  head: () => ({
    meta: [
      { title: "Safety guidance & investment checklist | Financial Trust Shield" },
      {
        name: "description",
        content:
          "Prevention-first guidance: verify intermediaries, spot scam patterns and use the investment safety checklist.",
      },
      { property: "og:title", content: "Investor Safety Guidance | Financial Trust Shield" },
      {
        property: "og:description",
        content: "Checklist and awareness examples to avoid securities fraud.",
      },
    ],
  }),
  component: AwarenessPage,
});

const GUIDANCE = [
  {
    icon: BadgeCheck,
    title: "Verify before you trust",
    body: "Every advisor, broker and research analyst must be listed on the SEBI intermediary registry. No registration number, no conversation.",
  },
  {
    icon: Fingerprint,
    title: "Communication DNA™ check",
    body: "Genuine intermediaries use registered numbers, official domains and never move you to a personal chat for payments.",
  },
  {
    icon: Lock,
    title: "Multi-layer Authentication",
    body: "Enable 2FA on email, broker and bank. Never read an OTP aloud — no legitimate staff will ever ask for one.",
  },
  {
    icon: ShieldCheck,
    title: "Assured returns are illegal",
    body: "Any promise of guaranteed, fixed or risk-free market returns is a red flag by itself, regardless of who says it.",
  },
];

const CHECKLIST = [
  "I verified the entity's SEBI registration number on the official registry.",
  "I checked the website domain letter by letter for look-alike spellings.",
  "I confirmed payments go to a company account, never to a personal UPI or wallet.",
  "I did not install any app shared as an APK or via a chat link.",
  "I read the risk disclosure and understood that returns are not guaranteed.",
  "I checked whether the 'profit dashboard' allows an actual withdrawal.",
  "I told a family member about this investment before transferring money.",
  "I kept screenshots of all communications and payment receipts.",
];

const EXAMPLES = [
  {
    title: "The VIP tip group",
    body: "You are added to a group of 'verified members' posting profit screenshots. The screenshots are fabricated and the members are bots.",
  },
  {
    title: "Pre-IPO allotment at a discount",
    body: "You are offered unlisted shares before an IPO 'at a special price'. Money is taken; no shares are ever transferred.",
  },
  {
    title: "Deepfake expert endorsement",
    body: "A video shows a well-known market figure endorsing an AI trading bot. The face and voice are synthetic.",
  },
  {
    title: "Regulator impersonation refund",
    body: "A message claims SEBI is refunding your past losses and asks for a processing fee. Regulators never charge refund fees.",
  },
];

function AwarenessPage() {
  const [ticked, setTicked] = useState<Record<number, boolean>>({});
  const done = Object.values(ticked).filter(Boolean).length;

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10">
      <PageHeader
        eyebrow="Prevention"
        title="Safety Guidance & Scam Awareness"
        subtitle="Prevention-first guidance, an investment safety checklist and real scam patterns to recognise."
      />

      <div className="mt-6 flex items-start gap-2 rounded-lg border border-warn/30 bg-warn-soft px-4 py-3 text-sm text-warn">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
        <p>
          <strong>Early warning:</strong> AI trading bot and pre-IPO allotment themes are currently
          rising. Treat any unsolicited message on these topics as hostile until verified.
        </p>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {GUIDANCE.map((g) => (
          <Card key={g.title}>
            <CardContent className="space-y-2 pt-6">
              <g.icon className="h-5 w-5 text-primary" />
              <p className="font-semibold">{g.title}</p>
              <p className="text-sm text-muted-foreground">{g.body}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-6">
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2">
          <CardTitle className="text-lg">Investment checklist</CardTitle>
          <span className="text-xs font-semibold text-muted-foreground">
            {done}/{CHECKLIST.length} completed
          </span>
        </CardHeader>
        <CardContent className="space-y-3">
          {CHECKLIST.map((c, i) => (
            <label key={i} className="flex items-start gap-3 text-sm">
              <Checkbox
                checked={Boolean(ticked[i])}
                onCheckedChange={(v) => setTicked((t) => ({ ...t, [i]: Boolean(v) }))}
              />
              <span className={ticked[i] ? "text-muted-foreground line-through" : ""}>{c}</span>
            </label>
          ))}
          {done === CHECKLIST.length && (
            <p className="rounded-md bg-safe-soft px-3 py-2 text-sm text-safe">
              Financial Trust Stamp™: self-check complete (Demo). Still verify anything new with a
              scan.
            </p>
          )}
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg">Scam awareness examples</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          {EXAMPLES.map((e) => (
            <div key={e.title} className="rounded-lg border border-border p-4">
              <p className="text-sm font-semibold">{e.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{e.body}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <p className="mt-6 text-sm text-muted-foreground">
        Got something suspicious?{" "}
        <Link to="/scan" className="text-primary underline underline-offset-4">
          Run a scan
        </Link>{" "}
        or{" "}
        <Link to="/recovery" className="text-primary underline underline-offset-4">
          open the recovery assistant
        </Link>
        .
      </p>
    </div>
  );
}
