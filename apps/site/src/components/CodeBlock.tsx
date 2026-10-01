"use client";

import { Copy01Icon, Tick02Icon } from "@hugeicons/core-free-icons";
import { cn, IconButton, toast, Tooltip } from "@puckoops/camelot";
import { useEffect, useState } from "react";
import { copyText } from "./code/copy";
import styles from "./CodeBlock.module.css";

export function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 1600);
    return () => clearTimeout(timer);
  }, [copied]);
  const copy = () =>
    copyText(text).then(
      () => setCopied(true),
      () => toast.error("Copy failed", "Select the text and copy it by hand."),
    );
  return (
    <Tooltip content={copied ? "Copied" : label}>
      <IconButton icon={copied ? Tick02Icon : Copy01Icon} aria-label={label} size="sm" variant="bare" onClick={copy} />
    </Tooltip>
  );
}

export function CodeBlock({ code, label, className }: { code: string; label?: string; className?: string }) {
  return (
    <div className={cn(styles.code, className)}>
      <div className={styles.head}>
        <span className="caps text-4">{label ?? ""}</span>
        <CopyButton text={code} label={label ? `Copy ${label}` : "Copy code"} />
      </div>
      <pre className={cn("num-sm", styles.pre)}>
        <code>{code}</code>
      </pre>
    </div>
  );
}
