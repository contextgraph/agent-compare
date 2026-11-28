/** Public site origin. Override with NEXT_PUBLIC_SITE_URL. */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://agent-compare-three.vercel.app"
).replace(/\/$/, "");

export const SITE_NAME = "The Personal Agent Guide";

/** Category this site covers, used where that category is described. */
export const CATEGORY =
  "personal agents (ai that acts for one person across email, calendar, browser, files and errands)";

/** Shown on the Grok Bot row and on /about. Not a product claim. */
export const KEEPER_NOTE =
  "this site's keeper runs on Grok Bot; its row follows the same sourcing rules as the rest.";

export const CORRECTIONS_URL =
  "https://github.com/contextgraph/agent-compare/issues";
