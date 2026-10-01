import { HelperText, Input, Label, RadioGroup } from "@puckoops/camelot";
import { useState } from "react";
import type { ExampleOf, Meta } from "@/docs";

const meta = {
  title: "ui/HelperText",
  component: HelperText,
  description:
    "One line under a control. **hint** explains, in the quietest ink; **error** says what to do next and is announced; **success** confirms a check that passed. Each carries its glyph so the tone survives greyscale. Write an error as the fix — *Enter a date after 01 Oct*, not *Invalid date*.",
  decorators: [
    (Example, { parameters }) => (
      <div style={{ width: parameters.frameWidth ?? 360 }}>
        <Example />
      </div>
    ),
  ],
  args: { tone: "hint", children: "Shown on invoices and in reminders." },
  argTypes: {
    tone: { control: "inline-radio", options: ["hint", "error", "success"] },
    children: { control: "text" },
    glyph: { control: false },
  },
} satisfies Meta<typeof HelperText>;

export default meta;
type Example = ExampleOf<typeof meta>;

export const Hint: Example = {
  description: "Explains the control in the quietest ink.",
};

export const ErrorTone: Example = {
  name: "Error",
  args: { tone: "error", children: "Choose how often this client is invoiced." },
  description: "Says what to do, and is announced when it appears.",
};

export const SuccessTone: Example = {
  name: "Success",
  args: { tone: "success", children: "nordvik is free — the portal will be nordvik.puckoops.app." },
  description: "Confirms a check that passed.",
};

export const WithoutGlyph: Example = {
  args: { glyph: false },
  description: "A hint can drop its glyph when it is one of many in a dense form.",
};

export const UnderARadioGroup: Example = {
  render: function Render() {
    const [value, setValue] = useState<string | undefined>(undefined);
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <Label id="frequency-label" required>
          Invoice frequency
        </Label>
        <RadioGroup
          aria-labelledby="frequency-label"
          aria-describedby="frequency-help"
          value={value}
          onValueChange={setValue}
          options={[
            { value: "monthly", label: "Monthly" },
            { value: "milestone", label: "At each milestone" },
          ]}
        />
        {value ? (
          <HelperText id="frequency-help" tone="success">
            The first invoice goes out on {value === "monthly" ? "01 Nov" : "the first sign-off"}.
          </HelperText>
        ) : (
          <HelperText id="frequency-help" tone="error">
            Choose how often this client is invoiced.
          </HelperText>
        )}
      </div>
    );
  },
  description: "Under a control Field does not wrap: the error clears to a confirmation once a choice is made.",
};

export const UnderAnInput: Example = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <Label htmlFor="handle">Portal address</Label>
      <Input id="handle" defaultValue="nordvik" suffix=".puckoops.app" aria-describedby="handle-help" />
      <HelperText id="handle-help" tone="success">
        That address is free.
      </HelperText>
    </div>
  ),
  description: "Point the control's aria-describedby at the line.",
};

export const AllVariants: Example = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <HelperText>Shown on invoices and in reminders.</HelperText>
      <HelperText tone="error">Enter a date from 01 Oct onwards.</HelperText>
      <HelperText tone="success">That address is free.</HelperText>
      <HelperText glyph={false}>A hint without its glyph.</HelperText>
    </div>
  ),
  description: "Hint, error, success, and a hint without its glyph.",
};
