import type { CSSProperties, HTMLAttributes, ReactNode } from "react";
import { cn } from "../../../lib/cn";
import styles from "./Layout.module.css";

export function Page({ className, wide, ...rest }: HTMLAttributes<HTMLDivElement> & { wide?: boolean }) {
  return <div className={cn(styles.page, wide && styles.wide, className)} {...rest} />;
}

export interface PageHeaderProps {
  eyebrow?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  /** Filters and the primary action, right-aligned. */
  actions?: ReactNode;
  /** A back link above the title, such as "← Dashboard". */
  back?: ReactNode;
  className?: string;
}

export function PageHeader({ eyebrow, title, subtitle, actions, back, className }: PageHeaderProps) {
  return (
    <header className={cn(styles.pageHeader, className)}>
      <div className={styles.pageHeading}>
        {back && <div className={styles.back}>{back}</div>}
        {eyebrow && <p className="caps text-4">{eyebrow}</p>}
        <h1 className="h1">{title}</h1>
        {subtitle && <p className={cn("small", styles.subtitle)}>{subtitle}</p>}
      </div>
      {actions && <div className={styles.pageActions}>{actions}</div>}
    </header>
  );
}

export interface BandProps extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  eyebrow?: ReactNode;
  heading?: ReactNode;
  caption?: ReactNode;
  actions?: ReactNode;
  /** A band that follows the page head sits closer; everything after it gets --space-16. */
  first?: boolean;
}

/** The only unit of vertical composition: eyebrow, heading, caption, then content. */
export function Band({ eyebrow, heading, caption, actions, first, className, children, ...rest }: BandProps) {
  const hasHead = eyebrow || heading || caption || actions;
  return (
    <section className={cn(styles.band, first && styles.first, className)} {...rest}>
      {hasHead && (
        <div className={styles.bandHead}>
          <div className={styles.bandHeading}>
            {eyebrow && <p className={cn("caps text-4", styles.eyebrow)}>{eyebrow}</p>}
            {heading && <h2 className="h2">{heading}</h2>}
            {caption && <p className={cn("small", styles.caption)}>{caption}</p>}
          </div>
          {actions && <div className={styles.bandActions}>{actions}</div>}
        </div>
      )}
      {children}
    </section>
  );
}

export type Span = 3 | 4 | 5 | 6 | 7 | 8 | 12;

export function Grid({ className, gap, style, ...rest }: HTMLAttributes<HTMLDivElement> & { gap?: number }) {
  return <div className={cn(styles.grid, className)} style={gap !== undefined ? { ...style, gap } : style} {...rest} />;
}

export interface GridItemProps extends HTMLAttributes<HTMLDivElement> {
  /** One of the spans the grammar allows: 12, 8+4, 7+5, 6+6, 5+4+3, 4+4+4, 3×4. */
  span: Span;
}

export function GridItem({ span, className, style, ...rest }: GridItemProps) {
  return <div className={cn(styles.item, className)} style={{ ...style, "--span": span } as CSSProperties} {...rest} />;
}

export function Stack({
  gap = 16,
  direction = "column",
  align,
  justify,
  wrap,
  className,
  style,
  ...rest
}: HTMLAttributes<HTMLDivElement> & {
  gap?: number;
  direction?: "row" | "column";
  align?: CSSProperties["alignItems"];
  justify?: CSSProperties["justifyContent"];
  wrap?: boolean;
}) {
  return (
    <div
      className={cn(styles.stack, className)}
      style={{ ...style, gap, flexDirection: direction, alignItems: align, justifyContent: justify, flexWrap: wrap ? "wrap" : undefined }}
      {...rest}
    />
  );
}

export interface DividerProps {
  /** --hairline-strong, as between drawer sections. */
  strong?: boolean;
  /** A provisional or sample boundary, never a data gridline. */
  dashed?: boolean;
  /** A rule between inline groups; it stretches to the height of its row. */
  vertical?: boolean;
  className?: string;
}

export function Divider({ strong, dashed, vertical, className }: DividerProps) {
  return (
    <hr
      aria-orientation={vertical ? "vertical" : undefined}
      className={cn(styles.divider, vertical && styles.vertical, strong && styles.strong, dashed && styles.dashed, className)}
    />
  );
}

/** The dashed "Sample data" flag beside a demo screen's title. */
export function SampleFlag({ children = "Sample data" }: { children?: ReactNode }) {
  return <span className={styles.flag}>{children}</span>;
}
