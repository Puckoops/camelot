import { cn } from "../../../lib/cn";
import styles from "./Meter.module.css";

export interface MeterProps {
  /** 0–100; values above 100 fill the bar and keep their number. */
  percent: number;
  label?: string;
  className?: string;
  size?: "thin" | "default";
}

export function Meter({ percent, label, className, size = "default" }: MeterProps) {
  const clamped = Math.max(0, Math.min(100, percent));
  return (
    <div
      role="meter"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(percent)}
      aria-label={label}
      className={cn(styles.track, styles[size], className)}
    >
      <span className={styles.fill} style={{ transform: `scaleX(${clamped / 100})` }} />
    </div>
  );
}

export interface InlineMeterRow {
  label: string;
  percent: number;
  /** Where a warning tick sits, as a percentage of the bar. */
  threshold?: number;
}

/** The Allocated / Committed / Consumed / Invoiced stack: four 4px bars with a percentage at a fixed 34px. */
export function InlineMeter({ rows, className }: { rows: InlineMeterRow[]; className?: string }) {
  return (
    <div className={cn(styles.stack, className)}>
      {rows.map((r) => (
        <div key={r.label} className={styles.row}>
          <span className={styles.rowLabel}>{r.label}</span>
          <span className={styles.rowTrack} aria-hidden="true">
            <span className={styles.fill} style={{ transform: `scaleX(${Math.max(0, Math.min(100, r.percent)) / 100})` }} />
            {r.threshold !== undefined && <span className={styles.tick} style={{ left: `${Math.min(100, r.threshold)}%` }} />}
          </span>
          <span className={cn("num-sm", styles.pct)}>{Math.round(r.percent)}%</span>
        </div>
      ))}
    </div>
  );
}

export interface SparkbarsProps {
  values: number[];
  /** How many trailing bars carry ink; the rest are quiet. */
  highlight?: number;
  height?: number;
  label?: string;
  className?: string;
}

export function Sparkbars({ values, highlight = 3, height = 56, label, className }: SparkbarsProps) {
  const max = Math.max(1, ...values);
  return (
    <div className={cn(styles.bars, className)} style={{ height }} role="img" aria-label={label}>
      {values.map((v, i) => (
        <span
          key={i}
          className={cn(styles.bar, i >= values.length - highlight && styles.barInk)}
          style={{ height: `${Math.max(6, (v / max) * 100)}%` }}
        />
      ))}
    </div>
  );
}
