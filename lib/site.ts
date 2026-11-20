/** Public site origin. Override with NEXT_PUBLIC_SITE_URL. */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://agent-compare.vercel.app"
).replace(/\/$/, "");

export const SITE_NAME = "agent compare";

/** Shown on the Grok Bot row and on /about. Not a product claim. */
export const KEEPER_NOTE =
  "this site's keeper runs on Grok Bot; its row follows the same sourcing rules as the rest.";

export const CORRECTIONS_URL =
  "https://github.com/contextgraph/agent-compare/issues";
