import { Button, Kpi } from "@puckoops/camelot";
import { useState } from "react";
import type { ExampleOf, Meta } from "@/docs";

const meta = {
  title: "ui/Kpi",
  component: Kpi,
  description:
    'A tabular mono figure. When its value changes it **counts** to the new one over --dur-4 (the value tick); the first render is already final, and with reduced motion or in a hidden tab it jumps straight to the new number. `size="hero"` is 52px and belongs to the one hero figure per screen.',
  args: { value: 312, size: "default" },
  argTypes: {
    value: { control: "number", description: "Change it to see the tick" },
    size: { control: "inline-radio", options: ["default", "hero"], description: "30px, or 52px for the hero" },
    format: { control: false },
  },
} satisfies Meta<typeof Kpi>;

export default meta;
type Example = ExampleOf<typeof meta>;

export const Default: Example = {
  description: "30px mono with tabular figures.",
};

export const Hero: Example = {
  args: { size: "hero", value: 48320, format: (n: number) => `£${Math.round(n).toLocaleString("en-GB")}` },
  description: "The one hero figure on a screen.",
};

export const Percent: Example = {
  args: { value: 78, format: (n: number) => `${Math.round(n)}%` },
  description: "format decides the unit; the number still ticks.",
};

export const ValueTick: Example = {
  render: function Render() {
    const [value, setValue] = useState(14200);
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 16 }}>
        <Kpi value={value} format={(n) => `£${Math.round(n).toLocaleString("en-GB")}`} />
        <div style={{ display: "flex", gap: 8 }}>
          <Button size="sm" onClick={() => setValue((v) => v + 9600)}>
            Invoice paid · +£9,600
          </Button>
          <Button size="sm" variant="quiet" onClick={() => setValue(14200)}>
            Reset
          </Button>
        </div>
      </div>
    );
  },
  description: "Press the button: the figure counts up rather than jumping.",
};

export const AllVariants: Example = {
  render: () => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, max-content)", gap: "16px 32px", alignItems: "baseline" }}>
      <span className="caps text-4">hero</span>
      <Kpi size="hero" value={4832000} format={(n) => `£${Math.round(n / 100).toLocaleString("en-GB")}`} />
      <span className="caps text-4">default</span>
      <Kpi value={312} />
      <span className="caps text-4">percent</span>
      <Kpi value={78} format={(n) => `${Math.round(n)}%`} />
    </div>
  ),
  description: "Both sizes and a formatted percentage.",
};
