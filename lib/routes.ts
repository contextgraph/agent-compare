import { agents, displayName, slugFor } from "./data";
import { leadFor } from "./leads";
import { questionsFor, type Question } from "./questions";
import { CATEGORY, SITE_NAME } from "./site";
import type { Agent } from "./types";

export type Pair = { slug: string; a: Agent; b: Agent };

export type RouteKind = "home" | "agent" | "vs" | "question" | "about";

export type SiteRoute = {
  path: string;
  kind: RouteKind;
  title: string;
  description: string;
  slug: string;
};

export function pairsFor(list: Agent[] = agents): Pair[] {
  const pairs: Pair[] = [];
  for (let i = 0; i < list.length; i += 1) {
    for (let j = i + 1; j < list.length; j += 1) {
      const a = list[i];
      const b = list[j];
      if (!a || !b) continue;
      pairs.push({ a, b, slug: `${slugFor(a)}-vs-${slugFor(b)}` });
    }
  }
  return pairs;
}

export function pairBySlug(slug: string): Pair | undefined {
  return pairsFor().find((pair) => pair.slug === slug);
}

export function questions(): Question[] {
  return questionsFor();
}

export function shouldIndex(kind: RouteKind, slug = ""): boolean {
  if (kind === "vs") return Boolean(leadFor("vs", slug));
  if (kind === "question") return Boolean(leadFor("questions", slug));
  return true;
}

export function siteRoutes(): SiteRoute[] {
  const routes: SiteRoute[] = [
    {
      path: "/",
      kind: "home",
      slug: "",
      title: SITE_NAME,
      description: `sourced comparison of ${CATEGORY}. every claim has a source and a checked-on date. no rankings and no paid placement.`,
    },
    {
      path: "/about",
      kind: "about",
      slug: "about",
      title: `about — ${SITE_NAME}`,
      description: `how ${SITE_NAME} works: every claim is sourced and dated, the dataset is refreshed weekly, and there is no paid placement.`,
    },
  ];
  for (const agent of agents) {
    const name = displayName(agent);
    routes.push({
      path: `/agents/${slugFor(agent)}`,
      kind: "agent",
      slug: slugFor(agent),
      title: `${name} — ${SITE_NAME}`,
      description: `sourced facts for ${name}. every claim has a source and a checked-on date.`,
    });
  }
  for (const pair of pairsFor()) {
    const title = `${displayName(pair.a)} vs ${displayName(pair.b)}`;
    routes.push({
      path: `/vs/${pair.slug}`,
      kind: "vs",
      slug: pair.slug,
      title: `${title} — ${SITE_NAME}`,
      description: leadFor("vs", pair.slug) ?? `${title}. sourced side by side.`,
    });
  }
  for (const question of questions()) {
    routes.push({
      path: `/questions/${question.slug}`,
      kind: "question",
      slug: question.slug,
      title: `${question.title} — ${SITE_NAME}`,
      description: leadFor("questions", question.slug) ?? question.title,
    });
  }
  return routes;
}

export function indexableRoutes(): SiteRoute[] {
  return siteRoutes().filter((route) => shouldIndex(route.kind, route.slug));
}
