import "server-only";
import catalogJson from "@generated/catalog.json";
import pagesJson from "@generated/pages.json";
import { MCP_DOCS, MCP_STORIES, mcpStoryHref, TOKEN_PAGES } from "./pages";
import { docsHref, idOf, previewHref, storyHref } from "./slug";
import type { ApiEntry, CatalogEntry, DocsPageSource, TreeBranch, TreeLeaf, TreeNode } from "./types";

interface Catalog {
  package: { name: string; version: string; description?: string };
  categories: string[];
  components: CatalogEntry[];
  api: Record<string, ApiEntry>;
  rules: { hardRules: { id: string; rule: string; why: string }[] };
}

export const catalog = catalogJson as unknown as Catalog;
const pages = pagesJson as DocsPageSource[];

export function hrefFor(page: Pick<DocsPageSource, "kind" | "slug">) {
  return docsHref(page.kind, page.slug);
}

export function docsPages(kind: DocsPageSource["kind"]) {
  return pages.filter((p) => p.kind === kind);
}

export function docsPage(kind: DocsPageSource["kind"], slug: string) {
  return pages.find((p) => p.kind === kind && p.slug === slug);
}

export function catalogEntry(name: string) {
  return catalog.components.find((c) => c.name === name);
}

export function apiFor(entry: CatalogEntry) {
  return entry.exports.map((name) => catalog.api[name]).filter((a): a is ApiEntry => Boolean(a));
}

/** Every catalogue name and export, mapped to the page that documents it. */
export function docsLinks() {
  const links: Record<string, string> = {};
  for (const page of pages) {
    const entry = catalogEntry(page.name);
    const href = hrefFor(page);
    links[page.name] = href;
    for (const name of entry?.exports ?? []) links[name] ??= href;
  }
  return links;
}

function leaf(type: TreeLeaf["type"], id: string, name: string, href: string, extra: Pick<TreeLeaf, "preview" | "keywords"> = {}): TreeLeaf {
  return { type, id, name, href, ...extra };
}

function componentNode(page: DocsPageSource, id: string, name: string): TreeBranch {
  const entry = catalogEntry(page.name);
  const keywords = [page.name, ...(entry?.exports ?? []), ...(entry?.keywords ?? [])];
  return {
    type: "component",
    id,
    name,
    category: entry?.category,
    children: [
      leaf("docs", `${id}--docs`, "Docs", hrefFor(page), { keywords }),
      ...page.examples.map((e) =>
        leaf("story", `${id}--${idOf(e.export)}`, e.name, storyHref(page.kind, page.slug, e.export), { preview: previewHref(page.kind, page.slug, e.export) }),
      ),
    ],
  };
}

/** Catalogue names with a folder, such as Cards/FigureCard, sit inside that folder, which sorts among the rest. */
function withFolders(root: string, list: DocsPageSource[]): TreeNode[] {
  const top: TreeNode[] = [];
  const folders = new Map<string, TreeBranch>();
  for (const page of list) {
    const [folder, ...rest] = page.name.split("/");
    if (rest.length === 0) {
      top.push(componentNode(page, idOf(root, page.name), page.name));
      continue;
    }
    let group = folders.get(folder!);
    if (!group) {
      group = { type: "group", id: idOf(root, folder!), name: folder!, children: [] };
      folders.set(folder!, group);
      top.push(group);
    }
    group.children.push(componentNode(page, idOf(root, page.name), rest.join("/")));
  }
  const byName = (a: TreeNode, b: TreeNode) => a.name.localeCompare(b.name);
  for (const g of folders.values()) g.children.sort(byName);
  return top.sort(byName);
}

/** The sidebar, laid out the way the Storybook it replaced was: roots, then components holding a docs page and their stories. */
export function tree(): TreeNode[] {
  const tokens: TreeBranch = {
    type: "root",
    id: "design-tokens",
    name: "Design Tokens",
    children: TOKEN_PAGES.map((t) => {
      const id = idOf("design-tokens", t.name);
      return {
        type: "component",
        id,
        name: t.name,
        children: [
          leaf("docs", `${id}--docs`, "Docs", `/docs/tokens/${t.slug}`),
          leaf("story", `${id}--${t.story.slug}`, t.story.name, `/docs/tokens/${t.slug}/${t.story.slug}`, { preview: `/preview/tokens/${t.slug}/${t.story.slug}` }),
        ],
      };
    }),
  };
  const mcp: TreeBranch = {
    type: "root",
    id: "mcp",
    name: "MCP",
    children: [
      {
        type: "component",
        id: "mcp-camelot-mcp",
        name: "Camelot MCP",
        children: [
          leaf("docs", "mcp-camelot-mcp--docs", "Docs", MCP_DOCS, { keywords: ["mcp", "server", "assistant", "ai"] }),
          ...MCP_STORIES.map((s) => leaf("story", `mcp-camelot-mcp--${s.slug}`, s.name, mcpStoryHref(s.slug), { preview: `/preview/mcp/camelot-mcp/${s.slug}` })),
        ],
      },
    ],
  };
  const roots: TreeNode[] = [
    leaf("docs", "introduction--docs", "Introduction", "/"),
    tokens,
    { type: "root", id: "ui", name: "ui", children: withFolders("ui", docsPages("component")) },
    { type: "root", id: "hooks", name: "Hooks", children: withFolders("hooks", docsPages("hook")) },
    mcp,
  ];
  return roots.filter((n) => n.type !== "root" || n.children.length > 0);
}
