import { readdirSync, readFileSync } from "node:fs";
import { join, sep } from "node:path";
import ts from "typescript";
import type { DocsKind, DocsPageRef } from "../../src/catalog-types.js";

export function slugOf(name: string) {
  return name
    .replace(/\//g, "-")
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/([A-Z])([A-Z][a-z])/g, "$1-$2")
    .toLowerCase();
}

export const docsKindOf = (name: string): DocsKind => (name.startsWith("use") ? "hook" : "component");

export const docsPathOf = (name: string) => `/docs/${docsKindOf(name) === "hook" ? "hooks" : "components"}/${slugOf(name)}`;

export const docsNameOf = (title: string) => title.replace(/^(ui|Hooks)\//, "");

function unwrap(node: ts.Expression): ts.Expression {
  let n = node;
  while (ts.isSatisfiesExpression(n) || ts.isAsExpression(n) || ts.isParenthesizedExpression(n)) n = n.expression;
  return n;
}

function propName(name: ts.PropertyName) {
  return ts.isIdentifier(name) || ts.isStringLiteral(name) || ts.isNumericLiteral(name) ? name.text : undefined;
}

export function docsTitle(file: string, text: string): string | undefined {
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
    const constant = ts.isIdentifier(e) ? constants.get(e.text) : undefined;
    if (constant) e = unwrap(constant);
    if (ts.isObjectLiteralExpression(e)) meta = e;
  }
  let title: ts.Expression | undefined;
  for (const p of meta?.properties ?? []) if (ts.isPropertyAssignment(p) && propName(p.name) === "title") title = p.initializer;
  return title && ts.isStringLiteral(title) ? title.text : undefined;
}

export function scanDocs(docsRoot: string, warnings: string[]): DocsPageRef[] {
  let files: string[];
  try {
    files = readdirSync(docsRoot, { recursive: true, encoding: "utf8" });
  } catch {
    warnings.push(`no docs folder at ${docsRoot}, so no entry has a docs page`);
    return [];
  }
  const pages: DocsPageRef[] = [];
  for (const file of files.filter((f) => f.endsWith(".docs.tsx") && !f.split(sep).includes("node_modules")).sort()) {
    const rel = file.split(sep).join("/");
    const title = docsTitle(rel, readFileSync(join(docsRoot, file), "utf8"));
    if (!title) {
      warnings.push(`docs file ${rel} has no meta title`);
      continue;
    }
    const name = docsNameOf(title);
    pages.push({ title, name, kind: docsKindOf(name), path: docsPathOf(name), file: rel });
  }
  return pages;
}
