import { readdirSync } from "node:fs";
import { join, relative, sep } from "node:path";
import ts from "typescript";
import type { ApiExport, ApiMember, ExportKind, PropInfo, PropsInfo } from "../../src/catalog-types.js";

export interface ApiResult {
  api: Record<string, ApiExport>;
  warnings: string[];
}

type TypeDeclaration = ts.InterfaceDeclaration | ts.TypeAliasDeclaration;
type FunctionLike = ts.FunctionDeclaration | ts.FunctionExpression | ts.ArrowFunction;

const compact = (text: string) =>
  text
    .replace(/\s+/g, " ")
    .replace(/\( /g, "(")
    .replace(/ \)/g, ")")
    .replace(/,\)/g, ")")
    .replace(/^\| /, "")
    .trim();

function listDeclarationFiles(dir: string): string[] {
  return readdirSync(dir, { recursive: true, encoding: "utf8" })
    .filter((file) => file.endsWith(".d.ts"))
    .map((file) => join(dir, file));
}

export function extractApi(root: string): ApiResult {
  const srcDir = join(root, "src");
  const indexPath = join(srcDir, "index.ts");
  const program = ts.createProgram({
    rootNames: [indexPath, ...listDeclarationFiles(srcDir)],
    options: {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.ESNext,
      moduleResolution: ts.ModuleResolutionKind.Bundler,
      jsx: ts.JsxEmit.ReactJSX,
      strict: true,
      skipLibCheck: true,
      noEmit: true,
      esModuleInterop: true,
      resolveJsonModule: true,
      types: [],
    },
  });
  const index = program.getSourceFile(indexPath);
  if (!index) throw new Error(`Cannot read ${indexPath}`);
  const checker = program.getTypeChecker();
  const moduleSymbol = checker.getSymbolAtLocation(index);
  if (!moduleSymbol) throw new Error("src/index.ts exports nothing");

  const extractor = new Extractor(checker, root, srcDir);
  for (const symbol of checker.getExportsOfModule(moduleSymbol)) extractor.add(symbol);
  return { api: extractor.api, warnings: extractor.warnings };
}

class Extractor {
  readonly api: Record<string, ApiExport> = {};
  readonly warnings: string[] = [];
  private readonly srcPrefix: string;

  constructor(
    private readonly checker: ts.TypeChecker,
    private readonly root: string,
    srcDir: string,
  ) {
    this.srcPrefix = srcDir + sep;
  }

  add(symbol: ts.Symbol) {
    const name = symbol.getName();
    const target = symbol.flags & ts.SymbolFlags.Alias ? this.checker.getAliasedSymbol(symbol) : symbol;
    const decl = pickDeclaration(target.getDeclarations() ?? []);
    if (!decl || !this.isLocal(decl)) {
      const from = this.externalModule(symbol);
      if (from.startsWith(".")) {
        this.warnings.push(`${name}: src/index.ts re-exports it from ${from}, which could not be resolved`);
        this.api[name] = { name, kind: "external", source: from, description: `Could not be resolved from ${from} when the catalogue was built.` };
      } else {
        this.api[name] = { name, kind: "external", source: from, description: `Re-exported from ${from}.` };
      }
      return;
    }
    const entry: ApiExport = { name, kind: "constant", source: this.relative(decl) };
    const doc = docOf(decl);
    if (doc.description) entry.description = doc.description;

    if (ts.isInterfaceDeclaration(decl) || ts.isTypeAliasDeclaration(decl)) {
      this.describeType(entry, decl);
    } else {
      const fn = functionOf(decl);
      entry.kind = fn ? kindOfFunction(name) : "constant";
      if (fn && entry.kind === "component") entry.props = this.componentProps(name, decl, fn);
      else if (fn) this.describeFunction(entry, name, fn);
      else if (ts.isVariableDeclaration(decl)) {
        const type = this.checker.getBaseTypeOfLiteralType(this.checker.getTypeAtLocation(decl));
        entry.signature = `${name}: ${decl.type ? compact(decl.type.getText()) : this.checker.typeToString(type)}`;
      }
      if (fn) {
        const members = this.expandoMembers(name, decl.getSourceFile());
        if (members.length) entry.members = members;
      }
    }
    this.api[name] = entry;
  }

