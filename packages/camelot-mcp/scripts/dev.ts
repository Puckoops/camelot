import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { buildCatalog } from "./catalog/build.js";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(process.env.CAMELOT_ROOT ?? resolve(here, "../../camelot"));
const docsRoot = resolve(process.env.DOCS_ROOT ?? resolve(here, "../../../apps/site/src/content"));
const out = resolve(process.env.CATALOG_PATH ?? resolve(here, "../data/catalog.json"));

const catalog = await buildCatalog({ root, docsRoot, docsUrl: process.env.DOCS_URL });
await mkdir(dirname(out), { recursive: true });
await writeFile(out, `${JSON.stringify(catalog, null, 2)}\n`);
for (const warning of catalog.warnings) console.warn(`warning: ${warning}`);
process.env.CATALOG_PATH = out;

await import("../src/server.js");
