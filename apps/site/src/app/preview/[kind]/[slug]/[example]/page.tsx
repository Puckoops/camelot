import { cn } from "@puckoops/camelot/helpers";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MCP_CONTENT } from "@/components/mcp/stories";
import { tokenPage } from "@/components/tokens/pages";
import { TokenPage } from "@/components/tokens/TokenDocs";
import { Preview } from "@/docs/Preview";
import { docsPage, docsPages } from "@/lib/data";
import { MCP_STORIES, TOKEN_PAGES } from "@/lib/pages";
import { slugOf } from "@/lib/slug";
import styles from "@/docs/docs.module.css";

export const dynamicParams = false;

const KINDS = { components: "component", hooks: "hook" } as const;

export function generateStaticParams() {
  return [
    ...(Object.keys(KINDS) as (keyof typeof KINDS)[]).flatMap((kind) =>
      docsPages(KINDS[kind]).flatMap((page) => page.examples.map((e) => ({ kind, slug: page.slug, example: slugOf(e.export) }))),
    ),
    ...TOKEN_PAGES.map((t) => ({ kind: "tokens", slug: t.slug, example: t.story.slug })),
    ...MCP_STORIES.map((s) => ({ kind: "mcp", slug: "camelot-mcp", example: s.slug })),
  ];
}

function find(params: { kind: string; slug: string; example: string }) {
  if (params.kind === "tokens") {
    const page = tokenPage(params.slug);
    return page?.story.slug === params.example ? ({ type: "tokens", title: `${page.story.name} · ${page.name}`, page } as const) : undefined;
  }
  if (params.kind === "mcp") {
    const story = params.slug === "camelot-mcp" ? MCP_STORIES.find((s) => s.slug === params.example) : undefined;
    return story ? ({ type: "mcp", title: `${story.name} · Camelot MCP`, story } as const) : undefined;
  }
  const kind = KINDS[params.kind as keyof typeof KINDS];
  const page = kind && docsPage(kind, params.slug);
  const example = page?.examples.find((e) => slugOf(e.export) === params.example);
  return page && example ? ({ type: "docs", title: `${example.name} · ${page.name.split("/").pop()}`, page, example } as const) : undefined;
}

export async function generateMetadata({ params }: PageProps<"/preview/[kind]/[slug]/[example]">): Promise<Metadata> {
  const found = find(await params);
  return found ? { title: found.title, robots: { index: false } } : {};
}

export default async function PreviewPage({ params }: PageProps<"/preview/[kind]/[slug]/[example]">) {
  const found = find(await params);
  if (!found) notFound();
  if (found.type === "tokens") {
    const { Content } = found.page;
    return (
      <div className={cn(styles.canvas, styles.bare, styles.padded)}>
        <TokenPage>
          <Content />
        </TokenPage>
      </div>
    );
  }
  if (found.type === "mcp") {
    const { Content } = MCP_CONTENT[found.story.slug];
    return (
      <div className={cn(styles.canvas, styles.bare, styles.fullscreen)}>
        <Content />
      </div>
    );
  }
  return <Preview slug={found.page.slug} exportName={found.example.export} />;
}
