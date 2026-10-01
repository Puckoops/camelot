import { cn } from "../../../lib/cn";
import styles from "./AzStrip.module.css";

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export interface AzStripProps {
  /** Letters that have at least one entry; the rest render quiet and inert. */
  available: Set<string> | string[];
  active?: string | null;
  onSelect: (letter: string) => void;
  className?: string;
}

export function AzStrip({ available, active, onSelect, className }: AzStripProps) {
  const has = available instanceof Set ? available : new Set(available);
  return (
    <nav aria-label="Jump to letter" className={cn(styles.strip, className)}>
      {LETTERS.map((l) => {
        const enabled = has.has(l);
        return (
          <button
            key={l}
            type="button"
            className={cn("num-sm", styles.letter, enabled && styles.enabled, active === l && styles.active)}
            disabled={!enabled}
            onClick={() => onSelect(l)}
            aria-pressed={active === l}
          >
            {l}
          </button>
        );
      })}
    </nav>
  );
}
