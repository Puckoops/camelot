import {
  cloneElement,
  forwardRef,
  isValidElement,
  useId,
  type InputHTMLAttributes,
  type ReactElement,
  type ReactNode,
  type TextareaHTMLAttributes,
} from "react";
import { Search01Icon } from "@hugeicons/core-free-icons";
import { cn } from "../../../lib/cn";
import { Icon, type IconDefinition } from "../Icon/Icon";
import styles from "./Field.module.css";

export interface FieldProps {
  label: ReactNode;
  required?: boolean;
  hint?: ReactNode;
  error?: ReactNode;
  /** Something that sits at the right of the label row, such as an "Add client" link. */
  aside?: ReactNode;
  className?: string;
  /** The control. It receives id, aria-describedby and aria-invalid. */
  children: ReactElement<{ id?: string; "aria-describedby"?: string; "aria-invalid"?: boolean }>;
}

export function Field({ label, required, hint, error, aside, className, children }: FieldProps) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;
  const control = isValidElement(children)
    ? cloneElement(children, { id, "aria-describedby": describedBy, "aria-invalid": error ? true : undefined })
    : children;
  return (
    <div className={cn(styles.field, className)}>
      <div className={styles.labelRow}>
        <label htmlFor={id} className={styles.label}>
          {label}
          {required && <span className={styles.required} aria-hidden="true">*</span>}
        </label>
        {aside}
      </div>
      {control}
      {hint && !error && <p id={hintId} className={styles.hint}>{hint}</p>}
      {error && <p id={errorId} className={styles.error} role="alert">{error}</p>}
    </div>
  );
}

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "prefix"> {
  iconStart?: IconDefinition;
  suffix?: ReactNode;
  prefix?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { iconStart, prefix, suffix, className, ...rest },
  ref,
) {
  if (!iconStart && !prefix && !suffix) {
    return <input ref={ref} className={cn(styles.input, className)} {...rest} />;
  }
  return (
    <div className={cn(styles.input, styles.withAdornment, className)} data-disabled={rest.disabled || undefined}>
      {iconStart && <Icon icon={iconStart} size={14} className={styles.adornment} />}
      {prefix && <span className={styles.affix}>{prefix}</span>}
      <input ref={ref} className={styles.bare} {...rest} />
      {suffix && <span className={styles.affix}>{suffix}</span>}
    </div>
  );
});

export const SearchInput = forwardRef<HTMLInputElement, Omit<InputProps, "iconStart" | "type">>(function SearchInput(
  { placeholder = "Search", ...rest },
  ref,
) {
  return <Input ref={ref} type="search" iconStart={Search01Icon} placeholder={placeholder} autoComplete="off" {...rest} />;
});

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(function Textarea(
  { className, rows = 4, ...rest },
  ref,
) {
  return <textarea ref={ref} rows={rows} className={cn(styles.input, styles.textarea, className)} {...rest} />;
});
