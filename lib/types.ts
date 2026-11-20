export type Fact = {
  value: unknown;
  source: string | null;
  checked_on: string;
  note?: string;
};

export type Agent = {
  id: string;
  aliases?: unknown;
  name?: Fact;
  vendor?: Fact;
  homepage?: Fact;
  type?: Fact;
  plans?: unknown;
  [key: string]: unknown;
};

export type ChangelogLink = { label: string; url: string };

export type ChangelogEntry = {
  date: string;
  summary: string;
  links?: ChangelogLink[];
};
