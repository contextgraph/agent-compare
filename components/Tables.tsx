import { FactCell } from "./Facts";
import { columnsFor, type Column, type Slot } from "../lib/columns";
import { displayName, isKeeperRow, latestCheckedOn, slugFor } from "../lib/data";
import { plainPresent, present } from "../lib/focus";
import { KEEPER_NOTE } from "../lib/site";
import type { Agent, Fact } from "../lib/types";

function signature(agent: Agent, fact: Fact, plain?: boolean): string {
  const view = plain ? plainPresent(fact) : present(agent, fact);
  return JSON.stringify([view.unverified, view.primary, view.rest, view.related]);
}

function sameColumn(column: Column, list: Agent[]): boolean {
  const perAgent = list.map((agent) =>
    column.slots(agent).map((slot) => signature(agent, slot.fact, slot.plain)).join("|"),
  );
  return perAgent.every((item) => item === perAgent[0]);
}

function SlotList({ agent, slots, compact }: { agent: Agent; slots: Slot[]; compact?: boolean }) {
  if (!slots.length) return <p className="unverified">unverified</p>;
  return (
    <>
      {slots.map((slot) => (
        <FactCell
          key={slot.label}
          agent={agent}
          fact={slot.fact}
          label={slot.label}
          plain={slot.plain}
          compact={compact}
        />
      ))}
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
  const sameIds = new Set(columns.filter((column) => sameColumn(column, list)).map((column) => column.id));
  return (
    <div className="table-block">
      <input id={id} className="diff-only" type="checkbox" />
      <label htmlFor={id}>show differences only</label>
      <div className="table-scroll" tabIndex={0} role="region" aria-label={`${caption}. scrolls horizontally.`}>
        <p className="scroll-hint">scroll horizontally. the first column and the header stay put.</p>
        <table>
          <caption>
            {caption}. checked on {latestCheckedOn()}.
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
                  <td key={column.id} data-same={sameIds.has(column.id) ? "true" : "false"}>
                    <SlotList agent={agent} slots={column.slots(agent)} compact />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function VersusTable({ a, b }: { a: Agent; b: Agent }) {
  const rows = columnsFor().flatMap((column) => {
    const left = column.slots(a);
    const right = column.slots(b);
    const count = Math.max(left.length, right.length, 1);
    return Array.from({ length: count }, (_, index) => ({
      column,
      index,
      left: left[index],
      right: right[index],
    }));
  });
  const inputId = `diff-${a.id}-${b.id}`;
  return (
    <div className="table-block">
      <input id={inputId} className="diff-only" type="checkbox" />
      <label htmlFor={inputId}>show differences only</label>
      <div className="table-scroll" tabIndex={0} role="region" aria-label="side by side comparison. scrolls horizontally.">
        <p className="scroll-hint">scroll horizontally. the field column and the header stay put.</p>
        <table>
          <caption>
            {displayName(a)} and {displayName(b)}. checked on {latestCheckedOn()}.
          </caption>
          <thead>
            <tr>
              <th scope="col">field</th>
              <th scope="col">
                {displayName(a)}
                {isKeeperRow(a) ? (
                  <p className="keeper">
                    <span className="tag">keeper's note</span> {KEEPER_NOTE}
                  </p>
                ) : null}
              </th>
              <th scope="col">
                {displayName(b)}
                {isKeeperRow(b) ? (
                  <p className="keeper">
                    <span className="tag">keeper's note</span> {KEEPER_NOTE}
                  </p>
                ) : null}
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const leftSig = row.left ? signature(a, row.left.fact, row.left.plain) : "missing";
              const rightSig = row.right ? signature(b, row.right.fact, row.right.plain) : "missing";
              return (
                <tr key={`${row.column.id}-${row.index}`} data-same={leftSig === rightSig ? "true" : "false"}>
                  <th scope="row">{row.left?.label ?? row.right?.label ?? row.column.label}</th>
                  <td>
                    {row.left ? <SlotList agent={a} slots={[row.left]} compact /> : <p className="unverified">unverified</p>}
                  </td>
                  <td>
                    {row.right ? <SlotList agent={b} slots={[row.right]} compact /> : <p className="unverified">unverified</p>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
