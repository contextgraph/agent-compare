# agent compare

public comparison of personal ai agents (assistants that act for one person). not coding agents.

## no source, no claim

every fact on the site comes from `data/agents.json`. a fact is:

```json
{ "value": "…", "source": "https://…", "checked_on": "YYYY-MM-DD", "note": "optional" }
```

if `value` is null, the site shows **unverified** and does not fill one in. a rendered value with no `source` or no `checked_on` fails `npm run build` (`scripts/check-facts.ts`).

do not add numbers, features, quotes, or reviews that are not in the data. do not rank agents. do not add affiliate links. the only opinion on the site is the keeper's note on the Grok Bot row.

`aliases` is an array of the same fact objects. empty until sourced. they render as "also called …" and as `alternateName` in JSON-LD.

`data/leads.json` holds the plain-language opening for every `/vs` and `/questions` page. a page without a unique lead is left out of the sitemap and fails the check.

## rows

the openai row is **OpenAI dots** (`/agents/openai-dots`). the anthropic row is **Claude Duet** (`/agents/claude-duet`). the google row is **Tasks in Gemini** (`/agents/google-tasks-in-gemini`). Gemini Agent and Spark stay in aliases only. ChatGPT Work and Claude Cowork text stays in the dataset and is labeled `related: ChatGPT Work` or `related: Claude Cowork`. if a field has only that related text, the product cell says unverified.

data notes render next to the value they belong to.

## columns

price and limits; email, calendar, browser, files, messaging, payments; schedule while away; memory; asks before sending or spending; where it runs; training; retention; platforms. extra fact keys in the json are rendered too.

comparison tables show a short line taken from those sourced values, with the source link and checked-on date. the full text, data notes, and related-product text are on the agent page.

## commands

```bash
npm install
npm run build
```

`NEXT_PUBLIC_SITE_URL` defaults to `https://agent-compare-three.vercel.app`.
