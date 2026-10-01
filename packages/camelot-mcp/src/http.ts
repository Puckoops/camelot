import { createServer, type IncomingMessage, type Server, type ServerResponse } from "node:http";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import type { Catalog } from "./catalog.js";
import { corsHeaders } from "./cors.js";
import { HEALTH_PATH, healthInfo, MCP_PATH, NO_SSE_MESSAGE, rpcError } from "./endpoint.js";
import { createMcpServer } from "./mcp.js";

export interface HttpOptions {
  catalog: Catalog;
  corsOrigin?: string;
  log?: (message: string) => void;
}

function applyCors(req: IncomingMessage, res: ServerResponse, origin: string) {
  const headers = corsHeaders(origin, {
    requestHeaders: String(req.headers["access-control-request-headers"] ?? ""),
    privateNetwork: req.headers["access-control-request-private-network"] === "true",
  });
  for (const [name, value] of Object.entries(headers)) res.setHeader(name, value);
}

function sendJson(res: ServerResponse, status: number, body: unknown, headers: Record<string, string> = {}) {
  res.writeHead(status, { "Content-Type": "application/json", ...headers });
  res.end(JSON.stringify(body));
}

export function createHttpHandler({ catalog, corsOrigin = "*", log = (m) => console.error(m) }: HttpOptions) {
  return async (req: IncomingMessage, res: ServerResponse) => {
    applyCors(req, res, corsOrigin);
    const path = new URL(req.url ?? "/", "http://localhost").pathname.replace(/\/+$/, "") || "/";
    if (req.method === "OPTIONS") {
      res.writeHead(204).end();
      return;
    }
    if (path === HEALTH_PATH) {
      if (req.method === "GET" || req.method === "HEAD") sendJson(res, 200, healthInfo(catalog));
      else sendJson(res, 405, { error: "Method not allowed" }, { Allow: "GET, HEAD, OPTIONS" });
      return;
    }
    if (path === MCP_PATH) {
      if (req.method === "GET") {
        sendJson(res, 405, rpcError(NO_SSE_MESSAGE), { Allow: "POST, DELETE, OPTIONS" });
        return;
      }
      if (req.method !== "POST" && req.method !== "DELETE") {
        sendJson(res, 405, rpcError("Method not allowed."), { Allow: "GET, POST, DELETE, OPTIONS" });
        return;
      }
      const server = createMcpServer(catalog);
      const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined, enableJsonResponse: true });
      res.on("close", () => {
        void transport.close();
        void server.close();
      });
      try {
        await server.connect(transport);
        await transport.handleRequest(req, res);
      } catch (error) {
        log(`MCP request failed: ${error instanceof Error ? (error.stack ?? error.message) : String(error)}`);
        if (!res.headersSent) sendJson(res, 500, rpcError("Internal server error", -32603));
      }
      return;
    }
    if (path === "/") {
      sendJson(res, 200, { ...healthInfo(catalog), mcpDocs: catalog.mcpDocsUrl() });
      return;
    }
    sendJson(res, 404, { error: "Not found", endpoints: [MCP_PATH, HEALTH_PATH] });
  };
}

export function startHttpServer(options: HttpOptions & { port: number; host?: string }): Promise<Server> {
  const handler = createHttpHandler(options);
  const server = createServer((req, res) => void handler(req, res));
  return new Promise((resolve, reject) => {
    server.once("error", reject);
    const onListening = () => {
      server.off("error", reject);
      resolve(server);
    };
    if (options.host) server.listen(options.port, options.host, onListening);
    else server.listen(options.port, onListening);
  });
}
