import { Button, Card, DescriptionList, Divider, SearchInput, Select } from "@puckoops/camelot";
import type { ExampleOf, Meta } from "@/docs";

const meta = {
  title: "ui/Divider",
  component: Divider,
  description:
    "A **hairline rule** between groups inside a card, a drawer or a toolbar. **strong** is the rule between drawer sections; **dashed** marks a provisional or sample boundary, never a gridline; **vertical** separates inline groups and stretches to the height of its row. Bands never need one — spacing separates bands.",
  args: { strong: false, dashed: false, vertical: false },
  argTypes: {
    strong: { control: "boolean", description: "--hairline-strong" },
    dashed: { control: "boolean", description: "A provisional boundary" },
    vertical: { control: "boolean", description: "Between inline groups" },
  },
  render: (args) =>
    args.vertical ? (
      <div style={{ display: "flex", alignItems: "center", gap: 16, height: 36 }}>
        <span className="small text-2">Left group</span>
        <Divider {...args} />
        <span className="small text-2">Right group</span>
      </div>
    ) : (
      <div style={{ display: "flex", flexDirection: "column", gap: 16, width: 360 }}>
        <span className="small text-2">Above the rule</span>
        <Divider {...args} />
        <span className="small text-2">Below the rule</span>
      </div>
    ),
} satisfies Meta<typeof Divider>;

export default meta;
type Example = ExampleOf<typeof meta>;

export const Horizontal: Example = {
  description: "The default hairline.",
};

export const Strong: Example = {
  args: { strong: true },
  description: "The strong hairline, as between drawer sections.",
};

export const Dashed: Example = {
  args: { dashed: true },
  description: "Dashed, for a boundary that is not final, such as projected rows.",
};

export const Vertical: Example = {
  args: { vertical: true },
  description: "Vertical, between two groups in a row.",
};

export const InAToolbar: Example = {
  render: () => (
    <div style={{ display: "flex", alignItems: "center", gap: 12, width: 640 }}>
      <div style={{ flex: 1 }}>
        <SearchInput aria-label="Search tasks" placeholder="Search tasks" />
      </div>
      <Select variant="filter" allLabel="All clients" value="" aria-label="Client" options={[{ value: "nordvik", label: "Nordvik Atelier" }]} />
      <Divider vertical />
      <Button variant="primary" size="sm">
        New task
      </Button>
    </div>
  ),
  description: "A vertical rule sets the filters apart from the action.",
};

export const InACard: Example = {
  render: () => (
    <Card style={{ width: 400, gap: 16 }}>
      <DescriptionList
        items={[
          { label: "Client", value: "Nordvik Atelier" },
          { label: "Budget", value: "£28,000" },
        ]}
      />
      <Divider />
      <DescriptionList items={[{ label: "Projected", value: "£31,500" }]} />
      <Divider dashed />
      <p className="caption text-4">Projected figures are estimates until the month closes.</p>
    </Card>
  ),
  description: "Solid between groups of fields, dashed before a provisional note.",
};

export const AllVariants: Example = {
  render: () => (
    <div style={{ display: "flex", gap: 40, alignItems: "stretch" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 20, width: 280 }}>
        <span className="caps text-4">hairline</span>
        <Divider />
        <span className="caps text-4">strong</span>
        <Divider strong />
        <span className="caps text-4">dashed</span>
        <Divider dashed />
        <span className="caps text-4">strong dashed</span>
        <Divider strong dashed />
      </div>
      <div style={{ display: "flex", gap: 20, alignItems: "stretch" }}>
        <Divider vertical />
        <Divider vertical strong />
        <Divider vertical dashed />
      </div>
    </div>
  ),
  description: "Every rule, horizontal and vertical.",
};
