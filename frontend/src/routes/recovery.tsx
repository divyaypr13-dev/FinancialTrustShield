import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader, Disclaimer } from "@/components/Page";
import { LifeBuoy } from "lucide-react";

export const Route = createFileRoute("/recovery")({
  head: () => ({
    meta: [
      { title: "AI Recovery Assistant | Financial Trust Shield" },
      {
        name: "description",
        content:
          "Step-by-step containment, financial, reporting and evidence actions after a securities scam.",
      },
      { property: "og:title", content: "AI Recovery Assistant | Financial Trust Shield" },
      {
        property: "og:description",
        content: "Guided response checklist after clicking a link, sharing an OTP or paying money.",
      },
    ],
  }),
  component: RecoveryPage,
});

interface Playbook {
  key: string;
  label: string;
  containment: string[];
  financial: string[];
  reporting: string[];
  evidence: string[];
}

const PLAYBOOKS: Playbook[] = [
  {
    key: "clicked",
    label: "I clicked a link",
    containment: [
      "Close the page and disconnect from public Wi-Fi.",
      "Do not enter any credentials on that page, even to 'test' it.",
      "Run a device scan and remove any app installed from that link.",
    ],
    financial: [
      "Check your broker and bank for unrecognised logins or orders.",
      "Enable two-factor authentication on broker, bank and email.",
    ],
    reporting: [
      "Report the link on the platform where you received it.",
      "File a complaint on cybercrime.gov.in if data was entered.",
    ],
    evidence: ["Save the full URL in plain text.", "Screenshot the page and the message thread."],
  },
  {
    key: "otp",
    label: "I shared OTP/credentials",
    containment: [
      "Change your broker, bank, email and UPI passwords now, from a trusted device.",
      "Sign out of all active sessions on those accounts.",
      "Never share a fresh OTP with anyone claiming to 'reverse' the first one.",
    ],
    financial: [
      "Call your bank's fraud helpline and request an account/card block.",
      "Ask your broker to freeze the trading account temporarily.",
    ],
    reporting: [
      "Call 1930 (national cyber fraud helpline) within the golden hour.",
      "File on cybercrime.gov.in and SEBI SCORES if securities-related.",
    ],
    evidence: [
      "Note the exact time you shared the OTP.",
      "Keep the SMS/e-mail with the OTP request and the caller number.",
    ],
  },
  {
    key: "paid",
    label: "I paid money",
    containment: [
      "Stop all further payments, even if the fraudster promises a refund.",
      "Block the contact on every channel.",
    ],
    financial: [
      "Report to your bank immediately and request a transaction recall/freeze.",
      "Raise a dispute with the UPI app and note the complaint reference number.",
    ],
    reporting: [
      "Call 1930 within 24 hours — early reporting improves recovery odds.",
      "File a detailed complaint on cybercrime.gov.in and SEBI SCORES.",
    ],
    evidence: [
      "Collect transaction IDs, UTR numbers and beneficiary account/UPI IDs.",
      "Download the bank statement page showing each transfer.",
    ],
  },
  {
    key: "compromised",
    label: "My account is compromised",
    containment: [
      "Reset passwords starting with your e-mail, then broker and bank.",
      "Revoke third-party app access and check registered mobile/e-mail on file.",
    ],
    financial: [
      "Ask the broker to block trading and pledge/DIS instructions.",
      "Review holdings for unauthorised sales and off-market transfers.",
    ],
    reporting: [
      "Inform your depository participant and broker in writing.",
      "File on SEBI SCORES if the broker's response is inadequate.",
    ],
    evidence: [
      "Export login/activity history from the broker app.",
      "Screenshot unauthorised orders with timestamps.",
    ],
  },
  {
    key: "tipgroup",
    label: "I joined a stock tip group",
    containment: [
      "Leave the group and stop acting on any tips received.",
      "Do not install any 'trading dashboard' app the group shares.",
    ],
    financial: [
      "Do not top up any wallet shown inside the group's app — those balances are fake.",
      "Verify the advisor on the SEBI intermediary registry before any payment.",
    ],
    reporting: [
      "Report the group and admin handles on the platform.",
      "Report unregistered advisory activity on SEBI SCORES.",
    ],
    evidence: [
      "Export the chat history and admin profile links.",
      "Save the group invite link and member count screenshots.",
    ],
  },
];

function RecoveryPage() {
  const [active, setActive] = useState<Playbook | null>(null);
  const [context, setContext] = useState("");
  const [done, setDone] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const raw = sessionStorage.getItem("fts:recovery");
    if (!raw) return;
    try {
      const p = JSON.parse(raw) as { description?: string; verdict?: string };
      if (p.description) setContext(p.description);
      if (p.verdict === "HIGH_RISK") setActive(PLAYBOOKS[0]!);
    } catch {
      /* ignore */
    }
    sessionStorage.removeItem("fts:recovery");
  }, []);

  const sections = useMemo(
    () =>
      active
        ? [
            { title: "1. Containment", items: active.containment },
            { title: "2. Financial steps", items: active.financial },
            { title: "3. Reporting steps", items: active.reporting },
            { title: "4. Evidence steps", items: active.evidence },
          ]
        : [],
    [active],
  );

  function toReport() {
    sessionStorage.setItem(
      "sis:prefill",
      JSON.stringify({
        description:
          `${context ? context + "\n\n" : ""}Recovery scenario selected: ${active?.label}.`.trim(),
      }),
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10">
      <PageHeader
        eyebrow="Response"
        title="AI Recovery Assistant"
        subtitle="Tell the assistant what happened and get an ordered response checklist. Rule-based guidance for the demo."
      />

      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="text-lg">What happened?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {PLAYBOOKS.map((p) => (
              <Button
                key={p.key}
                variant={active?.key === p.key ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setActive(p);
                  setDone({});
                }}
              >
                {p.label}
              </Button>
            ))}
          </div>
          <Textarea
            rows={4}
            placeholder="Add any extra context (optional)…"
            value={context}
            onChange={(e) => setContext(e.target.value)}
          />
        </CardContent>
      </Card>

      {active && (
        <Card className="mt-6">
          <CardHeader className="flex flex-row items-center gap-2">
            <LifeBuoy className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Response plan — {active.label}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {sections.map((s) => (
              <section key={s.title}>
                <h2 className="text-sm font-semibold">{s.title}</h2>
                <ul className="mt-2 space-y-2">
                  {s.items.map((item) => {
                    const id = `${s.title}-${item}`;
                    return (
                      <li key={id}>
                        <label className="flex items-start gap-2 text-sm text-muted-foreground">
                          <input
                            type="checkbox"
                            className="mt-1 h-4 w-4 accent-[var(--primary)]"
                            checked={Boolean(done[id])}
                            onChange={(e) => setDone((d) => ({ ...d, [id]: e.target.checked }))}
                          />
                          <span className={done[id] ? "line-through opacity-60" : ""}>{item}</span>
                        </label>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))}

            <div className="flex flex-wrap gap-3">
              <Button asChild onClick={toReport}>
                <Link to="/report">Continue to Incident Report</Link>
              </Button>
              <Button asChild variant="outline">
                <a href="https://cybercrime.gov.in" target="_blank" rel="noreferrer">
                  cybercrime.gov.in
                </a>
              </Button>
            </div>
            <Disclaimer />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
