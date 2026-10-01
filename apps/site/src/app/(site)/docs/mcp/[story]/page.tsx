import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MCP_CONTENT } from "@/components/mcp/stories";
import { StaticStory } from "@/docs/StoryView";
import { MCP_STORIES } from "@/lib/pages";

export const dynamicParams = false;

export function generateStaticParams() {
  return MCP_STORIES.map((s) => ({ story: s.slug }));
}

async function find(params: Promise<{ story: string }>) {
  const { story } = await params;
  const meta = MCP_STORIES.find((s) => s.slug === story);
  return meta && { ...meta, ...MCP_CONTENT[meta.slug] };
}

export async function generateMetadata({ params }: PageProps<"/docs/mcp/[story]">): Promise<Metadata> {
  const story = await find(params);
  return story ? { title: `${story.name} · Camelot MCP`, description: story.summary } : {};
}

export default async function McpStoryPage({ params }: PageProps<"/docs/mcp/[story]">) {
  const story = await find(params);
  if (!story) notFound();
  const { Content } = story;
  return (
    <StaticStory layout="fullscreen" code={story.code}>
      <Content />
    </StaticStory>
  );
}
