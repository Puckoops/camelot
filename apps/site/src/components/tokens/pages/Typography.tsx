import { cn } from "@puckoops/camelot/helpers";
import { fontTokens, inkClasses, typeClasses } from "@/components/tokens/parse";
import { Section, ThemedValue } from "@/components/tokens/TokenDocs";
import styles from "@/components/tokens/Tokens.module.css";

const family = (token: string) => fontTokens.find((f) => f.name === token)?.family ?? token;

export const description = `**${family("--font-display")}** for display, **${family("--font-sans")}** for the interface, **${family("--font-mono")}** for numbers and caps labels. Every type class with a live sample, its family, size and line height, weight and tracking, and when to reach for it — all read from \`type.css\` and \`tokens.css\` at build time.`;

const samples: Record<string, string> = {
  "hero-xl": "Studio ledger",
  hero: "Every project, one ledger",
  display: "Work, money and files in one place",
  quote: "“We stopped chasing invoices the week we moved.”",
  h1: "Obligations",
  h2: "Open obligations",
  h3: "Invoice 2041 · Nordvik Atelier",
  "body-lg": "Payable and receivable in one list, with overdue items at the top.",
  body: "Payable and receivable in one list. Overdue rises to the top, and every amount is in the client's currency.",
  small: "Receivable across 9 open invoices, 3 of them past their due date.",
  caption: "Updated 2 min ago · Sample data",
  caps: "Due this week",
  "kpi-hero": "£48,320",
  kpi: "312",
  num: "02 Oct 2026 · £14,200.00",
  "num-sm": "3.2 MB · 46% · NVA-014",
};

const usage: Record<string, string> = {
  "hero-xl": "The landing page's first line, once.",
  hero: "Landing sections and the sign-in screen.",
  display: "A marketing heading, or the welcome on an empty product.",
  quote: "A pull quote or a testimonial.",
  h1: "The page title in PageHeader, once per screen.",
  h2: "Band headings, drawer and dialog titles.",
  h3: "Card titles, list headings, accordion rows.",
  "body-lg": "A lede under a display heading.",
  body: "Running text: descriptions, briefs, notes.",
  small: "Subtitles and captions under headings, table text, card copy.",
  caption: "Hints, metadata, timestamps.",
  caps: "Eyebrows, table headers, the label above a figure. Mono, spaced, upper case.",
  "kpi-hero": "The one hero figure on a screen.",
  kpi: "Every other headline figure.",
  num: "Amounts, dates and counts in rows and cells.",
  "num-sm": "Sizes, percentages and codes beside smaller text.",
};

export function TypographyTokens() {
  return (
    <>
      <Section
        title="Families"
        caption="Three faces, each named by a token so an app can point them at next/font. Serif for display, sans for the interface, mono for every number and every caps label."
      >
        <div className={styles.panel}>
          <table className={cn("small", styles.table)}>
            <thead>
              <tr>
                <th className="caps">Token</th>
                <th className="caps">Sample</th>
                <th className="caps">Stack</th>
              </tr>
            </thead>
            <tbody>
              {fontTokens.map((f) => (
                <tr key={f.name}>
                  <td className={cn("num", styles.name)}>{f.name}</td>
                  <td className="h2" style={{ fontFamily: `var(${f.name})` }}>
                    Nordvik 2041
                  </td>
                  <td className={cn("num-sm", styles.fontStack)}>{f.stack}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section
        title="Scale"
        caption="Every type class in type.css, in order, with the sample set in the class itself. Size and line height are fixed pairs; never set a font size inline."
      >
        <div className={styles.panel}>
          {typeClasses.map((t) => (
            <div key={t.name} className={styles.typeRow}>
              <p className={cn(t.name, styles.typeSample)}>{samples[t.name] ?? "The quick brown fox"}</p>
              <dl className={cn("num-sm", styles.typeMeta)}>
                <dt>Class</dt>
                <dd className={styles.typeName}>.{t.name}</dd>
                <dt>Family</dt>
                <dd>{t.family}</dd>
                <dt>Size / line</dt>
                <dd>
                  {t.size} / {t.lineHeight}
                </dd>
                <dt>Weight</dt>
                <dd>{t.weight}</dd>
                <dt>Tracking</dt>
                <dd>{t.tracking}</dd>
                {(t.uppercase || t.tabular) && (
                  <>
                    <dt>Also</dt>
                    <dd>{[t.uppercase && "upper case", t.tabular && "tabular figures"].filter(Boolean).join(", ")}</dd>
                  </>
                )}
                <dd className={cn("small", styles.typeUsage)}>{usage[t.name] ?? "—"}</dd>
              </dl>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Ink classes" caption="Colour helpers for text, one per ink token.">
        <div className={styles.panel}>
          <table className={cn("small", styles.table)}>
            <thead>
              <tr>
                <th className="caps">Class</th>
                <th className="caps">Sample</th>
                <th className="caps">Light</th>
                <th className="caps">Dark</th>
              </tr>
            </thead>
            <tbody>
              {inkClasses.map((c) => (
                <tr key={c.name}>
                  <td className={cn("num", styles.name)}>.{c.name}</td>
                  <td className={cn("small", c.name)}>Receivable across 9 open invoices</td>
                  <td>
                    <ThemedValue name={c.token} theme="light" />
                  </td>
                  <td>
                    <ThemedValue name={c.token} theme="dark" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
    </>
  );
}