  private isLocal(node: ts.Node) {
    const file = node.getSourceFile().fileName.split("/").join(sep);
    return file.startsWith(this.srcPrefix) && !file.includes(`${sep}node_modules${sep}`);
  }

  private relative(node: ts.Node) {
    return relative(this.root, node.getSourceFile().fileName).split(sep).join("/");
  }

  private externalModule(symbol: ts.Symbol): string {
    let current: ts.Symbol | undefined = symbol;
    let lastRelative: string | undefined;
    for (let hops = 0; current && hops < 10; hops++) {
      for (const d of current.getDeclarations() ?? []) {
        if (ts.isExportSpecifier(d)) {
          const spec = d.parent.parent.moduleSpecifier;
          if (spec && ts.isStringLiteral(spec)) {
            if (!spec.text.startsWith(".")) return spec.text;
            lastRelative = spec.text;
          }
        }
      }
      if (!(current.flags & ts.SymbolFlags.Alias)) break;
      current = this.checker.getImmediateAliasedSymbol(current);
    }
    if (lastRelative) return lastRelative;
    const decl = symbol.getDeclarations()?.[0];
    return decl ? this.relative(decl) : "an external module";
  }

  private describeType(entry: ApiExport, decl: TypeDeclaration) {
    entry.kind = "type";
    if (decl.typeParameters?.length) entry.typeParameters = decl.typeParameters.map((t) => compact(t.getText()));
    if (ts.isTypeAliasDeclaration(decl)) {
      entry.definition = compact(decl.type.getText());
      const values = this.literalValues(decl.type);
      if (values) entry.values = values;
      else if (this.isObjectLike(decl.type)) {
        const shape = this.describeNode(decl.type, new Set([decl]));
        if (shape.props.length) entry.fields = shape.props;
        if (shape.extends.length) entry.definition = shape.extends.join(" & ");
        else delete entry.definition;
      }
      return;
    }
    const shape = this.describeDeclaration(decl, new Set([decl]));
    entry.fields = shape.props;
    if (shape.extends.length) entry.definition = `extends ${shape.extends.join(", ")}`;
  }

  private describeFunction(entry: ApiExport, name: string, fn: FunctionLike) {
    const typeParams = fn.typeParameters?.length ? `<${fn.typeParameters.map((t) => compact(t.getText())).join(", ")}>` : "";
    const params = fn.parameters.map((p) => compact(p.getText())).join(", ");
    let returns: string | undefined = fn.type ? compact(fn.type.getText()) : undefined;
    const signature = this.checker.getSignatureFromDeclaration(fn);
    const returnType = signature ? this.checker.getReturnTypeOfSignature(signature) : undefined;
    if (!returns && returnType) returns = this.checker.typeToString(returnType, undefined, ts.TypeFormatFlags.NoTruncation);
    entry.signature = `${name}${typeParams}(${params})${returns ? `: ${returns}` : ""}`;
    const returnDecl = returnType?.getSymbol()?.getDeclarations()?.find(ts.isInterfaceDeclaration);
    if (returnDecl && this.isLocal(returnDecl)) {
      const shape = this.describeDeclaration(returnDecl, new Set([returnDecl]));
      entry.returns = `{ ${shape.props.map((p) => `${p.name}${p.optional ? "?" : ""}: ${p.type}`).join("; ")} }`;
    }
  }

  private expandoMembers(name: string, file: ts.SourceFile): ApiMember[] {
    const members: ApiMember[] = [];
    for (const statement of file.statements) {
      if (!ts.isExpressionStatement(statement)) continue;
      const expr = statement.expression;
      if (!ts.isBinaryExpression(expr) || expr.operatorToken.kind !== ts.SyntaxKind.EqualsToken) continue;
      const left = expr.left;
      if (!ts.isPropertyAccessExpression(left) || !ts.isIdentifier(left.expression) || left.expression.text !== name) continue;
      const fn = unwrapFunction(expr.right);
      const member = `${name}.${left.name.text}`;
      const params = fn ? fn.parameters.map((p) => compact(p.getText())).join(", ") : "";
      const doc = docOf(statement);
      members.push({ name: member, signature: fn ? `${member}(${params})` : member, ...(doc.description ? { description: doc.description } : {}) });
    }
    return members;
  }

