import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TokenPage } from "@/components/tokens/TokenDocs";
import { tokenPage } from "@/components/tokens/pages";
import { StaticStory } from "@/docs/StoryView";
import { TOKEN_PAGES } from "@/lib/pages";

export const dynamicParams = false;

export function generateStaticParams() {
  return TOKEN_PAGES.map((t) => ({ token: t.slug, story: t.story.slug }));
}

async function find(params: Promise<{ token: string; story: string }>) {
  const { token, story } = await params;
  const page = tokenPage(token);
  return page?.story.slug === story ? page : undefined;
}

export async function generateMetadata({ params }: PageProps<"/docs/tokens/[token]/[story]">): Promise<Metadata> {
  const page = await find(params);
  return page ? { title: `${page.story.name} · ${page.name}`, description: page.summary } : {};
}

export default async function TokenStoryPage({ params }: PageProps<"/docs/tokens/[token]/[story]">) {
  const page = await find(params);
  if (!page) notFound();
  const { Content } = page;
  return (
    <StaticStory code={page.code}>
      <TokenPage>
        <Content />
      </TokenPage>
    </StaticStory>
  );
}
