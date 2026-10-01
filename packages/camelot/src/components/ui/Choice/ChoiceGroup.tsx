import { useRef, type KeyboardEvent, type ReactNode } from "react";
import { cn } from "../../../lib/cn";
import { useControllable } from "../../../lib/useControllable";
import styles from "./ChoiceGroup.module.css";

export interface ChoiceOption<T extends string> {
  value: T;
  label: ReactNode;
}

export interface ChoiceGroupProps<T extends string> {
  options: ChoiceOption<T>[];
  value?: T;
  defaultValue?: T;
  onValueChange?: (value: T) => void;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  /**
   * pill: the Tracker's quick filters (the chosen one is ink-filled).
   * outline: form choices such as Type or Priority (the chosen one gains an ink ring).
   * bare: options that carry their own look, such as status chips; the chosen one gains the ring.
   */
  look?: "pill" | "outline" | "bare";
  className?: string;
}

export function ChoiceGroup<T extends string>({
  options,
  value,
  defaultValue,
  onValueChange,
  look = "outline",
  className,
  ...aria
}: ChoiceGroupProps<T>) {
  const [current, setCurrent] = useControllable<T | undefined>(value, defaultValue, onValueChange as (v: T | undefined) => void);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const index = options.findIndex((o) => o.value === current);

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const step = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
    if (!step) return;
    e.preventDefault();
    const from = index < 0 ? 0 : index;
    const next = (from + step + options.length) % options.length;
    const option = options[next];
    if (!option) return;
    setCurrent(option.value);
    refs.current[next]?.focus();
  };

  return (
    <div role="radiogroup" className={cn(styles.group, className)} onKeyDown={onKeyDown} {...aria}>
      {options.map((o, i) => {
        const selected = o.value === current;
        return (
          <button
            key={o.value}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="radio"
            aria-checked={selected}
            tabIndex={selected || (index < 0 && i === 0) ? 0 : -1}
            className={cn(styles.option, styles[look], selected && styles.selected)}
            onClick={() => setCurrent(o.value)}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
