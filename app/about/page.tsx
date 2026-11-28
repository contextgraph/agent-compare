import { Breadcrumbs, Checked } from "../../components/Chrome";
import { JsonLd } from "../../components/JsonLd";
import { Lead } from "../../components/Facts";
import { Markdown } from "../../components/Markdown";
import { latestCheckedOn, unverifiedMarkdown } from "../../lib/data";
import { breadcrumb, graph, webPage } from "../../lib/jsonld";
import { pageMeta } from "../../lib/meta";
import { CATEGORY, CORRECTIONS_URL, KEEPER_NOTE, SITE_NAME } from "../../lib/site";

const intro = `${SITE_NAME} shows ${CATEGORY}. every claim is sourced and dated. the dataset is refreshed weekly. no paid placement.`;

export const metadata = pageMeta(`about — ${SITE_NAME}`, intro, "/about");

export default function AboutPage() {
  const date = latestCheckedOn();
  return (
    <>
      <JsonLd
        data={graph([
          webPage({
            path: "/about",
            title: "about",
            description: intro,
            dateModified: date,
            article: true,
            articleBody: intro,
          }),
          breadcrumb([
            { name: SITE_NAME, path: "/" },
            { name: "about", path: "/about" },
          ]),
        ])}
      />
      <Breadcrumbs items={[{ href: "/", label: SITE_NAME }, { label: "about" }]} />
      <h1>about</h1>
      <Lead text={intro} />
      <Checked />
      <p className="keeper">
        <span className="tag">keeper's note</span> {KEEPER_NOTE}
      </p>
      <p>
        corrections can be filed as GitHub issues on <a href={CORRECTIONS_URL}>{CORRECTIONS_URL}</a>.
      </p>
      <h2>how a cell works</h2>
      <p>
        a fact is a value, a source link, and a checked-on date. if the dataset has no value, the cell says unverified.
        on the OpenAI dots and Claude Duet rows, ChatGPT Work and Claude Cowork text stays in the dataset and is labeled
        related. data notes sit next to the value they belong to. there are no rankings and no affiliate links.
      </p>
      <h2>unverified gaps</h2>
      <Markdown text={unverifiedMarkdown()} />
    </>
  );
}
