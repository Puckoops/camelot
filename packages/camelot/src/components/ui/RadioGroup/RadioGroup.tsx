import { RadioGroup as RRadioGroup } from "radix-ui";
import { useId, type ReactNode, type Ref } from "react";
import { cn } from "../../../lib/cn";
import styles from "./RadioGroup.module.css";

export interface RadioOption<T extends string = string> {
  value: T;
  label: ReactNode;
  /** A sentence under the label, linked to the radio as its description. */
  description?: ReactNode;
  disabled?: boolean;
}

export interface RadioGroupProps<T extends string = string> {
  options: RadioOption<T>[];
  value?: T;
  defaultValue?: T;
  onValueChange?: (value: T) => void;
  orientation?: "vertical" | "horizontal";
  name?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  "aria-describedby"?: string;
}

/** One choice from a short list, each option able to carry a sentence of explanation. Arrow keys move the choice. */
export function RadioGroup<T extends string = string>({
  options,
  value,
  defaultValue,
  onValueChange,
  orientation = "vertical",
  className,
  ref,
  ...rest
}: RadioGroupProps<T> & { ref?: Ref<HTMLDivElement> }) {
  const baseId = useId();
  return (
    <RRadioGroup.Root
      ref={ref}
      value={value}
      defaultValue={defaultValue}
      onValueChange={(v) => onValueChange?.(v as T)}
      orientation={orientation}
      className={cn(styles.group, styles[orientation], className)}
      {...rest}
    >
      {options.map((o, i) => {
        const id = `${baseId}-${i}`;
        const descriptionId = o.description ? `${id}-description` : undefined;
        return (
          <div key={o.value} className={cn(styles.option, o.disabled && styles.disabled)}>
            <RRadioGroup.Item id={id} value={o.value} disabled={o.disabled} aria-describedby={descriptionId} className={styles.radio}>
              <RRadioGroup.Indicator className={styles.indicator} />
            </RRadioGroup.Item>
            <span className={styles.text}>
              <label htmlFor={id} className={styles.label}>
                {o.label}
              </label>
              {o.description && (
                <span id={descriptionId} className={styles.description}>
                  {o.description}
                </span>
              )}
            </span>
          </div>
        );
      })}
    </RRadioGroup.Root>
  );
}
