import { Switch as RSwitch } from "radix-ui";
import { forwardRef, useId, type ReactNode } from "react";
import { cn } from "../../../lib/cn";
import styles from "./Switch.module.css";

export interface SwitchProps {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  label?: ReactNode;
  /** A sentence under the label saying what the setting does. */
  description?: ReactNode;
  /** start puts the label first and the switch at the far end, as in a settings list. */
  labelPosition?: "start" | "end";
  size?: "sm" | "md";
  disabled?: boolean;
  id?: string;
  name?: string;
  value?: string;
  className?: string;
  "aria-label"?: string;
}

/** An on/off setting that applies the moment it flips. */
export const Switch = forwardRef<HTMLButtonElement, SwitchProps>(function Switch(
  { checked, defaultChecked, onCheckedChange, label, description, labelPosition = "end", size = "md", disabled, id, name, value, className, ...aria },
  ref,
) {
  const autoId = useId();
  const switchId = id ?? autoId;
  const descriptionId = description ? `${switchId}-description` : undefined;
  return (
    <span className={cn(styles.wrap, labelPosition === "start" && styles.start, disabled && styles.disabled, className)}>
      <RSwitch.Root
        ref={ref}
        id={switchId}
        name={name}
        value={value}
        checked={checked}
        defaultChecked={defaultChecked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        aria-describedby={descriptionId}
        className={cn(styles.track, styles[size])}
        {...aria}
      >
        <RSwitch.Thumb className={styles.thumb} />
      </RSwitch.Root>
      {(label || description) && (
        <span className={styles.text}>
          {label && (
            <label htmlFor={switchId} className={styles.label}>
              {label}
            </label>
          )}
          {description && (
            <span id={descriptionId} className={styles.description}>
              {description}
            </span>
          )}
        </span>
      )}
    </span>
  );
});
