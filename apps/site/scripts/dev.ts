import { spawn } from "node:child_process";
import { watch } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const site = fileURLToPath(new URL("..", import.meta.url));

/** A fresh process each time, so edits to the generator itself apply without restarting the dev server. */
function generate() {
  return new Promise<void>((resolve) => spawn("tsx", ["scripts/generate.ts"], { cwd: site, stdio: "inherit" }).on("exit", () => resolve()));
}

let running = false;
let queued = false;
async function regenerate() {
  if (running) {
    queued = true;
    return;
  }
  running = true;
  do {
    queued = false;
    await generate();
  } while (queued);
  running = false;
}

let timer: ReturnType<typeof setTimeout> | undefined;
const schedule = () => {
  clearTimeout(timer);
  timer = setTimeout(regenerate, 150);
};

await generate();
const watchers = [join(site, "src/content"), join(site, "scripts"), join(site, "../../packages/camelot/src")].map((dir) =>
  watch(dir, { recursive: true }, schedule),
);
const next = spawn("next", ["dev", "--port", process.env.PORT ?? "3030"], { cwd: site, stdio: "inherit" });
for (const signal of ["SIGINT", "SIGTERM"] as const) process.on(signal, () => next.kill(signal));
next.on("exit", (code) => {
  for (const w of watchers) w.close();
  process.exit(code ?? 0);
});
