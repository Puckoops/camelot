import { Dialog as RDialog } from "radix-ui";
import { Cancel01Icon } from "@hugeicons/core-free-icons";
import type { ReactNode } from "react";
import { cn } from "../../../lib/cn";
import { IconButton } from "../Button/Button";
import styles from "./Drawer.module.css";

export interface DrawerProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  /** Right-aligned actions pinned to the bottom, such as Cancel and Save. */
  footer?: ReactNode;
  width?: number;
  children: ReactNode;
}

/** A 480px right sheet over --scrim. It slides in over --dur-3 and the scrim fades over --dur-2. */
export function Drawer({ open, onOpenChange, trigger, title, description, footer, width = 480, children }: DrawerProps) {
  return (
    <RDialog.Root open={open} onOpenChange={onOpenChange}>
      {trigger && <RDialog.Trigger asChild>{trigger}</RDialog.Trigger>}
      <RDialog.Portal>
        <RDialog.Overlay className={styles.scrim} />
        <RDialog.Content className={styles.sheet} style={{ width: `min(${width}px, 100vw)` }} aria-describedby={description ? undefined : undefined}>
          <header className={styles.head}>
            <div className={styles.headText}>
              <RDialog.Title className={cn("h2", styles.title)}>{title}</RDialog.Title>
              {description ? (
                <RDialog.Description className="small text-3">{description}</RDialog.Description>
              ) : (
                <RDialog.Description className="visually-hidden">{typeof title === "string" ? title : "Details"}</RDialog.Description>
              )}
            </div>
            <RDialog.Close asChild>
              <IconButton icon={Cancel01Icon} aria-label="Close" variant="bare" />
            </RDialog.Close>
          </header>
          <div className={styles.body}>{children}</div>
          {footer && <footer className={styles.footer}>{footer}</footer>}
        </RDialog.Content>
      </RDialog.Portal>
    </RDialog.Root>
  );
}

export function DrawerSection({ title, children, className }: { title?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cn(styles.section, className)}>
      {title && <h3 className={cn("caps", styles.sectionTitle)}>{title}</h3>}
      {children}
    </section>
  );
}

export interface DescriptionItem {
  label: ReactNode;
  value: ReactNode;
}

/** Drawer field rows: a 128px caption label and a small value. */
export function DescriptionList({ items, className }: { items: DescriptionItem[]; className?: string }) {
  return (
    <dl className={cn(styles.dl, className)}>
      {items.map((it, i) => (
        <div key={i} className={styles.dlRow}>
          <dt className={styles.dt}>{it.label}</dt>
          <dd className={styles.dd}>{it.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export interface DialogProps extends Omit<DrawerProps, "width"> {
  width?: number;
}

export function Dialog({ open, onOpenChange, trigger, title, description, footer, width = 440, children }: DialogProps) {
  return (
    <RDialog.Root open={open} onOpenChange={onOpenChange}>
      {trigger && <RDialog.Trigger asChild>{trigger}</RDialog.Trigger>}
      <RDialog.Portal>
        <RDialog.Overlay className={styles.scrim} />
        <RDialog.Content className={styles.dialog} style={{ width: `min(${width}px, calc(100vw - 32px))` }}>
          <header className={styles.dialogHead}>
            <RDialog.Title className={cn("h2", styles.title)}>{title}</RDialog.Title>
            {description ? (
              <RDialog.Description className="small text-3">{description}</RDialog.Description>
            ) : (
              <RDialog.Description className="visually-hidden">{typeof title === "string" ? title : "Dialog"}</RDialog.Description>
            )}
          </header>
          <div className={styles.dialogBody}>{children}</div>
          {footer && <footer className={styles.dialogFooter}>{footer}</footer>}
        </RDialog.Content>
      </RDialog.Portal>
    </RDialog.Root>
  );
}
