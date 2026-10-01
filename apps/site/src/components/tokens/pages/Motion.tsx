import { cn } from "@puckoops/camelot/helpers";
import { MotionTrack, ReducedMotionNote, ReplayButton, ReplayProvider } from "@/components/tokens/MotionDemo";
import { bezier, motionTokens, reducedMotionRule } from "@/components/tokens/parse";
import { Section } from "@/components/tokens/TokenDocs";
import styles from "@/components/tokens/Tokens.module.css";

export const description =
  "The four **durations** and three **easings**, each with a demo you can replay, and the rules that bind them: transform and opacity only, and everything collapses for **prefers-reduced-motion**. Values are read from `tokens.css` and `motion.css` at build time.";

const durationUsage: Record<string, string> = {
  "--dur-1": "Hover ink, a tooltip leaving, a toggle's small changes.",
  "--dur-2": "Menus, tooltips, the segmented thumb, the switch, the scrim.",
  "--dur-3": "Drawers, dialogs, toasts, alerts arriving.",
  "--dur-4": "A value ticking to its new figure, a bar filling, a scroll reveal.",
};

const easingUsage: Record<string, string> = {
  "--ease-out": "Anything arriving: it starts quickly and settles.",
  "--ease-in-out": "State changes and exits.",
  "--ease-spring": "A small overshoot for something that lands, such as a dropped card or a radio's dot.",
};

function Curve({ value }: { value: string }) {
  const points = bezier(value);
  if (!points) return <span className="num-sm text-4">{value}</span>;
  const [x1, y1, x2, y2] = points;
  const w = 96;
  const h = 72;
  const y = (v: number) => h - v * h;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={styles.curve} aria-hidden="true">
      <path d={`M0 ${h} H${w} M0 ${h} V0`} className={styles.curveAxis} />
      <path d={`M0 ${y(0)} C${x1 * w} ${y(y1)} ${x2 * w} ${y(y2)} ${w} ${y(1)}`} className={styles.curveLine} />
    </svg>
  );
}

function TokenLabel({ name, value, usage }: { name: string; value: string; usage?: string }) {
  return (
    <div>
      <p className={cn("num", styles.name)}>{name}</p>
      <p className="num-sm text-4">{value}</p>
      <p className="caption text-3">{usage ?? "—"}</p>
    </div>
  );
}

export function MotionTokens() {
  return (
    <ReplayProvider>
      <>
        <ReducedMotionNote />
        <Section title="Durations" caption="Four steps. Small things move fast; big things take longer, but nothing in the product takes more than --dur-4.">
          <div className={styles.toolbar}>
            <span className="caption text-3">Each bar fills with transform over its duration on --ease-out.</span>
            <ReplayButton />
          </div>
          <div className={styles.panel}>
            {motionTokens.durations.map((d) => (
              <div key={d.name} className={styles.motionRow}>
                <TokenLabel name={d.name} value={d.value} usage={durationUsage[d.name]} />
                <MotionTrack duration={`var(${d.name})`} easing="var(--ease-out)" />
                <span />
              </div>
            ))}
          </div>
        </Section>

        <Section title="Easings" caption="Three curves, each shown over --dur-4 so the shape is visible.">
          <div className={styles.toolbar}>
            <span className="caption text-3">The curve plots progress against time.</span>
            <ReplayButton />
          </div>
          <div className={styles.panel}>
            {motionTokens.easings.map((e) => (
              <div key={e.name} className={styles.motionRow}>
                <TokenLabel name={e.name} value={e.value} usage={easingUsage[e.name]} />
                <MotionTrack duration="var(--dur-4)" easing={`var(${e.name})`} />
                <Curve value={e.value} />
              </div>
            ))}
          </div>
        </Section>

        <Section
          title="Rules"
          caption="Motion is transform and opacity only, so nothing costs a layout pass. Scroll reveals use the .reveal class, driven by the scroll timeline where the browser supports it."
        >
          <div className={cn(styles.panel, styles.panelPad, styles.column)}>
            <p className="small text-2">Everything is wrapped for prefers-reduced-motion. From motion.css:</p>
            <pre className={cn("num-sm", styles.code)}>{reducedMotionRule}</pre>
          </div>
        </Section>
      </>
    </ReplayProvider>
  );
}
