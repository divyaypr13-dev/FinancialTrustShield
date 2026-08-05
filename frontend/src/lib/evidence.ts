export interface EvidenceItem {
  id: string;
  kind: "url" | "text" | "file" | "note";
  label: string;
  detail?: string;
  filename?: string;
  mime?: string;
  size?: number;
  createdAt: string;
}

export interface DashboardSubmission {
  id: string;
  timestamp: string;
  verdict: string;
  platform: string;
  summary: string;
  city?: string;
  amount_lost?: number;
}

const EVIDENCE_KEY = "fts:evidence";
const SUBMISSION_KEY = "fts:submissions";

function read<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem(key) ?? "[]") as T[];
  } catch {
    return [];
  }
}

function write<T>(key: string, items: T[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(items));
}

export const listEvidence = () => read<EvidenceItem>(EVIDENCE_KEY);

export function addEvidence(item: Omit<EvidenceItem, "id" | "createdAt">): EvidenceItem[] {
  const items = [
    { ...item, id: crypto.randomUUID(), createdAt: new Date().toISOString() },
    ...listEvidence(),
  ];
  write(EVIDENCE_KEY, items);
  return items;
}

export function removeEvidence(id: string): EvidenceItem[] {
  const items = listEvidence().filter((i) => i.id !== id);
  write(EVIDENCE_KEY, items);
  return items;
}

export function evidenceListText(items: EvidenceItem[]) {
  return [
    "Financial Trust Shield — Evidence Locker export",
    `Generated: ${new Date().toLocaleString()}`,
    "Hackathon demo — results are risk guidance, not legal/financial advice.",
    "",
    ...items.map(
      (i, n) =>
        `${n + 1}. [${i.kind.toUpperCase()}] ${i.label}${i.filename ? ` (${i.filename})` : ""}${
          i.detail ? `\n   ${i.detail}` : ""
        }\n   Collected: ${new Date(i.createdAt).toLocaleString()}`,
    ),
  ].join("\n");
}

export function downloadText(filename: string, text: string) {
  const blob = new Blob([text], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export const listSubmissions = () => read<DashboardSubmission>(SUBMISSION_KEY);

export function addSubmission(item: Omit<DashboardSubmission, "id">): DashboardSubmission[] {
  const items = [{ ...item, id: crypto.randomUUID() }, ...listSubmissions()].slice(0, 50);
  write(SUBMISSION_KEY, items);
  return items;
}
