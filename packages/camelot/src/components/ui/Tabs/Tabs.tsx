import { Tabs as RTabs } from "radix-ui";
import { createContext, forwardRef, useContext, type ComponentPropsWithoutRef } from "react";
import { cn } from "../../../lib/cn";
import { Badge } from "../Badge/Badge";
import styles from "./Tabs.module.css";

export type TabsVariant = "underline" | "segmented";

const VariantContext = createContext<TabsVariant>("underline");

export interface TabsProps extends ComponentPropsWithoutRef<typeof RTabs.Root> {
  /** underline for the sections of a page or record; segmented inside a card, drawer or panel. */
  variant?: TabsVariant;
}

/** Sections of one surface that the reader switches between; only the chosen section is rendered. */
export const Tabs = forwardRef<HTMLDivElement, TabsProps>(function Tabs({ variant = "underline", className, ...rest }, ref) {
  return (
    <VariantContext.Provider value={variant}>
      <RTabs.Root ref={ref} className={cn(styles.root, className)} {...rest} />
    </VariantContext.Provider>
  );
});

export type TabsListProps = ComponentPropsWithoutRef<typeof RTabs.List>;

export const TabsList = forwardRef<HTMLDivElement, TabsListProps>(function TabsList({ className, ...rest }, ref) {
  const variant = useContext(VariantContext);
  return <RTabs.List ref={ref} className={cn(styles.list, styles[`list-${variant}`], className)} {...rest} />;
});

export interface TabsTriggerProps extends ComponentPropsWithoutRef<typeof RTabs.Trigger> {
  /** A neutral count after the label, such as open tasks. */
  count?: number;
}

export const TabsTrigger = forwardRef<HTMLButtonElement, TabsTriggerProps>(function TabsTrigger({ count, className, children, ...rest }, ref) {
  const variant = useContext(VariantContext);
  return (
    <RTabs.Trigger ref={ref} className={cn(styles.trigger, styles[`trigger-${variant}`], className)} {...rest}>
      <span className={styles.triggerLabel}>{children}</span>
      {count !== undefined && (
        <Badge variant="count" max={999} className={styles.count}>
          {count}
        </Badge>
      )}
    </RTabs.Trigger>
  );
});

export type TabsContentProps = ComponentPropsWithoutRef<typeof RTabs.Content>;

export const TabsContent = forwardRef<HTMLDivElement, TabsContentProps>(function TabsContent({ className, ...rest }, ref) {
  return <RTabs.Content ref={ref} className={cn(styles.content, className)} {...rest} />;
});
