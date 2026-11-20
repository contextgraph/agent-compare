import { plainPresent, present, type Partition } from "../lib/focus";
import { focusOf } from "../lib/data";
import type { Agent, Fact } from "../lib/types";

export function assertFact(fact: Fact, where: string): void {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fact.checked_on)) {
    throw new Error(`rendered fact missing checked_on at ${where}`);
  }
  if (fact.value == null) return;
  if (typeof fact.source !== "string" || !/^https:\/\/\S+$/.test(fact.source)) {
    throw new Error(`rendered fact missing source at ${where}`);
  }
}

function isLong(value: string): boolean {
  return value.length > 100 || /[.!?]\s/.test(value);
}

export function ValueView({ value, compact = false }: { value: unknown; compact?: boolean }) {
  if (value == null) return null;
  if (typeof value === "number" || typeof value === "boolean") {
    return <p className="fact-value">{String(value)}</p>;
  }
  if (typeof value === "string") {
    if (/^https?:\/\//.test(value)) {
      return (
        <p className="fact-value">
          <a href={value}>{value}</a>
        </p>
      );
    }
    if (compact && isLong(value)) {
      return (
        <details className="full-text">
          <summary>full text</summary>
          <p className="fact-value">{value}</p>
        </details>
      );
    }
    return <p className="fact-value">{value}</p>;
  }
  if (Array.isArray(value)) {
    return (
      <>
        {value.map((item, index) => (
          <ValueView key={index} value={item} compact={compact} />
        ))}
      </>
    );
  }
  if (typeof value === "object") {
    return (
      <dl className="value-object">
        {Object.entries(value as Record<string, unknown>).map(([key, item]) => (
          <div key={key}>
            <dt>{key.replaceAll("_", " ")}</dt>
            <dd>
              <ValueView value={item} compact={compact} />
            </dd>
          </div>
        ))}
      </dl>
    );
  }
  return null;
}

function SourceLine({ fact }: { fact: Fact }) {
  if (fact.value != null && fact.source) {
    return (
      <p className="fact-meta">
        <a href={fact.source}>{fact.source}</a>
        <span>checked on {fact.checked_on}</span>
      </p>
    );
  }
  return (
    <p className="fact-meta">
      <span>checked on {fact.checked_on}</span>
    </p>
  );
}

export function Lead({ text }: { text: string }) {
  const parts = text.split(/(https?:\/\/[^\s),]+)/g);
  return (
    <p className="lede">
      {parts.map((part, index) =>
        part.startsWith("http") ? (
          <a key={index} href={part}>
            {part}
          </a>
        ) : (
          <span key={index}>{part}</span>
        ),
      )}
    </p>
  );
}

export function FactCell({
  agent,
  fact,
  label,
  plain = false,
  compact = false,
}: {
  agent: Agent;
  fact: Fact;
  label?: string;
  plain?: boolean;
  compact?: boolean;
}) {
  assertFact(fact, label ?? agent.id);
  const view: Partition = plain || !focusOf(agent) ? plainPresent(fact) : present(agent, fact);
  return (
    <div className="fact">
      {label ? <p className="fact-label">{label}</p> : null}
      {view.unverified ? <p className="unverified">unverified</p> : null}
      {view.primary != null && !view.unverified ? <ValueView value={view.primary} compact={compact} /> : null}
      {view.rest != null ? <ValueView value={view.rest} compact={compact} /> : null}
      {view.related != null && view.relatedLabel ? (
        <div className="related">
          <p className="related-label">{view.relatedLabel}</p>
          <ValueView value={view.related} compact={false} />
        </div>
      ) : null}
      {fact.note ? (
        <p className="data-note">
          <span className="tag">data note</span> {fact.note}
        </p>
      ) : null}
      <SourceLine fact={fact} />
    </div>
  );
}
