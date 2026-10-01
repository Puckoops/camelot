import { ArrowLeft01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons";
import type { AnchorHTMLAttributes, ElementType, ReactNode } from "react";
import { cn } from "../../../lib/cn";
import { Icon } from "../Icon/Icon";
import styles from "./TextLink.module.css";

export interface TextLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  arrow?: "forward" | "back";
  as?: ElementType;
  children: ReactNode;
}

export function TextLink({ arrow, as, className, children, ...rest }: TextLinkProps) {
  const Comp: ElementType = as ?? "a";
  return (
    <Comp className={cn(styles.link, className)} {...rest}>
      {arrow === "back" && <Icon icon={ArrowLeft01Icon} size={14} />}
      <span>{children}</span>
      {arrow === "forward" && <Icon icon={ArrowRight01Icon} size={14} className={styles.forward} />}
    </Comp>
  );
}
