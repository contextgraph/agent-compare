import leadsJson from "../data/leads.json";

type LeadFile = {
  vs: Record<string, string>;
  questions: Record<string, string>;
};

const leads = leadsJson as LeadFile;

export type LeadKind = "vs" | "questions";

export function leadFor(kind: LeadKind, slug: string): string | null {
  const text = leads[kind]?.[slug];
  if (typeof text !== "string") return null;
  const trimmed = text.trim();
  return trimmed.length ? trimmed : null;
}

export function allLeadEntries(): { kind: LeadKind; slug: string; text: string }[] {
  const rows: { kind: LeadKind; slug: string; text: string }[] = [];
  for (const kind of ["vs", "questions"] as const) {
    for (const [slug, text] of Object.entries(leads[kind] ?? {})) {
      if (typeof text === "string" && text.trim()) rows.push({ kind, slug, text: text.trim() });
    }
  }
  return rows;
}