  private componentProps(name: string, decl: ts.Declaration, fn: FunctionLike): PropsInfo {
    const param = fn.parameters[0];
    const typeArgument = forwardRefPropsArgument(decl);
    let node = typeArgument ?? param?.type;
    let info: PropsInfo = { extends: [], props: [] };
    if (node) {
      info = this.describeNode(node, new Set());
      if (ts.isTypeReferenceNode(node) && this.isExpandable(node)) info.typeName = compact(node.getText());
    } else if (param) {
      const named = findTypeDeclaration(decl.getSourceFile(), `${name}Props`);
      if (named) {
        info = this.describeDeclaration(named, new Set([named]));
        info.typeName = named.name.text;
      } else {
        this.warnings.push(`${name}: could not find the type of its props`);
      }
    }
    if (fn.typeParameters?.length) info.typeParameters = fn.typeParameters.map((t) => compact(t.getText()));
    const defaults = bindingDefaults(param);
    for (const prop of info.props) {
      const value = defaults[prop.name];
      if (value !== undefined) prop.default = value;
      delete defaults[prop.name];
    }
    if (Object.keys(defaults).length) info.passThroughDefaults = defaults;
    return info;
  }

  private describeDeclaration(decl: TypeDeclaration, seen: Set<ts.Node>): PropsInfo {
    if (ts.isTypeAliasDeclaration(decl)) return this.describeNode(decl.type, seen);
    let out: PropsInfo = { extends: [], props: [] };
    for (const clause of decl.heritageClauses ?? []) {
      for (const type of clause.types) out = mergeProps(out, this.describeReference(type.expression, type.typeArguments, type, seen));
    }
    return mergeProps(out, { extends: [], props: this.members(decl.members) });
  }

  private describeNode(node: ts.TypeNode, seen: Set<ts.Node>): PropsInfo {
    if (ts.isParenthesizedTypeNode(node)) return this.describeNode(node.type, seen);
    if (ts.isTypeLiteralNode(node)) return { extends: [], props: this.members(node.members) };
    if (ts.isIntersectionTypeNode(node)) {
      return node.types.reduce<PropsInfo>((acc, part) => mergeProps(acc, this.describeNode(part, seen)), { extends: [], props: [] });
    }
    if (ts.isTypeReferenceNode(node)) return this.describeReference(node.typeName, node.typeArguments, node, seen);
    return { extends: [compact(node.getText())], props: [] };
  }

  private describeReference(
    nameNode: ts.EntityName | ts.Expression,
    typeArguments: ts.NodeArray<ts.TypeNode> | undefined,
    whole: ts.Node,
    seen: Set<ts.Node>,
  ): PropsInfo {
    const name = nameNode.getText();
    const [first, second] = typeArguments ?? [];
    if ((name === "Omit" || name === "Pick") && first && this.isExpandable(first)) {
      const inner = this.describeNode(first, seen);
      const keys = second ? this.literalKeys(second) : undefined;
      if (keys) inner.props = inner.props.filter((p) => (name === "Omit" ? !keys.has(p.name) : keys.has(p.name)));
      return inner;
    }
    if ((name === "Partial" || name === "Required") && first && this.isExpandable(first)) {
      const inner = this.describeNode(first, seen);
      inner.props = inner.props.map((p) => ({ ...p, optional: name === "Partial" }));
      return inner;
    }
    const decl = this.localTypeDeclaration(nameNode);
    if (decl && !seen.has(decl)) {
      seen.add(decl);
      return this.describeDeclaration(decl, seen);
    }
    return { extends: [compact(whole.getText())], props: [] };
  }

  private isExpandable(node: ts.TypeNode): boolean {
    if (ts.isParenthesizedTypeNode(node)) return this.isExpandable(node.type);
    if (ts.isTypeLiteralNode(node)) return true;
    if (ts.isIntersectionTypeNode(node)) return node.types.some((t) => this.isExpandable(t));
    if (ts.isTypeReferenceNode(node)) {
      const name = node.typeName.getText();
      if (["Omit", "Pick", "Partial", "Required"].includes(name)) {
        const first = node.typeArguments?.[0];
        return first ? this.isExpandable(first) : false;
      }
      return this.localTypeDeclaration(node.typeName) !== undefined;
    }
    return false;
  }

