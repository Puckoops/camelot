import type { SVGProps } from "react";
import { cn } from "../../../lib/cn";
import styles from "./Glyph.module.css";

/**
 * The frozen status silhouettes, drawn at Hugeicons weight. They are the greyscale fallback for every
 * state, so each shape must stay distinguishable without colour.
 */
export type GlyphShape =
  | "circle"
  | "circle-dashed"
  | "circle-half"
  | "diamond"
  | "diamond-filled"
  | "redo"
  | "check"
  | "square"
  | "square-filled"
  | "triangle"
  | "triangle-filled"
  | "triangle-down"
  | "cross"
  | "dot";

export interface GlyphProps extends Omit<SVGProps<SVGSVGElement>, "ref"> {
  shape: GlyphShape;
  size?: number;
}

function paths(shape: GlyphShape) {
  switch (shape) {
    case "circle":
      return <circle cx="6" cy="6" r="4.25" />;
    case "circle-dashed":
      return <circle cx="6" cy="6" r="4.25" strokeDasharray="1.6 1.75" />;
    case "circle-half":
      return (
        <>
          <circle cx="6" cy="6" r="4.25" />
          <path d="M6 1.75a4.25 4.25 0 0 0 0 8.5z" fill="currentColor" stroke="none" />
        </>
      );
    case "diamond":
      return <path d="M6 1.6 10.4 6 6 10.4 1.6 6z" />;
    case "diamond-filled":
      return <path d="M6 1.6 10.4 6 6 10.4 1.6 6z" fill="currentColor" />;
    case "redo":
      return (
        <>
          <path d="M2.1 6.4a3.95 3.95 0 1 0 1.2-3.1" />
          <path d="M2.9 1.6v2.1H5" />
        </>
      );
    case "check":
      return <path d="M2.1 6.3 4.8 9l5.1-6" />;
    case "square":
      return <rect x="2.1" y="2.1" width="7.8" height="7.8" rx="1.4" />;
    case "square-filled":
      return <rect x="2.4" y="2.4" width="7.2" height="7.2" rx="1.2" fill="currentColor" />;
    case "triangle":
      return <path d="M6 1.9 10.5 9.9H1.5z" />;
    case "triangle-filled":
      return <path d="M6 2.4 10 9.4H2z" fill="currentColor" />;
    case "triangle-down":
      return <path d="M6 9.6 10 2.6H2z" fill="currentColor" />;
    case "cross":
      return <path d="M2.8 2.8l6.4 6.4M9.2 2.8 2.8 9.2" />;
    case "dot":
      return <circle cx="6" cy="6" r="2.25" fill="currentColor" stroke="none" />;
  }
}

export function Glyph({ shape, size = 12, className, ...rest }: GlyphProps) {
  return (
    <svg
      viewBox="0 0 12 12"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={cn(styles.glyph, className)}
      {...rest}
    >
      {paths(shape)}
    </svg>
  );
}
