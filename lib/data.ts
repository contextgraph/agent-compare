import { readFileSync } from "node:fs";
import { join } from "node:path";
import agentsJson from "../data/agents.json";
import changelogJson from "../data/changelog.json";
import type { Agent, ChangelogEntry, Fact } from "./types";

export const agents = agentsJson as Agent[];
export const changelog = changelogJson as ChangelogEntry[];

export function unverifiedMarkdown(): string {
  return readFileSync(join(process.cwd(), "data/UNVERIFIED.md"), "utf8");
}

export function isFact(value: unknown): value is Fact {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const rec = value as Record<string, unknown>;
  return "value" in rec && "source" in rec && "checked_on" in rec;
}

export function walkFacts(
  node: unknown,
  path: string,
  acc: { path: string; fact: Fact }[] = [],
): { path: string; fact: Fact }[] {
  if (Array.isArray(node)) {
    node.forEach((item, i) => walkFacts(item, `${path}[${i}]`, acc));
    return acc;
  }
  if (!node || typeof node !== "object") return acc;
  if (isFact(node)) {
    acc.push({ path, fact: node });
    return acc;
  }
  for (const [key, value] of Object.entries(node)) {
    if (key === "id") continue;
    const next = path ? `${path}.${key}` : key;
    walkFacts(value, next, acc);
  }
  return acc;
}

export function latestCheckedOn(facts: Fact[] = allFacts()): string {
  const dates = facts
    .map((fact) => fact.checked_on)
    .filter((date) => /^\d{4}-\d{2}-\d{2}$/.test(date));
  dates.sort();
  return dates[dates.length - 1] ?? "";
}

export function allFacts(): Fact[] {
  return agents.flatMap((agent) => walkFacts(agent, agent.id).map((item) => item.fact));
}

export function agentBySlug(slug: string): Agent | undefined {
  return agents.find((agent) => slugFor(agent) === slug);
}

export function slugFor(agent: Agent): string {
  if (agent.id === "openai-chatgpt-agent") return "openai-dots";
  if (agent.id === "anthropic-claude-agent") return "claude-duet";
  if (agent.id === "google-gemini-agent") return "google-tasks-in-gemini";
  return agent.id;
}

export function displayName(agent: Agent): string {
  if (agent.id === "openai-chatgpt-agent") return "OpenAI dots";
  if (agent.id === "anthropic-claude-agent") return "Claude Duet";
  if (agent.id === "google-gemini-agent") return "Tasks in Gemini";
  if (isFact(agent.name) && typeof agent.name.value === "string" && agent.name.value.trim()) {
    const cut = agent.name.value.split(" (")[0]?.trim();
    return cut || agent.name.value;
  }
  return agent.id;
}

export function fullName(agent: Agent): string {
  if (isFact(agent.name) && typeof agent.name.value === "string" && agent.name.value.trim()) {
    return agent.name.value;
  }
  return displayName(agent);
}

export function isKeeperRow(agent: Agent): boolean {
  if (agent.id === "xai-grok-bot") return true;
  return fullName(agent).toLowerCase().includes("grok bot");
}

export function relatedLabel(agent: Agent): string | null {
  if (agent.id === "openai-chatgpt-agent") return "related: ChatGPT Work";
  if (agent.id === "anthropic-claude-agent") return "related: Claude Cowork";
  return null;
}

export type Focus = "dots" | "duet";

export function focusOf(agent: Agent): Focus | null {
  if (agent.id === "openai-chatgpt-agent") return "dots";
  if (agent.id === "anthropic-claude-agent") return "duet";
  return null;
}