  private isObjectLike(node: ts.TypeNode): boolean {
    if (ts.isParenthesizedTypeNode(node)) return this.isObjectLike(node.type);
    return ts.isTypeLiteralNode(node) || ts.isIntersectionTypeNode(node) || (ts.isTypeReferenceNode(node) && this.isExpandable(node));
  }

  private localTypeDeclaration(nameNode: ts.EntityName | ts.Expression): TypeDeclaration | undefined {
    let symbol = this.checker.getSymbolAtLocation(nameNode);
    if (!symbol) return undefined;
    if (symbol.flags & ts.SymbolFlags.Alias) symbol = this.checker.getAliasedSymbol(symbol);
    const decl = symbol.getDeclarations()?.find((d): d is TypeDeclaration => ts.isInterfaceDeclaration(d) || ts.isTypeAliasDeclaration(d));
    return decl && this.isLocal(decl) ? decl : undefined;
  }

  private members(elements: ts.NodeArray<ts.TypeElement>): PropInfo[] {
    const props: PropInfo[] = [];
    for (const member of elements) {
      if (!ts.isPropertySignature(member) && !ts.isMethodSignature(member)) continue;
      const name = propertyName(member.name);
      if (!name) continue;
      const type = ts.isPropertySignature(member)
        ? member.type
          ? compact(member.type.getText())
          : "any"
        : `(${member.parameters.map((p) => compact(p.getText())).join(", ")}) => ${member.type ? compact(member.type.getText()) : "void"}`;
      const prop: PropInfo = { name, type, optional: member.questionToken !== undefined };
      const values = ts.isPropertySignature(member) && member.type ? this.literalValues(member.type) : undefined;
      if (values) prop.values = values;
      const doc = docOf(member);
      if (doc.description) prop.description = doc.description;
      if (doc.tags.default) prop.default = doc.tags.default;
      if (doc.tags.deprecated !== undefined) prop.deprecated = doc.tags.deprecated || "Deprecated.";
      props.push(prop);
    }
    return props;
  }

  private literalValues(node: ts.TypeNode): string[] | undefined {
    const declared = this.declaredLiterals(node, new Set());
    if (declared?.length) return [...new Set(declared)];
    const type = this.checker.getTypeFromTypeNode(node);
    const parts = (type.isUnion() ? type.types : [type]).filter((t) => !(t.flags & (ts.TypeFlags.Undefined | ts.TypeFlags.Null)));
    if (!parts.length || parts.some((t) => !(t.isStringLiteral() || t.isNumberLiteral()))) return undefined;
    return parts.map((t) => (t.isStringLiteral() ? JSON.stringify(t.value) : String((t as ts.NumberLiteralType).value)));
  }

  /** Literal unions read from the source keep their written order; the checker sorts them by type id. */
  private declaredLiterals(node: ts.TypeNode, seen: Set<ts.Node>): string[] | undefined {
    if (ts.isParenthesizedTypeNode(node)) return this.declaredLiterals(node.type, seen);
    if (node.kind === ts.SyntaxKind.UndefinedKeyword) return [];
    if (ts.isLiteralTypeNode(node)) {
      const literal = node.literal;
      if (literal.kind === ts.SyntaxKind.NullKeyword) return [];
      if (ts.isStringLiteral(literal)) return [JSON.stringify(literal.text)];
      if (ts.isNumericLiteral(literal)) return [literal.text];
      if (ts.isPrefixUnaryExpression(literal) && ts.isNumericLiteral(literal.operand)) return [`-${literal.operand.text}`];
      return undefined;
    }
    if (ts.isUnionTypeNode(node)) {
      const out: string[] = [];
      for (const part of node.types) {
        const values = this.declaredLiterals(part, seen);
        if (!values) return undefined;
        out.push(...values);
      }
      return out;
    }
    if (ts.isTypeReferenceNode(node) && !node.typeArguments) {
      const decl = this.localTypeDeclaration(node.typeName);
      if (decl && ts.isTypeAliasDeclaration(decl) && !seen.has(decl)) {
        seen.add(decl);
        return this.declaredLiterals(decl.type, seen);
      }
    }
    return undefined;
  }

