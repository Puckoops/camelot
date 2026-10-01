import { createContext, useContext, type HTMLAttributes, type ReactNode, type TdHTMLAttributes, type ThHTMLAttributes } from "react";
import { cn } from "../../../lib/cn";
import styles from "./Table.module.css";

export type Density = "relaxed" | "default" | "compact";

const DensityContext = createContext<Density>("default");

export interface TableProps extends HTMLAttributes<HTMLTableElement> {
  /** relaxed for tables people read, default for the product, compact for a second table or a drawer. */
  density?: Density;
  /** A caption line under the table: the count, totals. */
  footer?: ReactNode;
  /** Shown in the body when there are no rows, keeping the header visible. */
  empty?: ReactNode;
  isEmpty?: boolean;
  minWidth?: number;
  frameClassName?: string;
}

export function Table({ density = "default", footer, empty, isEmpty, minWidth = 640, className, frameClassName, children, ...rest }: TableProps) {
  return (
    <DensityContext.Provider value={density}>
      <div className={cn(styles.frame, frameClassName)}>
        <div className={styles.scroll}>
          <table className={cn(styles.table, styles[density], className)} style={{ minWidth }} {...rest}>
            {children}
            {isEmpty && empty && (
              <tbody>
                <tr>
                  <td colSpan={999} className={styles.emptyCell}>
                    {empty}
                  </td>
                </tr>
              </tbody>
            )}
          </table>
        </div>
      </div>
      {footer && <div className={cn("small", styles.footer)}>{footer}</div>}
    </DensityContext.Provider>
  );
}

export function THead(props: HTMLAttributes<HTMLTableSectionElement>) {
  return <thead {...props} />;
}

export function TBody(props: HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody {...props} />;
}

export interface TrProps extends HTMLAttributes<HTMLTableRowElement> {
  selected?: boolean;
  interactive?: boolean;
}

export function Tr({ selected, interactive, className, onClick, onKeyDown, ...rest }: TrProps) {
  const activatable = Boolean(interactive && onClick);
  return (
    <tr
      className={cn(styles.row, interactive && styles.interactive, selected && styles.selected, className)}
      aria-selected={selected || undefined}
      tabIndex={activatable ? 0 : undefined}
      onClick={onClick}
      onKeyDown={(e) => {
        onKeyDown?.(e);
        if (!activatable || e.defaultPrevented || e.target !== e.currentTarget) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          e.currentTarget.click();
        }
      }}
      {...rest}
    />
  );
}

export interface ThProps extends ThHTMLAttributes<HTMLTableCellElement> {
  numeric?: boolean;
}

export function Th({ numeric, className, scope = "col", ...rest }: ThProps) {
  return <th scope={scope} className={cn("caps", styles.th, numeric && styles.numeric, className)} {...rest} />;
}

export interface TdProps extends TdHTMLAttributes<HTMLTableCellElement> {
  numeric?: boolean;
  /** The first column reads in --text-1; the rest in --text-2. */
  primary?: boolean;
  mono?: boolean;
  truncate?: boolean;
}

export function Td({ numeric, primary, mono, truncate, className, children, title, ...rest }: TdProps) {
  const density = useContext(DensityContext);
  return (
    <td
      className={cn(
        styles.td,
        styles[`td-${density}`],
        primary && styles.primary,
        (numeric || mono) && "num",
        mono && styles.mono,
        numeric && styles.numeric,
        truncate && styles.truncate,
        className,
      )}
      title={title ?? (truncate && typeof children === "string" ? children : undefined)}
      {...rest}
    >
      {children}
    </td>
  );
}

/** A caps row on --surface-2 spanning every column, for grouping. */
export function TGroup({ children, colSpan = 999 }: { children: ReactNode; colSpan?: number }) {
  return (
    <tr className={styles.group}>
      <td colSpan={colSpan} className={cn("caps", styles.groupCell)}>
        {children}
      </td>
    </tr>
  );
}
