"use client";

import { CheckListIcon, DashboardSquare02Icon, PaintBoardIcon } from "@hugeicons/core-free-icons";
import {
  Band,
  Card,
  cn,
  Field,
  Grid,
  GridItem,
  Icon,
  Input,
  ListCard,
  Page,
  PageHeader,
  Stack,
  Table,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  TBody,
  Td,
  TextLink,
  Th,
  THead,
  Tr,
} from "@puckoops/camelot";
import Link from "next/link";
import { CodeBlock, CopyButton } from "@/components/CodeBlock";
import { mcpStoryHref } from "@/lib/pages";
import { InlineCode, ServerStatus } from "./parts";
import { clientSnippets } from "./snippets";
import { useMcp } from "./useMcp";
import styles from "./mcp.module.css";

const FEATURES = [
  {
    icon: DashboardSquare02Icon,
    title: "Components, and which one",
    body: "The catalogue with every export's props, allowed values and defaults, plus the use-this-over-that guidance between lookalikes.",
    tools: ["get_components", "search_components", "get_component_details", "compare_components"],
  },
  {
    icon: PaintBoardIcon,
    title: "Colour and type",
    body: "Role tokens with their light and dark values, the neutral ramp, the hue ramps only a Chip may use, and every type class.",
    tools: ["get_color_tokens", "get_typography", "get_icons_guide"],
  },
  {
    icon: CheckListIcon,
    title: "Rules, with a validator",
    body: "The hard rules and why they exist, which component replaces each raw element, and a checker that flags violations by line.",
    tools: ["get_hard_rules", "get_element_mapping", "validate_code"],
  },
];

const STEPS = [
  {
    tool: "get_hard_rules",
    text: "before writing any UI. The list is short, and most review comments on a screen trace back to one of these rules.",
  },
  {
    tool: "compare_components",
    text: "when two components look alike, such as Select and SegmentedControl or Chip and PriorityMark. It answers from both components' use-instead guidance.",
  },
];

const DEVELOP = "npm install\nnpm run dev";

const STANDALONE = ["npm run catalog -w @puckoops/camelot-mcp", "npm run build -w @puckoops/camelot-mcp", "npm start -w @puckoops/camelot-mcp"].join("\n");

const ENV = [
  ["PORT", "8787", "HTTP port."],
  ["HOST", "all interfaces", "Interface to bind, such as 127.0.0.1."],
  ["DOCS_URL", "http://localhost:3030", "Base of the docs links in responses."],
  ["CORS_ORIGIN", "*", "Allowed browser origin."],
  ["CATALOG_PATH", "packages/camelot-mcp/data/catalog.json", "The generated catalogue the server reads."],
  ["MCP_TRANSPORT", "http", "stdio does the same as --stdio."],
];

