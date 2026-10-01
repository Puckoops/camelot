import { Card, Slider } from "@puckoops/camelot";
import { useState } from "react";
import { action, type ExampleOf, type Meta } from "@/docs";

const hours = (n: number) => `${n} hrs`;
const pounds = (n: number) => `£${n.toLocaleString("en-GB")}`;

const meta = {
  title: "ui/Slider",
  component: Slider,
  description:
    "Drag to an **approximate number** within known bounds, or a **range** with two thumbs. The readout sits at the end of the label row in mono and carries the unit through **format**. Arrow keys step, Page Up and Down take bigger steps, Home and End go to the bounds.",
  decorators: [
    (Example, { parameters }) => (
      <div style={{ width: parameters.frameWidth ?? 360 }}>
        <Example />
      </div>
    ),
  ],
  args: { label: "Weekly capacity", defaultValue: [32], min: 0, max: 40, step: 1, format: hours, onValueChange: action(), showBounds: false },
  argTypes: {
    label: { control: "text" },
    min: { control: "number" },
    max: { control: "number" },
    step: { control: "number" },
    showValue: { control: "boolean" },
    showBounds: { control: "boolean", description: "Min and max under the track" },
    disabled: { control: "boolean" },
    format: { control: false },
    value: { control: false },
    defaultValue: { control: "object" },
  },
} satisfies Meta<typeof Slider>;

export default meta;
type Example = ExampleOf<typeof meta>;

export const Single: Example = {
  description: "One thumb, the value in hours.",
};

export const Range: Example = {
  args: { label: "Budget", defaultValue: [8000, 24000], min: 0, max: 40000, step: 500, format: pounds, minStepsBetweenThumbs: 2, showBounds: true },
  description: "Two thumbs for a range filter; they stay at least two steps apart.",
};

export const WithBounds: Example = {
  args: { showBounds: true },
  description: "Min and max under the track when the bounds are not obvious.",
};

export const Disabled: Example = {
  args: { disabled: true, label: "Retainer hours", defaultValue: [20] },
  description: "Set by the contract and locked.",
};

export const Committed: Example = {
  render: function Render() {
    const [value, setValue] = useState([12000, 30000]);
    const [committed, setCommitted] = useState([12000, 30000]);
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <Slider label="Project budget" value={value} onValueChange={setValue} onValueCommit={setCommitted} min={0} max={50000} step={1000} format={pounds} />
        <p className="caption text-3">
          Filtering by <span className="num">{committed.map(pounds).join(" – ")}</span> once you let go
        </p>
      </div>
    );
  },
  description: "onValueCommit fires once on release, for work that should not run on every step.",
};

export const AllVariants: Example = {
  render: () => (
    <Card style={{ gap: 24, width: 400 }}>
      <Slider label="Weekly capacity" defaultValue={[32]} max={40} format={hours} />
      <Slider label="Budget" defaultValue={[8000, 24000]} max={40000} step={500} format={pounds} showBounds />
      <Slider aria-label="Opacity" defaultValue={[60]} format={(n) => `${n}%`} />
      <Slider label="Retainer hours" defaultValue={[20]} max={40} format={hours} disabled />
    </Card>
  ),
  parameters: { frameWidth: "auto" },
  description: "Single, range with bounds, unlabelled with an aria-label, and disabled.",
};
