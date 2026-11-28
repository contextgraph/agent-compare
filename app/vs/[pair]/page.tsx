import { notFound } from "next/navigation";
import { Breadcrumbs, Checked } from "../../../components/Chrome";
import { Lead } from "../../../components/Facts";
import { JsonLd } from "../../../components/JsonLd";
import { VersusTable } from "../../../components/Tables";
import { displayName } from "../../../lib/data";
import { breadcrumb, graph, webPage } from "../../../lib/jsonld";
import { leadFor } from "../../../lib/leads";
import { pageMeta } from "../../../lib/meta";
import { latestCheckedOn } from "../../../lib/data";
import { pairsFor } from "../../../lib/routes";
import { SITE_NAME } from "../../../lib/site";

export function generateStaticParams() {
  return pairsFor().map((pair) => ({ pair: pair.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ pair: string }> }) {
  const { pair: slug } = await params;
  const pair = pairsFor().find((item) => item.slug === slug);
  if (!pair) return {};
  const title = `${displayName(pair.a)} vs ${displayName(pair.b)} — ${SITE_NAME}`;
  const lead = leadFor("vs", slug);
  return pageMeta(title, lead ?? title, `/vs/${slug}`);
}

export default async function VersusPage({ params }: { params: Promise<{ pair: string }> }) {
  const { pair: slug } = await params;
  const pair = pairsFor().find((item) => item.slug === slug);
  if (!pair) notFound();
  const lead = leadFor("vs", slug);
  if (!lead) throw new Error(`missing unique lead for /vs/${slug}`);
  const title = `${displayName(pair.a)} vs ${displayName(pair.b)}`;
  const path = `/vs/${slug}`;
  return (
    <>
      <JsonLd
        data={graph([
          webPage({
            path,
            title,
            description: lead,
            dateModified: latestCheckedOn(),
            article: true,
            articleBody: lead,
          }),
          breadcrumb([
            { name: SITE_NAME, path: "/" },
            { name: title, path },
          ]),
        ])}
      />
      <Breadcrumbs items={[{ href: "/", label: SITE_NAME }, { label: title }]} />
      <h1>{title}</h1>
      <Lead text={lead} />
      <Checked />
      <VersusTable a={pair.a} b={pair.b} />
    </>
  );
}
