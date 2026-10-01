import { Slot } from "radix-ui";
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "../../../lib/cn";
import { Icon, type IconDefinition } from "../Icon/Icon";
import styles from "./Button.module.css";

export type ButtonVariant = "primary" | "ghost" | "quiet";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  iconStart?: IconDefinition;
  iconEnd?: IconDefinition;
  /** Render the child element (a link, say) with the button's styling. */
  asChild?: boolean;
  loading?: boolean;
  children?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "ghost", size = "md", iconStart, iconEnd, asChild, loading, disabled, className, children, type, ...rest },
  ref,
) {
  const Comp = asChild ? Slot.Root : "button";
  const iconSize = size === "lg" ? 20 : 16;
  return (
    <Comp
      ref={ref}
      type={asChild ? undefined : (type ?? "button")}
      className={cn(styles.button, styles[variant], styles[size], className)}
      disabled={asChild ? undefined : disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {asChild ? (
        children
      ) : (
        <>
          {iconStart && <Icon icon={iconStart} size={iconSize} />}
          {children}
          {iconEnd && <Icon icon={iconEnd} size={iconSize} />}
        </>
      )}
    </Comp>
  );
});

export interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  icon: IconDefinition;
  "aria-label": string;
  size?: "sm" | "md";
  variant?: "ghost" | "bare";
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { icon, size = "md", variant = "ghost", className, type, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type ?? "button"}
      className={cn(styles.iconButton, styles[`icon-${size}`], styles[`icon-${variant}`], className)}
      {...rest}
    >
      <Icon icon={icon} size={size === "sm" ? 14 : 16} />
    </button>
  );
});
