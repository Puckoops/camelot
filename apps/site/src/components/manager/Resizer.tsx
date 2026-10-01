"use client";

import { cn } from "@puckoops/camelot";
import type { KeyboardEvent, PointerEvent } from "react";
import styles from "./manager.module.css";

/** A drag edge like Storybook's: dragging by `direction` pixels grows the size by as many. */
export function Resizer({
  label,
  orientation,
  size,
  direction,
  onResize,
  className,
}: {
  label: string;
  orientation: "vertical" | "horizontal";
  size: number;
  direction: 1 | -1;
  onResize: (size: number) => void;
  className?: string;
}) {
  const axis = orientation === "vertical" ? "clientX" : "clientY";
  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    e.preventDefault();
    const handle = e.currentTarget;
    const start = e[axis];
    const initial = size;
    handle.setPointerCapture(e.pointerId);
    const move = (ev: globalThis.PointerEvent) => onResize(initial + direction * (ev[axis] - start));
    const up = () => {
      handle.removeEventListener("pointermove", move);
      handle.removeEventListener("pointerup", up);
      handle.removeEventListener("pointercancel", up);
    };
    handle.addEventListener("pointermove", move);
    handle.addEventListener("pointerup", up);
    handle.addEventListener("pointercancel", up);
  };
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const grow = orientation === "vertical" ? { ArrowRight: 1, ArrowLeft: -1 } : { ArrowDown: 1, ArrowUp: -1 };
    const step = grow[e.key as keyof typeof grow];
    if (step === undefined) return;
    e.preventDefault();
    onResize(size + step * direction * 20);
  };
  return (
    <div
      role="separator"
      tabIndex={0}
      aria-label={label}
      aria-orientation={orientation}
      aria-valuenow={size}
      className={cn(styles.resizer, orientation === "vertical" ? styles.resizerX : styles.resizerY, className)}
      onPointerDown={onPointerDown}
      onKeyDown={onKeyDown}
    />
  );
}
