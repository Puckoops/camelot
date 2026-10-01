import { Delete02Icon, RefreshIcon } from "@hugeicons/core-free-icons";
import {
  Button,
  Card,
  createSignedUrlUploader,
  Dropzone,
  formatBytes,
  HelperText,
  Label,
  UploadItem,
  useFileUpload,
  type UploadContext,
  type UploadFileState,
  type UseFileUploadResult,
} from "@puckoops/camelot";
import { useRef, useState } from "react";
import type { ExampleOf, Meta } from "@/docs";

interface HookArgs {
  maxSizeMb: number;
  maxFiles: number;
  concurrency: number;
  autoStart: boolean;
}

const MB = 1024 * 1024;

const sample = (name: string, type: string, bytes: number) => new File([new Uint8Array(bytes)], name, { type });

const KINDS: [RegExp, string][] = [
  [/pdf$/i, "PDF"],
  [/\.(png|jpe?g|gif|webp)$/i, "Image"],
  [/\.(zip|rar|7z)$/i, "Archive"],
  [/\.(mov|mp4|webm)$/i, "Video"],
  [/\.(docx?|pages)$/i, "Document"],
  [/\.(xlsx?|csv|numbers)$/i, "Sheet"],
];
const kindOf = (file: File) => KINDS.find(([re]) => re.test(file.name))?.[1] ?? "File";

const failedOnce = new Set<string>();

function simulatedUpload(file: File, { onProgress, signal }: UploadContext) {
  return new Promise<string>((resolve, reject) => {
    let pct = 0;
    const failAt = file.name.startsWith("Site_photos") && !failedOnce.has(file.name) ? 46 : Infinity;
    const timer = window.setInterval(() => {
      pct = Math.min(100, pct + 6 + ((file.size / 1000 + pct) % 9));
      if (pct >= failAt) {
        window.clearInterval(timer);
        failedOnce.add(file.name);
        reject(new Error("The connection dropped before the file finished uploading."));
        return;
      }
      onProgress(pct);
      if (pct >= 100) {
        window.clearInterval(timer);
        resolve(`https://files.example.com/${encodeURIComponent(file.name)}`);
      }
    }, 140);
    signal.addEventListener("abort", () => {
      window.clearInterval(timer);
      reject(new DOMException("Cancelled", "AbortError"));
    });
  });
}

