import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TokenPage } from "@/components/tokens/TokenDocs";
import { tokenPage } from "@/components/tokens/pages";
import { Description, DocsWrapper, Title } from "@/docs/Doc";
import { TOKEN_PAGES } from "@/lib/pages";

export const dynamicParams = false;

export function generateStaticParams() {
  return TOKEN_PAGES.map((t) => ({ token: t.slug }));
}

export async function generateMetadata({ params }: PageProps<"/docs/tokens/[token]">): Promise<Metadata> {
  const page = tokenPage((await params).token);
  return page ? { title: page.name, description: page.summary } : {};
}

export default async function TokenDocsPage({ params }: PageProps<"/docs/tokens/[token]">) {
  const page = tokenPage((await params).token);
  if (!page) notFound();
  const { Content } = page;
  return (
    <DocsWrapper>
      <Title>{page.name}</Title>
      <Description text={page.description} />
      <TokenPage>
        <Content />
      </TokenPage>
    </DocsWrapper>
  );
}
