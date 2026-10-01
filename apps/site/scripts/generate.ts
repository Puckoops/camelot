import { existsSync } from "node:fs";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import { buildCatalog } from "../../../packages/camelot-mcp/scripts/catalog/build.ts";
import { slugOf } from "../src/lib/slug.ts";

const site = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const library = resolve(site, "../../packages/camelot");
const contentDir = join(site, "src", "content");
const outDir = join(site, "generated");

export type PropKind = "string" | "true" | "action" | "expr";
export interface ExampleProp {
  key: string;
  kind: PropKind;
  value: string;
}
export interface ExampleSource {
  export: string;
  name: string;
  render?: string;
  props: ExampleProp[];
}
export interface DocsPageSource {
  slug: string;
  name: string;
  kind: "component" | "hook";
  title: string;
  file: string;
  module: string;
  component?: string;
  examples: ExampleSource[];
}

/** "AllVariants" → "All Variants": Storybook's name for a story exported without one. */
export function storyName(exportName: string) {
  return exportName
    .replace(/[_.-]/g, " ")
    .replace(/([^\n])([A-Z])([a-z])/g, "$1 $2$3")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/([a-z])([0-9])/gi, "$1 $2")
    .replace(/([0-9])([a-z])/gi, "$1 $2")
    .replace(/(\s|^)(\w)/g, (_, space: string, letter: string) => space + letter.toUpperCase())
    .replace(/ +/g, " ")
    .trim();
}


function unwrap(node: ts.Expression): ts.Expression {
  let n = node;
  while (ts.isSatisfiesExpression(n) || ts.isAsExpression(n) || ts.isParenthesizedExpression(n)) n = n.expression;
  return n;
}

function propName(name: ts.PropertyName) {
  return ts.isIdentifier(name) || ts.isStringLiteral(name) || ts.isNumericLiteral(name) ? name.text : undefined;
}

function properties(obj: ts.ObjectLiteralExpression) {
  const map = new Map<string, ts.Node>();
  for (const p of obj.properties) {
    if (ts.isPropertyAssignment(p) || ts.isMethodDeclaration(p)) {
      const name = propName(p.name);
      if (name) map.set(name, ts.isPropertyAssignment(p) ? p.initializer : p);
    } else if (ts.isShorthandPropertyAssignment(p)) {
      map.set(p.name.text, p.name);
    }
  }
  return map;
}

function argProps(node: ts.Node | undefined, sf: ts.SourceFile): ExampleProp[] {
  if (!node || !ts.isExpression(node)) return [];
  const obj = unwrap(node);
  if (!ts.isObjectLiteralExpression(obj)) return [];
  const out: ExampleProp[] = [];
  for (const [key, init] of properties(obj)) {
    const value = ts.isExpression(init) ? unwrap(init) : init;
    if (ts.isStringLiteral(value) || ts.isNoSubstitutionTemplateLiteral(value)) out.push({ key, kind: "string", value: value.text });
    else if (value.kind === ts.SyntaxKind.TrueKeyword) out.push({ key, kind: "true", value: "true" });
    else if (ts.isCallExpression(value) && ts.isIdentifier(value.expression) && value.expression.text === "action") out.push({ key, kind: "action", value: value.getText(sf) });
    else out.push({ key, kind: "expr", value: value.getText(sf) });
  }
  return out;
}

function mergeProps(base: ExampleProp[], over: ExampleProp[]) {
  const merged = new Map(base.map((p) => [p.key, p]));
  for (const p of over) merged.set(p.key, p);
  return [...merged.values()];
}

function renderText(node: ts.Node | undefined, sf: ts.SourceFile) {
  if (!node) return undefined;
  return ts.isMethodDeclaration(node) ? node.getText(sf) : ts.isExpression(node) ? unwrap(node).getText(sf) : undefined;
}

async function docsFiles(dir: string): Promise<string[]> {
  if (!existsSync(dir)) return [];
  const out: string[] = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await docsFiles(path)));
    else if (entry.name.endsWith(".docs.tsx")) out.push(path);
  }
  return out.sort();
}