function Queue<T>({ upload, detail }: { upload: UseFileUploadResult<T>; detail?: (f: UploadFileState<T>) => string | undefined }) {
  const queue = upload.files.filter((f) => f.status !== "rejected");
  if (!queue.length) return null;
  return (
    <div>
      {queue.map((f) => (
        <div key={f.id}>
          <UploadItem
            name={f.file.name}
            kind={kindOf(f.file)}
            size={formatBytes(f.file.size)}
            progress={f.progress}
            status={f.status === "rejected" ? "failed" : f.status}
            error={f.error}
            onRemove={() => (f.status === "uploading" ? upload.cancel(f.id) : upload.remove(f.id))}
          />
          {f.status === "done" && detail?.(f) && (
            <HelperText tone="success" style={{ padding: "6px 0" }}>
              {detail(f)}
            </HelperText>
          )}
          {f.status === "failed" && (
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 4, padding: "6px 0" }}>
              <Button size="sm" variant="quiet" iconStart={Delete02Icon} onClick={() => upload.remove(f.id)}>
                Remove
              </Button>
              <Button size="sm" iconStart={RefreshIcon} onClick={() => upload.retry(f.id)}>
                Retry
              </Button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function Rejections<T>({ upload }: { upload: UseFileUploadResult<T> }) {
  const rejected = upload.files.filter((f) => f.status === "rejected");
  if (!rejected.length) return null;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {rejected.map((f) => (
        <HelperText key={f.id} tone="error">
          {f.error}
        </HelperText>
      ))}
      <div>
        <Button size="sm" variant="quiet" onClick={() => rejected.forEach((f) => upload.remove(f.id))}>
          Dismiss
        </Button>
      </div>
    </div>
  );
}

function SingleFileDemo({ maxSizeMb }: HookArgs) {
  const upload = useFileUpload({ multiple: false, accept: [".pdf", "image/png", "image/jpeg"], maxSize: maxSizeMb * MB, upload: simulatedUpload });
  const current = upload.files.find((f) => f.status !== "rejected");
  return (
    <Card style={{ width: 560, gap: 12 }}>
      <Label>Signed contract</Label>
      <Dropzone
        multiple={false}
        accept={upload.accept}
        onFiles={upload.addFiles}
        title="Drop the signed contract, or browse"
        hint={`PDF, PNG or JPG up to ${maxSizeMb} MB. A new file replaces the old one.`}
      />
      <Queue upload={upload} />
      <Rejections upload={upload} />
      {current?.status === "done" && <HelperText tone="success">Uploaded and attached to the project.</HelperText>}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 4 }}>
        <Button size="sm" onClick={() => upload.addFiles([sample("Nordvik_contract_signed.pdf", "application/pdf", 2.4 * MB)])}>
          Use a sample contract
        </Button>
        <Button size="sm" variant="quiet" onClick={() => upload.addFiles([sample("Contract_scan_600dpi.pdf", "application/pdf", (maxSizeMb + 2) * MB)])}>
          Try one that is too big
        </Button>
        <Button
          size="sm"
          variant="quiet"
          onClick={() => upload.addFiles([sample("Contract_notes.docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", 40 * 1024)])}
        >
          Try the wrong type
        </Button>
      </div>
    </Card>
  );
}

function MultiFileDemo({ maxSizeMb, maxFiles, concurrency, autoStart }: HookArgs) {
  const upload = useFileUpload({
    accept: [".pdf", ".png", ".jpg", ".zip", ".docx", ".xlsx"],
    maxSize: maxSizeMb * MB,
    maxFiles,
    concurrency,
    autoStart,
    upload: simulatedUpload,
  });
  const queue = upload.files.filter((f) => f.status !== "rejected");
  const done = queue.filter((f) => f.status === "done").length;
  const inFlight = queue.filter((f) => f.status === "uploading").length;
  const waiting = queue.filter((f) => f.status === "queued").length;
  const addSamples = () =>
    upload.addFiles([
      sample("Nordvik_signage_pilot.pdf", "application/pdf", 3.2 * MB),
      sample("Site_photos_batch_02.zip", "application/zip", 4.1 * MB),
      sample("Brand_guidelines_v4.pdf", "application/pdf", 2.6 * MB),
      sample("Moodboard.png", "image/png", 1.4 * MB),
      sample("Budget_2026.xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", 220 * 1024),
      sample("Installer.exe", "application/x-msdownload", 800 * 1024),
      sample("Studio_walkthrough.zip", "application/zip", (maxSizeMb + 1) * MB),
    ]);
  return (
    <Card style={{ width: 640, gap: 12 }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12 }}>
        <Label>Deliverables</Label>
        <span className="caption text-3">
          <span className="num">{done}</span> of <span className="num">{queue.length}</span> uploaded
          {inFlight ? (
            <>
              {" "}
              · <span className="num">{inFlight}</span> in flight
            </>
          ) : null}
          {waiting ? (
            <>
              {" "}
              · <span className="num">{waiting}</span> waiting
            </>
          ) : null}
        </span>
      </div>
      <Dropzone
        accept={upload.accept}
        onFiles={upload.addFiles}
        hint={`PDF, PNG, JPG, ZIP, DOCX or XLSX, up to ${maxSizeMb} MB each and ${maxFiles} files. ${concurrency} upload at a time.`}
      />
      <Queue upload={upload} />
      <Rejections upload={upload} />
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 4 }}>
        <Button size="sm" onClick={addSamples}>
          Add sample files
        </Button>
        {!autoStart && (
          <Button size="sm" variant="primary" disabled={!waiting} onClick={upload.start}>
            Start uploads
          </Button>
        )}
        <Button size="sm" variant="quiet" disabled={!upload.files.length} onClick={upload.clear}>
          Clear all
        </Button>
      </div>
    </Card>
  );
}

interface LogLine {
  at: number;
  text: string;
}

