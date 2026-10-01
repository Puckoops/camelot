import { mkdir, writeFile } from "node:fs/promises";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { buildCatalog } from "./catalog/build.js";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(process.env.CAMELOT_ROOT ?? resolve(here, "../../camelot"));
const docsRoot = resolve(process.env.DOCS_ROOT ?? resolve(here, "../../../apps/site/src/content"));
const out = resolve(process.env.CATALOG_PATH ?? resolve(here, "../data/catalog.json"));

const started = performance.now();
const catalog = await buildCatalog({ root, docsRoot, docsUrl: process.env.DOCS_URL });
await mkdir(dirname(out), { recursive: true });
await writeFile(out, `${JSON.stringify(catalog, null, 2)}\n`);

const exports = Object.values(catalog.api);
const catalogued = new Set(catalog.components.flatMap((e) => e.exports));
const uncatalogued = exports.filter((a) => a.kind !== "type" && !catalogued.has(a.name)).map((a) => a.name);
const patterns = catalog.rules.hardRules.reduce((n, r) => n + r.detect.length, 0);
const lines = [
  `Wrote ${relative(process.cwd(), out) || out} in ${Math.round(performance.now() - started)}ms from ${catalog.package.name}@${catalog.package.version}`,
  `  components   ${catalog.components.length} in ${catalog.categories.length} categories (${catalog.components.filter((e) => e.hasDocs).length} with docs pages)`,
  `  exports      ${exports.length} (${exports.filter((a) => a.kind === "component").length} components, ${exports.filter((a) => a.kind === "type").length} types)`,
  `  tokens       ${catalog.tokens.colors.length} colours, ${catalog.tokens.effects.length} effects, ${catalog.tokens.spacing.length} spacing, ${catalog.tokens.radius.length} radius, ${catalog.tokens.layout.length} layout, ${catalog.tokens.fonts.length} fonts, ${catalog.tokens.motion.length} motion`,
  `  typography   ${catalog.typography.classes.length} type classes, ${catalog.typography.inkClasses.length} ink classes`,
  `  rules        ${catalog.rules.hardRules.length} hard rules (${patterns} detect patterns), ${catalog.rules.elementMapping.length} element mappings`,
  `  docs         ${catalog.docs.baseUrl} (${catalog.docs.pages.length} pages in ${relative(process.cwd(), docsRoot) || docsRoot})`,
];
if (uncatalogued.length) lines.push(`  uncatalogued ${uncatalogued.join(", ")}`);
console.log(lines.join("\n"));
for (const warning of catalog.warnings) console.warn(`warning: ${warning}`);
