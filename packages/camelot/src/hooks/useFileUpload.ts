import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { formatBytes } from "../lib/bytes";

export type UploadFileStatus = "queued" | "uploading" | "done" | "failed" | "rejected";

export interface UploadFileState<T = unknown> {
  id: string;
  file: File;
  status: UploadFileStatus;
  /** 0–100. */
  progress: number;
  /** A sentence for the person, set when the file was rejected or its upload failed. */
  error?: string;
  result?: T;
}

export interface UploadContext {
  onProgress(pct: number): void;
  signal: AbortSignal;
}

export type Uploader<T> = (file: File, ctx: UploadContext) => Promise<T>;

export interface UseFileUploadOptions<T> {
  /** MIME types (application/pdf, image/*) or extensions (.pdf or pdf). */
  accept?: string[];
  /** In bytes. */
  maxSize?: number;
  /** Counts every file in the list that was not rejected. */
  maxFiles?: number;
  /** false keeps a single file: a new valid file replaces the current one. Defaults to true. */
  multiple?: boolean;
  upload: Uploader<T>;
  /** Uploads in flight at once. Defaults to 3. */
  concurrency?: number;
  /** Start uploading as soon as files are added. Defaults to true; otherwise call start(). */
  autoStart?: boolean;
}

export interface UseFileUploadResult<T> {
  files: UploadFileState<T>[];
  addFiles(files: File[] | FileList): void;
  remove(id: string): void;
  retry(id: string): void;
  start(): void;
  clear(): void;
  cancel(id: string): void;
  /** The accept list as an input accept attribute, for Dropzone. */
  accept: string | undefined;
  isUploading: boolean;
}

let sequence = 0;
const nextId = () => `upload-${Date.now().toString(36)}-${(sequence++).toString(36)}`;

const SUBTYPES: Record<string, string> = {
  "vnd.openxmlformats-officedocument.wordprocessingml.document": "DOCX",
  "vnd.openxmlformats-officedocument.spreadsheetml.sheet": "XLSX",
  "vnd.openxmlformats-officedocument.presentationml.presentation": "PPTX",
  msword: "DOC",
  "vnd.ms-excel": "XLS",
  plain: "TXT",
  jpeg: "JPG",
  "svg+xml": "SVG",
  "x-zip-compressed": "ZIP",
  quicktime: "MOV",
};

const FAMILIES: Record<string, string> = { image: "images", video: "videos", audio: "audio files", text: "text files" };

function describeRule(raw: string) {
  const rule = raw.trim().toLowerCase();
  if (rule.endsWith("/*")) {
    const family = rule.slice(0, -2);
    return FAMILIES[family] ?? `${family} files`;
  }
  if (rule.includes("/")) {
    const sub = rule.slice(rule.indexOf("/") + 1);
    return SUBTYPES[sub] ?? (sub.length <= 5 ? sub.toUpperCase() : rule);
  }
  return rule.replace(/^\./, "").toUpperCase();
}

function listSentence(items: string[]) {
  const unique = [...new Set(items)];
  if (unique.length <= 1) return unique[0] ?? "";
  return `${unique.slice(0, -1).join(", ")} or ${unique[unique.length - 1]}`;
}

function matchesAccept(file: File, accept: string[]) {
  const name = file.name.toLowerCase();
  const type = (file.type || "").toLowerCase();
  return accept.some((raw) => {
    const rule = raw.trim().toLowerCase();
    if (!rule) return false;
    if (rule.includes("/")) return rule.endsWith("/*") ? type.startsWith(rule.slice(0, -1)) : type === rule;
    return name.endsWith(rule.startsWith(".") ? rule : `.${rule}`);
  });
}

/** The reason a file cannot join the list, as a sentence, or undefined when it can. */
export function validateFile(file: File, { accept, maxSize }: Pick<UseFileUploadOptions<unknown>, "accept" | "maxSize">) {
  if (accept?.length && !matchesAccept(file, accept)) {
    return `“${file.name}” is not a file type this accepts. Use ${listSentence(accept.map(describeRule))}.`;
  }
  if (maxSize !== undefined && file.size > maxSize) {
    return `“${file.name}” is ${formatBytes(file.size)}; files can be up to ${formatBytes(maxSize)}.`;
  }
  return undefined;
}

const countError = (file: File, limit: number) =>
  `“${file.name}” was not added: you can add up to ${limit === 1 ? "one file" : `${limit} files`}. Remove one to make room.`;

const failure = (err: unknown) =>
  err instanceof Error && err.message ? err.message : typeof err === "string" && err ? err : "The upload failed. Try again.";

