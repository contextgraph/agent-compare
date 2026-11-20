import { agents, isFact } from "./data";
import type { Agent, Fact } from "./types";

export type Slot = {
  label: string;
  fact: Fact;
  /** Plan prices and names stay whole. Narrative fields may split. */
  plain?: boolean;
};

export type Column = {
  id: string;
  label: string;
  slots: (agent: Agent) => Slot[];
};

export type Group = {
  id: string;
  title: string;
  columns: Column[];
};

const ACCOUNT_ORDER = ["email", "calendar", "browser", "files", "messaging", "payments"];
const SIMPLE: [string, string][] = [
  ["schedule_or_away", "runs on a schedule while you're away"],
  ["memory", "memory"],
  ["approvals", "asks before sending or spending"],
  ["where_it_runs", "where it runs"],
];
const PLATFORMS: [string, string] = ["platforms", "platforms"];
const PRIVACY_LABELS: Record<string, string> = {
  training_on_your_data: "training on your data",
  retention: "retention",
};
const PLAN_KEYS = ["name", "price", "billing_unit", "currency", "included", "overage"];
const SKIP_KEYS = new Set([
  "id",
  "aliases",
  "name",
  "vendor",
  "homepage",
  "type",
  "plans",
  "usage_limits",
  "accounts_apps",
  "privacy",
  ...SIMPLE.map(([key]) => key),
  "platforms",
]);

function labelize(key: string): string {
  return key.replaceAll("_", " ");
}

function ordered(keys: string[], preferred: string[]): string[] {
  const rest = keys.filter((key) => !preferred.includes(key)).sort();
  return [...preferred.filter((key) => keys.includes(key)), ...rest];
}

function objectKeys(list: Agent[], key: "accounts_apps" | "privacy"): string[] {
  const found = new Set<string>();
  for (const agent of list) {
    const value = agent[key];
    if (value && typeof value === "object" && !Array.isArray(value)) {
      Object.keys(value).forEach((child) => found.add(child));
    }
  }
  return [...found];
}

function priceSlots(agent: Agent): Slot[] {
  const slots: Slot[] = [];
  if (Array.isArray(agent.plans)) {
    agent.plans.forEach((plan, index) => {
      if (!plan || typeof plan !== "object") return;
      const record = plan as Record<string, unknown>;
      const keys = [
        ...PLAN_KEYS.filter((key) => key in record),
        ...Object.keys(record).filter((key) => !PLAN_KEYS.includes(key)),
      ];
      for (const key of keys) {
        const fact = record[key];
        if (!isFact(fact)) continue;
        slots.push({
          label: `plan ${index + 1} ${labelize(key)}`,
          fact,
          plain: key !== "included" && key !== "overage",
        });
      }
    });
  }
  if (isFact(agent.usage_limits)) {
    slots.push({ label: "usage limits", fact: agent.usage_limits });
  }
  return slots;
}

export function columnsFor(list: Agent[] = agents): Column[] {
  const columns: Column[] = [
    {
      id: "price",
      label: "price and limits",
      slots: priceSlots,
    },
  ];
  for (const key of ordered(objectKeys(list, "accounts_apps"), ACCOUNT_ORDER)) {
    columns.push({
      id: `accounts_apps.${key}`,
      label: labelize(key),
      slots: (agent) => {
        const group = agent.accounts_apps;
        if (!group || typeof group !== "object") return [];
        const fact = (group as Record<string, unknown>)[key];
        return isFact(fact) ? [{ label: labelize(key), fact }] : [];
      },
    });
  }
  for (const [key, label] of [...SIMPLE, PLATFORMS]) {
    if (!list.some((agent) => isFact(agent[key]))) continue;
    columns.push({
      id: key,
      label,
      slots: (agent) => (isFact(agent[key]) ? [{ label, fact: agent[key] }] : []),
    });
  }
  for (const key of ordered(objectKeys(list, "privacy"), ["training_on_your_data", "retention"])) {
    const label = PRIVACY_LABELS[key] ?? labelize(key);
    columns.push({
      id: `privacy.${key}`,
      label,
      slots: (agent) => {
        const group = agent.privacy;
        if (!group || typeof group !== "object") return [];
        const fact = (group as Record<string, unknown>)[key];
        return isFact(fact) ? [{ label, fact }] : [];
      },
    });
  }
  const extra = new Set<string>();
  for (const agent of list) extraKeys(agent).forEach((key) => extra.add(key));
  for (const key of [...extra].sort()) {
    columns.push({
      id: key,
      label: labelize(key),
      slots: (agent) => (isFact(agent[key]) ? [{ label: labelize(key), fact: agent[key] }] : []),
    });
  }
  return columns;
}

function extraKeys(agent: Agent): string[] {
  return Object.keys(agent).filter((key) => {
    if (SKIP_KEYS.has(key)) return false;
    return isFact(agent[key]);
  });
}

export function groupsFor(list: Agent[] = agents): Group[] {
  const columns = columnsFor(list);
  const byId = new Map(columns.map((column) => [column.id, column]));
  const used = new Set<string>();
  const take = (ids: string[]) => {
    const found = ids.map((id) => byId.get(id)).filter((column): column is Column => Boolean(column));
    found.forEach((column) => used.add(column.id));
    return found;
  };
  const groups: Group[] = [];
  const price = take(["price"]);
  if (price.length) groups.push({ id: "price", title: "price and limits", columns: price });
  const accounts = take(columns.filter((column) => column.id.startsWith("accounts_apps.")).map((column) => column.id));
  if (accounts.length) {
    groups.push({ id: "accounts", title: "accounts and apps it can act in", columns: accounts });
  }
  for (const [key, title] of SIMPLE) {
    const found = take([key]);
    if (found.length) groups.push({ id: key, title, columns: found });
  }
  const privacy = take(columns.filter((column) => column.id.startsWith("privacy.")).map((column) => column.id));
  if (privacy.length) groups.push({ id: "privacy", title: "privacy", columns: privacy });
  const platforms = take(["platforms"]);
  if (platforms.length) groups.push({ id: "platforms", title: "platforms", columns: platforms });
  const rest = columns.filter((column) => !used.has(column.id));
  if (rest.length) groups.push({ id: "other", title: "other sourced fields", columns: rest });
  return groups;
}

export function identitySlots(agent: Agent): Slot[] {
  const slots: Slot[] = [];
  for (const key of ["name", "vendor", "homepage", "type"] as const) {
    const fact = agent[key];
    if (!isFact(fact)) continue;
    slots.push({ label: key, fact, plain: key !== "type" });
  }
  return slots;
}

export function aliasFacts(agent: Agent): Fact[] {
  if (!Array.isArray(agent.aliases)) return [];
  return agent.aliases.filter(isFact);
}

export function renderedFacts(agent: Agent, list: Agent[] = agents): Fact[] {
  const facts = [...identitySlots(agent).map((slot) => slot.fact), ...aliasFacts(agent)];
  for (const column of columnsFor(list)) {
    for (const slot of column.slots(agent)) facts.push(slot.fact);
  }
  return facts;
}

export function columnById(id: string, list: Agent[] = agents): Column | undefined {
  return columnsFor(list).find((column) => column.id === id);
}
