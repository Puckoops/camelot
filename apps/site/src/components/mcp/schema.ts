import type { JsonSchema } from "./client";

export interface Param {
  name: string;
  type: string;
  required: boolean;
  description?: string;
  values?: string[];
  constraints: string[];
}

export function typeLabel(schema: JsonSchema): string {
  if (schema.enum?.length) return "enum";
  if (schema.anyOf?.length) return schema.anyOf.map(typeLabel).join(" | ");
  if (schema.type === "array") return `${schema.items ? typeLabel(schema.items) : "unknown"}[]`;
  if (Array.isArray(schema.type)) return schema.type.join(" | ");
  return schema.type ?? "any";
}

export function paramsOf(schema: JsonSchema): Param[] {
  const required = new Set(schema.required ?? []);
  return Object.entries(schema.properties ?? {}).map(([name, prop]) => {
    const constraints: string[] = [];
    if (prop.minLength !== undefined) constraints.push(`min length ${prop.minLength}`);
    if (prop.maxLength !== undefined) constraints.push(`max length ${prop.maxLength.toLocaleString("en-GB")}`);
    if (prop.minimum !== undefined) constraints.push(`≥ ${prop.minimum}`);
    if (prop.maximum !== undefined) constraints.push(`≤ ${prop.maximum}`);
    const param: Param = { name, type: typeLabel(prop), required: required.has(name), constraints };
    if (prop.description) param.description = prop.description;
    if (prop.enum?.length) param.values = prop.enum.map(String);
    return param;
  });
}

function placeholder(schema: JsonSchema): unknown {
  if (schema.enum?.length) return schema.enum[0];
  if (schema.default !== undefined) return schema.default;
  switch (Array.isArray(schema.type) ? schema.type[0] : schema.type) {
    case "number":
    case "integer":
      return 0;
    case "boolean":
      return false;
    case "array":
      return [];
    case "object":
      return {};
    default:
      return "";
  }
}

export function sampleArguments(schema: JsonSchema): Record<string, unknown> {
  const required = new Set(schema.required ?? []);
  const args: Record<string, unknown> = {};
  for (const [name, prop] of Object.entries(schema.properties ?? {})) {
    if (prop.examples?.length) args[name] = prop.examples[0];
    else if (required.has(name)) args[name] = placeholder(prop);
  }
  return args;
}

export const firstSentence = (text = "") => {
  const match = /^.+?[.!?](?=\s|$)/.exec(text.trim());
  return match ? match[0] : text.trim();
};
