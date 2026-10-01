import { useEffect, useRef, useState } from "react";
import { cn } from "../../../lib/cn";
import styles from "./Kpi.module.css";

export interface KpiProps {
  value: number;
  format?: (value: number) => string;
  /** hero is the one figure per screen at 52px; everything else is 30px. */
  size?: "hero" | "default";
  className?: string;
}

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

/** value-tick: a changed figure counts to its new value over --dur-4. The first render is already final. */
export function Kpi({ value, format = (n) => Math.round(n).toLocaleString("en-GB"), size = "default", className }: KpiProps) {
  const [shown, setShown] = useState(value);
  const from = useRef(value);
  const frame = useRef<number | null>(null);

  useEffect(() => {
    const start = from.current;
    if (start === value) return;
    const reduced = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduced || document.hidden) {
      from.current = value;
      setShown(value);
      return;
    }
    const began = performance.now();
    const duration = 420;
    const tick = (now: number) => {
      const t = Math.min(1, (now - began) / duration);
      setShown(start + (value - start) * easeOut(t));
      if (t < 1) frame.current = requestAnimationFrame(tick);
      else from.current = value;
    };
    frame.current = requestAnimationFrame(tick);
    return () => {
      if (frame.current !== null) cancelAnimationFrame(frame.current);
      from.current = value;
    };
  }, [value]);

  return <span className={cn(size === "hero" ? "kpi-hero" : "kpi", styles.kpi, className)}>{format(shown)}</span>;
}