function parseDocs(file: string, text: string, names: Set<string>): DocsPageSource {
  const sf = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const constants = new Map<string, ts.Expression>();
  for (const st of sf.statements) {
    if (!ts.isVariableStatement(st)) continue;
    for (const d of st.declarationList.declarations) if (ts.isIdentifier(d.name) && d.initializer) constants.set(d.name.text, d.initializer);
  }
  let meta: ts.ObjectLiteralExpression | undefined;
  for (const st of sf.statements) {
    if (!ts.isExportAssignment(st) || st.isExportEquals) continue;
    let e = unwrap(st.expression);
    if (ts.isIdentifier(e) && constants.has(e.text)) e = unwrap(constants.get(e.text)!);
    if (ts.isObjectLiteralExpression(e)) meta = e;
  }
  const where = relative(site, file);
  if (!meta) throw new Error(`${where}: the default export must be the docs meta object`);
  const metaProps = properties(meta);
  const titleNode = metaProps.get("title");
  if (!titleNode || !ts.isStringLiteral(titleNode)) throw new Error(`${where}: meta.title must be a string literal such as "ui/Button"`);
  const title = titleNode.text;
  const name = title.replace(/^(ui|Hooks)\//, "");
  if (!names.has(name)) throw new Error(`${where}: "${title}" names ${name}, which has no entry in src/catalog/components.ts`);
  const componentProp = metaProps.get("component");
  const componentNode = componentProp && ts.isExpression(componentProp) ? unwrap(componentProp) : componentProp;
  const metaArgs = argProps(metaProps.get("args"), sf);
  const metaRender = renderText(metaProps.get("render"), sf);

  const examples: ExampleSource[] = [];
  for (const st of sf.statements) {
    if (!ts.isVariableStatement(st) || !st.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword)) continue;
    for (const d of st.declarationList.declarations) {
      if (!ts.isIdentifier(d.name) || !d.initializer) continue;
      const obj = unwrap(d.initializer);
      if (!ts.isObjectLiteralExpression(obj)) continue;
      const props = properties(obj);
      const nameNode = props.get("name");
      examples.push({
        export: d.name.text,
        name: nameNode && ts.isStringLiteral(nameNode) ? nameNode.text : storyName(d.name.text),
        render: renderText(props.get("render"), sf) ?? metaRender,
        props: mergeProps(metaArgs, argProps(props.get("args"), sf)),
      });
    }
  }
  if (examples.length === 0) throw new Error(`${where}: export at least one example`);
  return {
    slug: slugOf(name),
    name,
    kind: name.startsWith("use") ? "hook" : "component",
    title,
    file: where,
    module: `@/content/${relative(contentDir, file).replace(/\.tsx$/, "")}`,
    component: componentNode && ts.isIdentifier(componentNode) ? componentNode.text : undefined,
    examples,
  };
}

async function writeIfChanged(path: string, text: string) {
  const current = existsSync(path) ? await readFile(path, "utf8") : undefined;
  if (current !== text) await writeFile(path, text);
}

export async function generate() {
  const started = performance.now();
  await mkdir(outDir, { recursive: true });
  const catalog = await buildCatalog({ root: library, docsRoot: contentDir });
  const names = new Set(catalog.components.map((c: { name: string }) => c.name));

  const pages: DocsPageSource[] = [];
  for (const file of await docsFiles(contentDir)) pages.push(parseDocs(file, await readFile(file, "utf8"), names));
  const seen = new Map<string, string>();
  for (const p of pages) {
    const other = seen.get(p.name);
    if (other) throw new Error(`${p.file} and ${other} both document ${p.name}`);
    seen.set(p.name, p.file);
  }

  const styles = Object.fromEntries(
    await Promise.all(["tokens", "type", "motion", "base"].map(async (n) => [n, await readFile(join(library, "src/styles", `${n}.css`), "utf8")] as const)),
  );

  const registry = [
    '"use client";',
    "// Generated by scripts/generate.ts from src/content. Do not edit.",
    'import dynamic from "next/dynamic";',
    'import { bindDocs, bindPreview, bindStory } from "@/docs/bind";',
    "",
    "export const registry = {",
    ...pages.map((p) => `  ${JSON.stringify(p.slug)}: dynamic(() => import(${JSON.stringify(p.module)}).then(bindDocs)),`),
    "};",
    "",
    "export const stories = {",
    ...pages.map((p) => `  ${JSON.stringify(p.slug)}: dynamic(() => import(${JSON.stringify(p.module)}).then(bindStory)),`),
    "};",
    "",
    "export const previews = {",
    ...pages.map((p) => `  ${JSON.stringify(p.slug)}: dynamic(() => import(${JSON.stringify(p.module)}).then(bindPreview)),`),
    "};",
    "",
  ].join("\n");

  await Promise.all([
    writeIfChanged(join(outDir, "catalog.json"), `${JSON.stringify(catalog, null, 2)}\n`),
    writeIfChanged(join(outDir, "pages.json"), `${JSON.stringify(pages, null, 2)}\n`),
    writeIfChanged(join(outDir, "styles.json"), `${JSON.stringify(styles)}\n`),
    writeIfChanged(join(outDir, "registry.tsx"), registry),
  ]);
  for (const warning of catalog.warnings as string[]) console.warn(`warning: ${warning}`);
  const missing = catalog.components.filter((c: { name: string }) => !seen.has(c.name)).map((c: { name: string }) => c.name);
  console.log(
    `generated ${pages.length} docs pages and the catalogue in ${Math.round(performance.now() - started)}ms` +
      (missing.length ? ` (no docs yet: ${missing.join(", ")})` : ""),
  );
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await generate().catch((e: unknown) => {
    console.error(e instanceof Error ? e.message : e);
    process.exitCode = 1;
  });
}
