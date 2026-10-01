import type { ExampleProp } from "@/lib/types";
import type { Args } from "./types";

function fromValue(key: string, value: unknown): ExampleProp | undefined {
  if (typeof value === "string") return { key, kind: "string", value };
  if (value === true) return { key, kind: "true", value: "true" };
  if (typeof value === "function" || value === undefined) return undefined;
  return { key, kind: "expr", value: JSON.stringify(value) };
}

function attribute(p: ExampleProp) {
  switch (p.kind) {
    case "string":
      return p.value.includes('"') ? `${p.key}={${JSON.stringify(p.value)}}` : `${p.key}="${p.value}"`;
    case "true":
      return p.key;
    case "action":
      return `${p.key}={() => {}}`;
    default:
      return `${p.key}={${p.value}}`;
  }
}

/**
 * The JSX an args-only example renders, from the args as written in its docs file with any control
 * changes applied on top, so identifiers such as icons keep their names.
 */
export function jsxSource(component: string, written: ExampleProp[], initial: Args, current: Args) {
  const props = new Map(written.filter((p) => !(p.kind === "expr" && p.value === "undefined")).map((p) => [p.key, p]));
  for (const [key, value] of Object.entries(current)) {
    if (Object.is(value, initial[key])) continue;
    const changed = fromValue(key, value);
    if (changed) props.set(key, changed);
    else if (value === undefined || value === false) props.delete(key);
  }
  const children = props.get("children");
  props.delete("children");
  const attrs = [...props.values()].map(attribute);
  const oneLine = `<${component}${attrs.map((a) => ` ${a}`).join("")}`;
  const multiline = oneLine.length > 72;
  const open = multiline ? `<${component}\n${attrs.map((a) => `  ${a}`).join("\n")}\n` : oneLine;
  if (!children) return multiline ? `${open}/>` : `${open} />`;
  const element = children.kind === "expr" && children.value.trimStart().startsWith("<");
  const inner = children.kind === "string" || element ? children.value : `{${children.value}}`;
  const short = `${open}>${inner}</${component}>`;
  if (!multiline && !inner.includes("\n") && short.length <= 80) return short;
  return `${open}>\n${inner.replace(/^/gm, "  ")}\n</${component}>`;
}
