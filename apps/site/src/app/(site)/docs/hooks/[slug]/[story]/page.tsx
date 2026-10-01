import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { StoryPage } from "@/docs/StoryPage";
import { apiFor, catalogEntry, docsPage, docsPages } from "@/lib/data";
import { slugOf } from "@/lib/slug";

export const dynamicParams = false;

export function generateStaticParams() {
  return docsPages("hook").flatMap((p) => p.examples.map((e) => ({ slug: p.slug, story: slugOf(e.export) })));
}

function find(slug: string, story: string) {
  const page = docsPage("hook", slug);
  const example = page?.examples.find((e) => slugOf(e.export) === story);
  const entry = page && catalogEntry(page.name);
  return page && example && entry ? { page, example, entry } : undefined;
}

export async function generateMetadata({ params }: PageProps<"/docs/hooks/[slug]/[story]">): Promise<Metadata> {
  const { slug, story } = await params;
  const found = find(slug, story);
  return found ? { title: `${found.example.name} · ${found.entry.name.split("/").pop()}`, description: found.entry.summary } : {};
}

export default async function HookStoryPage({ params }: PageProps<"/docs/hooks/[slug]/[story]">) {
  const { slug, story } = await params;
  const found = find(slug, story);
  if (!found) notFound();
  return <StoryPage page={found.page} entry={found.entry} api={apiFor(found.entry)} exportName={found.example.export} />;
}
