import { isFact } from "./data";
import type { Agent } from "./types";

export const HOME_INTRO =
  "agent compare is where you compare the personal ai agents from the big labs: what they cost, what they can do for you, and how they ask before acting. every fact is sourced and dated.";

export function datasetDetail(list: Agent[]): string {
  let sourced = 0;
  let missing = 0;
  for (const agent of list) {
    if (!Array.isArray(agent.plans)) continue;
    for (const plan of agent.plans) {
      if (!plan || typeof plan !== "object") continue;
      const price = (plan as { price?: unknown }).price;
      if (!isFact(price)) continue;
      if (price.value == null) missing += 1;
      else sourced += 1;
    }
  }
  return `on the openai and anthropic rows the products are OpenAI dots and Claude Duet. ChatGPT Work and Claude Cowork stay labeled related, and a cell says unverified when that product has no sourced text of its own. ${sourced} of ${sourced + missing} plan prices are sourced and ${missing} are unverified.`;
}

export function checkedLine(date: string): string {
  return date ? `last checked ${date}` : "last checked date is not in the dataset";
}
