import { aliasFacts, columnsFor, identitySlots } from "./columns";
import { displayName, latestCheckedOn, slugFor, agents } from "./data";
import { present, stringLeaves } from "./focus";
import { indexableRoutes, questions } from "./routes";
import { SITE_URL } from "./site";
import type { Agent, Fact } from "./types";

function link(path: string, label: string): string {
  return `- [${label}](${SITE_URL}${path})`;
}

export function llmsIndex(): string {
  const lines = [
    "# agent compare",
    "",
    "> sourced comparison of personal ai agents. every claim has a source and a checked-on date. no rankings. no paid placement.",
    "",
    `last checked ${latestCheckedOn()}.`,
    "",
    "## pages",
    ...indexableRoutes().map((route) => link(route.path, route.title)),
    "",
    "## questions",
    ...questions().map((question) => link(`/questions/${question.slug}`, question.title)),
    "",
  ];
  return `${lines.join("\n")}\n`;
}

function factBlock(agent: Agent, label: string, fact: Fact, plain?: boolean): string[] {
  const view = plain ? { unverified: fact.value == null, primary: fact.value, rest: null, related: null, relatedLabel: null } : present(agent, fact);
  const lines = [`### ${label}`];
  if (view.unverified) lines.push("unverified");
  for (const text of stringLeaves(view.primary)) lines.push(text);
  if (typeof view.primary === "number" || typeof view.primary === "boolean") lines.push(String(view.primary));
  for (const text of stringLeaves(view.rest)) lines.push(text);
  if (view.relatedLabel) {
    lines.push(view.relatedLabel);
    for (const text of stringLeaves(view.related)) lines.push(text);
  }
  if (fact.note) lines.push(`data note: ${fact.note}`);
  if (fact.source) lines.push(`source: ${fact.source}`);
  lines.push(`checked on ${fact.checked_on}`);
  lines.push("");
  return lines;
}

function agentText(agent: Agent): string[] {
  const lines = [`## ${displayName(agent)}`, link(`/agents/${slugFor(agent)}`, displayName(agent)), ""];
  for (const slot of identitySlots(agent)) lines.push(...factBlock(agent, slot.label, slot.fact, slot.plain));
  const aliases = aliasFacts(agent);
  if (aliases.length) {
    lines.push("### also called", "");
    aliases.forEach((fact, index) => lines.push(...factBlock(agent, `alias ${index + 1}`, fact, true)));
  }
  for (const column of columnsFor()) {
    for (const slot of column.slots(agent)) lines.push(...factBlock(agent, slot.label, slot.fact, slot.plain));
  }
  return lines;
}

export function llmsFull(): string {
  const lines = [
    "# agent compare",
    "",
    "full sourced record. a line without a source is not a claim. unverified means the dataset has no value for that product.",
    "",
    ...agents.flatMap((agent) => agentText(agent)),
  ];
  return `${lines.join("\n")}\n`;
}
