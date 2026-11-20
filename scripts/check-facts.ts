import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { columnBullets } from "../lib/bullets";
import { aliasFacts, columnsFor, identitySlots, renderedFacts } from "../lib/columns";
import { agents, isFact, latestCheckedOn, walkFacts, displayName, slugFor } from "../lib/data";
import { present, stringLeaves } from "../lib/focus";
import { allLeadEntries, leadFor } from "../lib/leads";
import { indexableRoutes, pairsFor, questions, shouldIndex } from "../lib/routes";
import { KEEPER_NOTE } from "../lib/site";
import type { Fact } from "../lib/types";

const errors: string[] = [];
const fail = (message: string) => errors.push(message);

function words(value: string): string[] {
  return value
    .toLowerCase()
    .split(/\s+/)
    .map((word) => word.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, ""))
    .filter(Boolean);
}

function assertShape(fact: Fact, where: string) {
  if (typeof fact.checked_on !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(fact.checked_on)) {
    fail(`${where} missing checked_on`);
  }
  if (fact.note != null && typeof fact.note !== "string") fail(`${where} note is not a string`);
  if (fact.value == null) return;
  if (typeof fact.source !== "string" || !/^https:\/\/\S+$/.test(fact.source)) {
    fail(`${where} has a value without an https source`);
  }
}

for (const agent of agents) {
  if (!agent.id) fail("agent missing id");
  const walked = walkFacts(agent, agent.id);
  for (const item of walked) assertShape(item.fact, item.path);
  const rendered = new Set(renderedFacts(agent));
  for (const item of walked) {
    if (!rendered.has(item.fact)) fail(`unmapped fact ${item.path}`);
  }
  for (const fact of rendered) {
    if (fact.value == null) continue;
    if (typeof fact.source !== "string" || !fact.source || !/^\d{4}-\d{2}-\d{2}$/.test(fact.checked_on)) {
      fail(`rendered fact for ${agent.id} lacks source or checked_on`);
    }
  }
  if (!Array.isArray(agent.aliases)) fail(`${agent.id} aliases must be an array`);
  for (const [index, alias] of aliasFacts(agent).entries()) {
    if (alias.value == null || typeof alias.source !== "string") {
      fail(`${agent.id} alias ${index} is missing a sourced value`);
    }
  }
  for (const slot of identitySlots(agent)) {
    const view = slot.plain ? null : present(agent, slot.fact);
    if (!view || typeof slot.fact.value !== "string") continue;
    for (const excerpt of view.excerpts) {
      if (!slot.fact.value.includes(excerpt)) fail(`excerpt not in ${agent.id} ${slot.label}: ${excerpt.slice(0, 80)}`);
    }
  }
  for (const fact of rendered) {
    if (!focusApplies(agent) || typeof fact.value !== "string") continue;
    const view = present(agent, fact);
    const leaves = stringLeaves(fact.value);
    for (const excerpt of view.excerpts) {
      if (!leaves.some((leaf) => leaf.includes(excerpt))) {
        fail(`split excerpt is not a substring for ${agent.id}`);
      }
    }
    const sourceWords = leaves.flatMap(words);
    const shownWords = [...stringLeaves(view.primary), ...stringLeaves(view.related), ...stringLeaves(view.rest)].flatMap(words);
    const bag = [...shownWords];
    for (const word of sourceWords) {
      const index = bag.indexOf(word);
      if (index < 0) {
        fail(`split dropped a word for ${agent.id}: ${word}`);
        break;
      }
      bag.splice(index, 1);
    }
  }
}

function focusApplies(agent: { id: string }) {
  return agent.id === "openai-chatgpt-agent" || agent.id === "anthropic-claude-agent";
}

if (KEEPER_NOTE !== "this site's keeper runs on Grok Bot; its row follows the same sourcing rules as the rest.") {
  fail("keeper note changed");
}

const corpus = JSON.stringify(agents);
const banned = /40\/400|40 messages|400 messages|\bbest\b|\bwinner\b|\bcheapest\b|\branking\b|\baffiliate\b|\brecommend\b/i;

function sentenceCount(text: string): number {
  const stripped = text.replace(/https?:\/\/[^\s)]+/g, "url");
  return stripped.split(/(?<=[.?!])\s+/).filter((part) => part.trim()).length;
}

const seen = new Set<string>();
const skeletons = new Map<string, string>();
for (const entry of allLeadEntries()) {
  if (seen.has(entry.text)) fail(`duplicate lead for ${entry.kind} ${entry.slug}`);
  seen.add(entry.text);
  if (banned.test(entry.text)) fail(`lead has a banned claim: ${entry.kind} ${entry.slug}`);
  const count = sentenceCount(entry.text);
  if (count < 1 || count > 3) fail(`${entry.kind} ${entry.slug} has ${count} sentences`);
  for (const url of entry.text.match(/https?:\/\/[^\s),]+/g) ?? []) {
    if (!corpus.includes(url)) fail(`lead cites a url that is not in the dataset: ${url}`);
  }
  const skeleton = entry.text.toLowerCase().replaceAll(displayName(agents[0]!).toLowerCase(), "{a}");
  void skeleton;
}

