import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import type { ApiExport, ComponentEntry } from "./catalog-types.js";
import { type Catalog, shortName } from "./catalog.js";
import { compareComponents } from "./compare.js";
import {
  COLOR_GROUPS,
  renderAppSetup,
  renderColorTokens,
  renderComparison,
  renderComponentDetails,
  renderComponentList,
  renderDocs,
  renderElementMapping,
  renderFullGuide,
  renderHardRules,
  renderIconsGuide,
  renderSearch,
  renderTypography,
  renderUncatalogued,
  renderValidation,
} from "./render.js";
import { searchComponents } from "./search.js";
import { validateCode } from "./validate.js";

export const SERVER_NAME = "camelot";
export const SERVER_VERSION = "0.1.0";

export const VALIDATE_EXAMPLE = `export function Overdue({ count }: { count: number }) {
  return (
    <div style={{ color: "#b9504b", fontSize: 14 }}>
      <Chip tone="red">Overdue</Chip>
      {count === 0 && <p>No data</p>}
    </div>
  );
}`;

const READ_ONLY = { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false } as const;

const text = (markdown: string, structuredContent?: Record<string, unknown>): CallToolResult => ({
  content: [{ type: "text", text: markdown }],
  ...(structuredContent ? { structuredContent } : {}),
});

const failure = (message: string): CallToolResult => ({ content: [{ type: "text", text: message }], isError: true });

function sharedKeyword(catalog: Catalog) {
  const counts = new Map<string, number>();
  for (const entry of catalog.entries) for (const k of new Set(entry.keywords.map((w) => w.toLowerCase()))) counts.set(k, (counts.get(k) ?? 0) + 1);
  return [...counts.entries()].reduce<[string, number] | undefined>((best, kv) => (!best || kv[1] > best[1] ? kv : best), undefined)?.[0];
}

function examples(catalog: Catalog) {
  const first = catalog.entries[0];
  const pair = catalog.lookalikePair();
  return {
    component: first ? shortName(first) : "",
    pair: pair ?? ([first ? shortName(first) : "", catalog.entries[1] ? shortName(catalog.entries[1]) : ""] as [string, string]),
    query: sharedKeyword(catalog) ?? first?.name ?? "",
    category: catalog.categories[0] ?? "",
  };
}

export function serverInstructions(catalog: Catalog) {
  const pair = catalog.lookalikePair();
  const { name, version } = catalog.data.package;
  return [
    `${name} ${version} is Camelot, the Puckoops React design system (${catalog.entries.length} catalogued components). Build UI from its components and tokens, never from raw elements or literal colours.`,
    "1. Call get_hard_rules before writing any UI.",
    "2. Find components with search_components or get_components, then read get_component_details before using one (props, allowed values, defaults).",
    `3. When two components look alike${pair ? ` (such as ${pair[0]} and ${pair[1]})` : ""}, call compare_components.`,
    "4. Colours come from get_color_tokens, text styles from get_typography, icons from get_icons_guide, raw elements map to components via get_element_mapping, and get_app_setup bootstraps an app.",
    "5. Run validate_code on what you wrote before you finish.",
    "get_full_guide returns all of it as one document.",
  ].join("\n");
}

function notFound(catalog: Catalog, name: string) {
  const suggestions = catalog.suggest(name);
  const mentionedBy = catalog.entries.filter((e) => e.useInstead.some((alt) => alt.name.toLowerCase() === name.trim().toLowerCase()));
  const lines = [`No component called "${name}" in the catalogue.`];
  if (mentionedBy.length && !catalog.isExported(name.trim())) {
    lines.push(`${mentionedBy.map(shortName).join(", ")} ${mentionedBy.length === 1 ? "names" : "name"} it as an alternative, but it is not exported yet, so do not import it.`);
  }
  if (suggestions.length) lines.push(`Did you mean ${suggestions.join(", ")}?`);
  lines.push("search_components finds components by purpose; get_components lists them all.");
  return lines.join(" ");
}

