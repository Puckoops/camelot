import type { ReactNode } from "react";
import { cn } from "../../../lib/cn";
import { Icon, type IconDefinition } from "../Icon/Icon";
import styles from "./EmptyState.module.css";

export interface EmptyStateProps {
  icon: IconDefinition;
  /** One sentence. Never "No data". */
  title: ReactNode;
  description?: ReactNode;
  /** One ghost button. */
  action?: ReactNode;
  framed?: boolean;
  className?: string;
}

export function EmptyState({ icon, title, description, action, framed, className }: EmptyStateProps) {
  return (
    <div className={cn(styles.empty, framed && styles.framed, className)}>
      <Icon icon={icon} size={28} className={styles.icon} />
      <p className={cn("h3", styles.title)}>{title}</p>
      {description && <p className={cn("small", styles.description)}>{description}</p>}
      {action && <div className={styles.action}>{action}</div>}
    </div>
  );
}
