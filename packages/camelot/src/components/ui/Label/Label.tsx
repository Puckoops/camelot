import { Label as RLabel } from "radix-ui";
import { forwardRef, type ComponentPropsWithoutRef } from "react";
import { cn } from "../../../lib/cn";
import styles from "./Label.module.css";

export interface LabelProps extends ComponentPropsWithoutRef<typeof RLabel.Root> {
  required?: boolean;
  /** Adds a quiet "Optional" after the text. */
  optional?: boolean;
}

/** The caption above a control. Clicking it focuses the control named by htmlFor. */
export const Label = forwardRef<HTMLLabelElement, LabelProps>(function Label({ required, optional, className, children, ...rest }, ref) {
  return (
    <RLabel.Root ref={ref} className={cn(styles.label, className)} {...rest}>
      {children}
      {required && (
        <span className={styles.required} aria-hidden="true">
          *
        </span>
      )}
      {optional && !required && <span className={styles.optional}>Optional</span>}
    </RLabel.Root>
  );
});