function detailsStructured(catalog: Catalog, entry: ComponentEntry) {
  const api = (names: string[]) => names.map((n) => catalog.api(n)).filter((a): a is ApiExport => Boolean(a));
  return {
    name: entry.name,
    category: entry.category,
    summary: entry.summary,
    import: entry.import,
    exports: entry.exports,
    whenToUse: entry.whenToUse,
    useInstead: entry.useInstead.map((alt) => ({ ...alt, exported: catalog.exists(alt.name) })),
    keywords: entry.keywords,
    docsUrl: catalog.pageUrl(entry),
    hasDocs: entry.hasDocs,
    api: api(entry.exports),
    types: api(entry.types),
  };
}

const sideSchema = z.object({ name: z.string(), inCatalogue: z.boolean(), exported: z.boolean() });

export function createMcpServer(catalog: Catalog): McpServer {
  const server = new McpServer(
    { name: SERVER_NAME, title: "Camelot", version: SERVER_VERSION },
    { instructions: serverInstructions(catalog) },
  );
  const ex = examples(catalog);
  const categories = catalog.categories;
  const componentName = z
    .string()
    .min(1)
    .max(120)
    .describe("A catalogue name (Button, FigureCard, Cards/FigureCard) or any export (IconButton, Sparkbars). Case-insensitive.");

  server.registerTool(
    "get_components",
    {
      title: "List components",
      description:
        "List every @puckoops/camelot component grouped by category, with a one-line summary and its exports. Pass category to list one group. Start here to see what exists, then call get_component_details.",
      inputSchema: {
        category: (categories.length ? z.enum(categories as [string, ...string[]]) : z.string())
          .optional()
          .describe(`Only list this category: ${categories.join(", ")}.`)
          .meta({ examples: [ex.category] }),
      },
      annotations: { title: "List components", ...READ_ONLY },
    },
    async ({ category }) => text(renderComponentList(catalog, category)),
  );

  server.registerTool(
    "get_component_details",
    {
      title: "Component details",
      description:
        "Everything about one component: summary, import line, exports, when to use it, what to use instead, the TypeScript props of each export (types, allowed values, defaults and docs) and the URL of its docs page.",
      inputSchema: { name: componentName.meta({ examples: [ex.component] }) },
      annotations: { title: "Component details", ...READ_ONLY },
    },
    async ({ name }) => {
      const found = catalog.find(name);
      if (!found) {
        const group = catalog.uncataloguedGroup(name);
        if (group) return text(renderUncatalogued(catalog, group), { name: group.primary.name, catalogued: false, api: group.members, types: group.types });
        return failure(notFound(catalog, name));
      }
      const exportName = found.via === "export" ? found.exportName : undefined;
      return text(renderComponentDetails(catalog, found.entry, exportName), detailsStructured(catalog, found.entry));
    },
  );

  server.registerTool(
    "compare_components",
    {
      title: "Compare two components",
      description:
        "Decide between two similar components, such as Select and SegmentedControl or Chip and PriorityMark. Explains which to use when, from both components' use-instead guidance and their summaries.",
      inputSchema: {
        a: componentName.meta({ examples: [ex.pair[0]] }),
        b: componentName.meta({ examples: [ex.pair[1]] }),
      },
      outputSchema: {
        a: sideSchema,
        b: sideSchema,
        sameEntry: z.boolean(),
        guidance: z.array(z.object({ instead: z.string(), of: z.string(), when: z.string() })),
        shared: z.array(z.object({ name: z.string(), fromA: z.string(), fromB: z.string() })),
      },
      annotations: { title: "Compare two components", ...READ_ONLY },
    },
    async ({ a, b }) => {
      const cmp = compareComponents(catalog, a, b);
      if (!cmp.a.entry && !cmp.b.entry) return failure(`${notFound(catalog, a)}\n\n${notFound(catalog, b)}`);
      const summary = (s: typeof cmp.a) => ({ name: s.exportName ?? s.name, inCatalogue: Boolean(s.entry), exported: s.exported });
      return text(renderComparison(catalog, cmp), {
        a: summary(cmp.a),
        b: summary(cmp.b),
        sameEntry: cmp.sameEntry,
        guidance: cmp.guidance,
        shared: cmp.shared,
      });
    },
  );

  server.registerTool(
    "search_components",
    {
      title: "Search components",
      description:
        "Find components by what you need, for example 'dropdown', 'status pill', 'date field' or 'kanban'. Ranks matches over names, exports, keywords, summaries and when-to-use guidance.",
      inputSchema: {
        query: z.string().min(1).max(200).describe("Words describing the UI you need.").meta({ examples: [ex.query] }),
      },
      outputSchema: {
        query: z.string(),
        results: z.array(
          z.object({ name: z.string(), category: z.string(), summary: z.string(), score: z.number(), matched: z.array(z.string()) }),
        ),
      },
      annotations: { title: "Search components", ...READ_ONLY },
    },
    async ({ query }) => {
      const hits = searchComponents(catalog.entries, query);
      const terms = query.toLowerCase().split(/[^a-z0-9]+/).filter((t) => t.length >= 3);
      const alsoExported = catalog
        .uncatalogued()
        .filter((a) => a.kind !== "external" && terms.some((t) => a.name.toLowerCase().includes(t)))
        .map((a) => a.name);
      return text(renderSearch(query, hits, alsoExported), {
        query,
        results: hits.map((h) => ({ name: h.entry.name, category: h.entry.category, summary: h.entry.summary, score: h.score, matched: h.matched })),
      });
    },
  );

  server.registerTool(
    "get_color_tokens",
    {
      title: "Colour tokens",
      description:
        "Colour tokens as CSS custom properties with their light and dark values: semantic roles (canvas, surface, text, hairline …), the neutral ramp, the hue ramps that may only appear inside Chip, and themed effects such as shadows. Use var(--token), never a literal colour.",
      inputSchema: {
        group: z
          .enum(COLOR_GROUPS)
          .optional()
          .describe("roles: semantic tokens to use first. neutral: the achromatic ramp. hues: the state ramps, only inside Chip. effects: shadows. Omit for all.")
          .meta({ examples: ["roles"] }),
      },
      annotations: { title: "Colour tokens", ...READ_ONLY },
    },
    async ({ group }) => text(renderColorTokens(catalog, group)),
  );

  server.registerTool(
    "get_typography",
    {
      title: "Typography",
      description:
        "The type classes (.h1, .body, .small, .caps, .num, .kpi …) with font, size, line height, weight and tracking, the font tokens, and the ink classes (.text-1 … .text-4). Text sizes must come from these classes.",
      annotations: { title: "Typography", ...READ_ONLY },
    },
    async () => text(renderTypography(catalog)),
  );

  server.registerTool(
    "get_icons_guide",
    {
      title: "Icons guide",
      description: "How to use icons: Hugeicons Stroke Rounded through <Icon> or an icon prop, the size for each context, common icon names, the Icon props and the status glyphs.",
      annotations: { title: "Icons guide", ...READ_ONLY },
    },
    async () => text(renderIconsGuide(catalog)),
  );

  server.registerTool(
    "get_hard_rules",
    {
      title: "Hard rules",
      description:
        "The non-negotiable rules of the design system, each with its reason and whether validate_code checks it automatically. Call this before writing any UI.",
      annotations: { title: "Hard rules", ...READ_ONLY },
    },
    async () => text(renderHardRules(catalog)),
  );

  server.registerTool(
    "get_element_mapping",
    {
      title: "Element mapping",
      description: "Which component replaces each raw HTML element (<button> → Button, <table> → Table …), flagging names the package does not export yet.",
      annotations: { title: "Element mapping", ...READ_ONLY },
    },
    async () => text(renderElementMapping(catalog)),
  );

  server.registerTool(
    "get_app_setup",
    {
      title: "App setup",
      description:
        "How to set up an app with @puckoops/camelot: install, the stylesheet, fonts, ThemeProvider, TooltipProvider, Toaster and the pre-paint theme script (Next.js App Router), plus the peer dependencies.",
      annotations: { title: "App setup", ...READ_ONLY },
    },
    async () => text(renderAppSetup(catalog)),
  );

  server.registerTool(
    "validate_code",
    {
      title: "Validate code",
      description:
        "Check TSX, JSX or CSS against every machine-checkable hard rule. Reports each violation's rule id, message, line, column and offending text, with a pass/fail summary and the rules that need a manual review. Run it on UI code before you finish.",
      inputSchema: {
        code: z.string().min(1).max(200_000).describe("The source to check. Pass whole files.").meta({ examples: [VALIDATE_EXAMPLE] }),
      },
      outputSchema: {
        pass: z.boolean(),
        lineCount: z.number().int(),
        violationCount: z.number().int(),
        truncated: z.boolean(),
        violations: z.array(
          z.object({
            ruleId: z.string(),
            message: z.string(),
            line: z.number().int(),
            column: z.number().int(),
            text: z.string(),
            lineText: z.string(),
          }),
        ),
        checkedRules: z.array(z.string()),
        uncheckedRules: z.array(z.string()),
        skippedPatterns: z.array(z.object({ ruleId: z.string(), pattern: z.string(), error: z.string() })),
      },
      annotations: { title: "Validate code", ...READ_ONLY },
    },
    async ({ code }) => {
      const report = validateCode(catalog.data.rules.hardRules, code);
      return text(renderValidation(catalog, report), { ...report, violationCount: report.violations.length });
    },
  );

  server.registerTool(
    "get_docs",
    {
      title: "Docs links",
      description:
        "URLs on the Camelot docs site: one component's or hook's docs page, or every page (plus the introduction and these MCP docs) when component is omitted.",
      inputSchema: {
        component: componentName.optional().meta({ examples: [ex.component] }),
      },
      outputSchema: {
        baseUrl: z.string(),
        introductionUrl: z.string(),
        mcpDocsUrl: z.string(),
        pages: z.array(z.object({ name: z.string(), url: z.string(), hasDocs: z.boolean() })),
      },
      annotations: { title: "Docs links", ...READ_ONLY },
    },
    async ({ component }) => {
      const found = component ? catalog.find(component) : undefined;
      if (component && !found) return failure(notFound(catalog, component));
      const entries = found ? [found.entry] : catalog.entries;
      return text(renderDocs(catalog, found?.entry), {
        baseUrl: catalog.docsUrl,
        introductionUrl: catalog.introUrl(),
        mcpDocsUrl: catalog.mcpDocsUrl(),
        pages: entries.map((e) => ({ name: e.name, url: catalog.pageUrl(e), hasDocs: e.hasDocs })),
      });
    },
  );

  server.registerTool(
    "get_full_guide",
    {
      title: "Full guide",
      description:
        "Everything in one markdown document: principles, hard rules, app setup, every component with its props, element mapping, colour and other tokens, typography, icons and docs links. It is long; prefer the focused tools when you know what you need.",
      annotations: { title: "Full guide", ...READ_ONLY },
    },
    async () => text(renderFullGuide(catalog)),
  );

  registerResources(server, catalog);
  return server;
}

