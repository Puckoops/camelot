import "server-only";
import sheets from "@generated/styles.json";

export type Theme = "light" | "dark";

interface Block {
  selector: string;
  decls: Map<string, string>;
}

function parseBlocks(css: string): Block[] {
  const blocks: Block[] = [];
  for (const m of css.replace(/\/\*[\s\S]*?\*\//g, "").matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const decls = new Map<string, string>();
    for (const part of m[2]!.split(";")) {
      const at = part.indexOf(":");
      if (at < 0) continue;
      const prop = part.slice(0, at).trim();
      if (prop) decls.set(prop, part.slice(at + 1).trim().replace(/\s+/g, " "));
    }
    blocks.push({ selector: m[1]!.trim().replace(/\s+/g, " "), decls });
  }
  return blocks;
}

const tokenBlocks = parseBlocks(sheets.tokens);
const empty = new Map<string, string>();
const light = tokenBlocks.find((b) => b.selector.includes('[data-theme="light"]'))?.decls ?? empty;
const dark = tokenBlocks.find((b) => b.selector === '[data-theme="dark"]')?.decls ?? empty;
const shared = tokenBlocks.find((b) => b.selector === ":root")?.decls ?? empty;

export const tokenCount = new Set(tokenBlocks.flatMap((b) => [...b.decls.keys()].filter((n) => n.startsWith("--")))).size;
export const themes = [...new Set(tokenBlocks.flatMap((b) => Array.from(b.selector.matchAll(/\[data-theme="([\w-]+)"\]/g), (m) => m[1]!)))];

/** The value as written, without resolving var() references. */
export function declared(name: string, theme: Theme = "light") {
  return (theme === "dark" ? dark.get(name) : undefined) ?? light.get(name) ?? shared.get(name) ?? "";
}

/** The final value in a theme, following var() references the way the cascade does on <html>. */
export function resolve(name: string, theme: Theme = "light", seen: Set<string> = new Set()): string {
  const raw = declared(name, theme);
  return raw.replace(/var\((--[\w-]+)\)/g, (_, ref: string) => (seen.has(ref) ? "" : resolve(ref, theme, new Set(seen).add(ref))));
}

/** The token this one points at, such as --n-01 for --canvas, or undefined for a literal. */
export function reference(name: string, theme: Theme = "light") {
  return /^var\((--[\w-]+)\)$/.exec(declared(name, theme))?.[1];
}

const RAMP = /^--(n|teal|blue|amber|red)-\d+$/;

export const roleTokens = [...light.keys()].filter((n) => !RAMP.test(n) && !n.startsWith("--shadow-"));
export const neutralRamp = [...light.keys()].filter((n) => /^--n-\d+$/.test(n));
export const hueRamps = (["teal", "blue", "amber", "red"] as const).map((hue) => ({
  hue,
  steps: [...light.keys()].filter((n) => n.startsWith(`--${hue}-`)),
}));
export const shadowTokens = [...light.keys()].filter((n) => n.startsWith("--shadow-"));

export const sharedTokens = (prefix: string) =>
  [...shared.keys()].filter((n) => n.startsWith(prefix)).sort((a, b) => parseFloat(shared.get(a)!) - parseFloat(shared.get(b)!));
export const layoutTokens = [...shared.keys()].filter((n) => !/^--(space|radius|font|dur|ease)-/.test(n));

export const px = (value: string) => parseFloat(value) || 0;

export interface TypeClass {
  name: string;
  family: string;
  familyToken: string;
  size: string;
  lineHeight: string;
  weight: string;
  tracking: string;
  uppercase: boolean;
  tabular: boolean;
}

const firstFamily = (stack: string) => stack.split(",")[0]!.trim().replace(/^["']|["']$/g, "");

export const typeClasses: TypeClass[] = (() => {
  const merged = new Map<string, Map<string, string>>();
  for (const block of parseBlocks(sheets.type)) {
    for (const sel of block.selector.split(",")) {
      const cls = /^\.([\w-]+)$/.exec(sel.trim())?.[1];
      if (!cls) continue;
      const decls = merged.get(cls) ?? new Map<string, string>();
      block.decls.forEach((v, k) => decls.set(k, v));
      merged.set(cls, decls);
    }
  }
  return [...merged.entries()]
    .filter(([, d]) => d.has("font-size"))
    .map(([name, d]) => {
      const familyToken = /var\((--[\w-]+)\)/.exec(d.get("font-family") ?? "")?.[1] ?? "";
      return {
        name,
        familyToken,
        family: familyToken ? firstFamily(resolve(familyToken)) : firstFamily(d.get("font-family") ?? ""),
        size: d.get("font-size") ?? "",
        lineHeight: d.get("line-height") ?? "",
        weight: d.get("font-weight") ?? "400",
        tracking: d.get("letter-spacing") ?? "0",
        uppercase: d.get("text-transform") === "uppercase",
        tabular: d.get("font-variant-numeric") === "tabular-nums",
      };
    });
})();

export const inkClasses = parseBlocks(sheets.type)
  .filter((b) => /^\.text-\d$/.test(b.selector))
  .map((b) => ({ name: b.selector.slice(1), token: /var\((--[\w-]+)\)/.exec(b.decls.get("color") ?? "")?.[1] ?? "" }));

export const fontTokens = [...shared.keys()]
  .filter((n) => n.startsWith("--font-"))
  .map((name) => ({ name, stack: shared.get(name)!, family: firstFamily(shared.get(name)!) }));

export const motionTokens = {
  durations: [...shared.keys()].filter((n) => n.startsWith("--dur-")).map((name) => ({ name, value: shared.get(name)! })),
  easings: [...shared.keys()].filter((n) => n.startsWith("--ease-")).map((name) => ({ name, value: shared.get(name)! })),
};

export function bezier(value: string): [number, number, number, number] | null {
  const m = /cubic-bezier\(([^)]+)\)/.exec(value);
  const n = m?.[1]?.split(",").map((v) => parseFloat(v));
  return n && n.length === 4 && n.every(Number.isFinite) ? (n as [number, number, number, number]) : null;
}

export const reducedMotionRule = /@media \(prefers-reduced-motion: reduce\) \{[\s\S]*?\n\}/.exec(sheets.motion)?.[0] ?? "";
