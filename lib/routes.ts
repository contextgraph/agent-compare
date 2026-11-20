import { HOME_INTRO } from "./copy";
import { agents, displayName, slugFor } from "./data";
import { leadFor } from "./leads";
import { questionsFor, type Question } from "./questions";
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
      title: "agent compare",
      description: HOME_INTRO,
    },
    {
      path: "/about",
      kind: "about",
      slug: "about",
      title: "about — agent compare",
      description:
        "how agent compare works: every claim is sourced and dated, the dataset is refreshed weekly, and there is no paid placement.",
    },
  ];
  for (const agent of agents) {
    const name = displayName(agent);
    routes.push({
      path: `/agents/${slugFor(agent)}`,
      kind: "agent",
      slug: slugFor(agent),
      title: `${name} — agent compare`,
      description: `sourced facts for ${name}. every claim has a source and a checked-on date.`,
    });
  }
  for (const pair of pairsFor()) {
    const title = `${displayName(pair.a)} vs ${displayName(pair.b)}`;
    routes.push({
      path: `/vs/${pair.slug}`,
      kind: "vs",
      slug: pair.slug,
      title: `${title} — agent compare`,
      description: leadFor("vs", pair.slug) ?? `${title}. sourced side by side.`,
    });
  }
  for (const question of questions()) {
    routes.push({
      path: `/questions/${question.slug}`,
      kind: "question",
      slug: question.slug,
      title: `${question.title} — agent compare`,
      description: leadFor("questions", question.slug) ?? question.title,
    });
  }
  return routes;
}

export function indexableRoutes(): SiteRoute[] {
  return siteRoutes().filter((route) => shouldIndex(route.kind, route.slug));
}
