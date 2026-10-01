import { ChoiceGroup, Chip, PriorityMark } from "@puckoops/camelot";
import { useState } from "react";
import { action, type ExampleOf, type Meta } from "@/docs";

const types = ["Development", "Design", "Bug", "Audit", "Tag"].map((t) => ({ value: t.toLowerCase(), label: t }));

const meta = {
  title: "ui/ChoiceGroup",
  component: ChoiceGroup,
  description:
    "A single choice shown as options you can see all at once. **pill** for quick filters (the chosen one is ink-filled), **outline** for form choices such as Type or Priority (the chosen one gains an ink ring), **bare** when each option is already a Chip.",
  args: { "aria-label": "Type", options: types, defaultValue: "design", look: "outline", onValueChange: action() },
  argTypes: {
    look: { control: "inline-radio", options: ["outline", "pill", "bare"], description: "How the options are drawn" },
    options: { control: "object" },
    value: { control: false },
  },
} satisfies Meta<typeof ChoiceGroup>;

export default meta;
type Example = ExampleOf<typeof meta>;

export const Outline: Example = {
  description: "Form choices: Type on a new task.",
};

export const Pill: Example = {
  args: {
    "aria-label": "Quick filter",
    look: "pill",
    defaultValue: "all",
    options: [
      { value: "all", label: "All work" },
      { value: "mine", label: "Mine" },
      { value: "week", label: "Due this week" },
      { value: "risk", label: "At risk" },
    ],
  },
  description: "The tracker's quick filters; the chosen one is ink.",
};

export const Bare: Example = {
  args: {
    "aria-label": "Status",
    look: "bare",
    defaultValue: "in_progress",
    options: [
      { value: "backlog", label: <Chip glyph="square">Backlog</Chip> },
      {
        value: "in_progress",
        label: (
          <Chip tone="blue" glyph="circle-half">
            In Progress
          </Chip>
        ),
      },
      {
        value: "review",
        label: (
          <Chip tone="blue" glyph="diamond">
            In Review
          </Chip>
        ),
      },
      {
        value: "done",
        label: (
          <Chip tone="teal" glyph="check">
            Done
          </Chip>
        ),
      },
    ],
  },
  description: "Status as chips; the chosen chip gains the ring.",
};

export const Priority: Example = {
  args: {
    "aria-label": "Priority",
    defaultValue: "2",
    options: ([1, 2, 3] as const).map((level) => ({ value: String(level), label: <PriorityMark level={level} /> })),
  },
  description: "Priority as glyph and ink inside outlined options.",
};

export const Controlled: Example = {
  render: function Render(args) {
    const [value, setValue] = useState<string | undefined>(undefined);
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <ChoiceGroup {...args} value={value} onValueChange={setValue} />
        <p className="caption text-3">{value ? `Type: ${value}` : "Nothing chosen yet"}</p>
      </div>
    );
  },
  args: { defaultValue: undefined },
  description: "Starts with nothing chosen; the first option takes focus from the keyboard.",
};

export const AllVariants: Example = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <ChoiceGroup
        aria-label="Quick filter"
        look="pill"
        defaultValue="all"
        options={[
          { value: "all", label: "All work" },
          { value: "mine", label: "Mine" },
          { value: "week", label: "Due this week" },
        ]}
      />
      <ChoiceGroup aria-label="Type" look="outline" defaultValue="bug" options={types} />
      <ChoiceGroup
        aria-label="Health"
        look="bare"
        defaultValue="ok"
        options={[
          {
            value: "ok",
            label: (
              <Chip tone="teal" glyph="check">
                On track
              </Chip>
            ),
          },
          {
            value: "watch",
            label: (
              <Chip tone="amber" glyph="diamond-filled">
                Watch
              </Chip>
            ),
          },
          {
            value: "risk",
            label: (
              <Chip tone="red" glyph="triangle">
                At risk
              </Chip>
            ),
          },
        ]}
      />
    </div>
  ),
  description: "Pill, outline and bare, each with a choice made.",
};
