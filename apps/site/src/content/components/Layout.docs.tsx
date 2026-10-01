import { Add01Icon, CloudUploadIcon } from "@hugeicons/core-free-icons";
import {
  ActionCard,
  Band,
  Button,
  Chip,
  FigureCard,
  Grid,
  GridItem,
  ListCard,
  MeterCard,
  Page,
  PageHeader,
  SampleFlag,
  Stack,
  Table,
  TBody,
  Td,
  TextLink,
  Th,
  THead,
  Tr,
  type Span,
} from "@puckoops/camelot";
import type { ExampleOf, Meta } from "@/docs";

const allowed: { name: string; spans: Span[]; note: string }[] = [
  { name: "12", spans: [12], note: "A full-width band: a table, a board, a chart." },
  { name: "8 + 4", spans: [8, 4], note: "Content and its context." },
  { name: "7 + 5", spans: [7, 5], note: "A hero figure and a list." },
  { name: "6 + 6", spans: [6, 6], note: "Two equals. Once per screen." },
  { name: "5 + 4 + 3", spans: [5, 4, 3], note: "Three cards that step down in weight." },
  { name: "4 + 4 + 4", spans: [4, 4, 4], note: "Three peers." },
  { name: "3 × 4", spans: [3, 3, 3, 3], note: "Four counts. Counts only." },
];

function Cell({ span }: { span: Span }) {
  return (
    <div
      style={{
        display: "grid",
        placeItems: "center",
        minHeight: 64,
        border: "var(--border-w) solid var(--hairline)",
        borderRadius: "var(--radius-md)",
        background: "var(--surface)",
      }}
    >
      <span className="num-sm text-3">span {span}</span>
    </div>
  );
}

const meta = {
  title: "ui/Layout",
  component: Band,
  subcomponents: { Page, PageHeader, Grid, GridItem, Stack, SampleFlag },
  description:
    "Composition. Every screen is a **Page** holding a **PageHeader** followed by **Bands**; a band has an eyebrow, a heading and a caption, then a **Grid** of 12 columns whose items use the **allowed spans** only. Unequal spans are what make a screen composed rather than stacked. Below 1040px spans double; below 860px everything stacks.",
  parameters: { layout: "fullscreen" },
  args: {
    eyebrow: "Ledger",
    heading: "Open obligations",
    caption: "Payable and receivable in one list. Overdue rises to the top.",
  },
  argTypes: {
    eyebrow: { control: "text" },
    heading: { control: "text" },
    caption: { control: "text" },
    actions: { control: false },
    first: { control: "boolean", description: "Sits closer to the page header" },
  },
  render: (args) => (
    <Page style={{ paddingBottom: "var(--space-10)" }}>
      <Band
        {...args}
        actions={
          <TextLink href="#" arrow="forward">
            All obligations
          </TextLink>
        }
      >
        <Grid>
          <GridItem span={8}>
            <ListCard
              title="Receivable"
              rows={[
                { label: "Invoice 2041 · Nordvik Atelier", value: "£14,200" },
                { label: "Invoice 2044 · Brightwater Foods", value: "£9,600" },
                { label: "Invoice 2046 · Purslane Studio", value: "£3,150" },
              ]}
            />
          </GridItem>
          <GridItem span={4}>
            <FigureCard label="Overdue" value={14200} format={(n) => `£${Math.round(n).toLocaleString("en-GB")}`} caption="One invoice, twelve days late." />
          </GridItem>
        </Grid>
      </Band>
    </Page>
  ),
} satisfies Meta<typeof Band>;

export default meta;
type Example = ExampleOf<typeof meta>;

export const BandWithGrid: Example = {
  name: "Band",
  description: "A band: eyebrow, heading, caption and a link, then an 8 + 4 grid.",
};

export const Header: Example = {
  name: "PageHeader",
  render: () => (
    <Page style={{ paddingBottom: "var(--space-10)" }}>
      <PageHeader
        back={
          <TextLink href="#" arrow="back">
            Dashboard
          </TextLink>
        }
        eyebrow="Clients"
        title={
          <span style={{ display: "inline-flex", alignItems: "center", gap: 12 }}>
            Nordvik Atelier <SampleFlag />
          </span>
        }
        subtitle="Client since March 2024. Brand, signage and the annual report."
        actions={
          <>
            <Button>Edit client</Button>
            <Button variant="primary" iconStart={Add01Icon}>
              New project
            </Button>
          </>
        }
      />
    </Page>
  ),
  description: "Back link, eyebrow, title with the sample flag, subtitle, and actions on the right.",
};