class SimulatedPut {
  upload: { onprogress: ((e: { lengthComputable: boolean; loaded: number; total: number }) => void) | null } = { onprogress: null };
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  onabort: (() => void) | null = null;
  status = 0;
  private url = "";
  private headers: string[] = [];
  private timer: number | undefined;
  constructor(private log: (text: string) => void) {}
  open(method: string, url: string) {
    this.url = url.replace(/\?.*$/, "");
    this.log(`${method} ${this.url.replace(/^https:\/\//, "")}`);
  }
  setRequestHeader(key: string, value: string) {
    this.headers.push(`${key}: ${value}`);
  }
  send(body: File) {
    this.log(`  ${this.headers.join(" · ")} · ${formatBytes(body.size)}`);
    let loaded = 0;
    const total = Math.max(1, body.size);
    this.timer = window.setInterval(() => {
      loaded = Math.min(total, loaded + total / 9);
      this.upload.onprogress?.({ lengthComputable: true, loaded, total });
      if (loaded >= total) {
        window.clearInterval(this.timer);
        this.status = 200;
        this.log(`  200 OK · ${body.name} stored`);
        this.onload?.();
      }
    }, 160);
  }
  abort() {
    window.clearInterval(this.timer);
    this.log("  aborted");
    this.onabort?.();
  }
}

const later = <T,>(ms: number, value: () => T) => new Promise<T>((resolve) => window.setTimeout(() => resolve(value()), ms));

function simulatedApi(write: (text: string) => void) {
  return createSignedUrlUploader({
    getSignedUrl: (file) => {
      write(`POST /api/uploads/sign · ${file.name}`);
      const key = `uploads/${Math.random().toString(16).slice(2, 10)}/${encodeURIComponent(file.name)}`;
      return later(360, () => {
        write(`  200 · signed URL for ${key}`);
        return {
          signedUrl: `https://storage.example.com/${key}?X-Goog-Signature=5d1f…`,
          resourceUrl: `https://storage.example.com/${key}`,
          headers: { "x-goog-meta-client": "nordvik" },
        };
      });
    },
    register: (file, resourceUrl) => {
      write(`POST /api/files · ${resourceUrl.replace("https://storage.example.com/", "")}`);
      return later(420, () => {
        const id = `file_${Math.random().toString(16).slice(2, 8)}`;
        write(`  201 · registered ${file.name} as ${id}`);
        return { id, url: resourceUrl };
      });
    },
    createRequest: () => new SimulatedPut(write) as unknown as XMLHttpRequest,
  });
}

function WithApisDemo({ maxSizeMb, concurrency }: HookArgs) {
  const [log, setLog] = useState<LogLine[]>([]);
  const started = useRef<number | null>(null);
  const write = (text: string) => {
    started.current ??= performance.now();
    const at = Math.round(performance.now() - started.current);
    setLog((lines) => [...lines.slice(-40), { at, text }]);
  };
  const upload = useFileUpload({
    accept: [".pdf", "image/*"],
    maxSize: maxSizeMb * MB,
    concurrency,
    upload: (file, context) => simulatedApi(write)(file, context),
  });
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 16, width: "min(960px, 100%)" }}>
      <Card style={{ gap: 12 }}>
        <Label>Upload to the project</Label>
        <Dropzone
          accept={upload.accept}
          onFiles={upload.addFiles}
          hint={`PDF or images up to ${maxSizeMb} MB. Nothing leaves this page: the API and storage are simulated.`}
        />
        <Queue upload={upload} detail={(f) => (f.result ? `Registered as ${f.result.id}` : undefined)} />
        <Rejections upload={upload} />
        <div style={{ display: "flex", gap: 8 }}>
          <Button
            size="sm"
            onClick={() =>
              upload.addFiles([sample("Signage_proof_A3.pdf", "application/pdf", 1.8 * MB), sample("Harbour_office_front.jpg", "image/jpeg", 2.2 * MB)])
            }
          >
            Upload two samples
          </Button>
          <Button
            size="sm"
            variant="quiet"
            onClick={() => {
              upload.clear();
              setLog([]);
              started.current = null;
            }}
          >
            Reset
          </Button>
        </div>
      </Card>
      <Card style={{ gap: 8 }}>
        <p className="caps text-4">Requests</p>
        {log.length ? (
          <ol style={{ display: "flex", flexDirection: "column", gap: 4, maxHeight: 340, overflowY: "auto" }}>
            {log.map((line, i) => (
              <li key={i} className="num-sm" style={{ display: "grid", gridTemplateColumns: "56px minmax(0, 1fr)", gap: 8 }}>
                <span className="text-4">{line.at} ms</span>
                <span className="text-2" style={{ overflowWrap: "anywhere", whiteSpace: "pre-wrap" }}>
                  {line.text}
                </span>
              </li>
            ))}
          </ol>
        ) : (
          <p className="small text-3">Upload a file to watch the signed-URL flow: sign, PUT to storage with progress, register.</p>
        )}
      </Card>
    </div>
  );
}

