import type { ComponentType } from "react";
import type { McpStorySlug } from "@/lib/pages";
import { HowToUse } from "./HowToUse";
import { ToolReference } from "./ToolReference";
import { TryItOut } from "./TryItOut";

export const MCP_CONTENT: Record<McpStorySlug, { Content: ComponentType; code: string; summary: string }> = {
  "how-to-use": {
    Content: HowToUse,
    code: "<HowToUse />",
    summary: "Connect an AI coding assistant to the Camelot MCP server, served from this site at /mcp.",
  },
  "tool-reference": {
    Content: ToolReference,
    code: "<ToolReference />",
    summary: "Every tool the Camelot MCP server exposes, read live from its endpoint, with parameters, output schemas and a sample response for each.",
  },
  "try-it-out": {
    Content: TryItOut,
    code: "<TryItOut />",
    summary: "Call the Camelot MCP server's tools from the browser and read the JSON-RPC response.",
  },
};
