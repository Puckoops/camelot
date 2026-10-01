import { AspectRatio as RAspectRatio } from "radix-ui";
import type { ComponentPropsWithoutRef } from "react";
import { cn } from "../../../lib/cn";
import styles from "./AspectRatio.module.css";

export interface AspectRatioProps extends ComponentPropsWithoutRef<typeof RAspectRatio.Root> {
  /** Width over height: 16 / 9, 4 / 3, 1. */
  ratio?: number;
  /** Clip to --radius-md. Turn it off inside a card that already clips its media. */
  rounded?: boolean;
  /** A hairline around the frame, for media on --surface-2. */
  framed?: boolean;
}

/** Holds an image, video or preview at a fixed ratio so the layout keeps its shape while the media loads. */
export function AspectRatio({ ratio = 16 / 9, rounded = true, framed, className, ...rest }: AspectRatioProps) {
  return <RAspectRatio.Root ratio={ratio} className={cn(styles.frame, rounded && styles.rounded, framed && styles.framed, className)} {...rest} />;
}
