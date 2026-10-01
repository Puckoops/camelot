import { File01Icon, Invoice01Icon, Task01Icon } from "@hugeicons/core-free-icons";
import { Badge, Chip, Icon } from "@puckoops/camelot";
import type { ExampleOf, Meta } from "@/docs";

const meta = {
  title: "ui/Badge",
  component: Badge,
  description:
    "A neutral **count** or **tag**. Counts are tabular mono in a pill; tags are mono caps with a hairline outline. A badge has no tone and no glyph — the moment it names a state it is a **Chip**.",
  args: { children: 12, variant: "count", strong: false },
  argTypes: {
    variant: { control: "inline-radio", options: ["count", "tag"], description: "A number or a short neutral word" },
    strong: { control: "boolean", description: "Ink fill for a count that needs attention" },
    max: { control: "number", description: "Counts above this read as max+" },
    children: { control: "text" },
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Example = ExampleOf<typeof meta>;

export const Count: Example = {
  description: "A count beside a label: open tasks, files, unread.",
};

export const Strong: Example = {
  args: { strong: true, children: 3 },
  description: "Ink fill when the count asks for attention, such as unread comments. Still not a state.",
};

export const Capped: Example = {
  args: { children: 1284, max: 99 },
  description: "Past max the badge reads 99+, so it never grows wider than its label.",
};

export const Tag: Example = {
  args: { variant: "tag", children: "PDF" },
  description: "A short neutral tag: a file kind, Beta, Internal.",
};

export const BesideLabels: Example = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, width: 280 }}>
      {[
        { icon: Task01Icon, label: "Open tasks", count: 12 },
        { icon: Invoice01Icon, label: "Invoices to send", count: 3 },
        { icon: File01Icon, label: "Files added this week", count: 23 },
      ].map((row) => (
        <div key={row.label} style={{ display: "flex", alignItems: "center", gap: 10 }} className="small text-2">
          <Icon icon={row.icon} size={16} className="text-4" />
          <span style={{ flex: 1 }}>{row.label}</span>
          <Badge>{row.count}</Badge>
        </div>
      ))}
    </div>
  ),
  description: "Counts sit at the end of the row, aligned, in the same quiet ink.",
};

export const NotAState: Example = {
  render: () => (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <Badge variant="tag">Draft</Badge>
      <span className="caption text-4">versus</span>
      <Chip tone="amber" glyph="diamond-filled">
        Payable
      </Chip>
    </div>
  ),
  description: "A tag labels a thing; a chip reports its state. If it changes as work moves, it is a Chip.",
};

export const AllVariants: Example = {
  render: () => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(5, max-content)", gap: 12, alignItems: "center" }}>
      <span className="caps text-4">count</span>
      <Badge>4</Badge>
      <Badge>128</Badge>
      <Badge max={99}>{1284}</Badge>
      <Badge strong>3</Badge>
      <span className="caps text-4">tag</span>
      <Badge variant="tag">PDF</Badge>
      <Badge variant="tag">Beta</Badge>
      <Badge variant="tag">Internal</Badge>
      <Badge variant="tag" strong>
        New
      </Badge>
    </div>
  ),
  description: "Counts and tags, quiet and strong.",
};
