import { DropdownMenu } from "radix-ui";
import type { ReactNode } from "react";
import { cn } from "../../../lib/cn";
import { Icon, type IconDefinition } from "../Icon/Icon";
import styles from "./Menu.module.css";

export interface MenuProps {
  trigger: ReactNode;
  children: ReactNode;
  align?: "start" | "center" | "end";
  side?: "top" | "right" | "bottom" | "left";
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  minWidth?: number;
}

export function Menu({ trigger, children, align = "end", side = "bottom", open, onOpenChange, minWidth = 200 }: MenuProps) {
  return (
    <DropdownMenu.Root open={open} onOpenChange={onOpenChange}>
      <DropdownMenu.Trigger asChild>{trigger}</DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content className={styles.content} align={align} side={side} sideOffset={6} collisionPadding={12} style={{ minWidth }}>
          {children}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

export interface MenuItemProps {
  children: ReactNode;
  icon?: IconDefinition;
  onSelect?: () => void;
  disabled?: boolean;
  /** Render the child (a link) as the item. */
  asChild?: boolean;
}

export function MenuItem({ children, icon, onSelect, disabled, asChild }: MenuItemProps) {
  return (
    <DropdownMenu.Item className={styles.item} onSelect={onSelect} disabled={disabled} asChild={asChild}>
      {asChild ? (
        children
      ) : (
        <span className={styles.itemInner}>
          {icon && <Icon icon={icon} size={16} className={styles.itemIcon} />}
          {children}
        </span>
      )}
    </DropdownMenu.Item>
  );
}

export function MenuLabel({ children }: { children: ReactNode }) {
  return <DropdownMenu.Label className={cn("caps", styles.label)}>{children}</DropdownMenu.Label>;
}

export function MenuSeparator() {
  return <DropdownMenu.Separator className={styles.separator} />;
}

/** A non-item row inside a menu, for controls such as the appearance switch. */
export function MenuGroup({ children }: { children: ReactNode }) {
  return <DropdownMenu.Group className={styles.group}>{children}</DropdownMenu.Group>;
}
