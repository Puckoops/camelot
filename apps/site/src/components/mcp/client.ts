export const MCP_PATH = "/mcp";

const PROTOCOL_VERSION = "2025-06-18";
const TIMEOUT_MS = 20_000;

export interface JsonSchema {
  type?: string | string[];
  description?: string;
  properties?: Record<string, JsonSchema>;
  required?: string[];
  items?: JsonSchema;
  enum?: unknown[];
  examples?: unknown[];
  default?: unknown;
  anyOf?: JsonSchema[];
  minLength?: number;
  maxLength?: number;
  minimum?: number;
  maximum?: number;
}

export interface McpTool {
  name: string;
  title?: string;
  description?: string;
  inputSchema: JsonSchema;
  outputSchema?: JsonSchema;
  annotations?: { title?: string; readOnlyHint?: boolean; destructiveHint?: boolean; idempotentHint?: boolean; openWorldHint?: boolean };
}

export interface InitializeResult {
  protocolVersion: string;
  serverInfo: { name: string; title?: string; version: string };
  instructions?: string;
  capabilities: Record<string, unknown>;
}

export interface ToolContent {
  type: string;
  text?: string;
}

export interface CallToolResult {
  content?: ToolContent[];
  structuredContent?: unknown;
  isError?: boolean;
}

export interface JsonRpcMessage {
  jsonrpc: "2.0";
  id?: number | string | null;
  result?: unknown;
  error?: { code: number; message: string; data?: unknown };
}

export interface ToolCall {
  result: CallToolResult;
  message: JsonRpcMessage;
  ms: number;
  bytes: number;
}

export class McpUnreachableError extends Error {}

export class McpRpcError extends Error {
  constructor(
    message: string,
    readonly code?: number,
  ) {
    super(message);
  }
}

function parseEventStream(text: string): JsonRpcMessage[] {
  return text
    .split(/\r?\n\r?\n/)
    .map((event) =>
      event
        .split(/\r?\n/)
        .filter((line) => line.startsWith("data:"))
        .map((line) => line.slice(5).trimStart())
        .join("\n"),
    )
    .filter(Boolean)
    .map((data) => JSON.parse(data) as JsonRpcMessage);
}

export class McpHttpClient {
  private nextId = 1;
  private sessionId: string | undefined;
  private protocolVersion: string | undefined;

  constructor(readonly endpoint: string) {}

  async initialize(): Promise<InitializeResult> {
    const { result } = await this.request<InitializeResult>("initialize", {
      protocolVersion: PROTOCOL_VERSION,
      capabilities: {},
      clientInfo: { name: "camelot-docs", version: "1.0.0" },
    });
    this.protocolVersion = result.protocolVersion;
    await this.post({ jsonrpc: "2.0", method: "notifications/initialized" });
    return result;
  }

  async listTools(): Promise<McpTool[]> {
    const tools: McpTool[] = [];
    let cursor: string | undefined;
    do {
      const { result } = await this.request<{ tools: McpTool[]; nextCursor?: string }>("tools/list", cursor ? { cursor } : undefined);
      tools.push(...result.tools);
      cursor = result.nextCursor;
    } while (cursor);
    return tools;
  }

  async callTool(name: string, args: Record<string, unknown>): Promise<ToolCall> {
    const started = performance.now();
    const { result, message, bytes } = await this.request<CallToolResult>("tools/call", { name, arguments: args });
    return { result, message, bytes, ms: Math.round(performance.now() - started) };
  }

  private async request<T>(method: string, params?: Record<string, unknown>) {
    const id = this.nextId++;
    const { message, bytes } = await this.post({ jsonrpc: "2.0", id, method, ...(params ? { params } : {}) }, id);
    if (!message) throw new McpRpcError(`${method} returned no response`);
    if (message.error) throw new McpRpcError(message.error.message, message.error.code);
    return { result: message.result as T, message, bytes };
  }

  private async post(body: Record<string, unknown>, id?: number): Promise<{ message?: JsonRpcMessage; bytes: number }> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json, text/event-stream",
    };
    if (this.sessionId) headers["Mcp-Session-Id"] = this.sessionId;
    if (this.protocolVersion) headers["MCP-Protocol-Version"] = this.protocolVersion;

    let response: Response;
    try {
      response = await fetch(this.endpoint, { method: "POST", headers, body: JSON.stringify(body), signal: AbortSignal.timeout(TIMEOUT_MS) });
    } catch (error) {
      const timedOut = error instanceof DOMException && error.name === "TimeoutError";
      throw new McpUnreachableError(timedOut ? `${this.endpoint} did not answer within ${TIMEOUT_MS / 1000}s` : `Could not reach ${this.endpoint}`);
    }
    const session = response.headers.get("mcp-session-id");
    if (session) this.sessionId = session;
    if (id === undefined || response.status === 202) {
      await response.text().catch(() => "");
      return { bytes: 0 };
    }

    const text = await response.text();
    let messages: JsonRpcMessage[];
    try {
      const type = response.headers.get("content-type") ?? "";
      messages = type.includes("text/event-stream") ? parseEventStream(text) : text ? [JSON.parse(text) as JsonRpcMessage] : [];
    } catch {
      throw new McpRpcError(`${this.endpoint} answered HTTP ${response.status} with something that is not JSON-RPC. Is this an MCP endpoint?`);
    }
    const message = messages.find((m) => m.id === id) ?? messages[0];
    if (!message && !response.ok) throw new McpRpcError(`HTTP ${response.status} ${response.statusText}`);
    return { message, bytes: text.length };
  }
}
