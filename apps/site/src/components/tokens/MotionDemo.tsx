"use client";

import { Button, HelperText } from "@puckoops/camelot";
import { createContext, use, useState, useSyncExternalStore, type CSSProperties, type ReactNode } from "react";
import styles from "./Tokens.module.css";

const ReplayContext = createContext({ run: 0, replay: () => {} });

export function ReplayProvider({ children }: { children: ReactNode }) {
  const [run, setRun] = useState(0);
  return <ReplayContext value={{ run, replay: () => setRun((r) => r + 1) }}>{children}</ReplayContext>;
}

export function ReplayButton() {
  const { replay } = use(ReplayContext);
  return (
    <Button size="sm" onClick={replay}>
      Replay
    </Button>
  );
}

export function MotionTrack({ duration, easing }: { duration: string; easing: string }) {
  const { run } = use(ReplayContext);
  return (
    <span className={styles.track}>
      <span key={run} className={styles.fill} style={{ "--demo-dur": duration, "--demo-ease": easing } as CSSProperties} />
    </span>
  );
}

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void) {
  const query = window.matchMedia(REDUCED_MOTION);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

export function ReducedMotionNote() {
  const reduced = useSyncExternalStore(
    subscribe,
    () => window.matchMedia(REDUCED_MOTION).matches,
    () => false,
  );
  return reduced ? <HelperText>Your system asks for reduced motion, so these demos jump to their end — exactly as the product does.</HelperText> : null;
}
