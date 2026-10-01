import { Card, HelperText, Label, RadioGroup } from "@puckoops/camelot";
import { useState } from "react";
import { action, type ExampleOf, type Meta } from "@/docs";

const frequency = [
  { value: "monthly", label: "Monthly", description: "One invoice on the first working day of the month." },
  { value: "milestone", label: "At each milestone", description: "An invoice when the client signs off a milestone." },
  { value: "end", label: "At the end", description: "One invoice when the project closes." },
];

const meta = {
  title: "ui/RadioGroup",
  component: RadioGroup,
  description:
    "One choice from a short list, as radio buttons that can each carry a **sentence of explanation**. The chosen radio is ink-filled; the arrow keys move the choice and Tab leaves the group. Label the group with a Label and aria-labelledby.",
  args: { options: frequency, defaultValue: "monthly", orientation: "vertical", "aria-label": "Invoice frequency", onValueChange: action() },
  argTypes: {
    orientation: { control: "inline-radio", options: ["vertical", "horizontal"] },
    options: { control: "object" },
    disabled: { control: "boolean" },
    value: { control: false },
  },
} satisfies Meta<typeof RadioGroup>;

export default meta;
type Example = ExampleOf<typeof meta>;

export const WithDescriptions: Example = {
  description: "Each option explains what it means for the invoice.",
};

export const Horizontal: Example = {
  args: {
    orientation: "horizontal",
    "aria-label": "Currency",
    defaultValue: "gbp",
    options: [
      { value: "gbp", label: "GBP" },
      { value: "eur", label: "EUR" },
      { value: "nok", label: "NOK" },
    ],
  },
  description: "Short labels in a row.",
};

export const DisabledOption: Example = {
  args: { options: [...frequency, { value: "retainer", label: "Retainer", description: "Needs a signed retainer on file.", disabled: true }] },
  description: "An option that cannot be chosen says why in its description.",
};

export const Disabled: Example = {
  args: { disabled: true },
  description: "The whole group, locked after the first invoice is sent.",
};

export const InAForm: Example = {
  render: function Render() {
    const [value, setValue] = useState<string | undefined>(undefined);
    return (
      <Card style={{ width: 420, gap: 12 }}>
        <Label id="frequency" required>
          Invoice frequency
        </Label>
        <RadioGroup options={frequency} value={value} onValueChange={setValue} aria-labelledby="frequency" aria-describedby="frequency-note" required />
        <HelperText id="frequency-note" tone={value ? "hint" : "error"}>
          {value ? "You can change this until the first invoice is sent." : "Choose how often this client is invoiced."}
        </HelperText>
      </Card>
    );
  },
  description: "Labelled by a Label, described by a HelperText that turns from error to hint.",
};

export const AllVariants: Example = {
  render: () => (
    <div style={{ display: "flex", gap: 48 }}>
      <RadioGroup aria-label="Frequency" options={frequency} defaultValue="milestone" />
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <RadioGroup
          aria-label="Currency"
          orientation="horizontal"
          defaultValue="eur"
          options={[
            { value: "gbp", label: "GBP" },
            { value: "eur", label: "EUR" },
            { value: "nok", label: "NOK" },
          ]}
        />
        <RadioGroup
          aria-label="Locked"
          disabled
          defaultValue="a"
          options={[
            { value: "a", label: "Chosen, disabled" },
            { value: "b", label: "Not chosen, disabled" },
          ]}
        />
      </div>
    </div>
  ),
  description: "Vertical with descriptions, horizontal, and disabled.",
};
