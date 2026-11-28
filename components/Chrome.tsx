import { latestCheckedOn } from "../lib/data";
import { checkedLine } from "../lib/copy";
import { SITE_NAME } from "../lib/site";

export function Header() {
  return (
    <header className="site-header">
      <a className="wordmark" href="/">
        {SITE_NAME}
      </a>
      <nav aria-label="primary">
        <a href="/#comparisons">compare</a>
        <a href="/#questions">questions</a>
        <a href="/about">about</a>
      </nav>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="site-footer">
      <p>{checkedLine(latestCheckedOn())}</p>
      <p>
        <a href="/llms.txt">llms.txt</a>
        {" · "}
        <a href="/llms-full.txt">llms-full.txt</a>
        {" · "}
        <a href="/about">about</a>
      </p>
    </footer>
  );
}

export function Breadcrumbs({ items }: { items: { href?: string; label: string }[] }) {
  return (
    <nav aria-label="breadcrumb">
      <ol className="crumbs">
        {items.map((item, index) => (
          <li key={`${item.label}-${index}`}>
            {item.href && index < items.length - 1 ? <a href={item.href}>{item.label}</a> : item.label}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function Checked() {
  return <p className="checked-line">{checkedLine(latestCheckedOn())}</p>;
}
