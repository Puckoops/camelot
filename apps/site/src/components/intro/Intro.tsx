import { cn } from "@puckoops/camelot/helpers";
import Link from "next/link";
import { Source } from "@/components/code/Source";
import { DocsLink } from "./DocsLink";
import styles from "./Intro.module.css";

export interface IntroRule {
  id: string;
  rule: string;
  why: string;
}

const sections = [
  {
    n: "01",
    title: "Design tokens",
    href: "/docs/tokens/semantic",
    body: "The neutral ramp, the four state hues, type, spacing, radii, elevation and motion. Every value a component uses resolves to one of these.",
  },
  {
    n: "02",
    title: "Components",
    href: "/docs/components/button",
    body: "The component library — actions, forms, status, cards, tables, overlays, layout. Each page has live controls, its props, and when to reach for it.",
  },
  {
    n: "03",
    title: "MCP",
    href: "/docs/mcp",
    body: "A server that gives an AI assistant the catalogue, the tokens and the rules, so it builds with the real system instead of guessing.",
  },
];

const usage = `import "@puckoops/camelot/styles.css";
import { Button } from "@puckoops/camelot";

<Button variant="primary">Continue</Button>;`;

export function Intro({ components, tokens, themes, rules }: { components: number; tokens: number; themes: number; rules: IntroRule[] }) {
  const stats = [
    { label: "Components", value: components },
    { label: "Tokens", value: tokens },
    { label: "Themes", value: themes },
  ];
  return (
    <div className={styles.intro}>
      <header className={styles.masthead}>
        <p className={cn("caps", styles.eyebrow)}>Puckoops design system</p>
        <h1 className={cn("display", styles.wordmark)}>Camelot</h1>
        <p className={cn("body-lg", styles.lede)}>
          The components, tokens and rules every Puckoops product is built from — one source for how things look, so a screen in one product reads like a
          screen in another. Orbit is the first product built on it.
        </p>
        <dl className={styles.stats}>
          {stats.map((s) => (
            <div key={s.label}>
              <dt className="caps">{s.label}</dt>
              <dd className="kpi">{s.value}</dd>
            </div>
          ))}
        </dl>
      </header>

      <section className={styles.section}>
        <h2 className={cn("caps", styles.label)}>01 — What’s here</h2>
        <div className={styles.cards}>
          {sections.map((s) => (
            <Link key={s.n} href={s.href} className={styles.card}>
              <span className={cn("kpi", styles.cardNum)}>{s.n}</span>
              <h3 className="h3">{s.title}</h3>
              <p className="small">{s.body}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={cn("caps", styles.label)}>02 — Using it</h2>
        <Source code={usage} />
        <p className="small text-2">
          Variants carry the design. Reach for a variant or a component before reaching for a className — the variant is what stays correct when the system
          changes.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={cn("caps", styles.label)}>03 — The rules</h2>
        <ol className={styles.rules}>
          {rules.slice(0, 5).map((r) => (
            <li key={r.id}>
              <p className="h3">{r.rule}</p>
              <p className="small text-3">{r.why}</p>
            </li>
          ))}
        </ol>
        <p className="small text-3">
          The full list, with a validator, is on the{" "}
          <DocsLink href="/docs/mcp">
            MCP pages
          </DocsLink>
          .
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={cn("caps", styles.label)}>04 — Where to start</h2>
        <p className="small text-2">
          Open{" "}
          <DocsLink href="/docs/tokens/semantic">
            Design tokens → Semantic
          </DocsLink>{" "}
          for the palette, then any component page for its variants. Working with an AI assistant? Point it at the MCP server first;{" "}
          <DocsLink href="/docs/mcp">
            MCP → How to use
          </DocsLink>{" "}
          has the one-line install.
        </p>
      </section>
    </div>
  );
}
