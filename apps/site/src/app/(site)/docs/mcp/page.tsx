import type { Metadata } from "next";
import { HowToUse } from "@/components/mcp/HowToUse";
import { DocsWrapper } from "@/docs/Doc";

export const metadata: Metadata = {
  title: "Camelot MCP",
  description: "Connect an AI coding assistant to the Camelot MCP server: the component catalogue, design tokens and hard rules as tools, served from this site at /mcp.",
};

export default function McpPage() {
  return (
    <DocsWrapper>
      <HowToUse />
    </DocsWrapper>
  );
}
