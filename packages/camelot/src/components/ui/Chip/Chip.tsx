import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../../../lib/cn";
import { Glyph, type GlyphShape } from "../Glyph/Glyph";
import styles from "./Chip.module.css";

/** The only place a hue may appear. teal settled · blue in flight · amber attention · red critical. */
export type ChipTone = "teal" | "blue" | "amber" | "red" | "neutral";

export interface ChipProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: ChipTone;
  /** Never optional in product screens: the glyph is what survives a greyscale screenshot. */
  glyph?: GlyphShape;
  /** Cancelled-style: neutral at reduced opacity with the label struck through. */
  struck?: boolean;
  children: ReactNode;
}

export function Chip({ tone = "neutral", glyph, struck, className, children, ...rest }: ChipProps) {
  return (
    <span className={cn(styles.chip, styles[tone], struck && styles.struck, className)} {...rest}>
      {glyph && <Glyph shape={glyph} />}
      <span className={styles.label}>{children}</span>
    </span>
  );
}
