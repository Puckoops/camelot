import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../../../lib/cn";
import styles from "./Badge.module.css";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /** count: a tabular mono number in a pill. tag: a short neutral word in mono caps, outlined. */
  variant?: "count" | "tag";
  /** Ink fill for a count that needs attention, such as unread. Still never a state. */
  strong?: boolean;
  /** A numeric count above max reads "{max}+". */
  max?: number;
  children: ReactNode;
}

/** A neutral count or tag. It has no tone and no glyph: a state belongs in a Chip. */
export function Badge({ variant = "count", strong, max, className, children, ...rest }: BadgeProps) {
  const shown = typeof children === "number" && max !== undefined && children > max ? `${max}+` : children;
  return (
    <span className={cn(styles.badge, styles[variant], strong && styles.strong, className)} {...rest}>
      {shown}
    </span>
  );
}
