import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { type InitializeResult, MCP_PATH, McpHttpClient, type McpTool, McpUnreachableError } from "./client";

export type McpConnection =
  | { status: "connecting" }
  | { status: "ready"; server: InitializeResult; tools: McpTool[]; client: McpHttpClient }
  | { status: "unreachable"; error: string }
  | { status: "error"; error: string };

export type ReadyConnection = Extract<McpConnection, { status: "ready" }>;

const CONNECTING: McpConnection = { status: "connecting" };

const pollDelay = (failures: number) => Math.min(10_000, 2000 * 2 ** failures);

const subscribe = () => () => {};

export function useEndpointUrl(path = MCP_PATH) {
  return useSyncExternalStore(
    subscribe,
    () => new URL(path, window.location.origin).href,
    () => path,
  );
}

export function useMcp(path = MCP_PATH) {
  const endpoint = useEndpointUrl(path);
  const [attempt, setAttempt] = useState({ n: 0, quiet: false });
  const [settled, setSettled] = useState<{ n: number; connection: McpConnection }>();
  const failures = useRef(0);

  useEffect(() => {
    let cancelled = false;
    const client = new McpHttpClient(new URL(path, window.location.origin).href);
    (async () => {
      try {
        const server = await client.initialize();
        const tools = await client.listTools();
        if (cancelled) return;
        failures.current = 0;
        setSettled({ n: attempt.n, connection: { status: "ready", server, tools, client } });
      } catch (error) {
        if (cancelled) return;
        const message = error instanceof Error ? error.message : String(error);
        setSettled({
          n: attempt.n,
          connection: error instanceof McpUnreachableError ? { status: "unreachable", error: message } : { status: "error", error: message },
        });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [path, attempt]);

  const connection = settled && (settled.n === attempt.n || attempt.quiet) ? settled.connection : CONNECTING;

  useEffect(() => {
    if (connection.status !== "unreachable") return;
    const timer = setTimeout(() => setAttempt((a) => ({ n: a.n + 1, quiet: true })), pollDelay(failures.current++));
    return () => clearTimeout(timer);
  }, [connection]);

  const retry = useCallback(() => {
    failures.current = 0;
    setAttempt((a) => ({ n: a.n + 1, quiet: false }));
  }, []);

  return { connection, retry, endpoint };
}
