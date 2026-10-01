import { Toast as RToast } from "radix-ui";
import { useEffect, useState, useSyncExternalStore, type ReactNode } from "react";
import { cn } from "../../../lib/cn";
import { Glyph } from "../Glyph/Glyph";
import styles from "./Toast.module.css";

export interface ToastItem {
  id: number;
  title: ReactNode;
  description?: ReactNode;
  tone?: "default" | "success" | "error";
}

let items: ToastItem[] = [];
let nextId = 1;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export function toast(title: ReactNode, options: Omit<ToastItem, "id" | "title"> = {}) {
  items = [...items, { id: nextId++, title, ...options }];
  emit();
}

toast.success = (title: ReactNode, description?: ReactNode) => toast(title, { description, tone: "success" });
toast.error = (title: ReactNode, description?: ReactNode) => toast(title, { description, tone: "error" });

function dismiss(id: number) {
  items = items.filter((t) => t.id !== id);
  emit();
}

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};
const empty: ToastItem[] = [];

let toasters: object[] = [];
const toasterListeners = new Set<() => void>();
const subscribeToasters = (l: () => void) => {
  toasterListeners.add(l);
  return () => toasterListeners.delete(l);
};
const setToasters = (next: object[]) => {
  toasters = next;
  toasterListeners.forEach((l) => l());
};

/**
 * Mount once near the root. Messages come from toast(), toast.success() and toast.error().
 * The queue is global, so while several Toasters are mounted only the first renders it.
 */
export function Toaster() {
  const list = useSyncExternalStore(subscribe, () => items, () => empty);
  const [self] = useState(() => ({}));
  const owner = useSyncExternalStore(subscribeToasters, () => toasters[0] === self, () => false);
  useEffect(() => {
    setToasters([...toasters, self]);
    return () => setToasters(toasters.filter((t) => t !== self));
  }, [self]);
  if (!owner) return null;
  return (
    <RToast.Provider swipeDirection="right" duration={5000}>
      {list.map((t) => (
        <RToast.Root key={t.id} className={styles.toast} onOpenChange={(open) => !open && dismiss(t.id)}>
          {t.tone && t.tone !== "default" && (
            <Glyph shape={t.tone === "success" ? "check" : "triangle"} className={cn(styles.glyph, styles[t.tone])} />
          )}
          <div className={styles.text}>
            <RToast.Title className={styles.title}>{t.title}</RToast.Title>
            {t.description && <RToast.Description className={styles.description}>{t.description}</RToast.Description>}
          </div>
          <RToast.Close className={styles.close} aria-label="Dismiss">
            ×
          </RToast.Close>
        </RToast.Root>
      ))}
      <RToast.Viewport className={styles.viewport} />
    </RToast.Provider>
  );
}
