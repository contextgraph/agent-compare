import { focusOf, relatedLabel, type Focus } from "./data";
import type { Agent, Fact } from "./types";

const DOTS = /\bdots?\b/i;
const WORK =
  /\bWork\b|cloud[ -]browser|Cloud[ -]browser|scheduled tasks?|Scheduled tasks?|scheduled-task|Event-triggered|event-triggered/;
const DUET = /\bDuet\b/;
const COWORK = /\bCowork\b|\bClaude in Chrome\b|\bcomputer use\b|\bcomputer-use\b/i;
const STARTS_RELATED =
  /^(work\b|cloud[ -]browser|claude in chrome|cowork\b|computer use|computer-use)/i;

export type Partition = {
  primary: unknown;
  related: unknown;
  rest: unknown;
  /** Strings shown from a split. Each must be an exact excerpt of the fact value. */
  excerpts: string[];
  unverified: boolean;
  relatedLabel: string | null;
};

function tokens(text: string, focus: Focus): { product: boolean; related: boolean } {
  if (focus === "dots") return { product: DOTS.test(text), related: WORK.test(text) };
  return { product: DUET.test(text), related: COWORK.test(text) };
}

function splitSentences(text: string): string[] {
  const parts = text.split(/(?<=[.!?])\s+(?=[A-Z"“'(])/);
  return parts.map((part) => part.trim()).filter(Boolean);
}

function splitClauses(sentence: string): string[] {
  const parts: string[] = [];
  let current = "";
  let depth = 0;
  for (let i = 0; i < sentence.length; i += 1) {
    const char = sentence[i] ?? "";
    if (char === "(") depth += 1;
    if (char === ")" && depth > 0) depth -= 1;
    if ((char === "," || char === ";") && depth === 0) {
      const piece = current.trim();
      if (piece) parts.push(piece);
      current = "";
      continue;
    }
    current += char;
  }
  const tail = current.trim();
  if (tail) parts.push(tail);
  return parts.length ? parts : [sentence.trim()];
}

function partitionString(text: string, focus: Focus): Partition {
  const excerpts: string[] = [];
  const buckets: Record<"primary" | "related" | "rest", string[]> = {
    primary: [],
    related: [],
    rest: [],
  };
  let current: "primary" | "related" | "rest" = "rest";
  const take = (bucket: "primary" | "related" | "rest", piece: string) => {
    current = bucket;
    buckets[bucket].push(piece);
    excerpts.push(piece);
  };
  for (const sentence of splitSentences(text)) {
    const flags = tokens(sentence, focus);
    if (flags.product && flags.related) {
      for (const clause of splitClauses(sentence)) {
        const clauseFlags = tokens(clause, focus);
        if (STARTS_RELATED.test(clause) && clauseFlags.related) take("related", clause);
        else if (clauseFlags.product) take("primary", clause);
        else if (clauseFlags.related) take("related", clause);
        else take(current, clause);
      }
      continue;
    }
    if (flags.product) take("primary", sentence);
    else if (flags.related) take("related", sentence);
    else take(current, sentence);
  }
  return {
    primary: buckets.primary.length ? buckets.primary : null,
    related: buckets.related.length ? buckets.related : null,
    rest: buckets.rest.length ? buckets.rest : null,
    excerpts,
    unverified: false,
    relatedLabel: null,
  };
}

function isEmpty(value: unknown): boolean {
  if (value == null) return true;
  if (typeof value === "string") return value.trim() === "";
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === "object") return Object.keys(value).length === 0;
  return false;
}

function mergePartitions(parts: Partition[], focus: Focus, label: string | null): Partition {
  const primary: unknown[] = [];
  const related: unknown[] = [];
  const rest: unknown[] = [];
  const excerpts: string[] = [];
  for (const part of parts) {
    if (!isEmpty(part.primary)) primary.push(part.primary);
    if (!isEmpty(part.related)) related.push(part.related);
    if (!isEmpty(part.rest)) rest.push(part.rest);
    excerpts.push(...part.excerpts);
  }
  const one = (items: unknown[]) => {
    if (!items.length) return null;
    if (items.length === 1) return items[0];
    return items;
  };
  const primaryValue = one(primary);
  const relatedValue = one(related);
  return {
    primary: primaryValue,
    related: relatedValue,
    rest: one(rest),
    excerpts,
    unverified: isEmpty(primaryValue) && !isEmpty(relatedValue),
    relatedLabel: !isEmpty(relatedValue) ? label : null,
  };
}

function force(part: Partition, bucket: "primary" | "related"): Partition {
  const items = [part.primary, part.related, part.rest].filter((item) => !isEmpty(item));
  const value = items.length <= 1 ? (items[0] ?? null) : items;
  return {
    primary: bucket === "primary" ? value : null,
    related: bucket === "related" ? value : null,
    rest: null,
    excerpts: part.excerpts,
    unverified: bucket === "related",
    relatedLabel: null,
  };
}

function partitionValue(value: unknown, focus: Focus, key?: string): Partition {
  if (focus === "dots" && key === "dots_usage") {
    return force(partitionValue(value, focus), "primary");
  }
  if (
    focus === "dots" &&
    (key === "work_usage" || key === "scheduled_tasks_active_limits")
  ) {
    return force(partitionValue(value, focus), "related");
  }
  if (typeof value === "string") return partitionString(value, focus);
  if (typeof value === "number" || typeof value === "boolean") {
    return {
      primary: value,
      related: null,
      rest: null,
      excerpts: [],
      unverified: false,
      relatedLabel: null,
    };
  }
  if (Array.isArray(value)) {
    return mergePartitions(
      value.map((item) => partitionValue(item, focus)),
      focus,
      null,
    );
  }
  if (value && typeof value === "object") {
    return mergePartitions(
      Object.entries(value).map(([childKey, child]) => {
        const part = partitionValue(child, focus, childKey);
        const wrap = (bucket: unknown) =>
          isEmpty(bucket) ? null : { [childKey]: bucket };
        return {
          ...part,
          primary: wrap(part.primary),
          related: wrap(part.related),
          rest: wrap(part.rest),
        };
      }),
      focus,
      null,
    );
  }
  return {
    primary: null,
    related: null,
    rest: null,
    excerpts: [],
    unverified: false,
    relatedLabel: null,
  };
}

export function plainPresent(fact: Fact): Partition {
  return {
    primary: fact.value ?? null,
    related: null,
    rest: null,
    excerpts: typeof fact.value === "string" ? [fact.value] : [],
    unverified: fact.value == null,
    relatedLabel: null,
  };
}

export function present(agent: Agent, fact: Fact): Partition {
  const focus = focusOf(agent);
  const label = relatedLabel(agent);
  if (!focus || fact.value == null) {
    return {
      primary: fact.value ?? null,
      related: null,
      rest: null,
      excerpts: [],
      unverified: fact.value == null,
      relatedLabel: null,
    };
  }
  const part = partitionValue(fact.value, focus);
  const unverified = isEmpty(part.primary) && isEmpty(part.rest) && !isEmpty(part.related);
  return {
    ...part,
    unverified,
    relatedLabel: !isEmpty(part.related) ? label : null,
  };
}

export function stringLeaves(value: unknown, acc: string[] = []): string[] {
  if (typeof value === "string") acc.push(value);
  else if (Array.isArray(value)) value.forEach((item) => stringLeaves(item, acc));
  else if (value && typeof value === "object") {
    Object.values(value).forEach((item) => stringLeaves(item, acc));
  }
  return acc;
}