  private literalKeys(node: ts.TypeNode): Set<string> | undefined {
    const type = this.checker.getTypeFromTypeNode(node);
    const parts = type.isUnion() ? type.types : [type];
    if (parts.some((t) => !t.isStringLiteral())) return undefined;
    return new Set(parts.map((t) => (t as ts.StringLiteralType).value));
  }
}

function pickDeclaration(decls: ts.Declaration[]): ts.Declaration | undefined {
  return decls.find(
    (d) =>
      ts.isFunctionDeclaration(d) ||
      ts.isVariableDeclaration(d) ||
      ts.isClassDeclaration(d) ||
      ts.isInterfaceDeclaration(d) ||
      ts.isTypeAliasDeclaration(d) ||
      ts.isEnumDeclaration(d),
  );
}

function kindOfFunction(name: string): ExportKind {
  if (/^use[A-Z0-9]/.test(name)) return "hook";
  if (/^[A-Z]/.test(name)) return "component";
  return "function";
}

function functionOf(decl: ts.Declaration): FunctionLike | undefined {
  if (ts.isFunctionDeclaration(decl)) return decl;
  if (ts.isVariableDeclaration(decl) && decl.initializer) return unwrapFunction(decl.initializer);
  return undefined;
}

function unwrapFunction(expr: ts.Expression): FunctionLike | undefined {
  if (ts.isArrowFunction(expr) || ts.isFunctionExpression(expr)) return expr;
  if (ts.isParenthesizedExpression(expr) || ts.isAsExpression(expr) || ts.isSatisfiesExpression(expr)) return unwrapFunction(expr.expression);
  if (ts.isCallExpression(expr) && /(^|\.)(forwardRef|memo)$/.test(expr.expression.getText()) && expr.arguments[0]) {
    return unwrapFunction(expr.arguments[0]);
  }
  return undefined;
}

function forwardRefPropsArgument(decl: ts.Declaration): ts.TypeNode | undefined {
  if (!ts.isVariableDeclaration(decl) || !decl.initializer) return undefined;
  let expr: ts.Expression = decl.initializer;
  while (ts.isCallExpression(expr)) {
    if (/(^|\.)forwardRef$/.test(expr.expression.getText())) return expr.typeArguments?.[1];
    const inner = expr.arguments[0];
    if (!inner) return undefined;
    expr = inner;
  }
  return undefined;
}

function findTypeDeclaration(file: ts.SourceFile, name: string): TypeDeclaration | undefined {
  return file.statements.find(
    (s): s is TypeDeclaration => (ts.isInterfaceDeclaration(s) || ts.isTypeAliasDeclaration(s)) && s.name.text === name,
  );
}

function bindingDefaults(param: ts.ParameterDeclaration | undefined): Record<string, string> {
  const out: Record<string, string> = {};
  if (!param || !ts.isObjectBindingPattern(param.name)) return out;
  for (const element of param.name.elements) {
    if (!element.initializer || element.dotDotDotToken) continue;
    const key = element.propertyName ? propertyName(element.propertyName) : ts.isIdentifier(element.name) ? element.name.text : undefined;
    if (key) out[key] = compact(element.initializer.getText());
  }
  return out;
}

function propertyName(name: ts.PropertyName): string | undefined {
  if (ts.isIdentifier(name) || ts.isStringLiteral(name) || ts.isNumericLiteral(name)) return name.text;
  if (ts.isComputedPropertyName(name)) return name.getText();
  return undefined;
}

function mergeProps(a: PropsInfo, b: PropsInfo): PropsInfo {
  const byName = new Map(a.props.map((p) => [p.name, p]));
  for (const prop of b.props) byName.set(prop.name, prop);
  return { extends: [...new Set([...a.extends, ...b.extends])], props: [...byName.values()] };
}

function docOf(node: ts.Node): { description?: string; tags: Record<string, string> } {
  const tags: Record<string, string> = {};
  const parts: string[] = [];
  for (const doc of ts.getJSDocCommentsAndTags(node)) {
    if (!ts.isJSDoc(doc)) continue;
    const text = ts.getTextOfJSDocComment(doc.comment)?.trim();
    if (text) parts.push(text);
    for (const tag of doc.tags ?? []) tags[tag.tagName.text] = ts.getTextOfJSDocComment(tag.comment)?.trim() ?? "";
  }
  const description = parts.join("\n").trim();
  return description ? { description, tags } : { tags };
}
