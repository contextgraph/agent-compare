import { displayName, isFact } from "./data";
import type { Agent } from "./types";

export function homeIntro(list: Agent[]): string {
  const names = list.map((agent) => displayName(agent)).join(", ");
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
  return `agent compare lists ${list.length} personal ai agents: ${names}. on the openai and anthropic rows the products are OpenAI dots and Claude Duet; ChatGPT Work and Claude Cowork stay labeled related, and a cell says unverified when that product has no sourced text of its own. ${sourced} of ${sourced + missing} plan prices are sourced and ${missing} are unverified.`;
}

export function checkedLine(date: string): string {
  return date ? `last checked ${date}` : "last checked date is not in the dataset";
}
