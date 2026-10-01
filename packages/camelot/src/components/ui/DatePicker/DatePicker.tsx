import { Popover } from "radix-ui";
import { ArrowLeft01Icon, ArrowRight01Icon, Calendar01Icon } from "@hugeicons/core-free-icons";
import { forwardRef, useMemo, useState } from "react";
import { cn } from "../../../lib/cn";
import { IconButton } from "../Button/Button";
import { Icon } from "../Icon/Icon";
import { formatIsoDate, parseIso, toIso, type IsoDate } from "../../../lib/dates";
import styles from "./DatePicker.module.css";

export { formatIsoDate, parseIso, toIso, type IsoDate };

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

function todayIso() {
  const now = new Date();
  return toIso(now.getFullYear(), now.getMonth(), now.getDate());
}

export interface CalendarProps {
  value?: IsoDate | null;
  onSelect: (value: IsoDate) => void;
  min?: IsoDate;
  max?: IsoDate;
}

export function Calendar({ value, onSelect, min, max }: CalendarProps) {
  const start = parseIso(value) ?? parseIso(todayIso())!;
  const [view, setView] = useState({ y: start.y, m: start.m });
  const today = todayIso();

  const cells = useMemo(() => {
    const first = new Date(Date.UTC(view.y, view.m, 1));
    const offset = (first.getUTCDay() + 6) % 7;
    const days = new Date(Date.UTC(view.y, view.m + 1, 0)).getUTCDate();
    const out: (number | null)[] = Array.from({ length: offset }, () => null);
    for (let d = 1; d <= days; d++) out.push(d);
    while (out.length % 7) out.push(null);
    return out;
  }, [view]);

  const shift = (delta: number) => {
    const m = view.m + delta;
    setView({ y: view.y + Math.floor(m / 12), m: ((m % 12) + 12) % 12 });
  };

  return (
    <div className={styles.calendar}>
      <div className={styles.calHead}>
        <IconButton icon={ArrowLeft01Icon} size="sm" variant="bare" aria-label="Previous month" onClick={() => shift(-1)} />
        <span className={styles.calTitle}>
          {MONTHS[view.m]} {view.y}
        </span>
        <IconButton icon={ArrowRight01Icon} size="sm" variant="bare" aria-label="Next month" onClick={() => shift(1)} />
      </div>
      <div className={styles.grid} role="grid">
        {DAYS.map((d) => (
          <span key={d} className={cn("caps", styles.dow)}>
            {d}
          </span>
        ))}
        {cells.map((d, i) => {
          if (d === null) return <span key={i} />;
          const iso = toIso(view.y, view.m, d);
          const disabled = (min !== undefined && iso < min) || (max !== undefined && iso > max);
          return (
            <button
              key={i}
              type="button"
              className={cn("num", styles.day, iso === value && styles.selected, iso === today && styles.today)}
              disabled={disabled}
              onClick={() => onSelect(iso)}
              aria-pressed={iso === value}
            >
              {d}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export interface DateInputProps {
  value?: IsoDate | null;
  onChange: (value: IsoDate | null) => void;
  placeholder?: string;
  min?: IsoDate;
  max?: IsoDate;
  clearable?: boolean;
  disabled?: boolean;
  id?: string;
  "aria-describedby"?: string;
  "aria-invalid"?: boolean;
}

export const DateInput = forwardRef<HTMLButtonElement, DateInputProps>(function DateInput(
  { value, onChange, placeholder = "dd mmm yyyy", min, max, clearable, disabled, ...rest },
  ref,
) {
  const [open, setOpen] = useState(false);
  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button ref={ref} type="button" disabled={disabled} className={cn(styles.trigger, !value && styles.placeholder)} {...rest}>
          <span>{value ? formatIsoDate(value) : placeholder}</span>
          <Icon icon={Calendar01Icon} size={16} className={styles.triggerIcon} />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content className={styles.popover} sideOffset={6} align="start" collisionPadding={12}>
          <Calendar
            value={value}
            min={min}
            max={max}
            onSelect={(v) => {
              onChange(v);
              setOpen(false);
            }}
          />
          <div className={styles.popFoot}>
            <button
              type="button"
              className={styles.link}
              onClick={() => {
                onChange(todayIso());
                setOpen(false);
              }}
            >
              Today
            </button>
            {clearable && value && (
              <button
                type="button"
                className={styles.link}
                onClick={() => {
                  onChange(null);
                  setOpen(false);
                }}
              >
                Clear
              </button>
            )}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
});
