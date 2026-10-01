import { readdirSync, readFileSync } from "node:fs";
import { basename, dirname, join, relative, sep } from "node:path";
import postcss, { type AtRule, type Container, type Node } from "postcss";
import type {
  ColorToken,
  InkClass,
  StaticToken,
  ThemedToken,
  ThemedValue,
  TokenUsage,
  Tokens,
  TypeClass,
  Typography,
  UtilityClass,
} from "../../src/catalog-types.js";

export type UsageMap = Map<string, Map<string, Set<string>>>;

const VAR = /var\(\s*(--[\w-]+)\s*(?:,\s*([^()]*))?\)/g;

export function isColorValue(value: string) {
  const v = value.trim();
  return (
    /^#[0-9a-f]{3,8}$/i.test(v) ||
    /^(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color)\(/i.test(v) ||
    /^(?:transparent|currentcolor|white|black)$/i.test(v)
  );
}

function commentText(text: string) {
  return text
    .split(/\r?\n/)
    .map((line) => line.replace(/^\s*\*?\s?/, "").trim())
    .filter(Boolean)
    .join(" ");
}

function resolver(values: Map<string, string>) {
  const cache = new Map<string, ThemedValue>();
  const resolve = (name: string, stack: string[]): ThemedValue => {
    const cached = cache.get(name);
    if (cached) return cached;
    const raw = values.get(name);
    if (raw === undefined) return { value: "", resolved: `var(${name})`, chain: [] };
    if (stack.includes(name)) return { value: raw, resolved: raw, chain: [] };
    let chain: string[] = [];
    const resolved = raw.replace(VAR, (_match, ref: string, fallback: string | undefined) => {
      const inner = values.has(ref) ? resolve(ref, [...stack, name]) : undefined;
      if (!chain.length) chain = [ref, ...(inner?.chain ?? [])];
      return inner ? inner.resolved : (fallback?.trim() ?? `var(${ref})`);
    });
    const result = { value: raw, resolved, chain };
    cache.set(name, result);
    return result;
  };
  return (name: string) => resolve(name, []);
}

function usageFor(usage: UsageMap, name: string): TokenUsage[] {
  const byComponent = usage.get(name);
  if (!byComponent) return [];
  return [...byComponent.entries()]
    .map(([component, properties]) => ({ component, properties: [...properties].sort() }))
    .sort((a, b) => a.component.localeCompare(b.component));
}

export function extractTokens(css: string, usage: UsageMap): Omit<Tokens, "utilities"> {
  const root = postcss.parse(css);
  const notes: string[] = [];
  root.each((node) => {
    if (node.type === "comment") notes.push(commentText(node.text));
  });

  const base = new Map<string, string>();
  const dark = new Map<string, string>();
  const themed = new Set<string>();
  const order: string[] = [];
  const selectors = { light: [] as string[], dark: [] as string[] };

  root.walkRules((rule) => {
    const isDark = rule.selectors.some((s) => /\[data-theme=["']?dark["']?\]/.test(s));
    const isLight = rule.selectors.some((s) => s.trim() === ":root" || /\[data-theme=["']?light["']?\]/.test(s));
    if (!isDark && !isLight) return;
    const isThemed = rule.selectors.some((s) => s.includes("[data-theme"));
    let declares = false;
    rule.each((node) => {
      if (node.type !== "decl" || !node.prop.startsWith("--")) return;
      declares = true;
      (isDark ? dark : base).set(node.prop, node.value.trim());
      if (isThemed || isDark) themed.add(node.prop);
      if (!order.includes(node.prop)) order.push(node.prop);
    });
    if (declares && (isThemed || isDark)) {
      const list = isDark ? selectors.dark : selectors.light;
      if (!list.includes(rule.selector)) list.push(rule.selector);
    }
  });

  const light = resolver(base);
  const darkResolve = resolver(new Map([...base, ...dark]));
  const tokens: Omit<Tokens, "utilities"> = {
    notes,
    selectors,
    colors: [],
    effects: [],
    spacing: [],
    radius: [],
    layout: [],
    fonts: [],
    motion: [],
  };

  for (const name of order) {
    const lightValue = light(name);
    const darkValue = darkResolve(name);
    const family = name.replace(/^--/, "").split("-")[0] ?? name;
    const used = usageFor(usage, name);
    if (isColorValue(lightValue.resolved) || isColorValue(darkValue.resolved)) {
      const neutral = /^--n-(\d+)$/.exec(name);
      const hue = /^--([a-z]+)-(\d{3})$/.exec(name);
      const color: ColorToken = neutral
        ? { name, group: "neutral", family: "n", step: neutral[1], light: lightValue, dark: darkValue, usage: used }
        : hue
          ? { name, group: "hue", family: hue[1] ?? family, hue: hue[1], step: hue[2], light: lightValue, dark: darkValue, usage: used }
          : { name, group: "role", family, light: lightValue, dark: darkValue, usage: used };
      tokens.colors.push(color);
      continue;
    }
    if (themed.has(name)) {
      const effect: ThemedToken = { name, family, light: lightValue, dark: darkValue, usage: used };
      tokens.effects.push(effect);
      continue;
    }
    const token: StaticToken = { name, value: lightValue.value, resolved: lightValue.resolved, usage: used };
    if (name.startsWith("--space-")) tokens.spacing.push(token);
    else if (name.startsWith("--radius-")) tokens.radius.push(token);
    else if (name.startsWith("--font-")) tokens.fonts.push(token);
    else if (/^--(?:dur|ease|delay|motion)-/.test(name)) tokens.motion.push(token);
    else tokens.layout.push(token);
  }
  return tokens;
}

function atRuleContext(node: Node): string[] {
  const context: string[] = [];
  let parent: Container | undefined = node.parent as Container | undefined;
  while (parent && parent.type !== "root") {
    if (parent.type === "atrule") {
      const at = parent as AtRule;
      context.unshift(`@${at.name} ${at.params}`.trim());
    }
    parent = parent.parent as Container | undefined;
  }
  return context;
}

export function extractUtilities(sheets: { file: string; css: string }[]): UtilityClass[] {
  const out: UtilityClass[] = [];
  for (const sheet of sheets) {
    postcss.parse(sheet.css).walkRules((rule) => {
      for (const selector of rule.selectors) {
        const match = /^\.([a-z][\w-]*)$/i.exec(selector.trim());
        if (!match?.[1]) continue;
        const declarations: Record<string, string> = {};
        rule.each((node) => {
          if (node.type === "decl") declarations[node.prop] = node.value;
        });
        out.push({ name: match[1], source: sheet.file, context: atRuleContext(rule), declarations });
      }
    });
  }
  return out;
}

export function extractTypography(css: string, tokens: Omit<Tokens, "utilities">): Typography {
  const root = postcss.parse(css);
  const classes = new Map<string, { declarations: Record<string, string>; note?: string }>();
  const notes: string[] = [];
  let pending: string | undefined;
  root.each((node) => {
    if (node.type === "comment") {
      pending = commentText(node.text);
      return;
    }
    if (node.type !== "rule") {
      if (pending) notes.push(pending);
      pending = undefined;
      return;
    }
    const names = node.selectors.map((s) => /^\.([\w-]+)$/.exec(s.trim())?.[1]).filter((n): n is string => Boolean(n));
    for (const name of names) {
      const entry = classes.get(name) ?? { declarations: {} };
      node.each((child) => {
        if (child.type === "decl") entry.declarations[child.prop] = child.value;
      });
      if (pending && names.length === 1) entry.note = pending;
      classes.set(name, entry);
    }
    if (pending && names.length !== 1) notes.push(pending);
    pending = undefined;
  });

  const fontStack = new Map(tokens.fonts.map((f) => [f.name, f.resolved]));
  const colorByName = new Map(tokens.colors.map((c) => [c.name, c]));
  const typeClasses: TypeClass[] = [];
  const inkClasses: InkClass[] = [];
  for (const [name, { declarations, note }] of classes) {
    const props = Object.keys(declarations);
    if (props.length === 1 && props[0] === "color") {
      const token = /var\((--[\w-]+)\)/.exec(declarations.color ?? "")?.[1] ?? "";
      const color = colorByName.get(token);
      inkClasses.push({ name, token, light: color?.light.resolved ?? "", dark: color?.dark.resolved ?? "" });
      continue;
    }
    const fontToken = /var\((--font-[\w-]+)\)/.exec(declarations["font-family"] ?? "")?.[1];
    const item: TypeClass = {
      name,
      declarations,
      tabular: /tabular-nums/.test(declarations["font-variant-numeric"] ?? ""),
    };
    if (fontToken) {
      item.fontToken = fontToken;
      const stack = fontStack.get(fontToken);
      if (stack) item.fontStack = stack;
    }
    if (note) item.note = note;
    typeClasses.push(item);
  }
  return { classes: typeClasses, inkClasses, notes };
}

function listFiles(dir: string, test: (file: string) => boolean): string[] {
  try {
    return readdirSync(dir, { recursive: true, encoding: "utf8" })
      .filter((file) => test(file) && !file.split(sep).includes("node_modules"))
      .map((file) => join(dir, file))
      .sort();
  } catch {
    return [];
  }
}

export function scanTokenUsage(root: string): UsageMap {
  const usage: UsageMap = new Map();
  const add = (token: string, owner: string, property: string) => {
    const owners = usage.get(token) ?? new Map<string, Set<string>>();
    const props = owners.get(owner) ?? new Set<string>();
    props.add(property);
    owners.set(owner, props);
    usage.set(token, owners);
  };
  const uiDir = join(root, "src", "components", "ui");
  const sheets = [
    ...listFiles(uiDir, (f) => f.endsWith(".module.css")).map((file) => ({ file, owner: relative(uiDir, dirname(file)).split(sep)[0] ?? basename(file) })),
    ...listFiles(join(root, "src", "styles"), (f) => f.endsWith(".css") && basename(f) !== "tokens.css").map((file) => ({ file, owner: basename(file) })),
  ];
  for (const { file, owner } of sheets) {
    postcss.parse(readFileSync(file, "utf8")).walkDecls((decl) => {
      for (const match of decl.value.matchAll(VAR)) if (match[1]) add(match[1], owner, decl.prop);
    });
  }
  return usage;
}
