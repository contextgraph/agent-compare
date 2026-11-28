import { JsonLd } from "../components/JsonLd";
import { Checked } from "../components/Chrome";
import { Lead } from "../components/Facts";
import { CompareTable } from "../components/Tables";
import { columnsFor } from "../lib/columns";
import { homeIntro } from "../lib/copy";
import { agents, changelog, latestCheckedOn, slugFor, displayName } from "../lib/data";
import { agentList, breadcrumb, graph, webPage } from "../lib/jsonld";
import { indexableRoutes, pairsFor, questions } from "../lib/routes";
import { pageMeta } from "../lib/meta";
import { CATEGORY, SITE_NAME } from "../lib/site";

export const metadata = pageMeta(
  SITE_NAME,
  `sourced comparison of ${CATEGORY}. every claim has a source and a checked-on date. no rankings and no paid placement.`,
  "/",
);

export default function HomePage() {
  const intro = homeIntro(agents);
  const date = latestCheckedOn();
  return (
    <>
      <JsonLd
        data={graph([
          webPage({ path: "/", title: SITE_NAME, description: intro, dateModified: date }),
          breadcrumb([{ name: SITE_NAME, path: "/" }]),
          agentList(),
        ])}
      />
      <h1>{SITE_NAME}</h1>
      <Lead text={intro} />
      <Checked />
      <h2 id="comparison">comparison</h2>
      <CompareTable id="diff-home" list={agents} columns={columnsFor()} caption="sourced comparison of personal agents" />
      <h2 id="agents">agents</h2>
      <ul className="link-list">
        {agents.map((agent) => (
          <li key={agent.id}>
            <a href={`/agents/${slugFor(agent)}`}>{displayName(agent)}</a>
          </li>
        ))}
      </ul>
      <h2 id="comparisons">comparisons</h2>
      <ul className="link-list">
        {pairsFor().map((pair) => (
          <li key={pair.slug}>
            <a href={`/vs/${pair.slug}`}>
              {displayName(pair.a)} vs {displayName(pair.b)}
            </a>
          </li>
        ))}
      </ul>
      <h2 id="questions">questions</h2>
      <ul className="link-list">
        {questions().map((question) => (
          <li key={question.slug}>
            <a href={`/questions/${question.slug}`}>{question.title}</a>
          </li>
        ))}
      </ul>
      <h2 id="changelog">changelog</h2>
      <ul className="link-list">
        {changelog.map((entry) => (
          <li key={entry.date}>
            {entry.date}: {entry.summary}
            {entry.links?.map((link) => (
              <span key={link.url}>
                {" "}
                <a href={link.url}>{link.label}</a>
              </span>
            ))}
          </li>
        ))}
      </ul>
      <h2>pages</h2>
      <ul className="link-list page-list">
        {indexableRoutes().map((route) => (
          <li key={route.path}>
            <a href={route.path}>{route.title}</a>
          </li>
        ))}
      </ul>
    </>
  );
}
