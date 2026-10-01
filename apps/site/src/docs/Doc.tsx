import { cn } from "@puckoops/camelot/helpers";
import type { ReactNode } from "react";
import { InlineMarkdown } from "@/components/InlineMarkdown";
import styles from "./docs.module.css";

export function DocsWrapper({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={styles.wrapper}>
      <div className={cn(styles.content, className)}>{children}</div>
    </div>
  );
}

export function Title({ children }: { children: ReactNode }) {
  return <h1 className={styles.title}>{children}</h1>;
}

export function Description({ text }: { text: string }) {
  return (
    <p className={styles.description}>
      <InlineMarkdown text={text} />
    </p>
  );
}
