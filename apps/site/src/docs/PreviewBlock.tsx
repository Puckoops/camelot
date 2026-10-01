"use client";

import { CopyIcon, MarkupIcon, ShareAltIcon, SyncIcon, ZoomIcon, ZoomOutIcon, ZoomResetIcon } from "@storybook/icons";
import { cn, toast } from "@puckoops/camelot";
import { useEffect, useState, type ReactNode } from "react";
import { Highlighted } from "@/components/code/Source";
import { copyText } from "@/components/code/copy";
import styles from "./docs.module.css";

const ZOOM_STEP = 1.25;

function CopyCode({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 1600);
    return () => clearTimeout(timer);
  }, [copied]);
  const copy = () =>
    copyText(code).then(
      () => setCopied(true),
      () => toast.error("Copy failed", "Select the text and copy it by hand."),
    );
  return (
    <button type="button" className={styles.action} onClick={copy} aria-live="polite">
      <CopyIcon size={14} />
      {copied ? "Copied" : "Copy code"}
    </button>
  );
}

/** Storybook's Canvas block: the framed example, its zoom toolbar when it is the page's first, and Show code below. */
export function PreviewBlock({
  toolbar,
  href,
  code,
  children,
}: {
  toolbar?: boolean;
  /** The example's own full-screen page. */
  href?: string;
  code?: string;
  children: (zoom: number) => ReactNode;
}) {
  const [zoom, setZoom] = useState(1);
  const [run, setRun] = useState(0);
  const [showCode, setShowCode] = useState(false);
  return (
    <>
      <div className={cn(styles.preview, toolbar && styles.withToolbar)}>
        {toolbar && (
          <div className={styles.previewBar}>
            <div className={styles.previewTools}>
              <button type="button" className={styles.iconButton} aria-label="Reload story" title="Reload story" onClick={() => setRun((n) => n + 1)}>
                <SyncIcon size={14} />
              </button>
              <button type="button" className={styles.iconButton} aria-label="Zoom in" title="Zoom in" onClick={() => setZoom((z) => Math.min(z * ZOOM_STEP, 4))}>
                <ZoomIcon size={14} />
              </button>
              <button type="button" className={styles.iconButton} aria-label="Zoom out" title="Zoom out" onClick={() => setZoom((z) => Math.max(z / ZOOM_STEP, 0.25))}>
                <ZoomOutIcon size={14} />
              </button>
              <button type="button" className={styles.iconButton} aria-label="Reset zoom" title="Reset zoom" onClick={() => setZoom(1)}>
                <ZoomResetIcon size={14} />
              </button>
            </div>
            {href && (
              <a href={href} target="_blank" rel="noopener" className={styles.iconButton} aria-label="Open canvas in new tab" title="Open canvas in new tab">
                <ShareAltIcon size={14} />
              </a>
            )}
          </div>
        )}
        <div key={run}>{children(zoom)}</div>
        {showCode && code && <Highlighted code={code} className={styles.codePanel} />}
      </div>
      {code && (
        <div className={styles.previewActions}>
          <button type="button" className={cn(styles.action, showCode && styles.actionOn)} aria-expanded={showCode} onClick={() => setShowCode((v) => !v)}>
            <MarkupIcon size={14} />
            {showCode ? "Hide code" : "Show code"}
          </button>
          <CopyCode code={code} />
        </div>
      )}
    </>
  );
}
