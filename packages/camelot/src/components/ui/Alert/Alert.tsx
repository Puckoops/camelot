import { Cancel01Icon } from "@hugeicons/core-free-icons";
import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../../../lib/cn";
import { IconButton } from "../Button/Button";
import { Glyph, type GlyphShape } from "../Glyph/Glyph";
import styles from "./Alert.module.css";

export type AlertTone = "neutral" | "info" | "success" | "warning" | "critical";

const glyphs: Record<AlertTone, GlyphShape> = {
  neutral: "circle",
  info: "diamond",
  success: "check",
  warning: "diamond-filled",
  critical: "triangle",
};

export interface AlertProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  /** Colours the glyph and the left edge only; the surface and text stay achromatic. */
  tone?: AlertTone;
  title: ReactNode;
  /** One or two sentences under the title. */
  children?: ReactNode;
  /** A single ghost button or TextLink, under the body. */
  action?: ReactNode;
  /** Shows a close button that calls this. */
  onDismiss?: () => void;
  dismissLabel?: string;
  /** Overrides the tone's glyph; every tone keeps a distinct shape so it reads in greyscale. */
  glyph?: GlyphShape;
}

/** A message that stays on the page until it is dealt with. Warning and critical interrupt assistive tech; the rest wait. */
export function Alert({
  tone = "neutral",
  title,
  children,
  action,
  onDismiss,
  dismissLabel = "Dismiss",
  glyph,
  className,
  role,
  ...rest
}: AlertProps) {
  return (
    <div
      role={role ?? (tone === "warning" || tone === "critical" ? "alert" : "status")}
      className={cn(styles.alert, styles[tone], className)}
      {...rest}
    >
      <Glyph shape={glyph ?? glyphs[tone]} className={styles.glyph} />
      <div className={styles.text}>
        <p className={styles.title}>{title}</p>
        {children && <div className={cn("small", styles.body)}>{children}</div>}
        {action && <div className={styles.action}>{action}</div>}
      </div>
      {onDismiss && (
        <IconButton icon={Cancel01Icon} size="sm" variant="bare" aria-label={dismissLabel} onClick={onDismiss} className={styles.dismiss} />
      )}
    </div>
  );
}
