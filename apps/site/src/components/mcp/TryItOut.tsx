"use client";

import { PlayIcon } from "@hugeicons/core-free-icons";
import { Alert, Band, Button, Card, ChoiceGroup, EmptyState, Field, Grid, GridItem, Page, PageHeader, Select, Skeleton, Stack, Textarea } from "@puckoops/camelot";
import { useId, useMemo, useState } from "react";
import type { McpTool, ToolCall } from "./client";
import { Connected, InlineCode, ResultView, ServerStatus } from "./parts";
import { firstSentence, paramsOf, sampleArguments } from "./schema";
import { type ReadyConnection, useMcp } from "./useMcp";
import styles from "./mcp.module.css";

interface Preset {
  id: string;
  label: string;
  tool: string;
  args: Record<string, unknown>;
}

function presetsFor(tools: McpTool[]): Preset[] {
  const make = (id: string, label: string, name: string, args?: Record<string, unknown>): Preset[] => {
    const tool = tools.find((t) => t.name === name);
    return tool ? [{ id, label, tool: name, args: args ?? sampleArguments(tool.inputSchema) }] : [];
  };
  return [
    ...make("rules", "Hard rules", "get_hard_rules", {}),
    ...make("compare", "Compare lookalikes", "compare_components"),
    ...make("validate", "Validate a snippet", "validate_code"),
    ...make("search", "Search", "search_components"),
  ];
}

const format = (args: Record<string, unknown>) => JSON.stringify(args, null, 2);

function parseArguments(text: string): { ok: true; value: Record<string, unknown> } | { ok: false; error: string } {
  if (!text.trim()) return { ok: true, value: {} };
  try {
    const value: unknown = JSON.parse(text);
    if (!value || typeof value !== "object" || Array.isArray(value)) return { ok: false, error: "Arguments must be a JSON object, such as {}." };
    return { ok: true, value: value as Record<string, unknown> };
  } catch (error) {
    return { ok: false, error: `Not valid JSON: ${error instanceof Error ? error.message : String(error)}` };
  }
}

type Run =
  | { status: "idle" }
  | { status: "running"; tool: string }
  | { status: "done"; tool: string; call: ToolCall }
  | { status: "failed"; tool: string; error: string };

function Playground({ tools, client }: ReadyConnection) {
  const presetsLabel = useId();
  const presets = useMemo(() => presetsFor(tools), [tools]);
  const first = presets[0];
  const [preset, setPreset] = useState<string | undefined>(first?.id);
  const [toolName, setToolName] = useState(first?.tool ?? tools[0]?.name ?? "");
  const [argsText, setArgsText] = useState(format(first?.args ?? {}));
  const [run, setRun] = useState<Run>({ status: "idle" });

  const tool = tools.find((t) => t.name === toolName);
  const parsed = parseArguments(argsText);
  const params = tool ? paramsOf(tool.inputSchema) : [];

  const choosePreset = (id: string) => {
    const chosen = presets.find((p) => p.id === id);
    if (!chosen) return;
    setPreset(id);
    setToolName(chosen.tool);
    setArgsText(format(chosen.args));
  };

  const chooseTool = (name: string) => {
    const chosen = tools.find((t) => t.name === name);
    setToolName(name);
    setPreset(undefined);
    setArgsText(format(chosen ? sampleArguments(chosen.inputSchema) : {}));
  };

  const execute = async () => {
    if (!parsed.ok || !tool) return;
    setRun({ status: "running", tool: tool.name });
    try {
      setRun({ status: "done", tool: tool.name, call: await client.callTool(tool.name, parsed.value) });
    } catch (error) {
      setRun({ status: "failed", tool: tool.name, error: error instanceof Error ? error.message : String(error) });
    }
  };

  return (
    <Band first>
      <Grid>
        <GridItem span={5}>
          <Card>
            <Stack gap={20}>
              {presets.length > 0 && (
                <Stack gap={8}>
                  <p id={presetsLabel} className="caps text-4">
                    Presets
                  </p>
                  <ChoiceGroup
                    look="pill"
                    aria-labelledby={presetsLabel}
                    options={presets.map((p) => ({ value: p.id, label: p.label }))}
                    value={preset}
                    onValueChange={choosePreset}
                  />
                </Stack>
              )}
              <Field label="Tool" hint={tool ? firstSentence(tool.description) : undefined}>
                <Select options={tools.map((t) => ({ value: t.name, label: t.name }))} value={toolName} onValueChange={chooseTool} />
              </Field>
              <Field
                label="Arguments"
                hint="A JSON object for the tool's input schema. ⌘ or Ctrl + Enter runs it."
                error={parsed.ok ? undefined : parsed.error}
                className={styles.argsField}
              >
                <Textarea
                  rows={12}
                  spellCheck={false}
                  value={argsText}
                  onChange={(e) => setArgsText(e.target.value)}
                  onKeyDown={(e) => {
                    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                      e.preventDefault();
                      void execute();
                    }
                  }}
                />
              </Field>
              {params.length > 0 && (
                <ul className={styles.paramList}>
                  {params.map((p) => (
                    <li key={p.name} className="caption text-3">
                      <InlineCode>{p.name}</InlineCode> {p.values ? p.values.join(" · ") : p.type}
                      {p.required ? ", required" : ""}
                      {p.description ? ` — ${p.description}` : ""}
                    </li>
                  ))}
                </ul>
              )}
              <Stack direction="row" gap={12} wrap>
                <Button variant="primary" iconStart={PlayIcon} loading={run.status === "running"} disabled={!parsed.ok || !tool} onClick={execute}>
                  Run tool
                </Button>
                <Button variant="quiet" onClick={() => tool && setArgsText(format(sampleArguments(tool.inputSchema)))}>
                  Reset arguments
                </Button>
              </Stack>
            </Stack>
          </Card>
        </GridItem>
        <GridItem span={7}>
          {run.status === "idle" && (
            <EmptyState
              framed
              icon={PlayIcon}
              title="Run a tool to see its response here."
              description="The formatted markdown and the raw JSON-RPC response are one tab apart."
            />
          )}
          {run.status === "running" && (
            <Card aria-busy="true">
              <Stack gap={12}>
                <Skeleton height={14} width="24%" />
                <Skeleton height={24} width="56%" />
                <Skeleton height={14} />
                <Skeleton height={14} />
                <Skeleton height={14} width="72%" />
              </Stack>
            </Card>
          )}
          {run.status === "failed" && (
            <Alert tone="critical" title={`${run.tool} did not complete.`}>
              {run.error}
            </Alert>
          )}
          {run.status === "done" && (
            <Card>
              <Stack gap={12}>
                <p className="caps text-4">{run.tool}</p>
                <ResultView call={run.call} />
              </Stack>
            </Card>
          )}
        </GridItem>
      </Grid>
    </Band>
  );
}

export function TryItOut() {
  const { connection, retry, endpoint } = useMcp();
  return (
    <Page>
      <PageHeader
        eyebrow="MCP"
        title="Try it out"
        subtitle={`Pick a tool or a preset, edit its JSON arguments and run it against ${endpoint}.`}
        actions={<ServerStatus connection={connection} />}
      />
      <Connected connection={connection} endpoint={endpoint} onRetry={retry}>
        {(ready) => <Playground {...ready} />}
      </Connected>
    </Page>
  );
}
