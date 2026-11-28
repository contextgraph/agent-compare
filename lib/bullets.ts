import { isFact, slugFor } from "./data";
import { present, stringLeaves } from "./focus";
import type { Column } from "./columns";
import type { Agent, Fact } from "./types";

export type SourceRef = { href: string; checked_on: string };

export type Bullet = {
  text: string;
  sources: SourceRef[];
  checked_on: string;
  unverified: boolean;
  /** Exact slice of a fact value, before any ellipsis. */
  excerpt?: string;
};

const MAX = 150;

function usd(fact: Fact | undefined): boolean {
  return Boolean(fact && typeof fact.value === "string" && /^\s*usd\b/i.test(fact.value));
}

function shortPlanName(name: string): string {
  const cut = name.split(" (")[0]?.trim();
  return (cut || name).toLowerCase();
}

function priceText(value: unknown): string | null {
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  if (value && typeof value === "object" && !Array.isArray(value)) {
    const bits = Object.entries(value as Record<string, unknown>)
      .filter((entry): entry is [string, number] => typeof entry[1] === "number" && Number.isFinite(entry[1]))
      .map(([key, amount]) => `${key.replaceAll("_", " ")} ${amount}`);
    return bits.length ? bits.join(" · ") : null;
  }
  return null;
}

function periodSuffix(billing: Fact | undefined, priceIsObject: boolean): string {
  if (priceIsObject || !billing || typeof billing.value !== "string") return "";
  const text = billing.value.toLowerCase();
  if (text.includes("month")) return " per month";
  if (text.includes("year")) return " per year";
  return "";
}

function refs(...facts: Array<Fact | undefined>): SourceRef[] {
  const seen = new Set<string>();
  const out: SourceRef[] = [];
  for (const fact of facts) {
    if (!fact || typeof fact.source !== "string" || !fact.checked_on) continue;
    const key = `${fact.source}|${fact.checked_on}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ href: fact.source, checked_on: fact.checked_on });
  }
  return out;
}

export function priceBullets(agent: Agent): Bullet[] {
  if (!Array.isArray(agent.plans)) return [];
  const sourced: Bullet[] = [];
  const missing: string[] = [];
  let missingChecked = "";
  for (const plan of agent.plans) {
    if (!plan || typeof plan !== "object") continue;
    const record = plan as Record<string, unknown>;
    if (!isFact(record.name) || !isFact(record.price)) continue;
    const name = typeof record.name.value === "string" ? shortPlanName(record.name.value) : "plan";
    const formatted = priceText(record.price.value);
    if (formatted == null) {
      missing.push(name);
      missingChecked = record.price.checked_on;
      continue;
    }
    const currency = isFact(record.currency) ? record.currency : undefined;
    const billing = isFact(record.billing_unit) ? record.billing_unit : undefined;
    const objectPrice = typeof record.price.value === "object" && record.price.value != null;
    const suffix = usd(currency) ? ` usd${periodSuffix(billing, objectPrice)}` : "";
    sourced.push({
      text: `${name} ${formatted}${suffix}`,
      sources: refs(
        record.price,
        record.name,
        suffix.includes("usd") ? currency : undefined,
        suffix.includes("per") ? billing : undefined,
      ),
      checked_on: record.price.checked_on,
      unverified: false,
    });
  }
  const bullets: Bullet[] = [];
  if (sourced.length) {
    const checked = sourced.every((item) => item.checked_on === sourced[0]?.checked_on)
      ? sourced[0]?.checked_on ?? ""
      : sourced.map((item) => item.checked_on).join(", ");
    bullets.push({
      text: sourced.map((item) => item.text).join(" · "),
      sources: refsFrom(sourced.flatMap((item) => item.sources)),
      checked_on: checked,
      unverified: false,
    });
  }
  if (missing.length) {
    bullets.push({
      text: `unverified: ${missing.join(", ")}`,
      sources: [],
      checked_on: missingChecked,
      unverified: true,
    });
  }
  return bullets;
}

function refsFrom(items: SourceRef[]): SourceRef[] {
  const seen = new Set<string>();
  const out: SourceRef[] = [];
  for (const item of items) {
    const key = `${item.href}|${item.checked_on}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }
  return out;
}

function firstSubstantial(parts: string[]): string | null {
  return parts.find((part) => part.length >= 40) ?? parts[0] ?? null;
}

function clip(exact: string): { text: string; excerpt: string } {
  const clean = exact.replace(/\s+/g, " ").trim();
  if (clean.length <= MAX) return { text: clean, excerpt: clean };
  const cut = clean.slice(0, MAX);
  const space = cut.lastIndexOf(" ");
  const excerpt = (space > 40 ? cut.slice(0, space) : cut).trim();
  return { text: `${excerpt}…`, excerpt };
}

export function proseBullet(agent: Agent, fact: Fact): Bullet {
  const view = present(agent, fact);
  const primary = stringLeaves(view.primary);
  const rest = stringLeaves(view.rest);
  const sourceText = firstSubstantial(primary) ?? firstSubstantial(rest);
  if (!sourceText) {
    return {
      text: "unverified",
      sources: [],
      checked_on: fact.checked_on,
      unverified: true,
    };
  }
  const clipped = clip(sourceText);
  return {
    text: clipped.text,
    excerpt: clipped.excerpt,
    sources: refs(fact),
    checked_on: fact.checked_on,
    unverified: false,
  };
}

export function columnBullets(agent: Agent, column: Column): Bullet[] {
  if (column.id === "price") return priceBullets(agent);
  const facts = column.slots(agent).map((slot) => slot.fact);
  if (!facts.length) {
    return [{ text: "unverified", sources: [], checked_on: "", unverified: true }];
  }
  return facts.map((fact) => proseBullet(agent, fact));
}

export function detailsHref(agent: Agent, columnId: string): string {
  return `/agents/${slugFor(agent)}#${columnId}`;
}
