import { cn } from "@puckoops/camelot/helpers";
import { Fragment } from "react";
import { declared, resolve, shadowTokens } from "@/components/tokens/parse";
import { Section, ThemedValue } from "@/components/tokens/TokenDocs";
import styles from "@/components/tokens/Tokens.module.css";

export const description =
  "Elevation and the quiet effects around it — the four **shadows**, the three **hairlines**, the **scrim**, the **washes** and the **focus** ring — shown on real surfaces in the current theme, with both themes' values read from `tokens.css`.";

const shadowUsage: Record<string, string> = {
  "--shadow-card": "Every card, table frame and board card at rest.",
  "--shadow-raised": "A card under the pointer, a dragged card, the form footer.",
  "--shadow-overlay": "Menus, popovers, tooltips, toasts, drawers and dialogs.",
  "--shadow-hero": "The landing page's hero media, once.",
};

function Values({ name }: { name: string }) {
  return (
    <div className={cn("num-sm", styles.shadowValues)}>
      {(["light", "dark"] as const).map((theme) => (
        <div key={theme} className={styles.themeValue}>
          <span className="text-4">{theme}</span>
          <span className="text-2">{resolve(name, theme) || "none"}</span>
        </div>
      ))}
    </div>
  );
}

function BothThemes({ name }: { name: string }) {
  return (
    <div className={styles.themePair}>
      <ThemedValue name={name} theme="light" />
      <ThemedValue name={name} theme="dark" />
    </div>
  );
}

export function EffectsTokens() {
  return (
    <>
      <Section
        title="Shadows"
        caption="Four elevations. In dark mode the card and raised shadows are none — a surface one step lighter than the canvas does that work — and the overlay and hero shadows deepen."
      >
        <div className={styles.stage}>
          <div className={styles.cards}>
            {shadowTokens.map((name) => (
              <div key={name} className={styles.demoCard} style={{ boxShadow: `var(${name})` }}>
                <span className={cn("num", styles.name)}>{name}</span>
                <span className="small text-3">{shadowUsage[name] ?? "—"}</span>
                <Values name={name} />
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section
        title="Hairlines"
        caption={`Three line weights, all ${resolve("--border-w")} at --border-w. Separation comes from the line's ink, never from a thicker stroke.`}
      >
        <div className={cn(styles.panel, styles.lines)}>
          <div className={styles.lineDemo}>
            <div>
              <p className={cn("num", styles.name)}>--hairline</p>
              <p className="small text-3">Card borders, row rules, dividers.</p>
            </div>
            <BothThemes name="--hairline" />
          </div>
          <div className={cn(styles.lineDemo, styles.lineStrong)}>
            <div>
              <p className={cn("num", styles.name)}>--hairline-strong</p>
              <p className="small text-3">Between drawer sections; the rule above this row uses it.</p>
            </div>
            <BothThemes name="--hairline-strong" />
          </div>
          <div className={cn(styles.lineDemo, styles.lineHairline)}>
            <div className={styles.lineLead}>
              <span className={cn("small", styles.control)}>Nordvik Atelier</span>
              <div>
                <p className={cn("num", styles.name)}>--border-control</p>
                <p className="small text-3">The edge of a control someone types into or ticks.</p>
              </div>
            </div>
            <BothThemes name="--border-control" />
          </div>
        </div>
      </Section>

      <Section title="Scrim" caption="Behind drawers and dialogs, so the page stays visible but out of reach.">
        <div className={cn(styles.cards, styles.split)}>
          <div className={styles.screen}>
            <div className={styles.screenRows}>
              {Array.from({ length: 5 }, (_, i) => (
                <span key={i} className={styles.screenRow} />
              ))}
            </div>
            <span className={styles.scrim} />
            <div className={styles.sheet}>
              <span className="h3">Brand system rollout</span>
              <span className="caption text-3">Task · Nordvik Atelier</span>
            </div>
          </div>
          <div className={styles.demoCard}>
            <span className={cn("num", styles.name)}>--scrim</span>
            <span className="small text-3">Fades in over --dur-2 while the sheet slides.</span>
            <div className={styles.demoValues}>
              <ThemedValue name="--scrim" theme="light" />
              <ThemedValue name="--scrim" theme="dark" />
            </div>
          </div>
        </div>
      </Section>

      <Section
        title="Washes"
        caption="Faint warm and cool tints for large, empty, atmospheric areas such as a landing hero. They carry no meaning and never sit behind data."
      >
        <div className={styles.cards}>
          {["--wash-warm", "--wash-cool"]
            .filter((n) => declared(n))
            .map((name) => (
              <div key={name} className={styles.wash}>
                <span className={styles.washLayer} style={{ background: `var(${name})` }} />
                <div className={styles.washLabel}>
                  <p className={cn("num", styles.name)}>{name}</p>
                  <div className={styles.washValues}>
                    <ThemedValue name={name} theme="light" />
                    <ThemedValue name={name} theme="dark" />
                  </div>
                </div>
              </div>
            ))}
        </div>
      </Section>

      <Section title="Focus" caption="Keyboard focus is an ink outline, never a glow.">
        <div className={cn(styles.panel, styles.panelPad, styles.focusPanel)}>
          <span className={cn("small", styles.control, styles.focused)}>Focused control</span>
          <dl className={cn("num-sm", styles.typeMeta)}>
            {["--focus-ring", "--focus-w", "--focus-offset", "--border-w"].map((name) => (
              <Fragment key={name}>
                <dt>{name}</dt>
                <dd>{name === "--focus-ring" ? `${resolve(name, "light")} · ${resolve(name, "dark")}` : resolve(name)}</dd>
              </Fragment>
            ))}
          </dl>
        </div>
      </Section>
    </>
  );
}