export const AllowedSpans: Example = {
  render: () => (
    <Page style={{ paddingBottom: "var(--space-10)" }}>
      <Stack gap={32}>
        {allowed.map((row) => (
          <div key={row.name}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 12 }}>
              <span className="caps text-4">{row.name}</span>
              <span className="caption text-3">{row.note}</span>
            </div>
            <Grid>
              {row.spans.map((span, i) => (
                <GridItem key={i} span={span}>
                  <Cell span={span} />
                </GridItem>
              ))}
            </Grid>
          </div>
        ))}
      </Stack>
    </Page>
  ),
  description: "The seven compositions the grid allows. Anything else is a layout bug.",
};

export const StackRowAndColumn: Example = {
  name: "Stack",
  render: () => (
    <Page style={{ paddingBottom: "var(--space-10)" }}>
      <Stack gap={24}>
        <Stack direction="row" gap={8} align="center" wrap>
          <Chip glyph="square">Backlog</Chip>
          <Chip tone="blue" glyph="circle-half">
            In Progress
          </Chip>
          <Chip tone="teal" glyph="check">
            Done
          </Chip>
        </Stack>
        <Stack gap={8} style={{ maxWidth: 360 }}>
          <Button variant="primary">Create project</Button>
          <Button>Save draft</Button>
        </Stack>
      </Stack>
    </Page>
  ),
  description: "Stack for the small arrangements inside a card or a band head.",
};

export const ComposedScreen: Example = {
  render: () => (
    <Page style={{ paddingBottom: "var(--space-10)" }}>
      <PageHeader
        title="Dashboard"
        subtitle="What needs you this week."
        actions={
          <Button variant="primary" iconStart={Add01Icon}>
            Add new
          </Button>
        }
      />
      <Band first>
        <Grid>
          <GridItem span={5}>
            <FigureCard
              hero
              label="Outstanding"
              value={48320}
              format={(n) => `£${Math.round(n).toLocaleString("en-GB")}`}
              caption="Receivable across 9 open invoices."
            />
          </GridItem>
          <GridItem span={4}>
            <ListCard
              title="This week"
              rows={[
                { label: "Tasks due", value: 14 },
                { label: "Invoices to send", value: 3 },
                { label: "Files to review", value: 6 },
              ]}
            />
          </GridItem>
          <GridItem span={3}>
            <MeterCard title="Studio capacity" percent={78} caption="31 of 40 hours." />
          </GridItem>
        </Grid>
      </Band>
      <Band eyebrow="Ledger" heading="Overdue" caption="Oldest first.">
        <Table density="relaxed">
          <THead>
            <tr>
              <Th>Invoice</Th>
              <Th>Client</Th>
              <Th>State</Th>
              <Th numeric>Amount</Th>
            </tr>
          </THead>
          <TBody>
            <Tr>
              <Td primary>Invoice 2041</Td>
              <Td>Nordvik Atelier</Td>
              <Td>
                <Chip tone="red" glyph="triangle">
                  Overdue
                </Chip>
              </Td>
              <Td numeric>£14,200</Td>
            </Tr>
            <Tr>
              <Td primary>Invoice 2038</Td>
              <Td>Halden &amp; Moss</Td>
              <Td>
                <Chip tone="red" glyph="triangle">
                  Overdue
                </Chip>
              </Td>
              <Td numeric>£2,480</Td>
            </Tr>
          </TBody>
        </Table>
      </Band>
      <Band heading="Next steps">
        <Grid>
          <GridItem span={6}>
            <ActionCard
              icon={CloudUploadIcon}
              title="Upload files"
              caption="Contracts, receipts, deliverables."
              action={<Button size="sm">Choose files</Button>}
            />
          </GridItem>
          <GridItem span={6}>
            <ActionCard icon={Add01Icon} title="New project" caption="Scope, budget and team." action={<Button size="sm">Start</Button>} />
          </GridItem>
        </Grid>
      </Band>
    </Page>
  ),
  description: "A screen that follows the grammar: header, a 5 + 4 + 3 band, one table band, then 6 + 6 once.",
};

export const AllVariants: Example = {
  render: () => (
    <Page style={{ paddingBottom: "var(--space-10)" }}>
      <PageHeader eyebrow="Layout" title="Every span" subtitle="Headers, bands and the allowed grid, together." />
      {allowed.map((row, i) => (
        <Band key={row.name} first={i === 0} eyebrow={row.name} caption={row.note}>
          <Grid>
            {row.spans.map((span, j) => (
              <GridItem key={j} span={span}>
                <Cell span={span} />
              </GridItem>
            ))}
          </Grid>
        </Band>
      ))}
    </Page>
  ),
  description: "Page, header, and a band for each allowed composition.",
};