function registerResources(server: McpServer, catalog: Catalog) {
  const json = (value: unknown) => JSON.stringify(value, null, 2);
  const fixed: [string, string, string, string, () => string][] = [
    ["catalog", "camelot://catalog.json", "application/json", "The whole generated catalogue: components, props, tokens, typography and rules.", () => json(catalog.data)],
    ["guide", "camelot://guide.md", "text/markdown", "The full guide as one markdown document.", () => renderFullGuide(catalog)],
    ["tokens", "camelot://tokens.json", "application/json", "Every design token with light and dark values.", () => json(catalog.data.tokens)],
    ["rules", "camelot://rules.json", "application/json", "Hard rules, element mapping, icons guide and app setup.", () => json(catalog.data.rules)],
  ];
  for (const [name, uri, mimeType, description, read] of fixed) {
    server.registerResource(name, uri, { title: `Camelot ${name}`, description, mimeType }, async (url) => ({
      contents: [{ uri: url.href, mimeType, text: read() }],
    }));
  }
  const names = catalog.entries.map(shortName);
  server.registerResource(
    "component",
    new ResourceTemplate("camelot://components/{name}", {
      list: async () => ({
        resources: catalog.entries.map((e) => ({
          uri: `camelot://components/${encodeURIComponent(shortName(e))}`,
          name: shortName(e),
          description: e.summary,
          mimeType: "text/markdown",
        })),
      }),
      complete: { name: (value) => names.filter((n) => n.toLowerCase().startsWith(value.toLowerCase())) },
    }),
    { title: "Camelot component", description: "One component's details, props and guidance.", mimeType: "text/markdown" },
    async (url, variables) => {
      const raw = variables.name;
      const name = decodeURIComponent(Array.isArray(raw) ? (raw[0] ?? "") : (raw ?? ""));
      const found = catalog.find(name);
      if (!found) throw new Error(notFound(catalog, name));
      return { contents: [{ uri: url.href, mimeType: "text/markdown", text: renderComponentDetails(catalog, found.entry) }] };
    },
  );
}
