import { JsonLd } from "../components/JsonLd";
import { Checked } from "../components/Chrome";
import { HOME_INTRO } from "../lib/copy";
import { agents, changelog, latestCheckedOn, slugFor, displayName } from "../lib/data";
import { agentList, breadcrumb, graph, webPage } from "../lib/jsonld";
import { pairsFor, questions } from "../lib/routes";
import { pageMeta } from "../lib/meta";

export const metadata = pageMeta("agent compare", HOME_INTRO, "/");

export default function HomePage() {
  const date = latestCheckedOn();
  return (
    <>
      <JsonLd
        data={graph([
          webPage({ path: "/", title: "agent compare", description: HOME_INTRO, dateModified: date }),
          breadcrumb([{ name: "agent compare", path: "/" }]),
          agentList(),
        ])}
      />
      <h1>agent compare</h1>
      <p className="lede">{HOME_INTRO}</p>
      <h2 id="questions">questions</h2>
      <div className="card-grid">
        {questions().map((question) => (
          <a key={question.slug} className="card" href={`/questions/${question.slug}`}>
            {question.title}
          </a>
        ))}
      </div>
      <h2 id="comparisons">comparisons</h2>
      <div className="card-grid agents">
        {agents.map((agent) => (
          <a key={agent.id} className="card card-agent" href={`/agents/${slugFor(agent)}`}>
            {displayName(agent)}
          </a>
        ))}
      </div>
      <div className="card-grid vs">
        {pairsFor().map((pair) => (
          <a key={pair.slug} className="card card-vs" href={`/vs/${pair.slug}`}>
            {displayName(pair.a)} vs {displayName(pair.b)}
          </a>
        ))}
      </div>
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
      <Checked />
    </>
  );
}
