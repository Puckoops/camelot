import { Select as RSelect } from "radix-ui";
import { ArrowDown01Icon, Tick02Icon } from "@hugeicons/core-free-icons";
import { forwardRef, type ReactNode } from "react";
import { cn } from "../../../lib/cn";
import { Icon } from "../Icon/Icon";
import styles from "./Select.module.css";

export interface SelectOption {
  value: string;
  label: ReactNode;
  /** Plain text for the closed trigger and typeahead when `label` is not a string. */
  text?: string;
  disabled?: boolean;
}

export interface SelectProps {
  options: SelectOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  /** Adds a first option that stands for "no filter", such as "All clients"; it reports "". */
  allLabel?: string;
  /** field: an input-shaped control inside a form. filter: a compact button in a filter row. */
  variant?: "field" | "filter";
  disabled?: boolean;
  id?: string;
  name?: string;
  className?: string;
  "aria-label"?: string;
  "aria-describedby"?: string;
  "aria-invalid"?: boolean;
}

const ALL = "__all__";

export const Select = forwardRef<HTMLButtonElement, SelectProps>(function Select(
  {
    options,
    value,
    defaultValue,
    onValueChange,
    placeholder = "Select",
    allLabel,
    variant = "field",
    disabled,
    id,
    name,
    className,
    ...aria
  },
  ref,
) {
  const toInner = (v: string | undefined) => (v === undefined ? undefined : v === "" && allLabel ? ALL : v || undefined);
  return (
    <RSelect.Root
      value={toInner(value)}
      defaultValue={toInner(defaultValue)}
      onValueChange={(v) => onValueChange?.(v === ALL ? "" : v)}
      disabled={disabled}
      name={name}
    >
      <RSelect.Trigger ref={ref} id={id} className={cn(styles.trigger, styles[variant], className)} {...aria}>
        <RSelect.Value placeholder={allLabel ?? placeholder} />
        <RSelect.Icon className={styles.chevron}>
          <Icon icon={ArrowDown01Icon} size={14} />
        </RSelect.Icon>
      </RSelect.Trigger>
      <RSelect.Portal>
        <RSelect.Content className={styles.content} position="popper" sideOffset={6} collisionPadding={12}>
          <RSelect.Viewport className={styles.viewport}>
            {allLabel && <Item value={ALL}>{allLabel}</Item>}
            {options.map((o) => (
              <Item key={o.value} value={o.value} disabled={o.disabled} text={o.text}>
                {o.label}
              </Item>
            ))}
          </RSelect.Viewport>
        </RSelect.Content>
      </RSelect.Portal>
    </RSelect.Root>
  );
});

function Item({ value, disabled, text, children }: { value: string; disabled?: boolean; text?: string; children: ReactNode }) {
  return (
    <RSelect.Item value={value} disabled={disabled} textValue={text} className={styles.item}>
      <RSelect.ItemText>{children}</RSelect.ItemText>
      <RSelect.ItemIndicator className={styles.indicator}>
        <Icon icon={Tick02Icon} size={14} />
      </RSelect.ItemIndicator>
    </RSelect.Item>
  );
}
