import { Chip, Grid, GridItem, ListCard, TextLink } from "@puckoops/camelot";
import type { ExampleOf, Meta } from "@/docs";

const meta = {
  title: "ui/Cards/ListCard",
  component: ListCard,
  description:
    "Three to five **label · value** rows under a title, separated by hairlines. Values are mono and right-aligned so they line up. More than five rows, or more than two columns, is a **Table**.",
  decorators: [
    (Example, { parameters }) => (
      <div style={{ width: parameters.frameWidth ?? 360 }}>
        <Example />
      </div>
    ),
  ],
  args: {
    title: "This month",
    caption: "Four numbers, one list.",
    rows: [
      { label: "Active projects", value: 17 },
      { label: "Hours logged", value: 312 },
      { label: "Invoices issued", value: 8 },
      { label: "Files added", value: 23 },
    ],
  },
  argTypes: {
    title: { control: "text" },
    caption: { control: "text" },
    rows: { control: "object", description: "3–5 rows" },
    footer: { control: false },
  },
} satisfies Meta<typeof ListCard>;

export default meta;
type Example = ExampleOf<typeof meta>;

export const Default: Example = {
  description: "A short summary of counts.",
};

export const WithFooter: Example = {
  args: {
    title: "Due this week",
    caption: "Receivable, by due date.",
    rows: [
      { label: "Invoice 2041 · Nordvik Atelier", value: "£14,200" },
      { label: "Invoice 2044 · Brightwater Foods", value: "£9,600" },
      { label: "Invoice 2046 · Purslane Studio", value: "£3,150" },
    ],
    footer: (
      <TextLink href="#" arrow="forward">
        All receivables
      </TextLink>
    ),
  },
  description: "A link at the foot leads to the full table.",
};

export const NeedsAttention: Example = {
  args: {
    title: "Needs attention",
    rows: [
      {
        label: "Overdue invoices",
        value: (
          <Chip tone="red" glyph="triangle">
            3
          </Chip>
        ),
      },
      {
        label: "Tasks sent back",
        value: (
          <Chip tone="amber" glyph="redo">
            2
          </Chip>
        ),
      },
      { label: "Awaiting review", value: 5 },
    ],
  },
  description: "A value can be a chip when the number is a state; the rest stay ink.",
};

export const AllVariants: Example = {
  render: () => (
    <Grid>
      <GridItem span={4}>
        <ListCard
          title="This month"
          caption="Four numbers, one list."
          rows={[
            { label: "Active projects", value: 17 },
            { label: "Hours logged", value: 312 },
            { label: "Invoices issued", value: 8 },
            { label: "Files added", value: 23 },
          ]}
        />
      </GridItem>
      <GridItem span={4}>
        <ListCard
          title="Due this week"
          rows={[
            { label: "Invoice 2041", value: "£14,200" },
            { label: "Invoice 2044", value: "£9,600" },
            { label: "Invoice 2046", value: "£3,150" },
          ]}
          footer={
            <TextLink href="#" arrow="forward">
              All receivables
            </TextLink>
          }
        />
      </GridItem>
      <GridItem span={4}>
        <ListCard
          title="Needs attention"
          rows={[
            {
              label: "Overdue invoices",
              value: (
                <Chip tone="red" glyph="triangle">
                  3
                </Chip>
              ),
            },
            {
              label: "Tasks sent back",
              value: (
                <Chip tone="amber" glyph="redo">
                  2
                </Chip>
              ),
            },
            { label: "Awaiting review", value: 5 },
          ]}
        />
      </GridItem>
    </Grid>
  ),
  parameters: { frameWidth: "auto", layout: "padded" },
  description: "Three list cards on a 4 + 4 + 4 row.",
};
