#!/usr/bin/env node
import type { AddressInfo } from "node:net";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import type { Catalog } from "./catalog.js";
import { CatalogNotFoundError, loadCatalog } from "./catalog-file.js";
import { HEALTH_PATH, MCP_PATH } from "./endpoint.js";
import { startHttpServer } from "./http.js";
import { createMcpServer, SERVER_NAME, SERVER_VERSION } from "./mcp.js";

const args = process.argv.slice(2);
const flag = (name: string) => {
  const i = args.findIndex((a) => a === `--${name}` || a.startsWith(`--${name}=`));
  if (i < 0) return undefined;
  const arg = args[i]!;
  return arg.includes("=") ? arg.slice(arg.indexOf("=") + 1) : (args[i + 1] ?? "");
};

const stdio = args.includes("--stdio") || process.env.MCP_TRANSPORT === "stdio";

let catalog: Catalog;
try {
  catalog = loadCatalog({ path: flag("catalog"), docsUrl: flag("docs-url") });
} catch (error) {
  console.error(error instanceof CatalogNotFoundError ? error.message : error);
  process.exit(1);
}

const summary = `${catalog.entries.length} components from ${catalog.data.package.name}@${catalog.data.package.version}, catalogue built ${catalog.data.generatedAt}`;

if (stdio) {
  await createMcpServer(catalog).connect(new StdioServerTransport());
  console.error(`${SERVER_NAME} ${SERVER_VERSION} MCP server on stdio (${summary})`);
} else {
  const port = Number(flag("port") ?? process.env.PORT ?? 8787);
  const host = flag("host") ?? process.env.HOST;
  const server = await startHttpServer({ catalog, port, host, corsOrigin: process.env.CORS_ORIGIN || "*" });
  const address = server.address() as AddressInfo;
  const shown = !host || host === "0.0.0.0" || host === "::" ? "localhost" : host.includes(":") ? `[${host}]` : host;
  console.log(`${SERVER_NAME} ${SERVER_VERSION} MCP server at http://${shown}:${address.port}${MCP_PATH} (${summary})`);
  console.log(`Health: http://${shown}:${address.port}${HEALTH_PATH} · Docs links point at ${catalog.docsUrl}`);
  const stop = () => server.close(() => process.exit(0));
  process.once("SIGINT", stop);
  process.once("SIGTERM", stop);
}
