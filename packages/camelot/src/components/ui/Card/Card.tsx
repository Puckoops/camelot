import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../../../lib/cn";
import { Icon, type IconDefinition } from "../Icon/Icon";
import { Kpi } from "../Kpi/Kpi";
import { Meter } from "../Meter/Meter";
import styles from "./Card.module.css";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Cards default to the 148px minimum height; flush drops padding for content that bleeds. */
  padding?: "default" | "flush";
  interactive?: boolean;
}

/** surface + hairline + radius-lg + shadow-card. If a card needs a fifth property, the layout is wrong. */
export function Card({ padding = "default", interactive, className, ...rest }: CardProps) {
  return <div className={cn(styles.card, padding === "flush" && styles.flush, interactive && styles.interactive, className)} {...rest} />;
}

export interface FigureCardProps {
  label: ReactNode;
  value: number;
  format?: (value: number) => string;
  hero?: boolean;
  caption?: ReactNode;
  delta?: ReactNode;
  /** A 40px sparkline or bar row flush to the bottom edge. */
  footer?: ReactNode;
  className?: string;
}

export function FigureCard({ label, value, format, hero, caption, delta, footer, className }: FigureCardProps) {
  return (
    <Card className={cn(styles.figure, className)}>
      <div className={styles.figureHead}>
        <span className="caps text-4">{label}</span>
        {delta}
      </div>
      <Kpi value={value} format={format} size={hero ? "hero" : "default"} className={styles.figureValue} />
      {caption && <p className={cn("small", styles.figureCaption)}>{caption}</p>}
      {footer && <div className={styles.figureFooter}>{footer}</div>}
    </Card>
  );
}

export interface ListCardRow {
  key?: string;
  label: ReactNode;
  value: ReactNode;
}

export interface ListCardProps {
  title: ReactNode;
  caption?: ReactNode;
  rows: ListCardRow[];
  footer?: ReactNode;
  className?: string;
}

/** 3–5 rows of label · value. More than five rows is a table, not a card. */
export function ListCard({ title, caption, rows, footer, className }: ListCardProps) {
  return (
    <Card className={cn(styles.list, className)}>
      <div>
        <h3 className="h3">{title}</h3>
        {caption && <p className={cn("caption", styles.listCaption)}>{caption}</p>}
      </div>
      <dl className={styles.rows}>
        {rows.map((r, i) => (
          <div key={r.key ?? i} className={styles.row}>
            <dt className={styles.rowLabel}>{r.label}</dt>
            <dd className={cn("num", styles.rowValue)}>{r.value}</dd>
          </div>
        ))}
      </dl>
      {footer && <div className={styles.listFooter}>{footer}</div>}
    </Card>
  );
}

export interface MeterCardProps {
  title: ReactNode;
  percent: number;
  caption?: ReactNode;
  className?: string;
}

export function MeterCard({ title, percent, caption, className }: MeterCardProps) {
  return (
    <Card className={cn(styles.meter, className)}>
      <h3 className="h3">{title}</h3>
      <Kpi value={percent} format={(n) => `${Math.round(n)}%`} />
      <Meter percent={percent} label={typeof title === "string" ? title : undefined} />
      {caption && <p className="caption text-3">{caption}</p>}
    </Card>
  );
}

export interface ActionCardProps {
  icon: IconDefinition;
  title: ReactNode;
  caption?: ReactNode;
  /** A ghost button, bottom-aligned. Omit it and pass onClick or href to make the whole card the action. */
  action?: ReactNode;
  onClick?: () => void;
  href?: string;
  className?: string;
  centered?: boolean;
}

export function ActionCard({ icon, title, caption, action, onClick, href, className, centered }: ActionCardProps) {
  const body = (
    <>
      <Icon icon={icon} size={28} className={styles.actionIcon} />
      <div>
        <h3 className="h3">{title}</h3>
        {caption && <p className="caption text-3">{caption}</p>}
      </div>
      {action && <div className={styles.actionSlot}>{action}</div>}
    </>
  );
  const cls = cn(styles.card, styles.action, centered && styles.centered, (onClick || href) && styles.interactive, className);
  if (href) {
    return (
      <a href={href} className={cls}>
        {body}
      </a>
    );
  }
  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={cn(cls, styles.buttonReset)}>
        {body}
      </button>
    );
  }
  return <div className={cls}>{body}</div>;
}

export interface MediaCardProps {
  media: ReactNode;
  title: ReactNode;
  caption?: ReactNode;
  className?: string;
}

export function MediaCard({ media, title, caption, className }: MediaCardProps) {
  return (
    <Card padding="flush" className={cn(styles.media, className)}>
      <div className={styles.mediaFrame}>{media}</div>
      <div className={styles.mediaBody}>
        <h3 className="h3">{title}</h3>
        {caption && <p className="caption text-3">{caption}</p>}
      </div>
    </Card>
  );
}
