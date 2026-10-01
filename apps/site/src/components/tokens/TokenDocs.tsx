import { cn } from "@puckoops/camelot/helpers";
import type { CSSProperties, ReactNode } from "react";
import { resolve, type Theme } from "./parse";
import styles from "./Tokens.module.css";

export function TokenPage({ children }: { children: ReactNode }) {
  return <div className={styles.page}>{children}</div>;
}

export function Section({ title, caption, children }: { title: string; caption?: ReactNode; children: ReactNode }) {
  return (
    <section className={styles.section}>
      <div className={styles.sectionHead}>
        <h2 className="h2">{title}</h2>
        {caption && <p className="small">{caption}</p>}
      </div>
      {children}
    </section>
  );
}

const isColour = (value: string) => /^(#|rgb|hsl|oklch|color\()/i.test(value.trim());

export function ThemedValue({ name, theme }: { name: string; theme: Theme }) {
  const value = resolve(name, theme);
  return (
    <span className={cn("num-sm", styles.value)}>
      {isColour(value) && <span className={cn(styles.dot, styles.checker)} style={{ "--swatch": value } as CSSProperties} />}
      {value || "—"}
    </span>
  );
}
