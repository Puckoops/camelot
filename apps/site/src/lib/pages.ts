export const TOKEN_PAGES = [
  { slug: "semantic", name: "Semantic", story: { slug: "colour-roles", name: "Colour roles" } },
  { slug: "typography", name: "Typography", story: { slug: "type-scale", name: "Type scale" } },
  { slug: "effects", name: "Shadows & Effects", story: { slug: "elevation-and-effects", name: "Elevation and effects" } },
  { slug: "spacing", name: "Spacing & Radius", story: { slug: "scales", name: "Scales" } },
  { slug: "motion", name: "Motion", story: { slug: "durations-and-easings", name: "Durations and easings" } },
] as const;

export type TokenSlug = (typeof TOKEN_PAGES)[number]["slug"];

export const MCP_STORIES = [
  { slug: "how-to-use", name: "How To Use" },
  { slug: "tool-reference", name: "Tool Reference" },
  { slug: "try-it-out", name: "Try It Out" },
] as const;

export type McpStorySlug = (typeof MCP_STORIES)[number]["slug"];

export const MCP_DOCS = "/docs/mcp";

export function mcpStoryHref(slug: McpStorySlug) {
  return `${MCP_DOCS}/${slug}`;
}
