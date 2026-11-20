import { notFound } from "next/navigation";
import { Breadcrumbs, Checked } from "../../../components/Chrome";
import { Lead } from "../../../components/Facts";
import { JsonLd } from "../../../components/JsonLd";
import { CompareTable } from "../../../components/Tables";
import { columnById } from "../../../lib/columns";
import { agents, latestCheckedOn } from "../../../lib/data";
import { breadcrumb, graph, webPage } from "../../../lib/jsonld";
import { leadFor } from "../../../lib/leads";
import { pageMeta } from "../../../lib/meta";
import { questions } from "../../../lib/routes";

export function generateStaticParams() {
  return questions().map((question) => ({ slug: question.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const question = questions().find((item) => item.slug === slug);
  if (!question) return {};
  const lead = leadFor("questions", slug);
  return pageMeta(`${question.title} — agent compare`, lead ?? question.title, `/questions/${slug}`);
}

export default async function QuestionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const question = questions().find((item) => item.slug === slug);
  if (!question) notFound();
  const lead = leadFor("questions", slug);
  if (!lead) throw new Error(`missing unique lead for /questions/${slug}`);
  const columns = question.columnIds.map((id) => columnById(id)).filter((column) => column != null);
  const path = `/questions/${slug}`;
  return (
    <>
      <JsonLd
        data={graph([
          webPage({
            path,
            title: question.title,
            description: lead,
            dateModified: latestCheckedOn(),
            article: true,
            articleBody: lead,
          }),
          breadcrumb([
            { name: "agent compare", path: "/" },
            { name: question.title, path },
          ]),
        ])}
      />
      <Breadcrumbs items={[{ href: "/", label: "agent compare" }, { label: question.title }]} />
      <h1>{question.title}</h1>
      <Lead text={lead} />
      <Checked />
      <CompareTable id={`diff-${slug}`} list={agents} columns={columns} caption={question.title} />
      <p>
        <a href="/#comparison">full comparison</a>
      </p>
    </>
  );
}