const toAcceptAttribute = (accept: string[] | undefined) =>
  accept?.length ? accept.map((a) => (a.includes("/") || a.startsWith(".") ? a : `.${a}`)).join(",") : undefined;

/**
 * A validated upload queue. Files are checked against accept, maxSize and maxFiles, then uploaded
 * through `upload` at most `concurrency` at a time, each with progress and an AbortSignal.
 */
export function useFileUpload<T = unknown>(options: UseFileUploadOptions<T>): UseFileUploadResult<T> {
  const optionsRef = useRef(options);
  useLayoutEffect(() => {
    optionsRef.current = options;
  });

  const [files, setFiles] = useState<UploadFileState<T>[]>([]);
  const filesRef = useRef(files);
  const controllers = useRef(new Map<string, AbortController>());
  const ready = useRef(new Set<string>());
  const mounted = useRef(false);

  const actions = useMemo(() => {
    const commit = (next: UploadFileState<T>[]) => {
      filesRef.current = next;
      if (mounted.current) setFiles(next);
    };
    const patch = (id: string, change: Partial<UploadFileState<T>>) =>
      commit(filesRef.current.map((f) => (f.id === id ? { ...f, ...change } : f)));
    const find = (id: string) => filesRef.current.find((f) => f.id === id);

    const stop = (id: string) => {
      controllers.current.get(id)?.abort();
      controllers.current.delete(id);
      ready.current.delete(id);
    };

    const settle = (id: string, controller: AbortController, change: Partial<UploadFileState<T>>) => {
      if (controllers.current.get(id) !== controller) return;
      controllers.current.delete(id);
      ready.current.delete(id);
      if (find(id)) patch(id, change);
      pump();
    };

    const run = (item: UploadFileState<T>) => {
      const controller = new AbortController();
      controllers.current.set(item.id, controller);
      patch(item.id, { status: "uploading", progress: 0, error: undefined, result: undefined });
      const ctx: UploadContext = {
        signal: controller.signal,
        onProgress: (pct) => {
          if (controllers.current.get(item.id) !== controller) return;
          const progress = Math.max(0, Math.min(100, Number.isFinite(pct) ? pct : 0));
          if (find(item.id)?.progress !== progress) patch(item.id, { progress });
        },
      };
      let pending: Promise<T>;
      try {
        pending = Promise.resolve(optionsRef.current.upload(item.file, ctx));
      } catch (err) {
        pending = Promise.reject(err);
      }
      pending.then(
        (result) => settle(item.id, controller, { status: "done", progress: 100, result }),
        (err) => settle(item.id, controller, { status: "failed", error: failure(err) }),
      );
    };

    const pump = () => {
      const limit = Math.max(1, Math.floor(optionsRef.current.concurrency ?? 3));
      let active = filesRef.current.filter((f) => f.status === "uploading").length;
      for (const f of filesRef.current) {
        if (active >= limit) break;
        if (f.status !== "queued" || !ready.current.has(f.id)) continue;
        active++;
        run(f);
      }
    };

    const addFiles = (input: File[] | FileList) => {
      const incoming = Array.from(input);
      if (!incoming.length) return;
      const { accept, maxSize, maxFiles, multiple = true, autoStart = true } = optionsRef.current;

      if (!multiple) {
        const file = incoming[0]!;
        const error = validateFile(file, { accept, maxSize });
        const id = nextId();
        if (error) {
          commit([...filesRef.current.filter((f) => f.status !== "rejected"), { id, file, status: "rejected", progress: 0, error }]);
          return;
        }
        for (const f of filesRef.current) stop(f.id);
        if (autoStart) ready.current.add(id);
        commit([{ id, file, status: "queued", progress: 0 }]);
        pump();
        return;
      }

      let room = maxFiles === undefined ? Infinity : Math.max(0, maxFiles - filesRef.current.filter((f) => f.status !== "rejected").length);
      const added = incoming.map((file): UploadFileState<T> => {
        const id = nextId();
        const error = validateFile(file, { accept, maxSize }) ?? (room <= 0 ? countError(file, maxFiles ?? 0) : undefined);
        if (error) return { id, file, status: "rejected", progress: 0, error };
        room--;
        if (autoStart) ready.current.add(id);
        return { id, file, status: "queued", progress: 0 };
      });
      commit([...filesRef.current, ...added]);
      pump();
    };

    const remove = (id: string) => {
      stop(id);
      commit(filesRef.current.filter((f) => f.id !== id));
      pump();
    };

    const cancel = (id: string) => {
      const item = find(id);
      if (!item || (item.status !== "uploading" && item.status !== "queued")) return;
      stop(id);
      patch(id, { status: "failed", error: "Upload cancelled." });
      pump();
    };

    const retry = (id: string) => {
      const item = find(id);
      if (!item || item.status !== "failed") return;
      ready.current.add(id);
      patch(id, { status: "queued", progress: 0, error: undefined });
      pump();
    };

    const start = () => {
      for (const f of filesRef.current) if (f.status === "queued") ready.current.add(f.id);
      pump();
    };

    const clear = () => {
      for (const f of filesRef.current) stop(f.id);
      commit([]);
    };

    return { addFiles, remove, cancel, retry, start, clear, abortAll: () => filesRef.current.forEach((f) => stop(f.id)) };
  }, []);

  useEffect(() => {
    mounted.current = true;
    setFiles((shown) => (shown === filesRef.current ? shown : filesRef.current));
    return () => {
      mounted.current = false;
      actions.abortAll();
    };
  }, [actions]);

  return {
    files,
    addFiles: actions.addFiles,
    remove: actions.remove,
    retry: actions.retry,
    start: actions.start,
    clear: actions.clear,
    cancel: actions.cancel,
    accept: toAcceptAttribute(options.accept),
    isUploading: files.some((f) => f.status === "uploading"),
  };
}

