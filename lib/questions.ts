import { columnById } from "./columns";
import { agents } from "./data";
import type { Agent } from "./types";

export type Question = {
  slug: string;
  title: string;
  columnIds: string[];
};

const QUESTIONS: Question[] = [
  {
    slug: "schedule-while-away",
    title: "which personal ai agents can run on a schedule while you're away?",
    columnIds: ["schedule_or_away"],
  },
  {
    slug: "ask-before-sending-or-spending",
    title: "which personal ai agents ask before sending email or spending money?",
    columnIds: ["approvals", "accounts_apps.payments"],
  },
  {
    slug: "training-and-retention",
    title: "which personal ai agents train on your data, and how long do they keep it?",
    columnIds: ["privacy.training_on_your_data", "privacy.retention"],
  },
  {
    slug: "cost",
    title: "how much do personal ai agents cost?",
    columnIds: ["price"],
  },
  {
    slug: "email-and-calendar",
    title: "which personal ai agents can act in email and calendar?",
    columnIds: ["accounts_apps.email", "accounts_apps.calendar"],
  },
  {
    slug: "memory",
    title: "which personal ai agents have memory?",
    columnIds: ["memory"],
  },
  {
    slug: "where-they-run",
    title: "where do personal ai agents run?",
    columnIds: ["where_it_runs"],
  },
];

export function questionsFor(list: Agent[] = agents): Question[] {
  return QUESTIONS.map((question) => ({
    ...question,
    columnIds: question.columnIds.filter((id) => columnById(id, list)),
  })).filter((question) => question.columnIds.length > 0);
}
