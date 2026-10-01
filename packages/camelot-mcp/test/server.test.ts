import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { startHttpServer } from "../src/http.js";
import { createMcpServer } from "../src/mcp.js";
import { realCatalog, TOOL_NAMES as TOOLS } from "./fixtures.js";

const textOf = (result: unknown) => ((result as { content: { text: string }[] }).content[0]?.text ?? "");

describe("MCP server in process", () => {
  let client: Client;

  beforeAll(async () => {
    const server = createMcpServer(await realCatalog());
    const [serverSide, clientSide] = InMemoryTransport.createLinkedPair();
    await server.connect(serverSide);
    client = new Client({ name: "test", version: "0.0.0" });
    await client.connect(clientSide);
  });

  afterAll(() => client.close());

  it("lists the thirteen tools with descriptions and object input schemas", async () => {
    const { tools } = await client.listTools();
    expect(tools.map((t) => t.name)).toEqual(TOOLS);
    for (const tool of tools) {
      expect(tool.description?.length).toBeGreaterThan(40);
      expect(tool.inputSchema.type).toBe("object");
      expect(tool.annotations?.readOnlyHint).toBe(true);
    }
    const details = tools.find((t) => t.name === "get_component_details");
    expect(details?.inputSchema.required).toEqual(["name"]);
    expect(client.getInstructions()).toContain("get_hard_rules");
  });

  it("returns a component's import, guidance, props and docs URL from get_component_details", async () => {
    const result = await client.callTool({ name: "get_component_details", arguments: { name: "button" } });
    expect(result.isError).toBeFalsy();
    const md = textOf(result);
    expect(md).toContain('import { Button, IconButton } from "@puckoops/camelot";');
    expect(md).toContain("## When to use");
    expect(md).toMatch(/\| `variant` \| `"primary"` · `"ghost"` · `"quiet"` \| `"ghost"` \|/);
    expect(md).toContain("http://localhost:3030/docs/components/button");
    const structured = result.structuredContent as { api: { name: string; props?: { props: { name: string }[] } }[] };
    expect(structured.api.map((a) => a.name)).toEqual(["Button", "IconButton"]);
    expect(structured.api[1]?.props?.props.map((p) => p.name)).toContain("aria-label");
  });

  it("answers an unknown name with an error result and suggestions", async () => {
    const result = await client.callTool({ name: "get_component_details", arguments: { name: "Buton" } });
    expect(result.isError).toBe(true);
    expect(textOf(result)).toContain("Did you mean Button");
  });

  it("runs validate_code with structured output that matches its schema", async () => {
    const result = await client.callTool({ name: "validate_code", arguments: { code: '<Chip tone="red">Late</Chip>' } });
    expect(result.structuredContent).toMatchObject({ pass: false, violationCount: 1, violations: [{ ruleId: "glyph-with-state", line: 1 }] });
    expect(textOf(result)).toContain("# validate_code: FAIL");
  });

  it("exposes the catalogue as resources", async () => {
    const { resources } = await client.listResources();
    expect(resources.map((r) => r.uri)).toEqual(
      expect.arrayContaining(["camelot://catalog.json", "camelot://guide.md", "camelot://components/Button"]),
    );
    const read = await client.readResource({ uri: "camelot://components/Button" });
    expect((read.contents[0] as { text: string }).text).toContain("# Button");
  });
});

describe("MCP server over HTTP", () => {
  let server: Server;
  let base: string;
  const post = (body: unknown, headers: Record<string, string> = {}) =>
    fetch(`${base}/mcp`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json, text/event-stream", ...headers },
      body: JSON.stringify(body),
    });

  beforeAll(async () => {
    server = await startHttpServer({ catalog: await realCatalog(), port: 0, host: "127.0.0.1", log: () => {} });
    base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  });

  afterAll(() => new Promise<void>((done) => server.close(() => done())));

  it("initializes and lists tools statelessly, with CORS headers for the browser", async () => {
    const init = await post({
      jsonrpc: "2.0",
      id: 1,
      method: "initialize",
      params: { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "test", version: "0" } },
    });
    expect(init.status).toBe(200);
    expect(init.headers.get("access-control-allow-origin")).toBe("*");
    expect(init.headers.get("access-control-expose-headers")).toContain("Mcp-Session-Id");
    expect(((await init.json()) as { result: { serverInfo: { name: string } } }).result.serverInfo.name).toBe("camelot");

    const list = await post({ jsonrpc: "2.0", id: 2, method: "tools/list" }, { "MCP-Protocol-Version": "2025-06-18" });
    expect(((await list.json()) as { result: { tools: unknown[] } }).result.tools).toHaveLength(TOOLS.length);
  });

  it("answers the CORS preflight, health checks and a GET on /mcp", async () => {
    const preflight = await fetch(`${base}/mcp`, {
      method: "OPTIONS",
      headers: { Origin: "http://localhost:3030", "Access-Control-Request-Method": "POST", "Access-Control-Request-Headers": "content-type, x-trace" },
    });
    expect(preflight.status).toBe(204);
    expect(preflight.headers.get("access-control-allow-headers")).toMatch(/Mcp-Session-Id.*x-trace/);

    const health = await fetch(`${base}/health`);
    expect(await health.json()).toMatchObject({ status: "ok", name: "camelot" });

    const get = await fetch(`${base}/mcp`, { headers: { Accept: "text/event-stream" } });
    expect(get.status).toBe(405);
  });
});
