import { Popover } from "radix-ui";
import { ArrowDown01Icon, Search01Icon, Tick02Icon } from "@hugeicons/core-free-icons";
import { forwardRef, useEffect, useId, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { cn } from "../../../lib/cn";
import { useControllable } from "../../../lib/useControllable";
import { Icon } from "../Icon/Icon";
import selectStyles from "../Select/Select.module.css";
import styles from "./SearchSelect.module.css";

export interface SearchSelectOption {
  value: string;
  label: string;
  /** Quiet text at the end of the row, such as a client code or an open count. */
  meta?: ReactNode;
  /** Extra terms the search matches, such as a former name or an email. */
  keywords?: string[];
  disabled?: boolean;
}

export interface SearchSelectProps {
  options: SearchSelectOption[];
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  /** Shown when nothing matches; a function receives the query. */
  empty?: ReactNode | ((query: string) => ReactNode);
  /** Pinned under the list, such as a quiet "Add client" button. */
  footer?: ReactNode;
  disabled?: boolean;
  id?: string;
  /** Adds a hidden input so the value posts with a form. */
  name?: string;
  className?: string;
  "aria-label"?: string;
  "aria-describedby"?: string;
  "aria-invalid"?: boolean;
}

const fold = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

/** Matches on the label, then word starts, then anywhere, then keywords; order within each rank is kept. */
export function filterOptions(options: SearchSelectOption[], query: string) {
  const q = fold(query.trim());
  if (!q) return options;
  const ranked: { option: SearchSelectOption; rank: number; index: number }[] = [];
  options.forEach((option, index) => {
    const label = fold(option.label);
    const rank = label.startsWith(q)
      ? 0
      : label.split(/[\s\-_/.,&]+/).some((word) => word.startsWith(q))
        ? 1
        : label.includes(q)
          ? 2
          : option.keywords?.some((k) => fold(k).includes(q))
            ? 3
            : -1;
    if (rank >= 0) ranked.push({ option, rank, index });
  });
  return ranked.sort((a, b) => a.rank - b.rank || a.index - b.index).map((r) => r.option);
}

function stepTo(list: SearchSelectOption[], from: number, dir: 1 | -1) {
  const n = list.length;
  const start = from < 0 ? (dir === 1 ? -1 : n) : from;
  for (let k = 1; k <= n; k++) {
    const i = (((start + dir * k) % n) + n) % n;
    if (!list[i]?.disabled) return i;
  }
  return -1;
}

/** A single select for long lists: a field-shaped trigger that opens a search box over a filtered list. */
export const SearchSelect = forwardRef<HTMLButtonElement, SearchSelectProps>(function SearchSelect(
  {
    options,
    value,
    defaultValue,
    onValueChange,
    placeholder = "Select",
    searchPlaceholder = "Search",
    empty,
    footer,
    disabled,
    id,
    name,
    className,
    ...aria
  },
  ref,
) {
  const baseId = useId();
  const triggerId = id ?? `${baseId}-trigger`;
  const listId = `${baseId}-list`;
  const optionId = (i: number) => `${baseId}-option-${i}`;
  const [current, setCurrent] = useControllable<string | null>(value, defaultValue ?? null, (next) => {
    if (next !== null) onValueChange?.(next);
  });
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const selected = options.find((o) => o.value === current) ?? null;
  const filtered = useMemo(() => filterOptions(options, query), [options, query]);

  const openWith = (seed: string) => {
    const list = filterOptions(options, seed);
    const selectedIndex = seed ? -1 : list.findIndex((o) => o.value === current && !o.disabled);
    setQuery(seed);
    setActive(selectedIndex >= 0 ? selectedIndex : stepTo(list, -1, 1));
    setOpen(true);
  };

  const choose = (option: SearchSelectOption | undefined) => {
    if (!option || option.disabled) return;
    setCurrent(option.value);
    setOpen(false);
  };

  useEffect(() => {
    if (!open || active < 0) return;
    listRef.current?.querySelector<HTMLElement>(`[data-index="${active}"]`)?.scrollIntoView?.({ block: "nearest" });
  }, [open, active]);

  const onTriggerKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (disabled || open) return;
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      openWith("");
    } else if (e.key.length === 1 && e.key !== " " && !e.metaKey && !e.ctrlKey && !e.altKey) {
      e.preventDefault();
      openWith(e.key);
    }
  };

  const onInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.nativeEvent.isComposing) return;
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      const next = stepTo(filtered, active, e.key === "ArrowDown" ? 1 : -1);
      if (next >= 0) setActive(next);
    } else if (e.key === "Enter") {
      e.preventDefault();
      choose(filtered[active]);
    }
  };

  const emptyText = typeof empty === "function" ? empty(query) : (empty ?? <>Nothing matches “{query.trim()}”.</>);

  return (
    <Popover.Root open={open} onOpenChange={(next) => (next ? openWith("") : setOpen(false))}>
      <Popover.Trigger asChild>
        <button
          ref={ref}
          id={triggerId}
          type="button"
          role="combobox"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={open ? listId : undefined}
          disabled={disabled}
          data-placeholder={selected ? undefined : ""}
          className={cn(selectStyles.trigger, selectStyles.field, className)}
          onKeyDown={onTriggerKeyDown}
          {...aria}
        >
          <span>{selected ? selected.label : placeholder}</span>
          <Icon icon={ArrowDown01Icon} size={14} className={selectStyles.chevron} />
        </button>
      </Popover.Trigger>
      {name && <input type="hidden" name={name} value={current ?? ""} />}
      <Popover.Portal>
        <Popover.Content
          className={styles.content}
          align="start"
          sideOffset={6}
          collisionPadding={12}
          onOpenAutoFocus={(e) => {
            e.preventDefault();
            const input = inputRef.current;
            if (!input) return;
            input.focus();
            input.setSelectionRange(input.value.length, input.value.length);
          }}
        >
          <div className={styles.search}>
            <Icon icon={Search01Icon} size={14} className={styles.searchIcon} />
            <input
              ref={inputRef}
              type="text"
              role="combobox"
              aria-expanded="true"
              aria-controls={listId}
              aria-autocomplete="list"
              aria-activedescendant={active >= 0 && filtered[active] ? optionId(active) : undefined}
              aria-label={searchPlaceholder}
              placeholder={searchPlaceholder}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setActive(stepTo(filterOptions(options, e.target.value), -1, 1));
              }}
              onKeyDown={onInputKeyDown}
              autoComplete="off"
              spellCheck={false}
              className={styles.searchInput}
            />
          </div>
          <ul ref={listRef} id={listId} role="listbox" aria-labelledby={triggerId} className={styles.list} hidden={filtered.length === 0}>
            {filtered.map((o, i) => (
              <li
                key={o.value}
                id={optionId(i)}
                role="option"
                data-index={i}
                aria-selected={o.value === current}
                aria-disabled={o.disabled || undefined}
                data-highlighted={i === active ? "" : undefined}
                data-state={o.value === current ? "checked" : undefined}
                data-disabled={o.disabled ? "" : undefined}
                className={cn(selectStyles.item, styles.option)}
                onPointerMove={() => !o.disabled && i !== active && setActive(i)}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => choose(o)}
              >
                <span className={styles.optionLabel}>{o.label}</span>
                {o.meta !== undefined && o.meta !== null && <span className={cn("num-sm", styles.meta)}>{o.meta}</span>}
                {o.value === current && (
                  <span className={selectStyles.indicator}>
                    <Icon icon={Tick02Icon} size={14} />
                  </span>
                )}
              </li>
            ))}
          </ul>
          {filtered.length === 0 && (
            <p className={cn("small", styles.empty)} role="status">
              {emptyText}
            </p>
          )}
          {footer && <div className={styles.footer}>{footer}</div>}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
});
