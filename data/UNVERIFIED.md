# Unverified fields and scope notes

Checked on: 2026-11-23. Every claim in `agents.json` is either sourced from an official vendor page fetched that day, or recorded as `value: null` with an `unverified:` note. A 23 November 2026 refresh re-fetched the cited source pages. Values changed only where a fetched official page stated a new figure. Claims that still matched had `checked_on` set to 2026-11-23.

A later pass the same day updated official product names and added sourced facts for OpenAI dots and Anthropic Claude Duet. Leftover limits and privacy text that were sourced only from the retired ChatGPT agent help article were removed from confirmed fields (see OpenAI section below). Each row now has a sourced `aliases` array.

No coding-agent dataset was written in this pass. `/workspace/agent-compare/data/_old-coding/` was created and is empty.

## Meta AI vs Muse, and Microsoft Copilot

Official Meta pages fetched today describe **Muse** as “your personal AI agent” that can connect to email and calendar, send email with approval, browse the web, and make purchases with confirmation (`muse.ai` help/privacy pages listed in `agents.json`).

This dataset therefore includes **Meta Muse**, not a separate Meta AI chatbot row. The general Meta AI assistant (for example on meta.ai, WhatsApp, Instagram, or Facebook) was not documented on the pages fetched today as a product that acts across a person’s email, calendar, and browser. Those acting features are documented for Muse.

Because Meta official pages do show a personal agent that can act across email, calendar, and browser, **Microsoft Copilot (Actions / Cowork / Tasks) was not added as an alternate**. Official Microsoft support pages for Copilot Cowork, Copilot Tasks, and Copilot Actions in Edge were located in search but were not used to build a comparison row.

## Unverified or incomplete fields (also marked in agents.json)

### OpenAI ChatGPT (Work and dots)
- ChatGPT Go dollar price: the Go help article points to chatgpt.com/pricing, but the fetched pricing page did not expose a Go dollar amount.
- ChatGPT Business / Enterprise per-seat dollar prices: not visible in the fetched pricing-page text.
- Exact current ChatGPT Work usage quotas (messages/tasks per plan): the Work help page says Work follows the Codex usage structure but does not publish a simple quota table. Official dots pages say conversations with a dot do not count toward ChatGPT usage limits, and that Work or Codex tasks a dot starts do count, but they do not publish a simple consumer message quota for dots themselves.
- The 40/400 monthly message limits (Plus 40, Pro 400, Business/Enterprise 40, or 30 credits/message on flexible pricing) still appear on the retired ChatGPT agent help page after that page states “ChatGPT agent is no longer available.” Those numbers were removed from confirmed `usage_limits` in the 20 Nov 2026 name-check update and should not be treated as current Work or dots quotas.
- Work-specific first-party Calendar connector / calendar write actions: still not clearly documented on Work, cloud-browser, or scheduled-task pages. Dots help does officially give a “review your calendar each morning” example; that is now recorded under `accounts_apps.calendar` as a dots fact only.
- Work-specific screenshot retention, 90-day deletion after a chat is deleted, and “agent-mode session” training language appeared only on the retired ChatGPT agent help page and were removed from confirmed privacy fields. Current dots privacy help covers dots context, encryption, and the “Improve the model for everyone” control; it does not restate a 90-day window.
- Enterprise dot prices are now sourced from a full fetch of the Enterprise dots pricing article: $50 per Standard dot, $200 per Advanced dot, and $500 per Expert dot for a full paid month, with no fee through 13 January 2027 and billing from 14 January 2027. ChatGPT Business and Enterprise per-seat dollar prices are still not on the fetched pricing pages.
- Free/Go overage or credit rates for Work: not found.
- Whether dots texting is generally available: the 29 September 2026 introducing-dots post said “texting coming soon.” This update did not find a later official help sentence confirming general availability, so it is recorded only as that “coming soon” wording.

