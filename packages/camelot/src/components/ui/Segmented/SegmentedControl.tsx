import { useLayoutEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { cn } from "../../../lib/cn";
import { useControllable } from "../../../lib/useControllable";
import styles from "./SegmentedControl.module.css";

export interface SegmentOption<T extends string> {
  value: T;
  label: ReactNode;
}

export interface SegmentedControlProps<T extends string> {
  options: SegmentOption<T>[];
  value?: T;
  defaultValue?: T;
  onValueChange?: (value: T) => void;
  "aria-label": string;
  size?: "sm" | "md";
  className?: string;
}

/** Month · Week · Timeline · Agenda, Both · Payable · Receivable: one choice, the thumb slides, labels stay put. */
export function SegmentedControl<T extends string>({
  options,
  value,
  defaultValue,
  onValueChange,
  size = "md",
  className,
  ...aria
}: SegmentedControlProps<T>) {
  const first = options[0]?.value as T;
  const [current, setCurrent] = useControllable<T>(value, defaultValue ?? first, onValueChange);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const [thumb, setThumb] = useState<{ x: number; w: number } | null>(null);
  const index = Math.max(0, options.findIndex((o) => o.value === current));

  useLayoutEffect(() => {
    const el = refs.current[index];
    if (!el) return;
    const measure = () => setThumb({ x: el.offsetLeft, w: el.offsetWidth });
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [index, options.length]);

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const step = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
    if (!step) return;
    e.preventDefault();
    const next = (index + step + options.length) % options.length;
    const option = options[next];
    if (!option) return;
    setCurrent(option.value);
    refs.current[next]?.focus();
  };

  return (
    <div role="radiogroup" className={cn(styles.trough, styles[size], className)} onKeyDown={onKeyDown} {...aria}>
      {thumb && <span className={styles.thumb} style={{ width: thumb.w, transform: `translateX(${thumb.x}px)` }} aria-hidden="true" />}
      {options.map((o, i) => {
        const selected = i === index;
        return (
          <button
            key={o.value}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="radio"
            aria-checked={selected}
            tabIndex={selected ? 0 : -1}
            className={cn(styles.segment, selected && styles.selected)}
            onClick={() => setCurrent(o.value)}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
