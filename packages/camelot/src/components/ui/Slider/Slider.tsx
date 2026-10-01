import { Slider as RSlider } from "radix-ui";
import { forwardRef, useId, useState, type ReactNode } from "react";
import { cn } from "../../../lib/cn";
import styles from "./Slider.module.css";

export interface SliderProps {
  /** One value for a single thumb, two for a range. */
  value?: number[];
  defaultValue?: number[];
  onValueChange?: (value: number[]) => void;
  /** Fires once, when the thumb is released. */
  onValueCommit?: (value: number[]) => void;
  min?: number;
  max?: number;
  step?: number;
  /** For a range, how many steps the two thumbs must stay apart. */
  minStepsBetweenThumbs?: number;
  label?: ReactNode;
  /** Shows the formatted value at the end of the label row. Defaults to true when there is a label. */
  showValue?: boolean;
  /** Shows min and max under the track. */
  showBounds?: boolean;
  format?: (value: number) => string;
  /** Names each thumb for assistive tech; a range defaults to Minimum and Maximum. */
  thumbLabels?: string[];
  disabled?: boolean;
  name?: string;
  id?: string;
  className?: string;
  "aria-label"?: string;
}

const plain = (n: number) => n.toLocaleString("en-GB");

/** Pick an approximate number, or a range with two thumbs, within known bounds. */
export const Slider = forwardRef<HTMLSpanElement, SliderProps>(function Slider(
  {
    value,
    defaultValue,
    onValueChange,
    onValueCommit,
    min = 0,
    max = 100,
    step = 1,
    minStepsBetweenThumbs,
    label,
    showValue,
    showBounds,
    format = plain,
    thumbLabels,
    disabled,
    name,
    id,
    className,
    "aria-label": ariaLabel,
  },
  ref,
) {
  const autoId = useId();
  const baseId = id ?? autoId;
  const labelId = `${baseId}-label`;
  const thumbNameId = (i: number) => `${baseId}-thumb-${i}`;
  const [inner, setInner] = useState<number[]>(defaultValue ?? [min]);
  const current = value ?? inner;
  const isRange = current.length > 1;
  const names = thumbLabels ?? (isRange ? ["Minimum", "Maximum"] : []);
  const readout = current.map(format).join(" – ");

  return (
    <div className={cn(styles.slider, disabled && styles.disabled, className)}>
      {(label || showValue) && (
        <div className={styles.head}>
          {label && (
            <span id={labelId} className={styles.label}>
              {label}
            </span>
          )}
          {(showValue ?? Boolean(label)) && (
            <span className={cn("num", styles.value)} aria-hidden="true">
              {readout}
            </span>
          )}
        </div>
      )}
      <RSlider.Root
        ref={ref}
        id={id}
        name={name}
        value={value}
        defaultValue={defaultValue ?? [min]}
        onValueChange={(v) => {
          if (value === undefined) setInner(v);
          onValueChange?.(v);
        }}
        onValueCommit={onValueCommit}
        min={min}
        max={max}
        step={step}
        minStepsBetweenThumbs={minStepsBetweenThumbs}
        disabled={disabled}
        className={styles.root}
      >
        <RSlider.Track className={styles.track}>
          <RSlider.Range className={styles.range} />
        </RSlider.Track>
        {current.map((v, i) => {
          const labelledBy = [label ? labelId : null, names[i] ? thumbNameId(i) : null].filter(Boolean).join(" ");
          return (
            <RSlider.Thumb
              key={i}
              className={styles.thumb}
              aria-labelledby={labelledBy || undefined}
              aria-label={labelledBy ? undefined : ariaLabel}
              aria-valuetext={format(v)}
            />
          );
        })}
      </RSlider.Root>
      {names.map((n, i) => (
        <span key={i} id={thumbNameId(i)} className="visually-hidden">
          {n}
        </span>
      ))}
      {showBounds && (
        <div className={cn("num-sm", styles.bounds)} aria-hidden="true">
          <span>{format(min)}</span>
          <span>{format(max)}</span>
        </div>
      )}
    </div>
  );
});
