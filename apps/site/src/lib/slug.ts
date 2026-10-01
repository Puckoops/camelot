/** "Cards/FigureCard" → "cards-figure-card", "useFileUpload" → "use-file-upload", "AllVariants" → "all-variants". */
export function slugOf(name: string) {
  return name
    .replace(/\//g, "-")
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/([A-Z])([A-Z][a-z])/g, "$1-$2")
    .toLowerCase();
}

/** A sidebar id the way Storybook writes one: "ui/Cards/FigureCard" → "ui-cards-figurecard". */
export function idOf(...parts: string[]) {
  return parts
    .join("-")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const SECTION = { component: "components", hook: "hooks" } as const;

export function docsHref(kind: "component" | "hook", slug: string) {
  return `/docs/${SECTION[kind]}/${slug}`;
}

export function storyHref(kind: "component" | "hook", slug: string, exportName: string) {
  return `/docs/${SECTION[kind]}/${slug}/${slugOf(exportName)}`;
}

export function previewHref(kind: "component" | "hook", slug: string, exportName: string) {
  return `/preview/${SECTION[kind]}/${slug}/${slugOf(exportName)}`;
}
