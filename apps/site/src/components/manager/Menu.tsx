"use client";

import { CheckIcon } from "@storybook/icons";
import { cn } from "@puckoops/camelot";
import { DropdownMenu } from "radix-ui";
import type { ReactNode } from "react";
import styles from "./manager.module.css";

export function ToolMenu({
  trigger,
  children,
  align = "start",
  label,
  width = 180,
}: {
  trigger: ReactNode;
  children: ReactNode;
  align?: "start" | "center" | "end";
  label: string;
  width?: number;
}) {
  return (
    <DropdownMenu.Root modal={false}>
      <DropdownMenu.Trigger asChild>{trigger}</DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content data-theme="light" aria-label={label} className={styles.menu} align={align} sideOffset={6} collisionPadding={8} style={{ minWidth: width }}>
          {children}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

export function ToolMenuItem({
  children,
  icon,
  right,
  active,
  onSelect,
  disabled,
}: {
  children: ReactNode;
  icon?: ReactNode;
  right?: ReactNode;
  active?: boolean;
  onSelect?: () => void;
  disabled?: boolean;
}) {
  return (
    <DropdownMenu.Item className={cn(styles.menuItem, active && styles.menuActive)} onSelect={onSelect} disabled={disabled}>
      {icon && <span className={styles.menuIcon}>{icon}</span>}
      <span className={styles.menuText}>{children}</span>
      {right && <span className={styles.menuRight}>{right}</span>}
    </DropdownMenu.Item>
  );
}

export function ToolMenuRadio<V extends string>({
  value,
  onValueChange,
  options,
}: {
  value: V;
  onValueChange: (value: V) => void;
  options: { value: V; label: string; icon?: ReactNode; right?: ReactNode }[];
}) {
  return (
    <DropdownMenu.RadioGroup value={value} onValueChange={(v) => onValueChange(v as V)}>
      {options.map((o) => (
        <DropdownMenu.RadioItem key={o.value} value={o.value} className={cn(styles.menuItem, o.value === value && styles.menuActive)}>
          {o.icon && <span className={styles.menuIcon}>{o.icon}</span>}
          <span className={styles.menuText}>{o.label}</span>
          {o.right && <span className={styles.menuRight}>{o.right}</span>}
        </DropdownMenu.RadioItem>
      ))}
    </DropdownMenu.RadioGroup>
  );
}

export function ToolMenuCheckbox({ checked, onCheckedChange, children }: { checked: boolean; onCheckedChange: (checked: boolean) => void; children: ReactNode }) {
  return (
    <DropdownMenu.CheckboxItem
      checked={checked}
      onCheckedChange={(v) => onCheckedChange(v === true)}
      onSelect={(e) => e.preventDefault()}
      className={cn(styles.menuItem, checked && styles.menuActive)}
    >
      <span className={cn(styles.menuCheck, checked && styles.menuChecked)} aria-hidden="true">
        {checked && <CheckIcon size={10} />}
      </span>
      <span className={styles.menuText}>{children}</span>
    </DropdownMenu.CheckboxItem>
  );
}

export function ToolMenuLabel({ children }: { children: ReactNode }) {
  return <DropdownMenu.Label className={styles.menuLabel}>{children}</DropdownMenu.Label>;
}

export function ToolMenuSeparator() {
  return <DropdownMenu.Separator className={styles.menuSeparator} />;
}

export function Shortcut({ keys }: { keys: string[] }) {
  return (
    <span className={styles.shortcut}>
      {keys.map((k) => (
        <kbd key={k}>{k}</kbd>
      ))}
    </span>
  );
}
