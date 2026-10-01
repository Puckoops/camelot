import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "../../../lib/cn";
import { Glyph, type GlyphShape } from "../Glyph/Glyph";
import styles from "./Board.module.css";

export function Board({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn(styles.board, className)} {...rest} />;
}

export interface BoardColumnProps extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  title: ReactNode;
  glyph: GlyphShape;
  count?: number;
  /** Set while a card is dragged over the column. */
  over?: boolean;
}

export const BoardColumn = forwardRef<HTMLElement, BoardColumnProps>(function BoardColumn(
  { title, glyph, count, over, className, children, ...rest },
  ref,
) {
  return (
    <section ref={ref} className={cn(styles.column, over && styles.over, className)} {...rest}>
      <header className={styles.columnHead}>
        <Glyph shape={glyph} className={styles.columnGlyph} />
        <h3 className={cn("h3", styles.columnTitle)}>{title}</h3>
        {count !== undefined && <span className={cn("num-sm", styles.count)}>{count}</span>}
      </header>
      <div className={styles.cards}>{children}</div>
    </section>
  );
});

export interface BoardCardProps extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  title: ReactNode;
  meta?: ReactNode;
  start?: ReactNode;
  end?: ReactNode;
  /** Renders as a button so the card can be opened with the keyboard. */
  onOpen?: () => void;
  dragging?: boolean;
}

export const BoardCard = forwardRef<HTMLElement, BoardCardProps>(function BoardCard(
  { title, meta, start, end, onOpen, dragging, className, ...rest },
  ref,
) {
  const content = (
    <>
      <p className={styles.cardTitle}>{title}</p>
      {meta && <p className={cn("caption", styles.cardMeta)}>{meta}</p>}
      {(start || end) && (
        <div className={styles.cardFoot}>
          <span className="num-sm text-3">{start}</span>
          <span>{end}</span>
        </div>
      )}
    </>
  );
  const cls = cn(styles.card, dragging && styles.dragging, className);
  if (onOpen) {
    return (
      <button ref={ref as React.Ref<HTMLButtonElement>} type="button" className={cls} onClick={onOpen} {...(rest as HTMLAttributes<HTMLButtonElement>)}>
        {content}
      </button>
    );
  }
  return (
    <article ref={ref} className={cls} {...rest}>
      {content}
    </article>
  );
});