export interface SignedUrlTarget {
  signedUrl: string;
  /** Where the file lives once uploaded; passed to register. */
  resourceUrl: string;
  /** Sent with the PUT, after Content-Type, so a signature that pins a header can set it. */
  headers?: Record<string, string>;
}

export interface SignedUrlUploaderOptions<R> {
  getSignedUrl(file: File): Promise<SignedUrlTarget>;
  /** Records the uploaded file with the API; its result becomes the upload's result. */
  register?(file: File, resourceUrl: string): Promise<R>;
  /** Builds the request; tests and offline demos pass a stand-in. */
  createRequest?: () => XMLHttpRequest;
}

const abortError = () => new DOMException("The upload was cancelled.", "AbortError");

function put(target: SignedUrlTarget, file: File, ctx: UploadContext, createRequest: () => XMLHttpRequest) {
  return new Promise<void>((resolve, reject) => {
    if (ctx.signal.aborted) return reject(abortError());
    const xhr = createRequest();
    const onAbort = () => xhr.abort();
    const done = (fn: () => void) => {
      ctx.signal.removeEventListener("abort", onAbort);
      fn();
    };
    xhr.open("PUT", target.signedUrl);
    const headers: Record<string, string> = { "Content-Type": file.type || "application/octet-stream" };
    for (const [key, value] of Object.entries(target.headers ?? {})) {
      for (const existing of Object.keys(headers)) if (existing.toLowerCase() === key.toLowerCase()) delete headers[existing];
      headers[key] = value;
    }
    for (const [key, value] of Object.entries(headers)) xhr.setRequestHeader(key, value);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && e.total > 0) ctx.onProgress(Math.min(99, (e.loaded / e.total) * 100));
    };
    xhr.onload = () =>
      done(() => (xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error(`The storage service refused the file (HTTP ${xhr.status}).`))));
    xhr.onerror = () => done(() => reject(new Error("The connection dropped before the file finished uploading.")));
    xhr.onabort = () => done(() => reject(abortError()));
    ctx.signal.addEventListener("abort", onAbort, { once: true });
    xhr.send(file);
  });
}

/**
 * An upload function for useFileUpload: ask the API for a signed URL, PUT the file straight to storage
 * with progress, then register it. Resolves with register's result, or the resource URL without one.
 */
export function createSignedUrlUploader(options: SignedUrlUploaderOptions<never> & { register?: undefined }): Uploader<string>;
export function createSignedUrlUploader<R>(options: SignedUrlUploaderOptions<R> & { register: (file: File, resourceUrl: string) => Promise<R> }): Uploader<R>;
export function createSignedUrlUploader<R>(options: SignedUrlUploaderOptions<R>): Uploader<R | string> {
  const createRequest = options.createRequest ?? (() => new XMLHttpRequest());
  return async (file, ctx) => {
    if (ctx.signal.aborted) throw abortError();
    const target = await options.getSignedUrl(file);
    if (ctx.signal.aborted) throw abortError();
    await put(target, file, ctx, createRequest);
    if (!options.register) {
      ctx.onProgress(100);
      return target.resourceUrl;
    }
    const registered = await options.register(file, target.resourceUrl);
    if (ctx.signal.aborted) throw abortError();
    ctx.onProgress(100);
    return registered;
  };
}
