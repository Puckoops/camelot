import { cn } from "../../../lib/cn";
import { Glyph, type GlyphShape } from "../Glyph/Glyph";
import styles from "./PriorityMark.module.css";

export type PriorityLevel = 1 | 2 | 3;

const shapes: Record<PriorityLevel, GlyphShape> = { 1: "triangle-filled", 2: "square-filled", 3: "triangle-down" };
const words: Record<PriorityLevel, string> = { 1: "High", 2: "Medium", 3: "Low" };

export interface PriorityMarkProps {
  level: PriorityLevel;
  /** "word" reads High / Medium / Low, "code" reads P1 / P2 / P3. */
  format?: "word" | "code";
  glyph?: boolean;
  className?: string;
}

/** Priority is glyph and ink only, never a filled chip, so a priority column stays quiet. */
export function PriorityMark({ level, format = "word", glyph = true, className }: PriorityMarkProps) {
  return (
    <span className={cn(styles.mark, styles[`p${level}`], className)}>
      {glyph && <Glyph shape={shapes[level]} size={10} className={styles.glyph} />}
      <span className={styles.label}>{format === "code" ? `P${level}` : words[level]}</span>
    </span>
  );
}

export function priorityLabel(level: PriorityLevel, format: "word" | "code" = "word") {
  return format === "code" ? `P${level}` : words[level];
}
