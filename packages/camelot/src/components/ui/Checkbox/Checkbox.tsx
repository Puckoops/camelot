import { Checkbox as RCheckbox } from "radix-ui";
import { Tick02Icon } from "@hugeicons/core-free-icons";
import { forwardRef, useId, type ReactNode } from "react";
import { cn } from "../../../lib/cn";
import { Icon } from "../Icon/Icon";
import styles from "./Checkbox.module.css";

export interface CheckboxProps {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  label?: ReactNode;
  disabled?: boolean;
  id?: string;
  name?: string;
  className?: string;
}

export const Checkbox = forwardRef<HTMLButtonElement, CheckboxProps>(function Checkbox(
  { checked, defaultChecked, onCheckedChange, label, disabled, id, name, className },
  ref,
) {
  const autoId = useId();
  const boxId = id ?? autoId;
  return (
    <span className={cn(styles.wrap, disabled && styles.disabled, className)}>
      <RCheckbox.Root
        ref={ref}
        id={boxId}
        name={name}
        checked={checked}
        defaultChecked={defaultChecked}
        onCheckedChange={(v) => onCheckedChange?.(v === true)}
        disabled={disabled}
        className={styles.box}
      >
        <RCheckbox.Indicator className={styles.indicator}>
          <Icon icon={Tick02Icon} size={12} strokeWidth={2} />
        </RCheckbox.Indicator>
      </RCheckbox.Root>
      {label && (
        <label htmlFor={boxId} className={styles.label}>
          {label}
        </label>
      )}
    </span>
  );
});
