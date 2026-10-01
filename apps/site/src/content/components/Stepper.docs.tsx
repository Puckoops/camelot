import { Button, Card, Stepper } from "@puckoops/camelot";
import { useState } from "react";
import { action, type ExampleOf, type Meta } from "@/docs";

const onboarding = [
  { label: "Client", description: "Name and billing contact" },
  { label: "Project", description: "Scope and budget" },
  { label: "Team", description: "Who works on it" },
  { label: "Review", description: "Check and create" },
];

const meta = {
  title: "ui/Stepper",
  component: Stepper,
  description:
    "A horizontal row of **named steps** for a flow that has to be done in order: finished steps show a **check** on ink, the **current** step an ink ring and its number, the rest a quiet number. The connector turns to ink behind you. Pass **onStepClick** to let people go back to a finished step. Below 640px only the current label stays visible.",
  decorators: [
    (Example, { parameters }) => (
      <div style={{ width: parameters.frameWidth ?? 720 }}>
        <Example />
      </div>
    ),
  ],
  args: { steps: onboarding, current: 1 },
  argTypes: {
    current: { control: { type: "range", min: 0, max: 4, step: 1 }, description: "Index of the step in progress; steps.length is all done" },
    steps: { control: "object" },
    onStepClick: { control: false },
  },
} satisfies Meta<typeof Stepper>;

export default meta;
type Example = ExampleOf<typeof meta>;

export const InProgress: Example = {
  description: "Step two of four: one done, one current, two to come.",
};

export const FirstStep: Example = {
  args: { current: 0 },
  description: "Nothing done yet.",
};

export const AllDone: Example = {
  args: { current: 4 },
  description: "Every step checked.",
};

export const LabelsOnly: Example = {
  args: { steps: onboarding.map(({ label }) => ({ label })), current: 2 },
  description: "Without descriptions, for a narrow drawer.",
};

export const GoBack: Example = {
  args: { current: 3, onStepClick: action() },
  description: "With onStepClick, finished steps become buttons.",
};

export const Walkthrough: Example = {
  render: function Render() {
    const [current, setCurrent] = useState(0);
    return (
      <Card style={{ gap: 24 }}>
        <Stepper steps={onboarding} current={current} onStepClick={setCurrent} aria-label="New client" />
        <p className="small text-2">
          {current < onboarding.length ? `Step ${current + 1}: ${onboarding[current]!.description}.` : "Nordvik Atelier is set up."}
        </p>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <Button variant="quiet" disabled={current === 0} onClick={() => setCurrent((c) => Math.max(0, c - 1))}>
            Back
          </Button>
          <Button variant="primary" disabled={current === onboarding.length} onClick={() => setCurrent((c) => Math.min(onboarding.length, c + 1))}>
            {current === onboarding.length - 1 ? "Create client" : "Continue"}
          </Button>
        </div>
      </Card>
    );
  },
  description: "Continue and Back drive the stepper; finished steps can be clicked.",
};

export const AllVariants: Example = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      {[0, 2, 4].map((current) => (
        <Stepper key={current} steps={onboarding} current={current} />
      ))}
    </div>
  ),
  description: "At the start, halfway, and finished.",
};
