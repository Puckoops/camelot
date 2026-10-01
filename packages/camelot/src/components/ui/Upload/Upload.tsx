import { CloudUploadIcon, Cancel01Icon } from "@hugeicons/core-free-icons";
import { useId, useRef, useState, type DragEvent, type ReactNode } from "react";
import { cn } from "../../../lib/cn";
import { IconButton } from "../Button/Button";
import { Icon } from "../Icon/Icon";
import styles from "./Upload.module.css";

export interface DropzoneProps {
  onFiles: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  title?: ReactNode;
  hint?: ReactNode;
  disabled?: boolean;
  className?: string;
}

export function Dropzone({
  onFiles,
  accept,
  multiple = true,
  title = "Drop files here, or browse",
  hint,
  disabled,
  className,
}: DropzoneProps) {
  const input = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  const id = useId();

  const take = (list: FileList | null) => {
    if (!list || disabled) return;
    const files = Array.from(list);
    if (files.length) onFiles(multiple ? files : files.slice(0, 1));
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setOver(false);
    take(e.dataTransfer.files);
  };

  return (
    <div
      className={cn(styles.zone, over && styles.over, disabled && styles.disabled, className)}
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled) setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={onDrop}
    >
      <Icon icon={CloudUploadIcon} size={20} className={styles.zoneIcon} />
      <label htmlFor={id} className={styles.zoneTitle}>
        {title}
      </label>
      {hint && <p className={cn("caption", styles.zoneHint)}>{hint}</p>}
      <input
        ref={input}
        id={id}
        type="file"
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        className={styles.input}
        onChange={(e) => {
          take(e.target.files);
          e.target.value = "";
        }}
      />
    </div>
  );
}

export interface UploadItemProps {
  name: string;
  kind?: string;
  size?: string;
  /** 0–100. */
  progress: number;
  status?: "queued" | "uploading" | "done" | "failed";
  error?: string;
  onRemove?: () => void;
}

export function UploadItem({ name, kind, size, progress, status = "uploading", error, onRemove }: UploadItemProps) {
  return (
    <div className={cn(styles.item, status === "failed" && styles.failed)}>
      <span className={styles.name} title={name}>
        {name}
      </span>
      {kind && <span className={cn("caption", styles.kind)}>{kind}</span>}
      {size && <span className={cn("num-sm", styles.size)}>{size}</span>}
      <span className={styles.progress} aria-hidden="true">
        <span className={styles.progressFill} style={{ transform: `scaleX(${Math.max(0, Math.min(100, progress)) / 100})` }} />
      </span>
      <span className={cn("num-sm", styles.pct)}>{status === "failed" ? "Failed" : `${Math.round(progress)}%`}</span>
      {onRemove ? (
        <IconButton icon={Cancel01Icon} size="sm" variant="bare" aria-label={`Remove ${name}`} onClick={onRemove} />
      ) : (
        <span className={styles.spacer} />
      )}
      {error && <p className={cn("caption", styles.error)}>{error}</p>}
    </div>
  );
}
