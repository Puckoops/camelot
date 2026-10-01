import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import type { Catalog } from "./catalog.js";
import { corsHeaders } from "./cors.js";
import { healthInfo, NO_SSE_MESSAGE, rpcError } from "./endpoint.js";
import { createMcpServer } from "./mcp.js";

export interface WebHandlerOptions {
  corsOrigin?: string;
  log?: (message: string) => void;
}

const corsFor = (request: Request, origin: string) =>
  corsHeaders(origin, {
    requestHeaders: request.headers.get("access-control-request-headers"),
    privateNetwork: request.headers.get("access-control-request-private-network") === "true",
  });

const json = (status: number, body: unknown, headers: Record<string, string>) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json", ...headers } });

function withHeaders(response: Response, extra: Record<string, string>) {
  const headers = new Headers(response.headers);
  for (const [name, value] of Object.entries(extra)) headers.set(name, value);
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}

export async function handleMcpRequest(
  request: Request,
  catalog: Catalog,
  { corsOrigin = "*", log = (m) => console.error(m) }: WebHandlerOptions = {},
): Promise<Response> {
  const cors = corsFor(request, corsOrigin);
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
  if (request.method === "GET") return json(405, rpcError(NO_SSE_MESSAGE), { ...cors, Allow: "POST, DELETE, OPTIONS" });
  if (request.method !== "POST" && request.method !== "DELETE") {
    return json(405, rpcError("Method not allowed."), { ...cors, Allow: "GET, POST, DELETE, OPTIONS" });
  }
  const server = createMcpServer(catalog);
  const transport = new WebStandardStreamableHTTPServerTransport({ sessionIdGenerator: undefined, enableJsonResponse: true });
  try {
    await server.connect(transport);
    return withHeaders(await transport.handleRequest(request), cors);
  } catch (error) {
    log(`MCP request failed: ${error instanceof Error ? (error.stack ?? error.message) : String(error)}`);
    return json(500, rpcError("Internal server error", -32603), cors);
  } finally {
    await server.close();
  }
}

export function handleHealthRequest(request: Request, catalog: Catalog, { corsOrigin = "*" }: WebHandlerOptions = {}): Response {
  const cors = corsFor(request, corsOrigin);
  switch (request.method) {
    case "OPTIONS":
      return new Response(null, { status: 204, headers: cors });
    case "GET":
      return json(200, healthInfo(catalog), cors);
    case "HEAD":
      return new Response(null, { status: 200, headers: { "Content-Type": "application/json", ...cors } });
    default:
      return json(405, { error: "Method not allowed" }, { ...cors, Allow: "GET, HEAD, OPTIONS" });
  }
}
