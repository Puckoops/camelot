import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../../../lib/cn";
import styles from "./FormFooter.module.css";

export interface FormFooterProps extends HTMLAttributes<HTMLDivElement> {
  /** Left-aligned, such as "All fields marked * are required" or "Draft saved 2 min ago". */
  note?: ReactNode;
  /** Right-aligned actions: Cancel as quiet, then the one primary. */
  children: ReactNode;
  /** Pins the bar to the bottom of the viewport while the form scrolls. */
  sticky?: boolean;
}

/** The last element of a long full-page form, so its actions stay in reach. Drawers and dialogs have their own footer. */
export function FormFooter({ note, sticky = true, className, children, ...rest }: FormFooterProps) {
  return (
    <div className={cn(styles.footer, sticky && styles.sticky, className)} {...rest}>
      <div className={cn("small", styles.note)}>{note}</div>
      <div className={styles.actions}>{children}</div>
    </div>
  );
}
