import { Progress as RProgress } from "radix-ui";
import { useId, type ReactNode } from "react";
import { cn } from "../../../lib/cn";
import styles from "./Progress.module.css";

const percentOf = (value: number, max: number) => (max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 0);
const clampTo = (value: number | null, max: number) => (value === null ? null : Math.max(0, Math.min(max, value)));
const defaultFormat = (value: number, max: number) => `${Math.round(percentOf(value, max))}%`;

export interface ProgressProps {
  /** null while the total is unknown: the bar slides instead of filling. */
  value: number | null;
  max?: number;
  label?: ReactNode;
  /** top puts the label and value above the bar; side puts them in one row with it. */
  labelPosition?: "top" | "side";
  showValue?: boolean;
  format?: (value: number, max: number) => string;
  size?: "thin" | "default";
  className?: string;
  "aria-label"?: string;
}

/** How far a task has got: an import, a sync, an onboarding checklist. */
export function Progress({
  value,
  max = 100,
  label,
  labelPosition = "top",
  showValue = true,
  format = defaultFormat,
  size = "default",
  className,
  "aria-label": ariaLabel,
}: ProgressProps) {
  const labelId = useId();
  const indeterminate = value === null;
  const pct = indeterminate ? 0 : percentOf(value, max);
  const readout = indeterminate ? null : format(value, max);
  return (
    <div className={cn(styles.linear, styles[labelPosition], !label && styles.noLabel, className)}>
      {label && (
        <span id={labelId} className={styles.label}>
          {label}
        </span>
      )}
      <RProgress.Root
        value={clampTo(value, max)}
        max={max}
        getValueLabel={(v, m) => format(v, m)}
        aria-labelledby={label ? labelId : undefined}
        aria-label={label ? undefined : ariaLabel}
        className={cn(styles.track, styles[size], indeterminate && styles.indeterminate)}
      >
        <RProgress.Indicator className={styles.fill} style={indeterminate ? undefined : { transform: `translateX(${pct - 100}%)` }} />
      </RProgress.Root>
      {showValue && readout !== null && (
        <span className={cn("num-sm", styles.value)} aria-hidden="true">
          {readout}
        </span>
      )}
    </div>
  );
}

const ringSizes = { sm: { box: 20, stroke: 2.5 }, md: { box: 32, stroke: 3 }, lg: { box: 56, stroke: 4 } } as const;

export interface ProgressCircleProps {
  value: number | null;
  max?: number;
  /** sm 20px beside text, md 32px on its own, lg 56px with the value inside. */
  size?: keyof typeof ringSizes;
  label?: ReactNode;
  format?: (value: number, max: number) => string;
  className?: string;
  "aria-label"?: string;
}

/** The same measure as a ring, for a card corner or a row where a bar would not fit. */
export function ProgressCircle({ value, max = 100, size = "md", label, format = defaultFormat, className, "aria-label": ariaLabel }: ProgressCircleProps) {
  const labelId = useId();
  const { box, stroke } = ringSizes[size];
  const r = (box - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const indeterminate = value === null;
  const pct = indeterminate ? 25 : percentOf(value, max);
  return (
    <div className={cn(styles.circle, className)}>
      <RProgress.Root
        value={clampTo(value, max)}
        max={max}
        getValueLabel={(v, m) => format(v, m)}
        aria-labelledby={label ? labelId : undefined}
        aria-label={label ? undefined : ariaLabel}
        className={cn(styles.ring, indeterminate && styles.spinning)}
        style={{ width: box, height: box }}
      >
        <svg viewBox={`0 0 ${box} ${box}`} width={box} height={box} aria-hidden="true" focusable="false">
          <circle className={styles.ringTrack} cx={box / 2} cy={box / 2} r={r} strokeWidth={stroke} fill="none" />
          <circle
            className={styles.ringFill}
            cx={box / 2}
            cy={box / 2}
            r={r}
            strokeWidth={stroke}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - pct / 100)}
            transform={`rotate(-90 ${box / 2} ${box / 2})`}
            opacity={!indeterminate && pct === 0 ? 0 : 1}
          />
        </svg>
        {size === "lg" && !indeterminate && (
          <span className={cn("num-sm", styles.ringValue)} aria-hidden="true">
            {format(value, max)}
          </span>
        )}
      </RProgress.Root>
      {label && (
        <span id={labelId} className={styles.label}>
          {label}
        </span>
      )}
    </div>
  );
}
