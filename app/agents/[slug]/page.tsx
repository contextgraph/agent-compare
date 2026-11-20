import { notFound } from "next/navigation";
import { Breadcrumbs, Checked } from "../../../components/Chrome";
import { FactCell, Lead } from "../../../components/Facts";
import { JsonLd } from "../../../components/JsonLd";
import { aliasFacts, groupsFor, identitySlots } from "../../../lib/columns";
import { agents, displayName, focusOf, isKeeperRow, latestCheckedOn, relatedLabel, slugFor } from "../../../lib/data";
import { alternateNames, breadcrumb, graph, softwareApplication, webPage } from "../../../lib/jsonld";
import { pageMeta } from "../../../lib/meta";
import { pairsFor } from "../../../lib/routes";
import { KEEPER_NOTE } from "../../../lib/site";

export function generateStaticParams() {
  return agents.map((agent) => ({ slug: slugFor(agent) }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const agent = agents.find((item) => slugFor(item) === slug);
  if (!agent) return {};
  const name = displayName(agent);
  return pageMeta(`${name} — agent compare`, `sourced facts for ${name}. every claim has a source and a checked-on date.`, `/agents/${slug}`);
}

export default async function AgentPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const agent = agents.find((item) => slugFor(item) === slug);
  if (!agent) notFound();
  const name = displayName(agent);
  const path = `/agents/${slug}`;
  const description = `sourced facts for ${name}. every claim has a source and a checked-on date.`;
  const related = relatedLabel(agent);
  const aliases = aliasFacts(agent);
  return (
    <>
      <JsonLd
        data={graph([
          webPage({ path, title: name, description, dateModified: latestCheckedOn() }),
          breadcrumb([
            { name: "agent compare", path: "/" },
            { name, path },
          ]),
          softwareApplication(agent),
        ])}
      />
      <Breadcrumbs items={[{ href: "/", label: "agent compare" }, { label: name }]} />
      <h1>{name}</h1>
      <Lead text="the fields below are the sourced record for this row. each claim has a source link and a checked-on date, and unverified means there is no value for this product." />
      {related ? (
        <p className="focus-line">
          this row is {name}. sourced text that is not this product is labeled {related}.
        </p>
      ) : null}
      {isKeeperRow(agent) ? (
        <p className="keeper">
          <span className="tag">keeper's note</span> {KEEPER_NOTE}
        </p>
      ) : null}
      <Checked />
      <section>
        <h2>name and type</h2>
        {identitySlots(agent).map((slot) => (
          <FactCell
            key={slot.label}
            agent={agent}
            fact={slot.fact}
            label={slot.label === "name" && focusOf(agent) ? "dataset name" : slot.label}
            plain={slot.plain}
          />
        ))}
      </section>
      {aliases.length ? (
        <section>
          <h2>also called</h2>
          {aliases.map((fact) => (
            <FactCell key={String(fact.value)} agent={agent} fact={fact} plain />
          ))}
        </section>
      ) : null}
      {alternateNames(agent).length ? null : null}
      {groupsFor().map((group) => (
        <section key={group.id} id={group.id}>
          <h2>{group.title}</h2>
          {group.columns.map((column) => (
            <section key={column.id} id={column.id}>
              {group.columns.length > 1 ? <h3>{column.label}</h3> : null}
              {column.slots(agent).length ? (
                column.slots(agent).map((slot) => (
                  <FactCell key={slot.label} agent={agent} fact={slot.fact} label={slot.label} plain={slot.plain} />
                ))
              ) : (
                <p className="unverified">unverified</p>
              )}
            </section>
          ))}
        </section>
      ))}
      <h2>comparisons</h2>
      <ul className="link-list">
        {pairsFor()
          .filter((pair) => pair.a.id === agent.id || pair.b.id === agent.id)
          .map((pair) => (
            <li key={pair.slug}>
              <a href={`/vs/${pair.slug}`}>
                {displayName(pair.a)} vs {displayName(pair.b)}
              </a>
            </li>
          ))}
      </ul>
    </>
  );
}