### Anthropic Claude (Cowork and Claude Duet)
- Enterprise seat price is now on the pricing page: US$20 per seat per month, billed annually, 20-seat minimum, plus usage at API rates. A published volume-discount schedule is still not on that page. The Enterprise help article states the same seat price for self-serve and sales-assisted plans, with a 50-seat sales-assisted minimum.
- Exact credit-pack prices for usage credits / Fable credits: not extracted from the fetched pricing page.
- Cowork / Claude in Chrome / computer use: a first-party payments or checkout integration is still not clearly documented for those surfaces. Computer-use help says Claude is trained to avoid typing card numbers and to check before submitting forms.
- Claude Duet payments (Link and Shop Pay, one-time cards, ask-before-purchase) are now sourced from official Duet help and the Duet safety article. Itemized fees, regional availability of Link or Shop Pay, and any Cowork equivalent remain unverified.
- Full account-level retention periods beyond the 30-day Cowork-task deletion window: not fully specified on the pages fetched today. Official Duet safety pages say deleting the account wipes everything Duet has stored, and that memory can be reset in settings, but they do not state a numeric backend retention window comparable to Cowork’s 30-day task deletion period.
- A separate Duet-specific model-training opt-in rule was not stated on the Duet safety article; consumer Claude training controls are used instead.
- Claude Duet help states Personal Finance is not available in Duet, and that you cannot watch or take over Duet’s cloud browser during the research preview. Those limits are recorded in the relevant columns; a broader inventory of unavailable Claude features in Duet was not built.

### Google Gemini Tasks
- AI credit pack prices: mechanism is stated; pack amounts are not listed on the subscriptions page. Plus ($4.99/month) and Pro ($19.99/month) are now sourced from that US page. The page also shows a Black Friday banner ("Save up to 50% on select Google AI plans") and does not replace those card prices with a discounted amount.
- Numeric per-task costs: not published; only compute-based limits, a 15 concurrent-task cap, and 5-hour / weekly refresh language.
- Whether a still-separate Labs product named “Gemini Agent” exists: fetching `support.google.com/gemini/answer/16596215?hl=en` on 20 Nov 2026 still returned the current Tasks in Gemini help article. Official current names are Tasks in Gemini and the Chat/Task toggle; Spark / Gemini Spark is a former official name (Privacy Hub: “formerly known as Spark”). This entry documents Tasks in Gemini only.

### xAI Grok Bot
- Absolute size of the base weekly usage pool (tokens or hours): not published; only multipliers (Premium 4x, Super 15x, Ultra 50x vs Plus) plus top-ups. The Ultra card on x.ai/pricing fetched 23 November 2026 states $200/month and 50x, and does not include the earlier "earliest access" wording; that wording is marked unverified on the Ultra included fact.
- Enterprise and legacy SuperGrok / X Premium+ / Grok Business prices: not fetched as a complete current table.
- Backend retention period after account deletion: follows Cursor terms; a specific day count was not stated on the Grok Bot pages fetched today.
- A complete official inventory of every connectable app: not fully extracted from the long computer-and-apps doc (Gmail, Outlook, Calendar, Slack, Notion, wallets, and others are documented).

### Meta Muse
- Numeric free-plan token allowance: the subscriptions article confirms a refreshable free usage limit but does not state the number.
- Additional Muse token pack prices: the mechanism is documented; pack dollar amounts were not listed in the extracted text.
- Dedicated “runs while you are away / app closed” help article: scheduled tasks are confirmed as a stored-data category in the Muse Privacy Policy, but a full unattended-execution guide was not fetched today.
- ai.meta.com/muse/ and ai.meta.com/muse/productivity/ returned no extractable body when fetched; muse.ai and Meta Help Center pages were used instead.
- Server-side retention period after account deletion: not stated on the pages fetched today.

## Pages that were thin, redirected, or incomplete
- `https://chatgpt.com/pricing/` rendered plan names and feature comparison but Go, Business, and Enterprise dollar amounts were still missing from the page (Plus $20 and Pro $100/$200/$500 remain confirmed from official help articles). `https://openai.com/business/pricing/` also omits a Business per-seat dollar amount and lists Enterprise as custom pricing. A plain HTTP fetch of `https://x.ai/pricing` returned HTTP 403; a second fetch returned the plan cards, and those prices matched the docs page.
- `https://ai.meta.com/muse/` returned empty extractable content.
- `https://support.google.com/gemini/answer/16596215` (older “Use Gemini Agent” URL) returned the Tasks in Gemini article (`answer/17094507`).
- Some long official docs (Claude computer use, Claude Cowork, Gemini Tasks, Gemini Privacy Hub, Grok Bot computer-and-apps, ChatGPT Work, Dots FAQs) were truncated mid-page by the fetcher; facts were taken only from text actually retrieved, with remaining mid-page details left unverified where not visible.
