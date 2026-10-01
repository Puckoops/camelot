import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../../../lib/cn";
import { Glyph, type GlyphShape } from "../Glyph/Glyph";
import styles from "./HelperText.module.css";

export type HelperTextTone = "hint" | "error" | "success";

const glyphs: Record<HelperTextTone, GlyphShape> = { hint: "dot", error: "triangle", success: "check" };

export interface HelperTextProps extends HTMLAttributes<HTMLParagraphElement> {
  tone?: HelperTextTone;
  /** Overrides the tone's glyph, or false to drop it. */
  glyph?: GlyphShape | false;
  children: ReactNode;
}

/** A line under a control: a hint, an error that says what to do next, or a confirmation. */
export function HelperText({ tone = "hint", glyph, className, children, role, ...rest }: HelperTextProps) {
  const shape = glyph === false ? null : (glyph ?? glyphs[tone]);
  return (
    <p role={role ?? (tone === "error" ? "alert" : undefined)} className={cn(styles.text, styles[tone], className)} {...rest}>
      {shape && <Glyph shape={shape} size={10} className={styles.glyph} />}
      <span>{children}</span>
    </p>
  );
}
