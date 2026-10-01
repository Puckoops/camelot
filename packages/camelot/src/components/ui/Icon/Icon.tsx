import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import type { SVGProps } from "react";

export type IconDefinition = IconSvgElement;

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, "ref" | "color" | "strokeWidth"> {
  icon: IconDefinition;
  /** 16 in tables and the sidebar, 18 in nav, 20 in buttons, 28 on an Action card. */
  size?: number;
  /** Set only when the icon carries meaning on its own; otherwise it is hidden from assistive tech. */
  label?: string;
  strokeWidth?: number;
}

export function Icon({ icon, size = 16, label, strokeWidth = 1.5, ...rest }: IconProps) {
  return (
    <HugeiconsIcon
      icon={icon}
      size={size}
      strokeWidth={strokeWidth}
      focusable="false"
      aria-hidden={label ? undefined : true}
      aria-label={label}
      role={label ? "img" : undefined}
      {...rest}
    />
  );
}
