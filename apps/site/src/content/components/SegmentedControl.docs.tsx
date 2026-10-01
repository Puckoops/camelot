import { SegmentedControl } from "@puckoops/camelot";
import { useState } from "react";
import { action, type ExampleOf, type Meta } from "@/docs";

const views = [
  { value: "month", label: "Month" },
  { value: "week", label: "Week" },
  { value: "timeline", label: "Timeline" },
  { value: "agenda", label: "Agenda" },
];

const meta = {
  title: "ui/SegmentedControl",
  component: SegmentedControl,
  description:
    "Two to five mutually exclusive **views** in a trough with a sliding thumb — *Month · Week · Timeline · Agenda*, *Both · Payable · Receivable*. The labels stay put and the thumb moves. Arrow keys move the choice and wrap.",
  args: { "aria-label": "View", options: views, defaultValue: "week", size: "md", onValueChange: action() },
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "md"], description: "30px or the 36px control height" },
    options: { control: "object" },
    value: { control: false },
    defaultValue: { control: "select", options: views.map((v) => v.value) },
  },
} satisfies Meta<typeof SegmentedControl>;

export default meta;
type Example = ExampleOf<typeof meta>;

export const Default: Example = {
  description: "The calendar's view switch.",
};

export const Small: Example = {
  args: { size: "sm" },
  description: "30px, for a topbar or a card header.",
};

export const Direction: Example = {
  args: {
    "aria-label": "Direction",
    defaultValue: "both",
    options: [
      { value: "both", label: "Both" },
      { value: "payable", label: "Payable" },
      { value: "receivable", label: "Receivable" },
    ],
  },
  description: "A direction filter over the same list of obligations.",
};

export const Controlled: Example = {
  render: function Render(args) {
    const [view, setView] = useState("timeline");
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 12 }}>
        <SegmentedControl {...args} value={view} onValueChange={setView} />
        <p className="caption text-3">
          Showing the <span className="num">{view}</span> view
        </p>
      </div>
    );
  },
  description: "Controlled by state, as when the view lives in the URL.",
};

export const AllVariants: Example = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 16 }}>
      <SegmentedControl aria-label="View" options={views} defaultValue="month" />
      <SegmentedControl aria-label="View" options={views} defaultValue="agenda" size="sm" />
      <SegmentedControl
        aria-label="Appearance"
        size="sm"
        defaultValue="system"
        options={[
          { value: "light", label: "Light" },
          { value: "dark", label: "Dark" },
          { value: "system", label: "System" },
        ]}
      />
    </div>
  ),
  description: "Both sizes and a three-way appearance switch.",
};
