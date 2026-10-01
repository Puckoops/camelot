import type { Catalog } from "./catalog.js";
import { SERVER_NAME, SERVER_VERSION } from "./mcp.js";

export const MCP_PATH = "/mcp";
export const HEALTH_PATH = "/health";
export const TRANSPORT = "streamable-http (stateless, JSON responses)";
export const NO_SSE_MESSAGE = `This server is stateless and does not open an SSE stream. POST JSON-RPC messages to ${MCP_PATH}.`;

export const rpcError = (message: string, code = -32000) => ({ jsonrpc: "2.0", error: { code, message }, id: null });

export function healthInfo(catalog: Catalog) {
  return {
    status: "ok",
    name: SERVER_NAME,
    version: SERVER_VERSION,
    package: `${catalog.data.package.name}@${catalog.data.package.version}`,
    components: catalog.entries.length,
    catalogGeneratedAt: catalog.data.generatedAt,
    docs: catalog.docsUrl,
    endpoint: MCP_PATH,
    transport: TRANSPORT,
  };
}
