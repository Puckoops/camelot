import { cn } from "@puckoops/camelot/helpers";
import { layoutTokens, px, resolve, sharedTokens } from "@/components/tokens/parse";
import { Section } from "@/components/tokens/TokenDocs";
import styles from "@/components/tokens/Tokens.module.css";

export const description =
  "The **spacing** scale with bars to scale, the **radii** on real boxes, and the fixed **layout sizes** of the shell, grid, controls and table rows — every value read from `tokens.css` when the site builds.";

const spaceUsage: Record<string, string> = {
  "--space-1": "Between a title and its caption; inside dense rows.",
  "--space-2": "Between an icon and its label; between controls in a group.",
  "--space-3": "Inside cards and drawers between small groups; table cell padding.",
  "--space-4": "Between fields in a form.",
  "--space-5": "Between a band's heading and its content.",
  "--space-6": "Card padding and the grid gutter.",
  "--space-8": "Above the page header.",
  "--space-10": "The page's side padding.",
  "--space-12": "Between large sections of a document page.",
  "--space-16": "Between bands.",
  "--space-20": "Landing sections.",
  "--space-24": "The page foot on small screens.",
  "--space-32": "The page foot.",
};

const radiusUsage: Record<string, string> = {
  "--radius-xs": "Chips, menu items, calendar days, tags.",
  "--radius-sm": "Buttons, inputs, selects, segmented controls.",
  "--radius-md": "Menus, popovers, toasts, alerts, the dropzone.",
  "--radius-lg": "Cards, table frames, board columns.",
  "--radius-xl": "Large landing surfaces.",
  "--radius-2xl": "The landing hero's media.",
  "--radius-full": "Avatars, meters, sliders, switches, counts.",
};

const layoutUsage: Record<string, string> = {
  "--sidebar-w": "The sidebar.",
  "--sidebar-collapsed": "The sidebar as an icon rail, below 1040px.",
  "--container": "The page's content width.",
  "--container-wide": "A wide page, such as a board.",
  "--grid-cols": "Columns in Grid.",
  "--grid-gutter": "The gap between grid columns.",
  "--nav-h": "The landing page's navigation bar.",
  "--pagehead-h": "The topbar and the sidebar's brand row.",
  "--control-h": "Inputs, selects, buttons and segmented controls.",
  "--row-compact": "Compact table rows.",
  "--row-default": "Default table rows.",
  "--row-relaxed": "Relaxed table rows.",
  "--card-min-h": "The shortest a card may be.",
  "--border-w": "Every hairline and control border.",
  "--focus-w": "The focus outline.",
  "--focus-offset": "The gap between a control and its focus outline.",
};

export function SpacingTokens() {
  const spacing = sharedTokens("--space-");
  const radii = sharedTokens("--radius-");
  const widest = Math.max(...spacing.map((n) => px(resolve(n))));
  return (
    <>
      <Section
        title="Spacing"
        caption={`${spacing.length} steps on a ${resolve(spacing[0]!)} base. Pick the step whose job matches; a gap between two steps means the layout is doing too much.`}
      >
        <div className={styles.panel}>
          <table className={cn("small", styles.table)}>
            <thead>
              <tr>
                <th className="caps">Token</th>
                <th className="caps">Value</th>
                <th className={cn("caps", styles.scaleColumn)}>Scale</th>
                <th className="caps">Use it for</th>
              </tr>
            </thead>
            <tbody>
              {spacing.map((name) => {
                const value = resolve(name);
                return (
                  <tr key={name}>
                    <td className={cn("num", styles.name)}>{name}</td>
                    <td className="num-sm">{value}</td>
                    <td>
                      <span className={styles.bar} style={{ width: `${(px(value) / widest) * 100}%` }} />
                    </td>
                    <td className={cn("small", styles.usage)}>{spaceUsage[name] ?? "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="Radius" caption="Radius grows with the size of the thing: a chip is tight, a card is soft, a person is round.">
        <div className={cn(styles.panel, styles.panelPad)}>
          <div className={styles.radii}>
            {radii.map((name) => (
              <div key={name} className={styles.radiusItem}>
                <span className={styles.radiusBox} style={{ borderRadius: `var(${name})` }} />
                <span className={cn("num", styles.name)}>{name}</span>
                <span className="num-sm text-4">{resolve(name)}</span>
                <span className="caption text-3">{radiusUsage[name] ?? "—"}</span>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section title="Layout sizes" caption="Fixed sizes the shell, the grid, controls and tables are built from.">
        <div className={styles.panel}>
          <table className={cn("small", styles.table)}>
            <thead>
              <tr>
                <th className="caps">Token</th>
                <th className="caps">Value</th>
                <th className="caps">Use it for</th>
              </tr>
            </thead>
            <tbody>
              {layoutTokens.map((name) => (
                <tr key={name}>
                  <td className={cn("num", styles.name)}>{name}</td>
                  <td className="num-sm">{resolve(name)}</td>
                  <td className={cn("small", styles.usage)}>{layoutUsage[name] ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
    </>
  );
}
