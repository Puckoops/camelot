import { Accordion as RAccordion } from "radix-ui";
import { ArrowDown01Icon } from "@hugeicons/core-free-icons";
import { forwardRef, type ReactNode } from "react";
import { cn } from "../../../lib/cn";
import { Icon } from "../Icon/Icon";
import styles from "./Accordion.module.css";

type RootProps = RAccordion.AccordionSingleProps | RAccordion.AccordionMultipleProps;

export type AccordionProps = RootProps & {
  /** framed puts the sections on a card surface; plain separates them with hairlines only. */
  variant?: "plain" | "framed";
};

/** Sections that open in place. type="single" keeps one open at a time; type="multiple" lets several stay open. */
export const Accordion = forwardRef<HTMLDivElement, AccordionProps>(function Accordion({ variant = "plain", className, ...rest }, ref) {
  return <RAccordion.Root ref={ref} className={cn(styles.root, styles[variant], className)} {...rest} />;
});

export interface AccordionItemProps {
  value: string;
  title: ReactNode;
  /** Quiet text before the chevron, such as a count or a date. */
  meta?: ReactNode;
  disabled?: boolean;
  className?: string;
  children: ReactNode;
}

export const AccordionItem = forwardRef<HTMLDivElement, AccordionItemProps>(function AccordionItem(
  { value, title, meta, disabled, className, children },
  ref,
) {
  return (
    <RAccordion.Item ref={ref} value={value} disabled={disabled} className={cn(styles.item, className)}>
      <RAccordion.Header className={styles.header}>
        <RAccordion.Trigger className={styles.trigger}>
          <span className={styles.title}>{title}</span>
          {meta !== undefined && meta !== null && <span className={cn("num-sm", styles.meta)}>{meta}</span>}
          <Icon icon={ArrowDown01Icon} size={16} className={styles.chevron} />
        </RAccordion.Trigger>
      </RAccordion.Header>
      <RAccordion.Content className={styles.content}>
        <div className={styles.body}>{children}</div>
      </RAccordion.Content>
    </RAccordion.Item>
  );
});
