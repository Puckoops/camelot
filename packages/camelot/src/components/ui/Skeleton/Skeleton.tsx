import type { CSSProperties } from "react";
import { cn } from "../../../lib/cn";
import styles from "./Skeleton.module.css";

/** Loading is the final layout in --surface-2 blocks at their real sizes, never a spinner. */
export function Skeleton({ width, height = 14, radius, className, style }: { width?: CSSProperties["width"]; height?: CSSProperties["height"]; radius?: string; className?: string; style?: CSSProperties }) {
  return <span aria-hidden="true" className={cn(styles.block, className)} style={{ width, height, borderRadius: radius, ...style }} />;
}