export function HowToUse() {
  const { connection, endpoint } = useMcp();
  const snippets = clientSnippets(endpoint);
  const ready = connection.status === "ready" ? connection : undefined;

  return (
    <Page>
      <PageHeader
        eyebrow="MCP"
        title="Camelot MCP"
        subtitle="A Model Context Protocol server that hands an AI coding assistant the real catalogue, tokens and rules of @puckoops/camelot, so it builds with the system instead of guessing at it."
        actions={<ServerStatus connection={connection} />}
      />

      <Band
        first
        eyebrow="What it gives an assistant"
        heading="The design system, as tools"
        caption="Everything the server says is generated from the package's sources when this site builds, so it cannot drift from what ships."
      >
        <Grid>
          {FEATURES.map((feature) => (
            <GridItem key={feature.title} span={4}>
              <Card className={styles.feature}>
                <Icon icon={feature.icon} size={28} className={styles.featureIcon} />
                <h3 className="h3">{feature.title}</h3>
                <p className="small text-2">{feature.body}</p>
                <p className={styles.toolList}>
                  {feature.tools.map((tool) => (
                    <span key={tool}>
                      <InlineCode>{tool}</InlineCode>
                    </span>
                  ))}
                </p>
              </Card>
            </GridItem>
          ))}
        </Grid>
        <p className={cn("small text-3", styles.after)}>
          Also <InlineCode>get_app_setup</InlineCode> for bootstrapping an app, <InlineCode>get_docs</InlineCode> for links to these pages and{" "}
          <InlineCode>get_full_guide</InlineCode> for everything in one document. The{" "}
          <TextLink as={Link} href={mcpStoryHref("tool-reference")} arrow="forward">
            Tool reference
          </TextLink>{" "}
          lists them live.
        </p>
      </Band>

      <Band
        eyebrow="Connect"
        heading="Add it to your assistant"
        caption="This site serves the server at one Streamable HTTP endpoint, so there is nothing to install. Editors that launch local processes can run it over stdio from a checkout instead."
      >
        <Stack gap={24}>
          <Field label="Endpoint" hint="The same deployment serves these pages and the endpoint." className={styles.endpointField}>
            <Input readOnly value={endpoint} suffix={<CopyButton text={endpoint} label="Copy endpoint" />} />
          </Field>
          <Tabs defaultValue={snippets[0]?.id}>
            <TabsList aria-label="Assistant">
              {snippets.map((s) => (
                <TabsTrigger key={s.id} value={s.id}>
                  {s.label}
                </TabsTrigger>
              ))}
            </TabsList>
            {snippets.map((s) => (
              <TabsContent key={s.id} value={s.id}>
                <Stack gap={12} className={styles.snippet}>
                  <p className="small text-2">{s.intro}</p>
                  {s.blocks.map((block) => (
                    <CodeBlock key={block.label} label={block.label} code={block.code} />
                  ))}
                </Stack>
              </TabsContent>
            ))}
          </Tabs>
        </Stack>
      </Band>

      <Band eyebrow="Where to start" heading="Two calls that prevent most mistakes">
        <Grid>
          <GridItem span={7}>
            <Card>
              <ol className={styles.steps}>
                {STEPS.map((step) => (
                  <li key={step.tool} className="small text-2">
                    Call <InlineCode>{step.tool}</InlineCode> {step.text}
                  </li>
                ))}
              </ol>
              <p className={cn("small text-2", styles.after)}>
                In between, <InlineCode>search_components</InlineCode> finds a component by purpose, <InlineCode>get_component_details</InlineCode>{" "}
                gives its props before it is used, and <InlineCode>validate_code</InlineCode> checks the result before the work is called done.
              </p>
              <p className={cn("caption text-3", styles.after)}>
                The server sends the same order to the assistant as its instructions when it connects. Try any call on{" "}
                <TextLink as={Link} href={mcpStoryHref("try-it-out")} arrow="forward">
                  Try it out
                </TextLink>
                .
              </p>
            </Card>
          </GridItem>
          <GridItem span={5}>
            <ListCard
              title="This server"
              caption={ready ? "Read live with initialize and tools/list." : "Connecting to the endpoint."}
              rows={[
                { key: "status", label: "Status", value: <ServerStatus connection={connection} /> },
                { key: "server", label: "Server", value: ready ? `${ready.server.serverInfo.name} ${ready.server.serverInfo.version}` : "—" },
                { key: "protocol", label: "Protocol", value: ready ? ready.server.protocolVersion : "—" },
                { key: "tools", label: "Tools", value: ready ? ready.tools.length : "—" },
                { key: "transport", label: "Transport", value: "HTTP, stateless · stdio" },
              ]}
            />
          </GridItem>
        </Grid>
      </Band>

      <Band
        eyebrow="Run it"
        heading="Run it locally"
        caption="From the repo root. The site serves these pages and the endpoint; the standalone server serves the same tools to editors and self-hosted setups."
      >
        <Stack gap={24}>
          <Grid>
            <GridItem span={6}>
              <CodeBlock label="Docs site and endpoint" code={DEVELOP} />
            </GridItem>
            <GridItem span={6}>
              <CodeBlock label="Standalone server" code={STANDALONE} />
            </GridItem>
          </Grid>
          <p className="small text-3">
            <InlineCode>npm run dev</InlineCode> serves the endpoint at <InlineCode>http://localhost:3030/mcp</InlineCode>. The standalone server serves HTTP on
            port 8787 with <InlineCode>GET /health</InlineCode> beside it, and <InlineCode>node packages/camelot-mcp/dist/server.js --stdio</InlineCode> runs
            it for an editor that starts the server itself.
          </p>
          <Table footer={`${ENV.length} environment variables of the standalone server`}>
            <THead>
              <Tr>
                <Th>Variable</Th>
                <Th>Default</Th>
                <Th>What it does</Th>
              </Tr>
            </THead>
            <TBody>
              {ENV.map(([name, value, about]) => (
                <Tr key={name}>
                  <Td primary mono>
                    {name}
                  </Td>
                  <Td mono>{value}</Td>
                  <Td>{about}</Td>
                </Tr>
              ))}
            </TBody>
          </Table>
        </Stack>
      </Band>
    </Page>
  );
}
