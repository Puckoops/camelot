import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DocsPage } from "@/docs/DocsPage";
import { apiFor, catalogEntry, docsLinks, docsPage, docsPages } from "@/lib/data";

export const dynamicParams = false;

export function generateStaticParams() {
  return docsPages("hook").map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/docs/hooks/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const page = docsPage("hook", slug);
  const entry = page && catalogEntry(page.name);
  return entry ? { title: entry.name, description: entry.summary } : {};
}

export default async function HookPage({ params }: PageProps<"/docs/hooks/[slug]">) {
  const { slug } = await params;
  const page = docsPage("hook", slug);
  const entry = page && catalogEntry(page.name);
  if (!page || !entry) notFound();
  return <DocsPage page={page} entry={entry} api={apiFor(entry)} links={docsLinks()} />;
}
