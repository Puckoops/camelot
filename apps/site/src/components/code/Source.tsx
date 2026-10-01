"use client";

import { cn, toast } from "@puckoops/camelot";
import { useEffect, useMemo, useState } from "react";
import type { LanguageName } from "sugar-high";
import { copyText } from "./copy";
import { highlightCode } from "./highlight";
import styles from "./code.module.css";

export function CopyLabel({ text, className, idle = "Copy" }: { text: string; className?: string; idle?: string }) {
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
    <button type="button" className={className} onClick={copy} aria-live="polite">
      {copied ? "Copied" : idle}
    </button>
  );
}

export function Highlighted({ code, lang, className }: { code: string; lang?: LanguageName; className?: string }) {
  const html = useMemo(() => highlightCode(code, lang), [code, lang]);
  return (
    <pre className={cn(styles.syntax, styles.pre, className)}>
      <code dangerouslySetInnerHTML={{ __html: html }} />
    </pre>
  );
}

/** Storybook's Source block: dark in both themes, with Copy at its foot. */
export function Source({ code, lang, className }: { code: string; lang?: LanguageName; className?: string }) {
  return (
    <div className={cn(styles.source, className)}>
      <Highlighted code={code} lang={lang} />
      <CopyLabel text={code} className={styles.copy} />
    </div>
  );
}
