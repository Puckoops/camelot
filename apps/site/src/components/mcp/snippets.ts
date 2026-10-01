export interface SnippetBlock {
  label: string;
  code: string;
}

export interface ClientSnippet {
  id: string;
  label: string;
  intro: string;
  blocks: SnippetBlock[];
}

export const STDIO_ENTRY = "/path/to/camelot/packages/camelot-mcp/dist/server.js";
export const LOCAL_LABEL = "Or run it locally over stdio";

const json = (value: unknown) => JSON.stringify(value, null, 2);

const curl = (endpoint: string, body: unknown) =>
  [
    `curl -s ${endpoint} \\`,
    `  -H 'Content-Type: application/json' \\`,
    `  -H 'Accept: application/json, text/event-stream' \\`,
    `  -d '${JSON.stringify(body)}'`,
  ].join("\n");

export function clientSnippets(endpoint: string): ClientSnippet[] {
  return [
    {
      id: "claude-code",
      label: "Claude Code",
      intro: "Run it once. --scope user makes the server available in every project on this machine.",
      blocks: [
        { label: "Terminal", code: `claude mcp add camelot --scope user --transport http ${endpoint}` },
        { label: LOCAL_LABEL, code: `claude mcp add camelot --scope user -- node ${STDIO_ENTRY} --stdio` },
      ],
    },
    {
      id: "cursor",
      label: "Cursor",
      intro: "Add it to ~/.cursor/mcp.json for every project, or to .cursor/mcp.json in one project.",
      blocks: [
        { label: "mcp.json", code: json({ mcpServers: { camelot: { url: endpoint } } }) },
        { label: LOCAL_LABEL, code: json({ mcpServers: { camelot: { command: "node", args: [STDIO_ENTRY, "--stdio"] } } }) },
      ],
    },
    {
      id: "claude-desktop",
      label: "Claude Desktop",
      intro: "Claude Desktop starts its servers as local processes. Add this under Settings → Developer → Edit Config, then restart the app; mcp-remote bridges to the endpoint.",
      blocks: [
        { label: "claude_desktop_config.json", code: json({ mcpServers: { camelot: { command: "npx", args: ["-y", "mcp-remote", endpoint] } } }) },
        { label: LOCAL_LABEL, code: json({ mcpServers: { camelot: { command: "node", args: [STDIO_ENTRY, "--stdio"] } } }) },
      ],
    },
    {
      id: "vscode",
      label: "VS Code",
      intro: "Add it to .vscode/mcp.json in the workspace, or run “MCP: Add Server” from the command palette.",
      blocks: [
        { label: ".vscode/mcp.json", code: json({ servers: { camelot: { type: "http", url: endpoint } } }) },
        { label: LOCAL_LABEL, code: json({ servers: { camelot: { type: "stdio", command: "node", args: [STDIO_ENTRY, "--stdio"] } } }) },
      ],
    },
    {
      id: "curl",
      label: "curl",
      intro: "The endpoint is JSON-RPC over HTTP and keeps no session, so any request can come first. Send both Accept types.",
      blocks: [
        { label: "List the tools", code: curl(endpoint, { jsonrpc: "2.0", id: 1, method: "tools/list" }) },
        {
          label: "Call a tool",
         
          code: curl(endpoint, { jsonrpc: "2.0", id: 2, method: "tools/call", params: { name: "get_hard_rules", arguments: {} } }),
        },
      ],
    },
  ];
}
