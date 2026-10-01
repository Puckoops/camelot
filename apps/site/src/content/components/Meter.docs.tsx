import { Card, InlineMeter, Meter, Sparkbars } from "@puckoops/camelot";
import type { ExampleOf, Meta } from "@/docs";

const stack = [
  { label: "Allocated", percent: 100 },
  { label: "Committed", percent: 82 },
  { label: "Consumed", percent: 64, threshold: 80 },
  { label: "Invoiced", percent: 41 },
];

const meta = {
  title: "ui/Meter",
  component: Meter,
  subcomponents: { InlineMeter, Sparkbars },
  description:
    "A **share of a whole** as an ink bar on the series track. **InlineMeter** is the Allocated / Committed / Consumed / Invoiced stack: four thin bars with the percentage at a fixed width and an optional warning tick. **Sparkbars** is a row of bars for a small trend; the trailing bars carry ink. The fill moves by transform only.",
  decorators: [
    (Example, { parameters }) => (
      <div style={{ width: parameters.frameWidth ?? 320 }}>
        <Example />
      </div>
    ),
  ],
  args: { percent: 64, label: "Budget consumed", size: "default" },
  argTypes: {
    percent: { control: { type: "range", min: 0, max: 130, step: 1 }, description: "0–100; more fills the bar" },
    size: { control: "inline-radio", options: ["default", "thin"], description: "6px or 4px" },
    label: { control: "text", description: "Names the meter for assistive tech" },
  },
} satisfies Meta<typeof Meter>;

export default meta;
type Example = ExampleOf<typeof meta>;

export const Default: Example = {
  description: "A 6px bar. Drag the percent control to watch it move.",
};

export const Thin: Example = {
  args: { size: "thin" },
  description: "4px, inside a row or a table cell.",
};

export const Over: Example = {
  args: { percent: 118 },
  description: "Over 100 fills the bar; say the real number beside it.",
};

export const Stack: Example = {
  render: () => <InlineMeter rows={stack} />,
  description: "InlineMeter: one budget at four stages, with a tick where Consumed should raise a warning.",
};

export const Trend: Example = {
  render: () => <Sparkbars values={[3, 5, 4, 7, 6, 8, 5, 9, 7, 12, 10, 11]} label="Invoiced by month, last twelve months" />,
  description: "Sparkbars: the last three months in ink, the rest quiet.",
};

export const TrendHighlight: Example = {
  render: () => <Sparkbars values={[12, 9, 14, 11, 8, 13, 10]} highlight={1} height={40} label="Hours per day this week" />,
  description: "highlight picks how many trailing bars carry ink; here only today.",
};

export const AllVariants: Example = {
  render: () => (
    <Card style={{ gap: 20, width: 380 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <span className="caps text-4">Meter</span>
        <Meter percent={64} label="Budget consumed" />
        <Meter percent={100} label="Allocated" size="thin" />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <span className="caps text-4">InlineMeter</span>
        <InlineMeter rows={stack} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <span className="caps text-4">Sparkbars</span>
        <Sparkbars values={[3, 5, 4, 7, 6, 8, 5, 9, 7, 12, 10, 11]} label="Invoiced by month" />
      </div>
    </Card>
  ),
  parameters: { frameWidth: "auto" },
  description: "All three on a card, as they appear in a drawer.",
};
