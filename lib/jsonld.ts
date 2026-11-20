import { aliasFacts } from "./columns";
import { agents, displayName, fullName, isFact, latestCheckedOn, slugFor } from "./data";
import { SITE_NAME, SITE_URL } from "./site";
import type { Agent, Fact } from "./types";

export type Json = Record<string, unknown>;

function usd(fact: Fact | undefined): boolean {
  return Boolean(fact && typeof fact.value === "string" && /^\s*usd\b/i.test(fact.value));
}

function priceLeaves(value: unknown): { key: string; amount: number }[] {
  if (typeof value === "number" && Number.isFinite(value)) return [{ key: "", amount: value }];
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return Object.entries(value as Record<string, unknown>)
      .filter((entry): entry is [string, number] => typeof entry[1] === "number" && Number.isFinite(entry[1]))
      .map(([key, amount]) => ({ key, amount }));
  }
  return [];
}

export function offersFor(agent: Agent): Json[] {
  if (!Array.isArray(agent.plans)) return [];
  const offers: Json[] = [];
  for (const plan of agent.plans) {
    if (!plan || typeof plan !== "object") continue;
    const record = plan as Record<string, unknown>;
    if (!isFact(record.price) || !isFact(record.currency) || !usd(record.currency)) continue;
    if (typeof record.price.source !== "string") continue;
    const name = isFact(record.name) && typeof record.name.value === "string" ? record.name.value : "";
    const billing =
      isFact(record.billing_unit) && typeof record.billing_unit.value === "string"
        ? record.billing_unit.value
        : undefined;
    for (const leaf of priceLeaves(record.price.value)) {
      offers.push({
        "@type": "Offer",
        ...(name ? { name: leaf.key ? `${name} (${leaf.key.replaceAll("_", " ")})` : name } : {}),
        price: String(leaf.amount),
        priceCurrency: "USD",
        url: record.price.source,
        ...(billing ? { description: billing } : {}),
      });
    }
  }
  return offers;
}

export function alternateNames(agent: Agent): string[] {
  const names = new Set<string>();
  for (const fact of aliasFacts(agent)) {
    if (typeof fact.value === "string" && fact.value.trim() && fact.source) names.add(fact.value.trim());
  }
  if (fullName(agent) !== displayName(agent)) names.add(fullName(agent));
  names.delete(displayName(agent));
  return [...names];
}

export function softwareApplication(agent: Agent): Json {
  const node: Json = {
    "@type": "SoftwareApplication",
    "@id": `${SITE_URL}/agents/${slugFor(agent)}#app`,
    name: displayName(agent),
    url: `${SITE_URL}/agents/${slugFor(agent)}`,
  };
  if (isFact(agent.type) && typeof agent.type.value === "string") node.description = agent.type.value;
  if (isFact(agent.vendor) && typeof agent.vendor.value === "string") {
    node.provider = { "@type": "Organization", name: agent.vendor.value };
  }
  const alternates = alternateNames(agent);
  if (alternates.length) node.alternateName = alternates;
  const offers = offersFor(agent);
  if (offers.length === 1) node.offers = offers[0];
  else if (offers.length > 1) node.offers = offers;
  return node;
}

export function breadcrumb(items: { name: string; path: string }[]): Json {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  };
}

export function webPage(options: {
  path: string;
  title: string;
  description: string;
  dateModified: string;
  article?: boolean;
  articleBody?: string;
}): Json {
  return {
    "@type": options.article ? ["WebPage", "Article"] : "WebPage",
    "@id": `${SITE_URL}${options.path}`,
    url: `${SITE_URL}${options.path}`,
    name: options.title,
    headline: options.title,
    description: options.description,
    dateModified: options.dateModified,
    isPartOf: { "@id": `${SITE_URL}/#website` },
    ...(options.articleBody ? { articleBody: options.articleBody } : {}),
  };
}

export function websiteNode(): Json {
  return {
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: SITE_NAME,
    url: SITE_URL,
    description:
      "sourced comparison of personal ai agents. every claim has a source and a checked-on date. no rankings. no paid placement.",
  };
}

export function graph(nodes: Json[]): Json {
  return { "@context": "https://schema.org", "@graph": [websiteNode(), ...nodes] };
}

export function siteDate(): string {
  return latestCheckedOn();
}

export function agentList(): Json {
  return {
    "@type": "ItemList",
    name: "personal ai agents in this dataset",
    itemListElement: agents.map((agent, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: displayName(agent),
      url: `${SITE_URL}/agents/${slugFor(agent)}`,
    })),
  };
}
