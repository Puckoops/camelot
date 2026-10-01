import { Chip, Glyph, type GlyphShape } from "@puckoops/camelot";
import type { ExampleOf, Meta } from "@/docs";

const shapes: GlyphShape[] = [
  "circle",
  "circle-dashed",
  "circle-half",
  "diamond",
  "diamond-filled",
  "redo",
  "check",
  "square",
  "square-filled",
  "triangle",
  "triangle-filled",
  "triangle-down",
  "cross",
  "dot",
];

const meta = {
  title: "ui/Chip",
  component: Chip,
  description:
    "The only place a hue may appear. A chip names a **state** — task status, invoice stage, obligation direction, client health — in **teal** (settled), **blue** (in flight), **amber** (attention), **red** (critical) or **neutral**. It always carries its frozen **Glyph**, so a desaturated screenshot still reads.",
  args: { children: "In Progress", tone: "blue", glyph: "circle-half", struck: false },
  argTypes: {
    tone: { control: "inline-radio", options: ["neutral", "teal", "blue", "amber", "red"], description: "The state's hue" },
    glyph: { control: "select", options: shapes, description: "The frozen silhouette that survives greyscale" },
    struck: { control: "boolean", description: "Cancelled: reduced opacity and a struck label" },
    children: { control: "text" },
  },
} satisfies Meta<typeof Chip>;

export default meta;
type Example = ExampleOf<typeof meta>;

export const InFlight: Example = {
  description: "Blue is work in flight: In Progress, In Review, Receivable.",
};

export const Settled: Example = {
  args: { tone: "teal", glyph: "check", children: "Done" },
  description: "Teal is settled: Done, Paid, On track.",
};

export const Attention: Example = {
  args: { tone: "amber", glyph: "redo", children: "Re-do" },
  description: "Amber asks for attention without alarm: Re-do, Payable, Due soon.",
};

export const Critical: Example = {
  args: { tone: "red", glyph: "triangle", children: "Overdue" },
  description: "Red is critical and rare: Overdue, Blocked, At risk.",
};

export const Neutral: Example = {
  args: { tone: "neutral", glyph: "square", children: "Backlog" },
  description: "Neutral states that need no hue: Backlog, To Do, Draft.",
};

export const Struck: Example = {
  args: { tone: "neutral", glyph: "circle-dashed", children: "Cancelled", struck: true },
  description: "A cancelled item keeps its place in the list but reads as withdrawn.",
};

export const TaskStatuses: Example = {
  render: () => (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
      <Chip glyph="square">Backlog</Chip>
      <Chip glyph="circle">To Do</Chip>
      <Chip tone="blue" glyph="circle-half">
        In Progress
      </Chip>
      <Chip tone="blue" glyph="diamond">
        In Review
      </Chip>
      <Chip tone="amber" glyph="redo">
        Re-do
      </Chip>
      <Chip tone="red" glyph="triangle">
        Blocked
      </Chip>
      <Chip tone="teal" glyph="check">
        Done
      </Chip>
      <Chip glyph="circle-dashed" struck>
        Cancelled
      </Chip>
    </div>
  ),
  description: "The tracker's full status set, each with its own silhouette.",
};

export const Directions: Example = {
  render: () => (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
      <Chip tone="red" glyph="triangle">
        Overdue
      </Chip>
      <Chip tone="amber" glyph="diamond-filled">
        Payable
      </Chip>
      <Chip tone="blue" glyph="diamond">
        Receivable
      </Chip>
      <Chip tone="teal" glyph="check">
        Settled
      </Chip>
    </div>
  ),
  description: "The ledger's obligation directions. Filled against outline tells payable from receivable in greyscale.",
};

export const Greyscale: Example = {
  render: () => (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, filter: "grayscale(1)" }}>
      <Chip glyph="square">Backlog</Chip>
      <Chip tone="blue" glyph="circle-half">
        In Progress
      </Chip>
      <Chip tone="amber" glyph="redo">
        Re-do
      </Chip>
      <Chip tone="red" glyph="triangle">
        Blocked
      </Chip>
      <Chip tone="teal" glyph="check">
        Done
      </Chip>
    </div>
  ),
  description: "The test every chip has to pass: with colour removed, glyph and label still carry the state.",
};

export const Glyphs: Example = {
  render: () => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(7, minmax(0, 1fr))", gap: 8 }}>
      {shapes.map((shape) => (
        <div
          key={shape}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 8,
            padding: "16px 8px",
            border: "var(--border-w) solid var(--hairline)",
            borderRadius: "var(--radius-md)",
            background: "var(--surface)",
            color: "var(--text-1)",
          }}
        >
          <Glyph shape={shape} size={16} />
          <span className="num-sm text-3">{shape}</span>
        </div>
      ))}
    </div>
  ),
  description: "The fourteen frozen silhouettes. They are drawn at Hugeicons weight and are never swapped for icons.",
};

export const AllVariants: Example = {
  render: () => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, max-content)", gap: 12, alignItems: "center" }}>
      {(
        [
          ["neutral", "square", "Backlog"],
          ["teal", "check", "Done"],
          ["blue", "circle-half", "In Progress"],
          ["amber", "redo", "Re-do"],
          ["red", "triangle", "Overdue"],
        ] as const
      ).map(([tone, glyph, label]) => (
        <div key={tone} style={{ display: "contents" }}>
          <span className="caps text-4">{tone}</span>
          <Chip tone={tone} glyph={glyph}>
            {label}
          </Chip>
          <Chip tone={tone} glyph={glyph} struck>
            {label}
          </Chip>
          <span style={{ filter: "grayscale(1)" }}>
            <Chip tone={tone} glyph={glyph}>
              {label}
            </Chip>
          </span>
        </div>
      ))}
    </div>
  ),
  description: "Every tone at rest, struck, and in greyscale.",
};
