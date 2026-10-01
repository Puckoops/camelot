import { describe, expect, it } from "vitest";
import pkg from "../package.json" with { type: "json" };
import { Catalog } from "../src/catalog.js";
import { handleHealthRequest, handleMcpRequest } from "../src/web.js";
import { realCatalog, TOOL_NAMES } from "./fixtures.js";

const ORIGIN = "https://camelot.example";

const catalog = async () => new Catalog((await realCatalog()).data, ORIGIN);

const post = async (body: unknown, headers: Record<string, string> = {}) =>
  handleMcpRequest(
    new Request(`${ORIGIN}/mcp`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json, text/event-stream", ...headers },
      body: JSON.stringify(body),
    }),
    await catalog(),
  );

const resultOf = async <T>(response: Response) => ((await response.json()) as { result: T }).result;

describe("MCP server over the web-standard transport", () => {
  it("initializes without a session and sends CORS headers", async () => {
    const response = await post({
      jsonrpc: "2.0",
      id: 1,
      method: "initialize",
      params: { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "test", version: "0" } },
    });
    expect(response.status).toBe(200);
    expect(response.headers.get("mcp-session-id")).toBeNull();
    expect(response.headers.get("access-control-allow-origin")).toBe("*");
    expect(response.headers.get("access-control-expose-headers")).toContain("Mcp-Session-Id");
    const result = await resultOf<{ serverInfo: { name: string; version: string }; instructions: string }>(response);
    expect(result.serverInfo).toMatchObject({ name: "camelot", version: pkg.version });
    expect(result.instructions).toContain("get_hard_rules");
  });

  it("lists the thirteen tools on a fresh server and transport", async () => {
    const response = await post({ jsonrpc: "2.0", id: 2, method: "tools/list" }, { "MCP-Protocol-Version": "2025-06-18" });
    const { tools } = await resultOf<{ tools: { name: string }[] }>(response);
    expect(tools.map((t) => t.name)).toEqual(TOOL_NAMES);
  });

  it("answers get_docs with the docs page on the docs URL it was given", async () => {
    const response = await post({ jsonrpc: "2.0", id: 3, method: "tools/call", params: { name: "get_docs", arguments: { component: "Button" } } });
    const result = await resultOf<{ content: { text: string }[]; structuredContent: unknown }>(response);
    expect(result.structuredContent).toEqual({
      baseUrl: ORIGIN,
      introductionUrl: `${ORIGIN}/`,
      mcpDocsUrl: `${ORIGIN}/docs/mcp`,
      pages: [{ name: "Button", url: `${ORIGIN}/docs/components/button`, hasDocs: true }],
    });
    expect(result.content[0]?.text).toContain(`${ORIGIN}/docs/components/button`);
  });

  it("answers the CORS preflight, accepts DELETE and refuses GET", async () => {
    const preflight = await handleMcpRequest(
      new Request(`${ORIGIN}/mcp`, {
        method: "OPTIONS",
        headers: {
          Origin: "http://localhost:5173",
          "Access-Control-Request-Method": "POST",
          "Access-Control-Request-Headers": "content-type, x-trace",
          "Access-Control-Request-Private-Network": "true",
        },
      }),
      await catalog(),
    );
    expect(preflight.status).toBe(204);
    expect(preflight.headers.get("access-control-allow-origin")).toBe("*");
    expect(preflight.headers.get("access-control-allow-methods")).toBe("GET, POST, DELETE, OPTIONS");
    expect(preflight.headers.get("access-control-allow-headers")).toMatch(/Mcp-Session-Id.*x-trace/);
    expect(preflight.headers.get("access-control-allow-private-network")).toBe("true");

    const remove = await handleMcpRequest(new Request(`${ORIGIN}/mcp`, { method: "DELETE" }), await catalog());
    expect(remove.status).toBe(200);

    const get = await handleMcpRequest(new Request(`${ORIGIN}/mcp`, { headers: { Accept: "text/event-stream" } }), await catalog());
    expect(get.status).toBe(405);
    expect(get.headers.get("allow")).toBe("POST, DELETE, OPTIONS");
    expect(get.headers.get("access-control-allow-origin")).toBe("*");
  });

  it("reports health with the docs URL it was given", async () => {
    const health = handleHealthRequest(new Request(`${ORIGIN}/health`), await catalog());
    expect(health.headers.get("access-control-allow-origin")).toBe("*");
    expect(await health.json()).toMatchObject({ status: "ok", name: "camelot", version: pkg.version, docs: ORIGIN, endpoint: "/mcp" });
  });
});
