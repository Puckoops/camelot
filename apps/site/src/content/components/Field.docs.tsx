import { Mail01Icon } from "@hugeicons/core-free-icons";
import { Card, Field, Input, SearchInput, Textarea, TextLink } from "@puckoops/camelot";
import type { ExampleOf, Meta } from "@/docs";

const meta = {
  title: "ui/Field",
  component: Field,
  subcomponents: { Input, SearchInput, Textarea },
  description:
    "A **label**, a **control** and a **hint or error**, wired together: Field gives its child an id, points `aria-describedby` at the hint or error, and sets `aria-invalid` when there is an error. **Input** takes a prefix, a suffix or an icon; **Textarea** is for notes; **SearchInput** is the filter box.",
  decorators: [
    (Example, { parameters }) => (
      <div style={{ width: parameters.frameWidth ?? 360 }}>
        <Example />
      </div>
    ),
  ],
  args: {
    label: "Client name",
    hint: "As it appears on invoices.",
    required: false,
    children: <Input placeholder="Nordvik Atelier" />,
  },
  argTypes: {
    label: { control: "text" },
    hint: { control: "text", description: "Hidden while there is an error" },
    error: { control: "text", description: "Replaces the hint and marks the control invalid" },
    required: { control: "boolean" },
    aside: { control: false },
    children: { control: false },
  },
} satisfies Meta<typeof Field>;

export default meta;
type Example = ExampleOf<typeof meta>;

export const Default: Example = {
  description: "A text input with a label and a hint.",
};

export const Required: Example = {
  args: { required: true, hint: undefined },
  description: "The asterisk is visual; say which fields are required once, in the form's footer note.",
};

export const WithError: Example = {
  args: { error: "Enter the client's name, as it appears on their invoices.", children: <Input defaultValue="" placeholder="Nordvik Atelier" /> },
  description: "The error replaces the hint, says what to do, and is announced.",
};

export const WithAside: Example = {
  args: { label: "Client", hint: undefined, aside: <TextLink href="#">Add client</TextLink>, children: <Input placeholder="Search clients" /> },
  description: "A related action at the end of the label row.",
};

export const PrefixAndSuffix: Example = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Field label="Fee" hint="In the project's currency.">
        <Input prefix="£" placeholder="0.00" inputMode="decimal" />
      </Field>
      <Field label="Estimate">
        <Input suffix="hrs" placeholder="12" inputMode="numeric" />
      </Field>
    </div>
  ),
  description: "Affixes are set in mono in the quiet ink, so the typed value leads.",
};

export const WithIcon: Example = {
  args: { label: "Email", hint: undefined, children: <Input type="email" iconStart={Mail01Icon} placeholder="annika@nordvikatelier.com" /> },
  description: "A 14px icon at the start, for a field whose kind is not obvious from the label.",
};

export const Search: Example = {
  render: () => <SearchInput placeholder="Search tasks, bugs, deliverables" aria-label="Search tasks" />,
  description: "SearchInput for the filter row; label it with aria-label when there is no visible label.",
};

export const Notes: Example = {
  args: { label: "Notes", hint: "Only your team sees these.", children: <Textarea placeholder="Anything the next person should know" /> },
  description: "Textarea grows vertically from four rows.",
};

export const Disabled: Example = {
  args: { label: "Client code", hint: "Set when the client was created.", children: <Input defaultValue="NVA-014" disabled /> },
  description: "A disabled control keeps its value readable.",
};

export const AllVariants: Example = {
  render: () => (
    <Card style={{ gap: 16, width: 420 }}>
      <Field label="Client name" required hint="As it appears on invoices.">
        <Input placeholder="Nordvik Atelier" />
      </Field>
      <Field label="Email" error="Enter an email address, such as annika@nordvikatelier.com.">
        <Input type="email" iconStart={Mail01Icon} defaultValue="annika@" />
      </Field>
      <Field label="Fee" aside={<TextLink href="#">Rates</TextLink>}>
        <Input prefix="£" suffix="GBP" placeholder="0.00" />
      </Field>
      <Field label="Client code">
        <Input defaultValue="NVA-014" disabled />
      </Field>
      <Field label="Notes">
        <Textarea rows={3} placeholder="Anything the next person should know" />
      </Field>
      <SearchInput aria-label="Search" placeholder="Search" />
    </Card>
  ),
  parameters: { frameWidth: "auto" },
  description: "Every control and state on a card surface.",
};
