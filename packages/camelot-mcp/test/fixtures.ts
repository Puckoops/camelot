import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { buildCatalog } from "../scripts/catalog/build.js";
import { docsPathOf } from "../scripts/catalog/docs.js";
import { CATALOG_SCHEMA_VERSION, type CatalogFile, type ComponentEntry, type HardRule } from "../src/catalog-types.js";
import { Catalog } from "../src/catalog.js";

export const DESIGN_SYSTEM_ROOT = resolve(fileURLToPath(new URL("../../camelot", import.meta.url)));
export const DOCS_ROOT = resolve(fileURLToPath(new URL("../../../apps/site/src/content", import.meta.url)));

export const TOOL_NAMES = [
  "get_components",
  "get_component_details",
  "compare_components",
  "search_components",
  "get_color_tokens",
  "get_typography",
  "get_icons_guide",
  "get_hard_rules",
  "get_element_mapping",
  "get_app_setup",
  "validate_code",
  "get_docs",
  "get_full_guide",
];

let real: Promise<Catalog> | undefined;

export function realCatalog() {
  real ??= buildCatalog({ root: DESIGN_SYSTEM_ROOT, docsRoot: DOCS_ROOT }).then((data) => new Catalog(data));
  return real;
}

type EntryInput = Pick<ComponentEntry, "name" | "category" | "summary" | "exports"> & Partial<ComponentEntry>;

export function entry(e: EntryInput): ComponentEntry {
  return {
    import: `import { ${e.exports.join(", ")} } from "@puckoops/camelot";`,
    whenToUse: "",
    useInstead: [],
    keywords: [],
    docsPath: docsPathOf(e.name),
    hasDocs: true,
    types: [],
    missingExports: [],
    ...e,
  };
}

export const fixtureEntries: ComponentEntry[] = [
  entry({
    name: "Button",
    category: "Actions",
    summary: "A one-shot action in three variants.",
    exports: ["Button", "IconButton"],
    whenToUse: "Use Button for anything that fires an action. Use IconButton for a single-glyph toolbar action.",
    useInstead: [
      { name: "TextLink", when: "when the action navigates somewhere." },
      { name: "Menu", when: "when one trigger offers several actions." },
    ],
    keywords: ["cta", "submit", "icon button"],
  }),
  entry({
    name: "Select",
    category: "Forms",
    summary: "Pick one value from a list, as a form field or a filter button.",
    exports: ["Select"],
    whenToUse: 'Use variant="field" inside forms and variant="filter" in filter rows.',
    useInstead: [
      { name: "SegmentedControl", when: "for two to five options that should all stay visible." },
      { name: "ChoiceGroup", when: "for options shown as chips." },
    ],
    keywords: ["dropdown", "picker", "filter", "combobox"],
  }),
  entry({
    name: "SegmentedControl",
    category: "Navigation",
    summary: "Two to five mutually exclusive views in a trough.",
    exports: ["SegmentedControl"],
    whenToUse: "Use SegmentedControl to switch views without leaving the page.",
    useInstead: [
      { name: "Tabs", when: "when each option is a distinct section." },
      { name: "ChoiceGroup", when: "when the options are form values rather than views." },
    ],
    keywords: ["tabs", "toggle group", "view switch"],
  }),
  entry({
    name: "ChoiceGroup",
    category: "Forms",
    summary: "A single choice shown as pills or chips.",
    exports: ["ChoiceGroup"],
    useInstead: [{ name: "Select", when: "when there are more than about six options." }],
    keywords: ["radio", "pills", "quick filter"],
  }),
  entry({
    name: "Menu",
    category: "Overlays",
    summary: "A dropdown of actions or links from one trigger.",
    exports: ["Menu", "MenuItem"],
    useInstead: [{ name: "Select", when: "when the user is choosing a value, not an action." }],
    keywords: ["dropdown", "actions", "context menu"],
  }),
  entry({
    name: "Chip",
    category: "Status",
    summary: "The only place a hue may appear: a state label with its glyph.",
    exports: ["Chip", "Glyph"],
    whenToUse: "Use Chip for a state such as task status.",
    useInstead: [
      { name: "PriorityMark", when: "for priority, which is glyph and ink only." },
      { name: "Badge", when: "for a count or a neutral tag that is not a state." },
    ],
    keywords: ["status", "tag", "pill", "state"],
  }),
  entry({
    name: "PriorityMark",
    category: "Status",
    summary: "P1 / P2 / P3 as a glyph and a word.",
    exports: ["PriorityMark"],
    useInstead: [{ name: "Chip", when: "for a status or stage, not a priority." }],
    keywords: ["priority", "urgency"],
  }),
  entry({
    name: "DateInput",
    category: "Forms",
    summary: "A date field that opens a month calendar.",
    exports: ["DateInput", "Calendar"],
    keywords: ["date picker", "calendar", "due date"],
  }),
  entry({
    name: "Table",
    category: "Data",
    summary: "The product's table with three densities.",
    exports: ["Table", "Tr", "Td"],
    useInstead: [{ name: "Cards/ListCard", when: "for five rows or fewer of label and value." }],
    keywords: ["grid", "data table", "rows"],
  }),
  entry({
    name: "Cards/ListCard",
    category: "Cards",
    summary: "Three to five label and value rows under a title.",
    exports: ["ListCard"],
    useInstead: [{ name: "Table", when: "for more than five rows." }],
    keywords: ["list", "summary"],
  }),
  entry({
    name: "Board",
    category: "Data",
    summary: "Status columns of cards.",
    exports: ["Board", "BoardColumn"],
    keywords: ["kanban", "columns", "tracker"],
  }),
  entry({
    name: "TextLink",
    category: "Navigation",
    summary: "An underlined inline link.",
    exports: ["TextLink"],
    keywords: ["link", "anchor"],
  }),
];