const meta = {
  title: "Hooks/useFileUpload",
  description:
    "A validated upload queue behind **Dropzone** and **UploadItem**. Pass **accept** (MIME types or extensions), **maxSize** in bytes and **maxFiles**; a file that fails a check joins the list as **rejected** with a sentence that says why. Accepted files upload through your **upload(file, { onProgress, signal })** function, at most **concurrency** at a time (3 by default), starting as soon as they are added unless **autoStart** is false. Each file reports **status**, **progress**, **error** and **result**; the hook returns **addFiles, remove, retry, start, clear** and **cancel**. **createSignedUrlUploader** builds the upload function for the usual storage flow: ask the API for a signed URL, PUT the file with XMLHttpRequest so progress works, then register it.",
  args: { maxSizeMb: 5, maxFiles: 6, concurrency: 2, autoStart: true },
  argTypes: {
    maxSizeMb: { control: { type: "range", min: 1, max: 20, step: 1 }, name: "maxSize (MB)", description: "Passed to the hook in bytes" },
    maxFiles: { control: { type: "range", min: 1, max: 10, step: 1 }, description: "Multi only" },
    concurrency: { control: { type: "range", min: 1, max: 4, step: 1 }, description: "Uploads in flight at once" },
    autoStart: { control: "boolean", description: "Multi only; otherwise Start uploads calls start()" },
  },
} satisfies Meta<HookArgs>;

export default meta;
type Example = ExampleOf<typeof meta>;

export const SingleFileUploader: Example = {
  name: "Single File Uploader",
  render: (args) => <SingleFileDemo {...args} />,
  description: "multiple: false keeps one file; a valid new file replaces it, a rejected one leaves it in place. Try the three sample buttons.",
  code: `const upload = useFileUpload({
  multiple: false,
  accept: [".pdf", "image/png", "image/jpeg"],
  maxSize: 5 * 1024 * 1024,
  upload: (file, { onProgress, signal }) => api.upload(file, { onProgress, signal }),
});

<Dropzone multiple={false} accept={upload.accept} onFiles={upload.addFiles} />
{upload.files.map((f) =>
  f.status === "rejected" ? (
    <HelperText key={f.id} tone="error">{f.error}</HelperText>
  ) : (
    <UploadItem key={f.id} name={f.file.name} size={formatBytes(f.file.size)} progress={f.progress} status={f.status} error={f.error} onRemove={() => upload.remove(f.id)} />
  ),
)}`,
};

export const MultiFileUploader: Example = {
  name: "Multi File Uploader",
  render: (args) => <MultiFileDemo {...args} />,
  description:
    "Add sample files: two upload at a time, the photo archive drops on its first attempt and can be retried, the installer and the oversized archive are rejected with sentences, and anything past maxFiles is turned away.",
  code: `const upload = useFileUpload({
  accept: [".pdf", ".png", ".jpg", ".zip", ".docx", ".xlsx"],
  maxSize: 5 * 1024 * 1024,
  maxFiles: 6,
  concurrency: 2,
  upload: uploadToApi,
});

upload.addFiles(fileList);          // validate and queue
upload.cancel(id);                  // abort one in flight
upload.retry(id);                   // queue a failed file again
upload.remove(id);                  // drop it from the list
upload.start();                     // with autoStart: false
upload.clear();                     // abort everything`,
};

export const FileUploaderWithApis: Example = {
  name: "File Uploader With APIs",
  render: (args) => <WithApisDemo {...args} />,
  parameters: { layout: "padded" },
  description:
    "createSignedUrlUploader against a simulated API: getSignedUrl and register resolve on timers and the storage PUT is a stand-in request, so it works offline. The log shows each call and the headers sent, Content-Type included.",
  code: `const upload = useFileUpload({
  accept: [".pdf", "image/*"],
  maxSize: 20 * 1024 * 1024,
  upload: createSignedUrlUploader({
    getSignedUrl: (file) =>
      fetch("/api/uploads/sign", { method: "POST", body: JSON.stringify({ name: file.name, type: file.type }) }).then((r) => r.json()),
    register: (file, resourceUrl) =>
      fetch("/api/files", { method: "POST", body: JSON.stringify({ name: file.name, url: resourceUrl }) }).then((r) => r.json()),
  }),
});`,
};
