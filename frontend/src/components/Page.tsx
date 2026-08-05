import { DISCLAIMER } from "@/lib/api";
import { Info } from "lucide-react";

export function Disclaimer({ className = "" }: { className?: string }) {
  return (
    <p
      className={`flex items-start gap-2 rounded-md border border-border bg-secondary/50 px-3 py-2 text-xs text-muted-foreground ${className}`}
    >
      <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
      {DISCLAIMER}
    </p>
  );
}

export function PageHeader({
  title,
  subtitle,
  eyebrow,
}: {
  title: string;
  subtitle?: string;
  eyebrow?: string;
}) {
  return (
    <header className="space-y-3">
      {eyebrow && (
        <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          {eyebrow}
        </span>
      )}
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
      {subtitle && <p className="max-w-2xl text-sm text-muted-foreground">{subtitle}</p>}
      <Disclaimer />
    </header>
  );
}

export function DemoTag({ children = "Demo" }: { children?: string }) {
  return (
    <span className="rounded-full border border-warn/30 bg-warn-soft px-2.5 py-0.5 text-[11px] font-semibold text-warn">
      {children}
    </span>
  );
}
