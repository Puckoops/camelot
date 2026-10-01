import { HelperText, Input, Label, RadioGroup } from "@puckoops/camelot";
import { useId } from "react";
import type { ExampleOf, Meta } from "@/docs";

const meta = {
  title: "ui/Label",
  component: Label,
  description:
    "The caption above a control, in the quiet ink: **required** adds the asterisk, **optional** adds a quieter *Optional*. It is a Radix label, so clicking it focuses the control named by **htmlFor**. Inside a form prefer **Field**, which renders the label, hint and error together.",
  args: { children: "Client name", required: false, optional: false, htmlFor: "label-demo" },
  argTypes: {
    children: { control: "text" },
    required: { control: "boolean" },
    optional: { control: "boolean" },
    htmlFor: { control: "text" },
  },
  render: function Render(args) {
    const id = `${args.htmlFor}${useId()}`;
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 6, width: 320 }}>
        <Label {...args} htmlFor={id} />
        <Input id={id} placeholder="Nordvik Atelier" />
      </div>
    );
  },
} satisfies Meta<typeof Label>;

export default meta;
type Example = ExampleOf<typeof meta>;

export const Default: Example = {
  description: "Click the label to focus the input.",
};

export const Required: Example = {
  args: { required: true },
  description: "An asterisk in the stronger ink.",
};

export const Optional: Example = {
  args: { optional: true, children: "Purchase order number" },
  description: "For the one optional field in a mostly required form.",
};

export const ForARadioGroup: Example = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, width: 320 }}>
      <Label id="visibility-label" required>
        Who can see this project
      </Label>
      <RadioGroup
        aria-labelledby="visibility-label"
        aria-describedby="visibility-help"
        defaultValue="team"
        options={[
          { value: "team", label: "The studio team" },
          { value: "client", label: "The team and the client", description: "The client sees tasks marked shared, and every file." },
        ]}
      />
      <HelperText id="visibility-help">You can change this later from the project’s settings.</HelperText>
    </div>
  ),
  description: "A control that Field does not wrap takes a Label by id and a HelperText.",
};

export const AllVariants: Example = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, width: 320 }}>
      {[
        { id: "a", text: "Client name", required: true },
        { id: "b", text: "Billing email" },
        { id: "c", text: "Purchase order number", optional: true },
      ].map((f) => (
        <div key={f.id} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <Label htmlFor={`all-${f.id}`} required={f.required} optional={f.optional}>
            {f.text}
          </Label>
          <Input id={`all-${f.id}`} />
        </div>
      ))}
    </div>
  ),
  description: "Required, plain and optional.",
};
