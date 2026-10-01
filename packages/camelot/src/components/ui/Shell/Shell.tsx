import { Fragment, type ComponentPropsWithoutRef, type ElementType, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "../../../lib/cn";
import { Icon, type IconDefinition } from "../Icon/Icon";
import styles from "./Shell.module.css";

export function AppShell({ sidebar, children, className }: { sidebar: ReactNode; children: ReactNode; className?: string }) {
  return (
    <div className={cn(styles.shell, className)}>
      {sidebar}
      <div className={styles.main}>{children}</div>
    </div>
  );
}

export function Sidebar({ className, children, ...rest }: HTMLAttributes<HTMLElement>) {
  return (
    <nav className={cn(styles.sidebar, className)} {...rest}>
      {children}
    </nav>
  );
}

/** The brand mark: a rounded square with a centred dot. */
export function BrandMark({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 22 22" fill="none" aria-hidden="true" className={styles.mark}>
      <rect x="1.75" y="1.75" width="18.5" height="18.5" rx="5.25" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="11" cy="11" r="2.75" fill="currentColor" />
    </svg>
  );
}

export function SidebarBrand({ name, href, end, as }: { name: string; href?: string; end?: ReactNode; as?: ElementType }) {
  const Comp = as ?? (href ? "a" : "span");
  return (
    <div className={styles.brandRow}>
      <Comp {...(href ? { href } : {})} className={styles.brand}>
        <BrandMark />
        <span className={styles.brandName}>{name}</span>
      </Comp>
      {end && <div className={styles.brandEnd}>{end}</div>}
    </div>
  );
}

export function SidebarSection({ label, children }: { label?: ReactNode; children: ReactNode }) {
  return (
    <div className={styles.section}>
      {label && <p className={cn("caps", styles.sectionLabel)}>{label}</p>}
      <ul className={styles.items}>{children}</ul>
    </div>
  );
}

type SidebarItemOwnProps<E extends ElementType> = {
  as?: E;
  icon: IconDefinition;
  current?: boolean;
  badge?: ReactNode;
  children: ReactNode;
};

export type SidebarItemProps<E extends ElementType = "a"> = SidebarItemOwnProps<E> &
  Omit<ComponentPropsWithoutRef<E>, keyof SidebarItemOwnProps<E>>;

export function SidebarItem<E extends ElementType = "a">({ as, icon, current, badge, children, className, ...rest }: SidebarItemProps<E>) {
  const Comp: ElementType = as ?? "a";
  return (
    <li>
      <Comp
        className={cn(styles.item, current && styles.current, className as string | undefined)}
        aria-current={current ? "page" : undefined}
        title={typeof children === "string" ? children : undefined}
        {...rest}
      >
        <Icon icon={icon} size={18} className={styles.itemIcon} />
        <span className={styles.itemLabel}>{children}</span>
        {badge !== undefined && badge !== null && <span className={cn("num-sm", styles.badge)}>{badge}</span>}
      </Comp>
    </li>
  );
}

export function SidebarSeparator() {
  return <li role="separator" className={styles.separator} />;
}

export function SidebarFooter({ children, note }: { children?: ReactNode; note?: ReactNode }) {
  return (
    <div className={styles.footer}>
      {children}
      {note && <p className={cn("num-sm", styles.note)}>{note}</p>}
    </div>
  );
}

export interface SidebarUserProps {
  name: string;
  email?: string;
  avatar?: ReactNode;
  /** A trigger at the end of the row, usually a Menu with profile, appearance and sign-out. */
  menu?: ReactNode;
}

export function SidebarUser({ name, email, avatar, menu }: SidebarUserProps) {
  return (
    <div className={styles.user}>
      {avatar}
      <div className={styles.userText}>
        <p className={styles.userName}>{name}</p>
        {email && <p className={cn("caption", styles.userEmail)}>{email}</p>}
      </div>
      {menu && <div className={styles.userMenu}>{menu}</div>}
    </div>
  );
}

export function Topbar({ start, end, className }: { start?: ReactNode; end?: ReactNode; className?: string }) {
  return (
    <header className={cn(styles.topbar, className)}>
      <div className={styles.topbarStart}>{start}</div>
      <div className={styles.topbarEnd}>{end}</div>
    </header>
  );
}

export interface Crumb {
  label: ReactNode;
  href?: string;
}

export function Breadcrumbs({ items, linkAs }: { items: Crumb[]; linkAs?: ElementType }) {
  const LinkComp: ElementType = linkAs ?? "a";
  return (
    <nav aria-label="Breadcrumb">
      <ol className={styles.crumbs}>
        {items.map((c, i) => {
          const last = i === items.length - 1;
          return (
            <Fragment key={i}>
              <li className={cn(styles.crumb, last && styles.crumbCurrent)} aria-current={last ? "page" : undefined}>
                {c.href && !last ? <LinkComp href={c.href}>{c.label}</LinkComp> : c.label}
              </li>
              {!last && (
                <li aria-hidden="true" className={styles.crumbSep}>
                  /
                </li>
              )}
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
