import { Fragment, type ReactNode } from "react";

function inline(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const pattern = /(\*\*[^*]+\*\*|`[^`]+`)/g;
  let last = 0;
  for (const match of text.matchAll(pattern)) {
    const index = match.index ?? 0;
    if (index > last) nodes.push(text.slice(last, index));
    const token = match[0];
    if (token.startsWith("**")) nodes.push(<strong key={index}>{token.slice(2, -2)}</strong>);
    else nodes.push(<code key={index}>{token.slice(1, -1)}</code>);
    last = index + token.length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

export function Markdown({ text }: { text: string }) {
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  const blocks: ReactNode[] = [];
  let list: string[] = [];
  const flush = () => {
    if (!list.length) return;
    blocks.push(
      <ul key={`ul-${blocks.length}`}>
        {list.map((item) => (
          <li key={item}>{inline(item)}</li>
        ))}
      </ul>,
    );
    list = [];
  };
  lines.forEach((line, index) => {
    if (line.startsWith("- ")) {
      list.push(line.slice(2));
      return;
    }
    flush();
    if (!line.trim()) return;
    if (line.startsWith("### ")) blocks.push(<h3 key={index}>{inline(line.slice(4))}</h3>);
    else if (line.startsWith("## ")) blocks.push(<h2 key={index}>{inline(line.slice(3))}</h2>);
    else if (line.startsWith("# ")) blocks.push(<h2 key={index}>{inline(line.slice(2))}</h2>);
    else blocks.push(<p key={index}>{inline(line)}</p>);
  });
  flush();
  return <div className="markdown">{blocks.map((block, index) => <Fragment key={index}>{block}</Fragment>)}</div>;
}