export const fixtureRules: HardRule[] = [
  {
    id: "tokens-only",
    rule: "Colour comes from tokens.",
    why: "Dark mode works everywhere.",
    detect: [
      { pattern: "#[0-9a-fA-F]{3,8}\\b", message: "Literal hex colour." },
      { pattern: "\\b(?:rgb|rgba|hsl|hsla|oklch)\\(", message: "Literal colour function." },
    ],
  },
  {
    id: "glyph-with-state",
    rule: "Every status carries its glyph.",
    why: "Greyscale still reads.",
    detect: [{ pattern: "<Chip(?![^>]*\\bglyph=)[^>]*>", message: "Chip without a glyph." }],
  },
  {
    id: "type-classes",
    rule: "Text sizes come from the type classes.",
    why: "Ad-hoc sizes drift.",
    detect: [{ pattern: "font-?[sS]ize\\s*[:=]\\s*['\"{]?\\d", message: "Literal font size." }],
  },
  { id: "one-hero", rule: "One hero figure per screen.", why: "Five heroes is no hero.", detect: [] },
];

export function fixtureCatalog(entries: ComponentEntry[] = fixtureEntries): Catalog {
  const empty = { value: "", resolved: "", chain: [] };
  const data: CatalogFile = {
    schemaVersion: CATALOG_SCHEMA_VERSION,
    generatedAt: "2026-01-01T00:00:00.000Z",
    package: { name: "@puckoops/camelot", version: "0.0.0-test", peerDependencies: { react: "^19.0.0" } },
    docs: { baseUrl: "http://docs.test", pages: [] },
    principles: { tagline: "Chrome is achromatic.", points: [], readmeRules: [] },
    categories: [...new Set(entries.map((e) => e.category))],
    components: entries,
    api: Object.fromEntries(
      entries.flatMap((e) => e.exports).map((name) => [name, { name, kind: "component" as const, source: `src/${name}.tsx`, props: { extends: [], props: [] } }]),
    ),
    tokens: {
      notes: [],
      selectors: { light: [":root"], dark: ['[data-theme="dark"]'] },
      colors: [{ name: "--text-1", group: "role", family: "text", light: { ...empty, resolved: "#111111" }, dark: { ...empty, resolved: "#eeeeee" }, usage: [] }],
      effects: [],
      spacing: [],
      radius: [],
      layout: [],
      fonts: [],
      motion: [],
      utilities: [],
    },
    typography: { classes: [], inkClasses: [], notes: [] },
    rules: { hardRules: fixtureRules, elementMapping: [], iconsGuide: "", appSetup: "" },
    warnings: [],
  };
  return new Catalog(data);
}
