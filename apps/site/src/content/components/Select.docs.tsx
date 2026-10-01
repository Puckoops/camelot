import { Field, Select } from "@puckoops/camelot";
import { useState } from "react";
import { action, type ExampleOf, type Meta } from "@/docs";

const clients = [
  { value: "brightwater", label: "Brightwater Foods" },
  { value: "halden", label: "Halden & Moss" },
  { value: "nordvik", label: "Nordvik Atelier" },
  { value: "purslane", label: "Purslane Studio" },
];

const meta = {
  title: "ui/Select",
  component: Select,
  description:
    "Pick one value from a fixed list. **field** is the input-shaped control inside a form; **filter** is the compact button in a filter row. `allLabel` adds a first option such as *All clients* that reports an empty string.",
  decorators: [
    (Example, { parameters }) => (
      <div style={{ width: parameters.frameWidth ?? 280 }}>
        <Example />
      </div>
    ),
  ],
  args: { options: clients, placeholder: "Client", variant: "field", onValueChange: action(), "aria-label": "Client" },
  argTypes: {
    variant: { control: "inline-radio", options: ["field", "filter"], description: "Form control or filter button" },
    placeholder: { control: "text" },
    allLabel: { control: "text", description: 'Adds a "no filter" first option' },
    disabled: { control: "boolean" },
    options: { control: "object" },
  },
} satisfies Meta<typeof Select>;

export default meta;
type Example = ExampleOf<typeof meta>;

export const FieldVariant: Example = {
  name: "Field",
  description: "The form control: --surface-2, the control border, full width.",
};

export const Filter: Example = {
  args: { variant: "filter", allLabel: "All clients", value: "" },
  parameters: { frameWidth: "auto" },
  description: "A compact button in a filter row; All clients stands for no filter.",
};

export const InAField: Example = {
  render: function Render(args) {
    const [client, setClient] = useState("");
    return (
      <Field label="Client" required hint="Invoices go to the client's billing contact.">
        <Select {...args} value={client} onValueChange={setClient} placeholder="Select client" />
      </Field>
    );
  },
  description: "Inside Field the label, hint and invalid state reach the trigger.",
};

export const Invalid: Example = {
  render: (args) => (
    <Field label="Client" required error="Choose the client this project is for.">
      <Select {...args} placeholder="Select client" />
    </Field>
  ),
  description: "An error from Field marks the trigger invalid.",
};

export const DisabledOption: Example = {
  args: { options: [...clients, { value: "archived", label: "Old Harbour (archived)", disabled: true }] },
  description: "An option that cannot be picked stays visible for context.",
};

export const Disabled: Example = {
  args: { disabled: true, defaultValue: "nordvik" },
  description: "Read-only in this context, value still readable.",
};

export const AllVariants: Example = {
  render: (args) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, width: 320 }}>
      <Select {...args} variant="field" placeholder="Client" />
      <Select {...args} variant="field" defaultValue="nordvik" />
      <Select {...args} variant="field" disabled defaultValue="halden" />
      <div style={{ display: "flex", gap: 8 }}>
        <Select {...args} variant="filter" allLabel="All clients" value="" />
        <Select {...args} variant="filter" defaultValue="purslane" />
      </div>
    </div>
  ),
  parameters: { frameWidth: "auto" },
  description: "Field empty, chosen and disabled; filter with and without a value.",
};
