import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { createSignedUrlUploader, useFileUpload, type UploadContext, type UseFileUploadOptions } from "../index";

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

function mockUploader() {
  const calls: { file: File; ctx: UploadContext; resolve: (v: string) => void; reject: (e: unknown) => void }[] = [];
  const upload = vi.fn((file: File, ctx: UploadContext) => {
    const d = deferred<string>();
    calls.push({ file, ctx, resolve: d.resolve, reject: d.reject });
    return d.promise;
  });
  return { upload, calls };
}

const pdf = (name: string, bytes = 1024) => new File([new Uint8Array(bytes)], name, { type: "application/pdf" });
const MB = 1024 * 1024;

function setup(options: Partial<UseFileUploadOptions<string>> = {}) {
  const mock = mockUploader();
  const hook = renderHook(() => useFileUpload<string>({ upload: mock.upload, ...options }));
  return { ...mock, hook, state: () => hook.result.current };
}

describe("useFileUpload validation", () => {
  it("rejects a file of the wrong type with a sentence naming what is accepted", () => {
    const { state, upload } = setup({ accept: ["pdf", "image/*", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"] });
    act(() => state().addFiles([new File(["MZ"], "setup.exe", { type: "application/x-msdownload" }), pdf("brief.pdf")]));
    const [exe, brief] = state().files;
    expect(exe?.status).toBe("rejected");
    expect(exe?.error).toBe("“setup.exe” is not a file type this accepts. Use PDF, images or DOCX.");
    expect(brief?.status).toBe("uploading");
    expect(upload).toHaveBeenCalledTimes(1);
  });

  it("matches extensions without the dot and exposes an accept attribute", () => {
    const { state } = setup({ accept: ["pdf", ".png", "image/jpeg"] });
    expect(state().accept).toBe(".pdf,.png,image/jpeg");
    act(() => state().addFiles([new File(["x"], "Moodboard.PNG", { type: "" }), new File(["x"], "photo.jpg", { type: "image/jpeg" })]));
    expect(state().files.map((f) => f.status)).toEqual(["uploading", "uploading"]);
  });

  it("rejects a file over maxSize and says how big it is", () => {
    const { state } = setup({ maxSize: 1 * MB });
    act(() => state().addFiles([pdf("site_photos.pdf", 2 * MB)]));
    expect(state().files[0]?.status).toBe("rejected");
    expect(state().files[0]?.error).toBe("“site_photos.pdf” is 2 MB; files can be up to 1 MB.");
  });

  it("rejects files beyond maxFiles, and rejected files do not use up the room", () => {
    const { state } = setup({ maxFiles: 2, accept: [".pdf"] });
    act(() => state().addFiles([pdf("a.pdf"), new File(["x"], "b.txt", { type: "text/plain" }), pdf("c.pdf"), pdf("d.pdf")]));
    expect(state().files.map((f) => [f.file.name, f.status])).toEqual([
      ["a.pdf", "uploading"],
      ["b.txt", "rejected"],
      ["c.pdf", "uploading"],
      ["d.pdf", "rejected"],
    ]);
    expect(state().files[3]?.error).toBe("“d.pdf” was not added: you can add up to 2 files. Remove one to make room.");

    act(() => state().remove(state().files[0]!.id));
    act(() => state().addFiles([pdf("e.pdf")]));
    expect(state().files.find((f) => f.file.name === "e.pdf")?.status).toBe("uploading");
  });

  it("keeps one file when multiple is false and a bad file does not replace a good one", () => {
    const { state, calls } = setup({ multiple: false, accept: [".pdf"] });
    act(() => state().addFiles([pdf("contract-v1.pdf")]));
    act(() => state().addFiles([new File(["x"], "notes.txt", { type: "text/plain" })]));
    expect(state().files.map((f) => [f.file.name, f.status])).toEqual([
      ["contract-v1.pdf", "uploading"],
      ["notes.txt", "rejected"],
    ]);

    act(() => state().addFiles([pdf("contract-v2.pdf")]));
    expect(state().files.map((f) => f.file.name)).toEqual(["contract-v2.pdf"]);
    expect(calls[0]?.ctx.signal.aborted).toBe(true);
  });
});

describe("useFileUpload queue", () => {
  it("never runs more than `concurrency` uploads and starts the next as one finishes", async () => {
    const { state, calls, upload } = setup({ concurrency: 2 });
    act(() => state().addFiles(["1", "2", "3", "4", "5"].map((n) => pdf(`${n}.pdf`))));
    expect(state().files.map((f) => f.status)).toEqual(["uploading", "uploading", "queued", "queued", "queued"]);
    expect(upload).toHaveBeenCalledTimes(2);

    await act(async () => calls[0]!.resolve("https://files.example.com/1.pdf"));
    expect(state().files.map((f) => f.status)).toEqual(["done", "uploading", "uploading", "queued", "queued"]);
    expect(state().files[0]).toMatchObject({ progress: 100, result: "https://files.example.com/1.pdf" });

    await act(async () => {
      calls[1]!.resolve("2");
      calls[2]!.resolve("3");
    });
    expect(state().files.map((f) => f.status)).toEqual(["done", "done", "done", "uploading", "uploading"]);
    expect(state().isUploading).toBe(true);
    expect(upload).toHaveBeenCalledTimes(5);
  });

  it("reports progress from the upload function, clamped to 0–100", () => {
    const { state, calls } = setup();
    act(() => state().addFiles([pdf("brief.pdf")]));
    act(() => calls[0]!.ctx.onProgress(42.5));
    expect(state().files[0]?.progress).toBe(42.5);
    act(() => calls[0]!.ctx.onProgress(140));
    expect(state().files[0]?.progress).toBe(100);
  });

  it("waits for start() when autoStart is false", () => {
    const { state, upload } = setup({ autoStart: false, concurrency: 1 });
    act(() => state().addFiles([pdf("a.pdf"), pdf("b.pdf")]));
    expect(state().files.map((f) => f.status)).toEqual(["queued", "queued"]);
    expect(upload).not.toHaveBeenCalled();
    act(() => state().start());
    expect(state().files.map((f) => f.status)).toEqual(["uploading", "queued"]);
  });

  it("marks a failed upload with its message and uploads it again on retry", async () => {
    const { state, calls, upload } = setup();
    act(() => state().addFiles([pdf("invoice-2041.pdf")]));
    await act(async () => calls[0]!.reject(new Error("The connection dropped before the file finished uploading.")));
    expect(state().files[0]).toMatchObject({ status: "failed", error: "The connection dropped before the file finished uploading." });

    act(() => state().retry(state().files[0]!.id));
    expect(state().files[0]).toMatchObject({ status: "uploading", progress: 0, error: undefined });
    await act(async () => calls[1]!.resolve("ok"));
    expect(state().files[0]?.status).toBe("done");
    expect(upload).toHaveBeenCalledTimes(2);
  });

  it("falls back to a generic sentence when the failure has no message", async () => {
    const { state, calls } = setup();
    act(() => state().addFiles([pdf("a.pdf")]));
    await act(async () => calls[0]!.reject(undefined));
    expect(state().files[0]?.error).toBe("The upload failed. Try again.");
  });

  it("cancels an upload through its signal and lets the queue move on", async () => {
    const { state, calls } = setup({ concurrency: 1 });
    act(() => state().addFiles([pdf("a.pdf"), pdf("b.pdf")]));
    const first = state().files[0]!;
    act(() => state().cancel(first.id));
    expect(calls[0]!.ctx.signal.aborted).toBe(true);
    expect(state().files.map((f) => f.status)).toEqual(["failed", "uploading"]);
    expect(state().files[0]?.error).toBe("Upload cancelled.");

    await act(async () => calls[0]!.reject(new DOMException("Aborted", "AbortError")));
    expect(state().files[0]?.error).toBe("Upload cancelled.");
  });

  it("ignores a late result from an upload that was removed", async () => {
    const { state, calls } = setup();
    act(() => state().addFiles([pdf("a.pdf")]));
    act(() => state().remove(state().files[0]!.id));
    await act(async () => calls[0]!.resolve("late"));
    expect(state().files).toEqual([]);
    expect(calls[0]!.ctx.signal.aborted).toBe(true);
  });

  it("aborts everything on clear and on unmount", () => {
    const { state, calls, hook } = setup();
    act(() => state().addFiles([pdf("a.pdf"), pdf("b.pdf")]));
    act(() => state().clear());
    expect(state().files).toEqual([]);
    expect(calls.every((c) => c.ctx.signal.aborted)).toBe(true);

    act(() => state().addFiles([pdf("c.pdf")]));
    hook.unmount();
    expect(calls[2]!.ctx.signal.aborted).toBe(true);
  });
});

class FakeRequest {
  static last: FakeRequest | null = null;
  method = "";
  url = "";
  headers: Record<string, string> = {};
  body: unknown = null;
  status = 0;
  aborted = false;
  upload: { onprogress: ((e: { lengthComputable: boolean; loaded: number; total: number }) => void) | null } = { onprogress: null };
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  onabort: (() => void) | null = null;
  constructor() {
    FakeRequest.last = this;
  }
  open(method: string, url: string) {
    this.method = method;
    this.url = url;
  }
  setRequestHeader(key: string, value: string) {
    this.headers[key] = value;
  }
  send(body: unknown) {
    this.body = body;
  }
  abort() {
    this.aborted = true;
    this.onabort?.();
  }
  progress(loaded: number, total: number) {
    this.upload.onprogress?.({ lengthComputable: true, loaded, total });
  }
  respond(status: number) {
    this.status = status;
    this.onload?.();
  }
}

const createRequest = () => new FakeRequest() as unknown as XMLHttpRequest;
const flush = () => new Promise((r) => setTimeout(r, 0));

describe("createSignedUrlUploader", () => {
  it("PUTs the file with its Content-Type, reports progress, then registers it", async () => {
    const getSignedUrl = vi.fn(async () => ({
      signedUrl: "https://storage.example.com/u/1?sig=abc",
      resourceUrl: "https://storage.example.com/u/1",
      headers: { "x-goog-meta-client": "nordvik" },
    }));
    const register = vi.fn(async (_file: File, url: string) => ({ id: "file_1", url }));
    const upload = createSignedUrlUploader({ getSignedUrl, register, createRequest });
    const onProgress = vi.fn();
    const file = pdf("brief.pdf");

    const pending = upload(file, { onProgress, signal: new AbortController().signal });
    await flush();
    const req = FakeRequest.last!;
    expect(getSignedUrl).toHaveBeenCalledWith(file);
    expect(req.method).toBe("PUT");
    expect(req.url).toBe("https://storage.example.com/u/1?sig=abc");
    expect(req.headers).toEqual({ "Content-Type": "application/pdf", "x-goog-meta-client": "nordvik" });
    expect(req.body).toBe(file);

    req.progress(512, 1024);
    req.progress(1024, 1024);
    expect(onProgress.mock.calls.map((c) => c[0])).toEqual([50, 99]);
    req.respond(200);

    await expect(pending).resolves.toEqual({ id: "file_1", url: "https://storage.example.com/u/1" });
    expect(register).toHaveBeenCalledWith(file, "https://storage.example.com/u/1");
    expect(onProgress).toHaveBeenLastCalledWith(100);
  });

  it("sends application/octet-stream for a file with no type, lets the signer pin Content-Type, and resolves the resource URL without register", async () => {
    const upload = createSignedUrlUploader({
      getSignedUrl: async () => ({ signedUrl: "https://s/1", resourceUrl: "https://s/r/1" }),
      createRequest,
    });
    const pending = upload(new File(["x"], "export.bin"), { onProgress: () => {}, signal: new AbortController().signal });
    await flush();
    expect(FakeRequest.last!.headers).toEqual({ "Content-Type": "application/octet-stream" });
    FakeRequest.last!.respond(201);
    await expect(pending).resolves.toBe("https://s/r/1");

    const pinned = createSignedUrlUploader({
      getSignedUrl: async () => ({ signedUrl: "https://s/2", resourceUrl: "https://s/r/2", headers: { "content-type": "application/pdf" } }),
      createRequest,
    });
    const second = pinned(new File(["x"], "scan"), { onProgress: () => {}, signal: new AbortController().signal });
    await flush();
    expect(FakeRequest.last!.headers).toEqual({ "content-type": "application/pdf" });
    FakeRequest.last!.respond(200);
    await second;
  });

  it("turns a refused PUT into a sentence and never registers", async () => {
    const register = vi.fn(async () => "never");
    const upload = createSignedUrlUploader({ getSignedUrl: async () => ({ signedUrl: "https://s/1", resourceUrl: "https://s/r/1" }), register, createRequest });
    const pending = upload(pdf("a.pdf"), { onProgress: () => {}, signal: new AbortController().signal });
    await flush();
    FakeRequest.last!.respond(403);
    await expect(pending).rejects.toThrow("The storage service refused the file (HTTP 403).");
    expect(register).not.toHaveBeenCalled();
  });

  it("aborts the request when the signal fires", async () => {
    const controller = new AbortController();
    const upload = createSignedUrlUploader({ getSignedUrl: async () => ({ signedUrl: "https://s/1", resourceUrl: "https://s/r/1" }), createRequest });
    const pending = upload(pdf("a.pdf"), { onProgress: () => {}, signal: controller.signal });
    await flush();
    controller.abort();
    expect(FakeRequest.last!.aborted).toBe(true);
    await expect(pending).rejects.toMatchObject({ name: "AbortError" });
  });

  it("works as the upload function of useFileUpload", async () => {
    const hook = renderHook(() =>
      useFileUpload({
        upload: createSignedUrlUploader({
          getSignedUrl: async (file) => ({ signedUrl: `https://s/${file.name}`, resourceUrl: `https://s/r/${file.name}` }),
          register: async (file) => ({ name: file.name }),
          createRequest,
        }),
      }),
    );
    await act(async () => {
      hook.result.current.addFiles([pdf("brief.pdf")]);
      await flush();
    });
    await act(async () => FakeRequest.last!.progress(300, 1000));
    expect(hook.result.current.files[0]?.progress).toBe(30);
    await act(async () => {
      FakeRequest.last!.respond(200);
      await flush();
    });
    expect(hook.result.current.files[0]).toMatchObject({ status: "done", progress: 100, result: { name: "brief.pdf" } });
  });
});
