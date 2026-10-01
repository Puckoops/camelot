import { PlugSocketIcon, RefreshIcon } from "@hugeicons/core-free-icons";
import { Alert, Button, Chip, cn, EmptyState, formatBytes, Skeleton, Stack, Tabs, TabsContent, TabsList, TabsTrigger } from "@puckoops/camelot";
import type { ReactNode } from "react";
import { CodeBlock } from "@/components/CodeBlock";
import type { ToolCall } from "./client";
import { Markdown } from "./Markdown";
import type { McpConnection, ReadyConnection } from "./useMcp";
import styles from "./mcp.module.css";

export function InlineCode({ children }: { children: ReactNode }) {
  return <code className={cn("num-sm", styles.inlineCode)}>{children}</code>;
}

export function ServerStatus({ connection }: { connection: McpConnection }) {
  switch (connection.status) {
    case "connecting":
      return <Chip tone="blue" glyph="circle-half">Connecting</Chip>;
    case "ready":
      return <Chip tone="teal" glyph="check">Connected</Chip>;
    case "unreachable":
      return <Chip tone="amber" glyph="triangle">Unreachable</Chip>;
    case "error":
      return <Chip tone="red" glyph="cross">Error</Chip>;
  }
}

function Unreachable({ endpoint, onRetry }: { endpoint: string; onRetry: () => void }) {
  return (
    <div className={styles.down}>
      <EmptyState
        framed
        icon={PlugSocketIcon}
        title="The MCP endpoint did not answer."
        description={
          <>
            Nothing answered at <InlineCode>{endpoint}</InlineCode>; this page keeps trying, or you can try again now.
          </>
        }
        action={
          <Button variant="ghost" iconStart={RefreshIcon} onClick={onRetry}>
            Try again
          </Button>
        }
      />
    </div>
  );
}

function Loading() {
  return (
    <Stack gap={12} aria-busy="true" aria-label="Connecting to the MCP endpoint">
      <Skeleton height={20} width="32%" />
      <Skeleton height={48} />
      <Skeleton height={48} />
      <Skeleton height={48} />
    </Stack>
  );
}

export function Connected({
  connection,
  endpoint,
  onRetry,
  children,
}: {
  connection: McpConnection;
  endpoint: string;
  onRetry: () => void;
  children: (ready: ReadyConnection) => ReactNode;
}) {
  switch (connection.status) {
    case "connecting":
      return <Loading />;
    case "unreachable":
      return <Unreachable endpoint={endpoint} onRetry={onRetry} />;
    case "error":
      return (
        <Alert
          tone="critical"
          title="The endpoint answered, but not as an MCP server."
          action={
            <Button variant="ghost" size="sm" iconStart={RefreshIcon} onClick={onRetry}>
              Try again
            </Button>
          }
        >
          {connection.error}
        </Alert>
      );
    case "ready":
      return <>{children(connection)}</>;
  }
}

export function ResultView({ call }: { call: ToolCall }) {
  const text = (call.result.content ?? [])
    .filter((c) => c.type === "text" && c.text)
    .map((c) => c.text)
    .join("\n\n");
  return (
    <Stack gap={12} className={styles.result}>
      <div className={styles.resultHead}>
        {call.result.isError ? (
          <Chip tone="red" glyph="cross">
            Tool error
          </Chip>
        ) : (
          <Chip tone="teal" glyph="check">
            OK
          </Chip>
        )}
        <span className="num-sm text-4">
          {call.ms} ms · {formatBytes(call.bytes)}
          {call.result.structuredContent !== undefined ? " · structured content" : ""}
        </span>
      </div>
      <Tabs defaultValue="formatted" variant="segmented">
        <TabsList aria-label="Response view">
          <TabsTrigger value="formatted">Formatted</TabsTrigger>
          <TabsTrigger value="json">Raw JSON</TabsTrigger>
        </TabsList>
        <TabsContent value="formatted">
          {text ? <Markdown source={text} /> : <p className="small text-3">The tool returned no text content.</p>}
        </TabsContent>
        <TabsContent value="json">
          <CodeBlock label="JSON-RPC response" code={JSON.stringify(call.message, null, 2)} />
        </TabsContent>
      </Tabs>
    </Stack>
  );
}
