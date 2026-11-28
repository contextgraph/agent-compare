import { columnBullets, detailsHref, type Bullet } from "../lib/bullets";
import { columnsFor, type Column } from "../lib/columns";
import { displayName, isKeeperRow, latestCheckedOn, slugFor } from "../lib/data";
import { KEEPER_NOTE } from "../lib/site";
import type { Agent } from "../lib/types";

function hostLabel(href: string): string {
  try {
    return new URL(href).host.replace(/^www\./, "");
  } catch {
    return "source";
  }
}

function signature(bullets: Bullet[]): string {
  return bullets.map((bullet) => bullet.text).join("|");
}

export function BulletList({ bullets }: { bullets: Bullet[] }) {
  if (!bullets.length) return <p className="unverified">unverified</p>;
  return (
    <ul className="bullets">
      {bullets.map((bullet) => (
        <li key={`${bullet.text}-${bullet.checked_on}`}>
          {bullet.text === "unverified" ? <span className="unverified">unverified</span> : <span>{bullet.text}</span>}
          {bullet.sources.map((source) => (
            <a key={source.href} className="footnote" href={source.href}>
              {hostLabel(source.href)}
            </a>
          ))}
          {bullet.checked_on ? <span className="when">checked {bullet.checked_on}</span> : null}
        </li>
      ))}
    </ul>
  );
}

function Cell({ agent, column }: { agent: Agent; column: Column }) {
  const bullets = columnBullets(agent, column);
  return (
    <>
      <BulletList bullets={bullets} />
      <a className="details-link" href={detailsHref(agent, column.id)}>
        details
      </a>
    </>
  );
}

export function CompareTable({
  list,
  columns,
  caption,
  id,
}: {
  list: Agent[];
  columns: Column[];
  caption: string;
  id: string;
}) {
  const sameIds = new Set(
    columns
      .filter((column) => {
        const values = list.map((agent) => signature(columnBullets(agent, column)));
        return values.every((value) => value === values[0]);
      })
      .map((column) => column.id),
  );
  return (
    <div className="table-block">
      <input id={id} className="diff-only" type="checkbox" />
      <label htmlFor={id}>show differences only</label>
      <table className="flow-table">
        <caption>
          {caption}
          {caption.endsWith("?") || caption.endsWith(".") ? "" : "."} checked on {latestCheckedOn()}.
        </caption>
        <thead>
          <tr>
            <th scope="col">agent</th>
            {columns.map((column) => (
              <th key={column.id} scope="col" data-same={sameIds.has(column.id) ? "true" : "false"}>
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {list.map((agent) => (
            <tr key={agent.id}>
              <th scope="row">
                <a href={`/agents/${slugFor(agent)}`}>{displayName(agent)}</a>
                {isKeeperRow(agent) ? (
                  <p className="keeper">
                    <span className="tag">keeper's note</span> {KEEPER_NOTE}
                  </p>
                ) : null}
              </th>
              {columns.map((column) => (
                <td key={column.id} data-label={column.label} data-same={sameIds.has(column.id) ? "true" : "false"}>
                  <Cell agent={agent} column={column} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function VersusTable({ a, b }: { a: Agent; b: Agent }) {
  const rows = columnsFor().map((column) => {
    const left = signature(columnBullets(a, column));
    const right = signature(columnBullets(b, column));
    return { column, same: left === right };
  });
  const inputId = `diff-${a.id}-${b.id}`;
  return (
    <div className="table-block">
      <input id={inputId} className="diff-only" type="checkbox" />
      <label htmlFor={inputId}>show differences only</label>
      <table className="flow-table">
        <caption>
          {displayName(a)} and {displayName(b)}, checked on {latestCheckedOn()}.
        </caption>
        <thead>
          <tr>
            <th scope="col">field</th>
            <th scope="col">{displayName(a)}</th>
            <th scope="col">{displayName(b)}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.column.id} data-same={row.same ? "true" : "false"}>
              <th scope="row">{row.column.label}</th>
              <td data-label={displayName(a)}>
                <Cell agent={a} column={row.column} />
              </td>
              <td data-label={displayName(b)}>
                <Cell agent={b} column={row.column} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
