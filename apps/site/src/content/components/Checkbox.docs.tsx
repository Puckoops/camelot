import { Checkbox } from "@puckoops/camelot";
import { useState } from "react";
import { action, type ExampleOf, type Meta } from "@/docs";

const meta = {
  title: "ui/Checkbox",
  component: Checkbox,
  description:
    "An independent on/off choice with a label — *Include archived*, a calendar overlay, a row in a list of options. Checked is ink-filled with a white tick. The label is a real `<label>`, so clicking it toggles the box.",
  args: { label: "Include archived", onCheckedChange: action() },
  argTypes: {
    label: { control: "text" },
    checked: { control: "boolean" },
    defaultChecked: { control: "boolean" },
    disabled: { control: "boolean" },
  },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Example = ExampleOf<typeof meta>;

export const Default: Example = {
  description: "Unchecked, with its label.",
};

export const Checked: Example = {
  args: { defaultChecked: true },
  description: "Ink fill and a tick.",
};

export const Disabled: Example = {
  args: { disabled: true, label: "Include deleted (admins only)" },
  description: "Dimmed and inert.",
};

export const DisabledChecked: Example = {
  args: { disabled: true, defaultChecked: true, label: "Studio calendar (always shown)" },
  description: "A choice that is fixed on.",
};

export const Overlays: Example = {
  render: function Render() {
    const [on, setOn] = useState<Record<string, boolean>>({ tasks: true, invoices: true, holidays: false });
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {[
          ["tasks", "Task due dates"],
          ["invoices", "Invoice due dates"],
          ["holidays", "Public holidays"],
        ].map(([key, label]) => (
          <Checkbox key={key} label={label} checked={on[key!]} onCheckedChange={(v) => setOn((s) => ({ ...s, [key!]: v }))} />
        ))}
        <p className="caption text-4">{Object.values(on).filter(Boolean).length} of 3 shown</p>
      </div>
    );
  },
  description: "A list of independent choices, such as calendar overlays.",
};

export const AllVariants: Example = {
  render: () => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, max-content)", gap: "12px 32px" }}>
      <Checkbox label="Unchecked" />
      <Checkbox label="Checked" defaultChecked />
      <Checkbox label="Disabled" disabled />
      <Checkbox label="Disabled, checked" disabled defaultChecked />
    </div>
  ),
  description: "Every state. Tab to see the focus ring.",
};
