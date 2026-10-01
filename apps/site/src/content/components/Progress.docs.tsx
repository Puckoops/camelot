import { Button, Card, Progress, ProgressCircle } from "@puckoops/camelot";
import { useEffect, useState } from "react";
import type { ExampleOf, Meta } from "@/docs";

const meta = {
  title: "ui/Progress",
  component: Progress,
  subcomponents: { ProgressCircle },
  description:
    "How far a **task** has got — an import, a sync, an onboarding checklist. The linear bar takes its label **above** or **beside** it with the value in mono; **ProgressCircle** is the same measure as a ring where a bar would not fit. Pass **null** while the total is unknown and the bar slides instead. For a share of a whole that is not a task, use Meter; for loading content, Skeleton.",
  decorators: [
    (Example, { parameters }) => (
      <div style={{ width: parameters.frameWidth ?? 360 }}>
        <Example />
      </div>
    ),
  ],
  args: { value: 64, max: 100, label: "Importing transactions", labelPosition: "top", showValue: true, size: "default" },
  argTypes: {
    value: { control: { type: "range", min: 0, max: 100, step: 1 }, description: "null for unknown" },
    max: { control: "number" },
    label: { control: "text" },
    labelPosition: { control: "inline-radio", options: ["top", "side"] },
    showValue: { control: "boolean" },
    size: { control: "inline-radio", options: ["default", "thin"] },
    format: { control: false },
  },
} satisfies Meta<typeof Progress>;

export default meta;
type Example = ExampleOf<typeof meta>;

export const LabelOnTop: Example = {
  description: "The label and the value above the bar.",
};

export const LabelBeside: Example = {
  args: { labelPosition: "side", label: "Profile", value: 3, max: 5, format: (v: number, m: number) => `${v} of ${m}` },
  description: "One row, with a count instead of a percentage.",
};

export const Indeterminate: Example = {
  args: { value: null, label: "Preparing the export" },
  description: "While the total is unknown the bar slides; with reduced motion it rests as a quiet full bar.",
};

export const Thin: Example = {
  args: { size: "thin", label: undefined, "aria-label": "Upload progress", value: 38 },
  description: "4px without a label, inside a row; the value stays at the end.",
};

export const Running: Example = {
  render: function Render() {
    const [value, setValue] = useState(0);
    const [running, setRunning] = useState(false);
    useEffect(() => {
      if (!running) return;
      const timer = setInterval(() => setValue((v) => (v >= 100 ? 100 : v + 4)), 120);
      return () => clearInterval(timer);
    }, [running]);
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <Progress value={value} label={value >= 100 ? "Import finished" : "Importing transactions"} />
        <div style={{ display: "flex", gap: 8 }}>
          <Button
            size="sm"
            variant="primary"
            onClick={() => {
              setValue(0);
              setRunning(true);
            }}
          >
            Run import
          </Button>
          <Button size="sm" variant="quiet" onClick={() => setRunning(false)}>
            Pause
          </Button>
        </div>
      </div>
    );
  },
  description: "The fill moves by transform as the value changes.",
};

export const Circle: Example = {
  render: () => (
    <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
      <ProgressCircle value={30} size="sm" label="Syncing" />
      <ProgressCircle value={64} size="md" aria-label="Checklist" />
      <ProgressCircle value={82} size="lg" label="Onboarding" />
      <ProgressCircle value={null} size="md" aria-label="Preparing" />
    </div>
  ),
  parameters: { frameWidth: "auto" },
  description: "Small beside text, medium alone, large with the value inside, and indeterminate.",
};

export const AllVariants: Example = {
  render: () => (
    <Card style={{ gap: 20, width: 440 }}>
      <Progress value={64} label="Importing transactions" />
      <Progress value={3} max={5} label="Profile" labelPosition="side" format={(v, m) => `${v} of ${m}`} />
      <Progress value={null} label="Preparing the export" />
      <Progress value={100} label="Upload complete" size="thin" />
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <ProgressCircle value={30} size="sm" label="Syncing" />
        <ProgressCircle value={64} aria-label="Checklist" />
        <ProgressCircle value={82} size="lg" label="Onboarding" />
      </div>
    </Card>
  ),
  parameters: { frameWidth: "auto" },
  description: "Top and side labels, unknown, thin and complete, and the three ring sizes.",
};
