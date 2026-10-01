import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import {
  CATALOG_SCHEMA_VERSION,
  type Alternative,
  type ApiExport,
  type CatalogFile,
  type ComponentEntry,
  type DetectPattern,
  type ElementMapping,
  type HardRule,
} from "../../src/catalog-types.js";
import { extractApi } from "./api.js";
import { extractTokens, extractTypography, extractUtilities, scanTokenUsage } from "./css.js";
import { docsPathOf, scanDocs } from "./docs.js";
import { declaredCategories, extractPrinciples } from "./sources.js";

export const DEFAULT_DOCS_URL = "http://localhost:3030";

export interface BuildOptions {
  root: string;
  docsRoot: string;
  docsUrl?: string;
  now?: Date;
}

const str = (value: unknown) => (typeof value === "string" ? value : undefined);
const strings = (value: unknown) => (Array.isArray(value) ? value.filter((v): v is string => typeof v === "string") : []);
const record = (value: unknown) => (value && typeof value === "object" ? (value as Record<string, unknown>) : {});

async function importSource(root: string, path: string): Promise<Record<string, unknown>> {
  try {
    return (await import(pathToFileURL(join(root, path)).href)) as Record<string, unknown>;
  } catch (error) {
    throw new Error(`Cannot import ${path}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

function typeNamesIn(text: string, types: Set<string>) {
  return [...text.matchAll(/\b[A-Z][A-Za-z0-9]*\b/g)].map((m) => m[0]).filter((name) => types.has(name));
}

function relatedTypes(exports: string[], api: Record<string, ApiExport>): string[] {
  const typeNames = new Set(Object.values(api).filter((a) => a.kind === "type").map((a) => a.name));
  const propsTypes = new Set(Object.values(api).flatMap((a) => a.props?.typeName?.replace(/<.*$/, "") ?? []));
  const found = new Set<string>();
  const visit = (name: string, depth: number) => {
    if (found.has(name) || propsTypes.has(name) || exports.includes(name)) return;
    found.add(name);
    if (depth > 1) return;
    const type = api[name];
    const texts = [type?.definition ?? "", ...(type?.fields ?? []).map((f) => f.type)];
    for (const text of texts) for (const ref of typeNamesIn(text, typeNames)) visit(ref, depth + 1);
  };
  for (const name of exports) {
    const item = api[name];
    const texts = [
      ...(item?.props?.props ?? []).map((p) => p.type),
      ...(item?.props?.extends ?? []),
      item?.signature ?? "",
      item?.returns ?? "",
      ...(item?.members ?? []).map((m) => m.signature),
    ];
    for (const text of texts) for (const ref of typeNamesIn(text, typeNames)) visit(ref, 1);
  }
  return [...found];
}

function normaliseEntries(raw: unknown, api: Record<string, ApiExport>, warnings: string[]) {
  const entries: ComponentEntry[] = [];
  if (!Array.isArray(raw)) throw new Error("src/catalog/components.ts must export `catalog` as an array");
  raw.forEach((item, i) => {
    const e = record(item);
    const name = str(e.name);
    if (!name) {
      warnings.push(`catalog[${i}] has no name and was skipped`);
      return;
    }
    const exports = strings(e.exports);
    const useInstead: Alternative[] = (Array.isArray(e.useInstead) ? e.useInstead : []).flatMap((alt) => {
      const a = record(alt);
      const altName = str(a.name);
      return altName ? [{ name: altName, when: str(a.when) ?? "" }] : [];
    });
    const missingExports = exports.filter((x) => !api[x]);
    for (const x of missingExports) warnings.push(`${name} lists export ${x}, which src/index.ts does not export`);
    entries.push({
      name,
      category: str(e.category) ?? "Uncategorised",
      summary: str(e.summary) ?? "",
      exports,
      import: str(e.import) ?? `import { ${exports.join(", ")} } from "@puckoops/camelot";`,
      whenToUse: str(e.whenToUse) ?? "",
      useInstead,
      keywords: strings(e.keywords),
      docsPath: docsPathOf(name),
      hasDocs: false,
      types: relatedTypes(exports, api),
      missingExports,
    });
  });
  return entries;
}

function normaliseRules(raw: unknown, warnings: string[]): HardRule[] {
  if (!Array.isArray(raw)) throw new Error("src/catalog/rules.ts must export `hardRules` as an array");
  return raw.flatMap((item, i) => {
    const r = record(item);
    const id = str(r.id);
    if (!id) {
      warnings.push(`hardRules[${i}] has no id and was skipped`);
      return [];
    }
    const detect: DetectPattern[] = (Array.isArray(r.detect) ? r.detect : []).flatMap((d) => {
      const p = record(d);
      const pattern = str(p.pattern);
      if (!pattern) return [];
      const flags = str(p.flags);
      try {
        new RegExp(pattern, flags);
      } catch (error) {
        warnings.push(`rule ${id}: pattern ${pattern} does not compile (${error instanceof Error ? error.message : error})`);
      }
      return [{ pattern, ...(flags ? { flags } : {}), message: str(p.message) ?? `Breaks ${id}` }];
    });
    return [{ id, rule: str(r.rule) ?? "", why: str(r.why) ?? "", detect }];
  });
}

function normaliseMapping(raw: unknown): ElementMapping[] {
  return (Array.isArray(raw) ? raw : []).flatMap((item) => {
    const m = record(item);
    const element = str(m.element);
    const use = str(m.use);
    if (!element || !use) return [];
    const note = str(m.note);
    return [{ element, use, ...(note ? { note } : {}) }];
  });
}

function knownName(name: string, entries: ComponentEntry[], api: Record<string, ApiExport>) {
  const key = name.toLowerCase();
  return (
    api[name] !== undefined ||
    entries.some((e) => e.name.toLowerCase() === key || e.name.toLowerCase().endsWith(`/${key}`))
  );
}

export async function buildCatalog({ root, docsRoot, docsUrl, now = new Date() }: BuildOptions): Promise<CatalogFile> {
  const warnings: string[] = [];
  const read = (path: string) => readFile(join(root, path), "utf8");
  const [pkgText, readme, componentsSource, tokensCss, typeCss] = await Promise.all([
    read("package.json"),
    read("README.md").catch(() => ""),
    read("src/catalog/components.ts"),
    read("src/styles/tokens.css"),
    read("src/styles/type.css"),
  ]);
  const pkg = record(JSON.parse(pkgText));
  const [componentsModule, rulesModule] = await Promise.all([
    importSource(root, "src/catalog/components.ts"),
    importSource(root, "src/catalog/rules.ts"),
  ]);

  const { api, warnings: apiWarnings } = extractApi(root);
  warnings.push(...apiWarnings);

  const components = normaliseEntries(componentsModule.catalog, api, warnings);
  const names = new Set(components.map((e) => e.name));
  const pages = scanDocs(docsRoot, warnings).filter((page) => {
    if (names.has(page.name)) return true;
    warnings.push(`docs file ${page.file} documents ${page.name}, which has no catalogue entry`);
    return false;
  });
  const documented = new Set(pages.map((p) => p.name));
  for (const entry of components) entry.hasDocs = documented.has(entry.name);

  const declared = declaredCategories(componentsSource);
  const used = [...new Set(components.map((e) => e.category))];
  const categories = [...declared.filter((c) => used.includes(c)), ...used.filter((c) => !declared.includes(c))];

  for (const entry of components) {
    for (const alt of entry.useInstead) {
      if (!knownName(alt.name, components, api)) warnings.push(`${entry.name} suggests ${alt.name}, which is not in the catalogue or exported`);
    }
  }
  const elementMapping = normaliseMapping(rulesModule.elementMapping);
  for (const row of elementMapping) {
    for (const name of row.use.match(/\b[A-Za-z][A-Za-z0-9]*\b/g) ?? []) {
      if (/^[A-Z]/.test(name) || /^use[A-Z]/.test(name)) {
        if (!knownName(name, components, api)) warnings.push(`element mapping for ${row.element} names ${name}, which @puckoops/camelot does not export`);
      }
    }
  }

  const usage = scanTokenUsage(root);
  const baseTokens = extractTokens(tokensCss, usage);
  const utilitySheets = await Promise.all(
    ["base.css", "motion.css"].map(async (file) => ({ file: `src/styles/${file}`, css: await read(`src/styles/${file}`).catch(() => "") })),
  );

  return {
    schemaVersion: CATALOG_SCHEMA_VERSION,
    generatedAt: now.toISOString(),
    package: {
      name: str(pkg.name) ?? "@puckoops/camelot",
      version: str(pkg.version) ?? "0.0.0",
      ...(str(pkg.description) ? { description: str(pkg.description) } : {}),
      peerDependencies: Object.fromEntries(Object.entries(record(pkg.peerDependencies)).filter((kv): kv is [string, string] => typeof kv[1] === "string")),
    },
    docs: {
      baseUrl: (docsUrl || DEFAULT_DOCS_URL).replace(/\/+$/, ""),
      pages,
    },
    principles: extractPrinciples(readme),
    categories,
    components,
    api,
    tokens: { ...baseTokens, utilities: extractUtilities(utilitySheets) },
    typography: extractTypography(typeCss, baseTokens),
    rules: {
      hardRules: normaliseRules(rulesModule.hardRules, warnings),
      elementMapping,
      iconsGuide: str(rulesModule.iconsGuide) ?? "",
      appSetup: str(rulesModule.appSetup) ?? "",
    },
    warnings,
  };
}
