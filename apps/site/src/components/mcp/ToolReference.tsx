"use client";

import { PlayIcon, RefreshIcon } from "@hugeicons/core-free-icons";
import { Accordion, AccordionItem, Alert, Band, Button, Card, cn, Page, PageHeader, Stack, Table, TBody, Td, Th, THead, Tr } from "@puckoops/camelot";
import { useState } from "react";
import { CodeBlock } from "@/components/CodeBlock";
import type { McpHttpClient, McpTool, ToolCall } from "./client";
import { Markdown } from "./Markdown";
import { Connected, InlineCode, ResultView, ServerStatus } from "./parts";
import { firstSentence, paramsOf, sampleArguments, type Param } from "./schema";
import { useMcp } from "./useMcp";
import styles from "./mcp.module.css";

function ParamsTable({ params }: { params: Param[] }) {
  return (
    <Table density="compact" minWidth={560}>
      <THead>
        <Tr>
          <Th>Parameter</Th>
          <Th>Type</Th>
          <Th>Required</Th>
          <Th>Description</Th>
        </Tr>
      </THead>
      <TBody>
        {params.map((p) => (
          <Tr key={p.name}>
            <Td primary mono>
              {p.name}
            </Td>
            <Td mono>{p.values ? p.values.join(" · ") : p.type}</Td>
            <Td>{p.required ? "Required" : "Optional"}</Td>
            <Td>{[p.description, p.constraints.length ? `(${p.constraints.join(", ")})` : ""].filter(Boolean).join(" ")}</Td>
          </Tr>
        ))}
      </TBody>
    </Table>
  );
}

type Preview = { status: "idle" } | { status: "running" } | { status: "done"; call: ToolCall } | { status: "failed"; error: string };

function ToolDetail({ tool, client }: { tool: McpTool; client: McpHttpClient }) {
  const params = paramsOf(tool.inputSchema);
  const sample = sampleArguments(tool.inputSchema);
  const outputs = Object.keys(tool.outputSchema?.properties ?? {});
  const [preview, setPreview] = useState<Preview>({ status: "idle" });

  const run = async () => {
    setPreview({ status: "running" });
    try {
      setPreview({ status: "done", call: await client.callTool(tool.name, sample) });
    } catch (error) {
      setPreview({ status: "failed", error: error instanceof Error ? error.message : String(error) });
    }
  };

  return (
    <Stack gap={16} className={styles.toolDetail}>
      {tool.description && <p className="small text-2">{tool.description}</p>}
      {params.length ? <ParamsTable params={params} /> : <p className="small text-3">No parameters: call it with an empty object.</p>}
      {outputs.length > 0 && (
        <p className="caption text-3">
          Also returns structured content with{" "}
          {outputs.map((key, i) => (
            <span key={key}>
              {i > 0 && ", "}
              <InlineCode>{key}</InlineCode>
            </span>
          ))}
          .
        </p>
      )}
      <div className={styles.previewRow}>
        <CodeBlock label="Sample arguments" code={JSON.stringify(sample, null, 2)} className={styles.grow} />
        <Button variant="ghost" iconStart={PlayIcon} loading={preview.status === "running"} onClick={run}>
          Preview response
        </Button>
      </div>
      {preview.status === "failed" && (
        <Alert tone="critical" title="The call failed.">
          {preview.error}
        </Alert>
      )}
      {preview.status === "done" && <ResultView call={preview.call} />}
    </Stack>
  );
}

export function ToolReference() {
  const { connection, retry, endpoint } = useMcp();
  return (
    <Page>
      <PageHeader
        eyebrow="MCP"
        title="Tool reference"
        subtitle={`Every tool the server exposes, read live from ${endpoint}: initialize, then tools/list, as an assistant connects.`}
        actions={
          <>
            <ServerStatus connection={connection} />
            <Button variant="ghost" size="sm" iconStart={RefreshIcon} onClick={retry}>
              Reload
            </Button>
          </>
        }
      />
      <Connected connection={connection} endpoint={endpoint} onRetry={retry}>
        {({ server, tools, client }) => {
          const readOnly = tools.every((t) => t.annotations?.readOnlyHint);
          return (
            <>
              <Band
                first
                eyebrow="Server"
                heading={`${server.serverInfo.title ?? server.serverInfo.name} ${server.serverInfo.version}`}
                caption={`${server.serverInfo.name} · protocol ${server.protocolVersion} · ${tools.length} tools${readOnly ? ", all read-only" : ""}`}
              >
                {server.instructions && (
                  <Card className={styles.instructions}>
                    <p className="caps text-4">What it tells the assistant on connect</p>
                    <Markdown source={server.instructions} />
                  </Card>
                )}
              </Band>
              <Band
                eyebrow="Tools"
                heading={`${tools.length} tools`}
                caption="Expand a tool for the parameters of its input schema. Preview response calls tools/call with sample arguments taken from the schema's own examples."
              >
                <Accordion type="multiple" variant="framed">
                  {tools.map((tool) => {
                    const count = Object.keys(tool.inputSchema.properties ?? {}).length;
                    return (
                      <AccordionItem
                        key={tool.name}
                        value={tool.name}
                        title={
                          <span className={styles.toolTitle}>
                            <code className={cn("num", styles.toolName)}>{tool.name}</code>
                            <span className="small text-3">{firstSentence(tool.description)}</span>
                          </span>
                        }
                        meta={count === 1 ? "1 parameter" : `${count} parameters`}
                      >
                        <ToolDetail tool={tool} client={client} />
                      </AccordionItem>
                    );
                  })}
                </Accordion>
              </Band>
            </>
          );
        }}
      </Connected>
    </Page>
  );
}
