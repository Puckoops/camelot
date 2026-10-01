import { Alert } from "@puckoops/camelot";
import { cn } from "@puckoops/camelot/helpers";
import type { CSSProperties } from "react";
import { hueRamps, neutralRamp, reference, resolve, roleTokens, type Theme } from "@/components/tokens/parse";
import { Section, ThemedValue } from "@/components/tokens/TokenDocs";
import styles from "@/components/tokens/Tokens.module.css";

export const description =
  "The colour **roles** every component is written against — canvas, surfaces, lines, ink, emphasis, focus, data, scrim and washes — with their value in **light** and **dark**, followed by the twelve-step **neutral ramp** they draw from and the four **state hues**. Every value on this page is read from `tokens.css` when the site builds, so the page cannot drift from the source.";

const groups: { heading: string; names: string[] }[] = [
  { heading: "Surfaces", names: ["--canvas", "--surface", "--surface-2", "--surface-3"] },
  { heading: "Lines", names: ["--hairline", "--hairline-strong", "--border-control"] },
  { heading: "Ink", names: ["--text-1", "--text-2", "--text-3", "--text-4"] },
  { heading: "Emphasis and focus", names: ["--emphasis", "--emphasis-on", "--emphasis-quiet", "--focus-ring"] },
  { heading: "Data", names: ["--series-1", "--series-track", "--delta-up", "--delta-down"] },
  { heading: "Overlay and washes", names: ["--scrim", "--wash-warm", "--wash-cool"] },
];

const usage: Record<string, string> = {
  "--canvas": "The page behind everything. Text never sits on it directly.",
  "--surface": "Cards, tables, drawers, the sidebar — where text sits.",
  "--surface-2": "Inputs, table headers, the segmented trough, loading blocks.",
  "--surface-3": "Hovered and selected rows, highlighted menu items, avatars, counts.",
  "--hairline": "Card borders, row rules, dividers.",
  "--hairline-strong": "Between drawer sections, tag outlines, a chart's baseline.",
  "--border-control": "The edge of an input, a select, a checkbox, a radio.",
  "--text-1": "Titles, values, the first column of a table, and the ink series of a chart.",
  "--text-2": "Body copy and the other table columns.",
  "--text-3": "Labels and captions.",
  "--text-4": "Hints, placeholders, caps labels, icons at rest.",
  "--emphasis": "Primary buttons, a chosen pill, a checked box: emphasis is ink, never a hue.",
  "--emphasis-on": "Text and icons on --emphasis.",
  "--emphasis-quiet": "The current sidebar item and the active letter of an A–Z strip.",
  "--focus-ring": "The keyboard focus outline, at --focus-w.",
  "--series-1": "InlineMeter's fill, in the body-copy ink so a stack of bars stays quiet.",
  "--series-track": "The unfilled track behind meters, progress bars and sliders.",
  "--delta-up": "A rise against the last period, beside its glyph.",
  "--delta-down": "A fall against the last period, beside its glyph.",
  "--scrim": "Behind drawers and dialogs.",
  "--wash-warm": "A faint warm tint over a large empty area, such as a landing hero. Never behind data.",
  "--wash-cool": "The cool counterpart of --wash-warm.",
};

const listed = new Set(groups.flatMap((g) => g.names));
const allGroups = [
  ...groups.map((g) => ({ ...g, names: g.names.filter((n) => roleTokens.includes(n)) })),
  { heading: "Other roles", names: roleTokens.filter((n) => !listed.has(n)) },
].filter((g) => g.names.length);

function RoleTable() {
  return (
    <div className={styles.panel}>
      <table className={cn("small", styles.table)}>
        <thead>
          <tr>
            <th className="caps" aria-label="Swatch" />
            <th className="caps">Token</th>
            <th className="caps">Light</th>
            <th className="caps">Dark</th>
            <th className="caps">Use it for</th>
          </tr>
        </thead>
        {allGroups.map((group) => (
          <tbody key={group.heading}>
            <tr className={styles.groupRow}>
              <td colSpan={5} className="caps">
                {group.heading}
              </td>
            </tr>
            {group.names.map((name) => {
              const ref = (theme: Theme) => reference(name, theme);
              return (
                <tr key={name}>
                  <td>
                    <span className={cn(styles.swatch, styles.checker)} style={{ "--swatch": `var(${name})` } as CSSProperties} />
                  </td>
                  <td>
                    <div className={cn("num", styles.name)}>{name}</div>
                    {ref("light") && (
                      <div className={cn("num-sm", styles.ref)}>
                        → {ref("light")}
                        {ref("dark") && ref("dark") !== ref("light") ? ` · dark → ${ref("dark")}` : ""}
                      </div>
                    )}
                  </td>
                  <td>
                    <ThemedValue name={name} theme="light" />
                  </td>
                  <td>
                    <ThemedValue name={name} theme="dark" />
                  </td>
                  <td className={cn("small", styles.usage)}>{usage[name] ?? "—"}</td>
                </tr>
              );
            })}
          </tbody>
        ))}
      </table>
    </div>
  );
}

function Ramp({ names, theme, label }: { names: string[]; theme: Theme; label: string }) {
  return (
    <div className={styles.rampRow}>
      <span className={cn("caps text-4", styles.rampLabel)}>{label}</span>
      <div className={styles.ramp} style={{ "--steps": names.length } as CSSProperties}>
        {names.map((name) => {
          const value = resolve(name, theme);
          return (
            <div key={name} className={styles.step}>
              <span className={styles.stepSwatch} style={{ background: value }} />
              <span className={cn("num-sm", styles.stepLabel)}>{name.replace(/^--/, "")}</span>
              <span className={cn("num-sm", styles.stepValue)}>{value}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function SemanticTokens() {
  return (
    <>
      <Section
        title="Roles"
        caption="Components use these names, never a ramp step, so dark mode is a swap of values rather than a second set of styles. The swatch is live in the current theme; the two columns are read from tokens.css."
      >
        <RoleTable />
      </Section>
      <Section
        title="Neutral ramp"
        caption={`${neutralRamp.length} steps from paper to ink. Light runs warm; dark is its own ramp, not an inversion. The roles above point into it.`}
      >
        <div className={cn(styles.panel, styles.panelPad)}>
          <Ramp names={neutralRamp} theme="light" label="Light" />
          <Ramp names={neutralRamp} theme="dark" label="Dark" />
        </div>
      </Section>
      <Section
        title="State hues"
        caption="Four ramps of ten steps: teal settled, blue in flight, amber attention, red critical. They are the same in both themes; Chip picks the 050, 100 and 700 steps in light and 900, 800 and 300 in dark."
      >
        <Alert tone="neutral" title="Only the state components may use them.">
          Chrome is achromatic and state is chromatic, so a coloured pixel always means a state. Outside a chip, a hue appears only as a state glyph beside its
          text — in Alert, Toast, HelperText and PriorityMark — or as a field&apos;s error, each borrowing its chip&apos;s 700 step, or 300 in dark.
        </Alert>
        <div className={cn(styles.panel, styles.panelPad)}>
          {hueRamps.map((ramp) => (
            <Ramp key={ramp.hue} names={ramp.steps} theme="light" label={ramp.hue} />
          ))}
        </div>
      </Section>
    </>
  );
}
