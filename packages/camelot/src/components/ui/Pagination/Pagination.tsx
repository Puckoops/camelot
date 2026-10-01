import { ArrowLeft01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { cn } from "../../../lib/cn";
import { Button, IconButton } from "../Button/Button";
import styles from "./Pagination.module.css";

export type PaginationItem = number | "start-ellipsis" | "end-ellipsis";

const range = (start: number, end: number) => Array.from({ length: Math.max(0, end - start + 1) }, (_, i) => start + i);

/**
 * The pages to show for a page out of pageCount. The list keeps the same length as the current page moves,
 * so the control never shifts under the pointer: 1 … 4 5 6 … 12.
 */
export function paginationRange(page: number, pageCount: number, siblings = 1, boundaries = 1): PaginationItem[] {
  const count = Math.max(0, Math.floor(pageCount));
  if (count === 0) return [];
  const current = Math.min(Math.max(1, Math.floor(page)), count);
  const startPages = range(1, Math.min(boundaries, count));
  const endPages = range(Math.max(count - boundaries + 1, boundaries + 1), count);
  const siblingsStart = Math.max(Math.min(current - siblings, count - boundaries - siblings * 2 - 1), boundaries + 2);
  const siblingsEnd = Math.min(Math.max(current + siblings, boundaries + siblings * 2 + 2), (endPages[0] ?? count + 1) - 2);
  return [
    ...startPages,
    ...(siblingsStart > boundaries + 2 ? (["start-ellipsis"] as const) : boundaries + 1 < count - boundaries ? [boundaries + 1] : []),
    ...range(siblingsStart, siblingsEnd),
    ...(siblingsEnd < count - boundaries - 1 ? (["end-ellipsis"] as const) : count - boundaries > boundaries ? [count - boundaries] : []),
    ...endPages,
  ];
}

export interface PaginationProps {
  /** 1-based. */
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  /** numbers: arrows around numbered pages. arrows: Previous and Next buttons with "Page 3 of 12". compact: arrows around "3 / 12". */
  variant?: "numbers" | "arrows" | "compact";
  /** Pages shown on each side of the current one. */
  siblings?: number;
  /** Pages always shown at each end. */
  boundaries?: number;
  disabled?: boolean;
  "aria-label"?: string;
  className?: string;
}

/** Page through a long list. Controlled: it reports the page it wants and shows the page it is given. */
export function Pagination({
  page,
  pageCount,
  onPageChange,
  variant = "numbers",
  siblings = 1,
  boundaries = 1,
  disabled,
  "aria-label": ariaLabel = "Pagination",
  className,
}: PaginationProps) {
  const count = Math.max(0, Math.floor(pageCount));
  const current = Math.min(Math.max(1, Math.floor(page)), Math.max(1, count));
  const go = (next: number) => {
    const target = Math.min(Math.max(1, next), count);
    if (!disabled && target !== current) onPageChange(target);
  };
  const atStart = disabled || current <= 1;
  const atEnd = disabled || current >= count;

  if (variant === "arrows") {
    return (
      <nav aria-label={ariaLabel} className={cn(styles.pagination, styles.arrows, className)}>
        <Button size="sm" iconStart={ArrowLeft01Icon} disabled={atStart} onClick={() => go(current - 1)}>
          Previous
        </Button>
        <span className={cn("small", styles.status)} aria-live="polite">
          Page <span className="num">{current}</span> of <span className="num">{count}</span>
        </span>
        <Button size="sm" iconEnd={ArrowRight01Icon} disabled={atEnd} onClick={() => go(current + 1)}>
          Next
        </Button>
      </nav>
    );
  }

  const previous = (
    <IconButton icon={ArrowLeft01Icon} size="sm" aria-label="Previous page" disabled={atStart} onClick={() => go(current - 1)} />
  );
  const next = <IconButton icon={ArrowRight01Icon} size="sm" aria-label="Next page" disabled={atEnd} onClick={() => go(current + 1)} />;

  if (variant === "compact") {
    return (
      <nav aria-label={ariaLabel} className={cn(styles.pagination, className)}>
        {previous}
        <span className={cn("num", styles.compact)} aria-live="polite">
          <span aria-hidden="true">
            {current}
            <span className={styles.slash}> / </span>
            {count}
          </span>
          <span className="visually-hidden">
            Page {current} of {count}
          </span>
        </span>
        {next}
      </nav>
    );
  }

  return (
    <nav aria-label={ariaLabel} className={cn(styles.pagination, className)}>
      {previous}
      <ul className={styles.pages}>
        {paginationRange(current, count, siblings, boundaries).map((item) =>
          typeof item === "number" ? (
            <li key={item}>
              <button
                type="button"
                className={cn("num", styles.page, item === current && styles.current)}
                aria-current={item === current ? "page" : undefined}
                aria-label={`Page ${item}`}
                disabled={disabled}
                onClick={() => go(item)}
              >
                {item}
              </button>
            </li>
          ) : (
            <li key={item} className={styles.ellipsis} aria-hidden="true">
              …
            </li>
          ),
        )}
      </ul>
      {next}
    </nav>
  );
}
