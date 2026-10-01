import ts from "typescript";
import type { Principles } from "../../src/catalog-types.js";

const stripEmphasis = (text: string) => text.replace(/\*\*(.+?)\*\*/g, "$1").trim();

export function extractPrinciples(readme: string): Principles {
  const lines = readme.split(/\r?\n/);
  const principles: Principles = { points: [], readmeRules: [] };
  const quoteAt = lines.findIndex((line) => line.startsWith("> "));
  if (quoteAt >= 0) {
    principles.tagline = stripEmphasis(lines[quoteAt]!.slice(2));
    let i = quoteAt + 1;
    while (i < lines.length && !lines[i]!.startsWith("- ") && !lines[i]!.startsWith("#")) i++;
    for (; i < lines.length && lines[i]!.startsWith("- "); i++) principles.points.push(stripEmphasis(lines[i]!.slice(2)));
  }
  const rulesAt = lines.findIndex((line) => /^##\s+.*\brules\b/i.test(line));
  if (rulesAt >= 0) {
    for (let i = rulesAt + 1; i < lines.length && !lines[i]!.startsWith("#"); i++) {
      const line = lines[i]!;
      if (line.startsWith("- ")) principles.readmeRules.push(stripEmphasis(line.slice(2)));
      else if (/^\s{2,}\S/.test(line) && principles.readmeRules.length) {
        principles.readmeRules[principles.readmeRules.length - 1] += ` ${line.trim()}`;
      }
    }
  }
  return principles;
}

export function declaredCategories(componentsSource: string): string[] {
  const file = ts.createSourceFile("components.ts", componentsSource, ts.ScriptTarget.ES2022, true, ts.ScriptKind.TS);
  for (const statement of file.statements) {
    if (!ts.isTypeAliasDeclaration(statement) || statement.name.text !== "Category") continue;
    const type = statement.type;
    const parts = ts.isUnionTypeNode(type) ? type.types : [type];
    return parts.flatMap((part) =>
      ts.isLiteralTypeNode(part) && ts.isStringLiteral(part.literal) ? [part.literal.text] : [],
    );
  }
  return [];
}