const names = agents.flatMap((agent) => [displayName(agent), agent.id, slugFor(agent)]).sort((a, b) => b.length - a.length);
for (const entry of allLeadEntries()) {
  let skeleton = entry.text.toLowerCase();
  for (const name of names) skeleton = skeleton.split(name.toLowerCase()).join("{a}");
  skeleton = skeleton.replace(/\s+/g, " ").trim();
  const previous = skeletons.get(skeleton);
  if (previous) fail(`name-swapped lead: ${previous} and ${entry.kind}:${entry.slug}`);
  skeletons.set(skeleton, `${entry.kind}:${entry.slug}`);
}

for (const pair of pairsFor()) {
  const lead = leadFor("vs", pair.slug);
  if (!lead) fail(`missing vs lead ${pair.slug}`);
  else {
    if (!lead.includes(displayName(pair.a)) || !lead.includes(displayName(pair.b))) {
      fail(`vs lead does not name both products: ${pair.slug}`);
    }
  }
  if (!shouldIndex("vs", pair.slug)) fail(`vs page would be dropped from the sitemap: ${pair.slug}`);
}
for (const question of questions()) {
  if (!leadFor("questions", question.slug)) fail(`missing question lead ${question.slug}`);
  if (!shouldIndex("question", question.slug)) fail(`question page would be dropped from the sitemap: ${question.slug}`);
}
if (shouldIndex("vs", "missing-slug")) fail("missing leads must be excluded from the sitemap");
const indexed = new Set(indexableRoutes().map((route) => route.path));
for (const pair of pairsFor()) {
  const path = `/vs/${pair.slug}`;
  if (leadFor("vs", pair.slug) && !indexed.has(path)) fail(`sitemap missing ${path}`);
  if (!leadFor("vs", pair.slug) && indexed.has(path)) fail(`sitemap includes lead-less ${path}`);
}
if (!indexed.has("/agents/openai-dots") || !indexed.has("/agents/claude-duet") || !indexed.has("/agents/google-tasks-in-gemini")) {
  fail("expected slugs openai-dots, claude-duet, and google-tasks-in-gemini");
}
if (indexed.has("/agents/google-gemini-agent") || [...indexed].some((path) => path.includes("google-gemini-agent"))) {
  fail("old google slug is still indexable");
}
if (indexed.has("/agents/openai-chatgpt-agent") || indexed.has("/agents/anthropic-claude-agent")) {
  fail("old product slugs are still indexable");
}

const source = [
  "app",
  "components",
  "lib",
  "scripts",
].flatMap((dir) => readTree(dir));
for (const file of source) {
  if (!/\.(ts|tsx)$/.test(file)) continue;
  const text = readFileSync(file, "utf8");
  if (file !== "scripts/check-facts.ts" && text.includes("FAQPage")) fail(`${file} uses FAQPage`);
  if (/40\/400|40 messages\/month|400 messages\/month/.test(text)) fail(`${file} hardcodes a retired quota`);
}

if (!latestCheckedOn()) fail("no checked_on dates");

for (const agent of agents) {
  for (const column of columnsFor()) {
    for (const bullet of columnBullets(agent, column)) {
      if (bullet.unverified) continue;
      if (!bullet.sources.length || !/^\d{4}-\d{2}-\d{2}$/.test(bullet.checked_on)) {
        fail(`compact cell missing source or checked_on: ${agent.id} ${column.id}`);
      }
      for (const source of bullet.sources) {
        if (!/^https:\/\/\S+$/.test(source.href) || !corpus.includes(source.href)) {
          fail(`compact source is not in the dataset: ${agent.id} ${column.id} ${source.href}`);
        }
        if (!/^\d{4}-\d{2}-\d{2}$/.test(source.checked_on)) {
          fail(`compact source missing checked_on: ${agent.id} ${column.id}`);
        }
      }
      if (bullet.excerpt) {
        const hay = column
          .slots(agent)
          .map((slot) => (typeof slot.fact.value === "string" ? slot.fact.value : JSON.stringify(slot.fact.value)))
          .join("\n")
          .replace(/\s+/g, " ");
        if (!hay.includes(bullet.excerpt.replace(/\s+/g, " "))) {
          fail(`compact excerpt is not in the fact: ${agent.id} ${column.id}`);
        }
      }
      if (column.id === "price") {
        const plans = JSON.stringify(agent.plans);
        for (const number of bullet.text.match(/\d+(?:\.\d+)?/g) ?? []) {
          if (!plans.includes(number)) fail(`price ${number} is not in ${agent.id} plans`);
        }
      }
    }
  }
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log(`ok: ${agents.length} agents, ${walkFacts({ agents }, "").length} facts, ${indexableRoutes().length} indexable pages`);

function readTree(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) out.push(...readTree(path));
    else out.push(path);
  }
  return out;
}
