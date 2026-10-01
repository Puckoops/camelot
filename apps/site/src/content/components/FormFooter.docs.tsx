import {
  Button,
  Card,
  DateInput,
  Field,
  FormFooter,
  Grid,
  GridItem,
  Input,
  Page,
  PageHeader,
  RadioGroup,
  SearchSelect,
  Textarea,
  toast,
  type FormFooterProps,
} from "@puckoops/camelot";
import type { Decorator, ExampleOf, Meta } from "@/docs";

const docsFrame: Decorator<FormFooterProps> = (Example, { parameters, viewMode }) =>
  viewMode === "docs" && !parameters.docsInline ? (
    <div style={{ height: 560, overflow: "auto", borderRadius: "var(--radius-lg)", boxShadow: "inset 0 0 0 var(--border-w) var(--hairline)" }}>
      <Example />
    </div>
  ) : (
    <Example />
  );

const clients = [
  { value: "brightwater", label: "Brightwater Foods" },
  { value: "halden", label: "Halden & Moss" },
  { value: "nordvik", label: "Nordvik Atelier" },
  { value: "purslane", label: "Purslane Studio" },
];

const meta = {
  title: "ui/FormFooter",
  component: FormFooter,
  decorators: [docsFrame],
  description:
    "The **sticky bottom bar of a long form**: a note on the left — *All fields marked \\* are required*, *Draft saved 2 min ago* — and the actions on the right, Cancel as quiet and the one primary last. It stays in reach while the form scrolls. Drawers and dialogs have their own footer.",
  parameters: { layout: "fullscreen" },
  args: { note: "All fields marked * are required", sticky: true, children: null },
  argTypes: {
    note: { control: "text" },
    sticky: { control: "boolean", description: "Pins the bar to the bottom while the form scrolls" },
    children: { control: false },
  },
  render: (args) => (
    <Page style={{ paddingBottom: "var(--space-6)" }}>
      <PageHeader title="New project" subtitle="Scope, budget and dates. You can change any of it later." />
      <form
        onSubmit={(e) => {
          e.preventDefault();
          toast.success("Project created", "Rebrand discovery · Purslane Studio");
        }}
      >
        <Card style={{ gap: 20 }}>
          <Grid>
            <GridItem span={6}>
              <Field label="Project name" required>
                <Input placeholder="Rebrand discovery" />
              </Field>
            </GridItem>
            <GridItem span={6}>
              <Field label="Client" required>
                <SearchSelect options={clients} placeholder="Select client" searchPlaceholder="Search clients" />
              </Field>
            </GridItem>
          </Grid>
          <Grid>
            <GridItem span={6}>
              <Field label="Start date" required>
                <DateInput value="2026-10-05" onChange={() => {}} />
              </Field>
            </GridItem>
            <GridItem span={6}>
              <Field label="Fee" hint="In the client's currency.">
                <Input prefix="£" placeholder="0.00" inputMode="decimal" />
              </Field>
            </GridItem>
          </Grid>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <span className="small text-3" id="billing-label">
              Billing
            </span>
            <RadioGroup
              aria-labelledby="billing-label"
              defaultValue="fixed"
              options={[
                { value: "fixed", label: "Fixed fee", description: "One price for the agreed scope." },
                { value: "hourly", label: "Hourly", description: "Invoiced monthly from logged hours." },
              ]}
            />
          </div>
          <Field label="Brief">
            <Textarea rows={8} placeholder="What the client asked for, in their words." />
          </Field>
          <Field label="Internal notes">
            <Textarea rows={6} />
          </Field>
        </Card>
        <FormFooter {...args}>
          <Button variant="quiet">Cancel</Button>
          <Button variant="primary" type="submit">
            Create project
          </Button>
        </FormFooter>
      </form>
    </Page>
  ),
} satisfies Meta<typeof FormFooter>;

export default meta;
type Example = ExampleOf<typeof meta>;

export const StickyOnALongForm: Example = {
  description: "Scroll the form: the bar stays at the bottom with its actions.",
};

export const DraftNote: Example = {
  args: { note: "Draft saved 2 min ago" },
  description: "The note can report state instead, such as an autosave.",
};

export const Static: Example = {
  args: { sticky: false },
  description: "Not pinned, for a form short enough to see whole.",
};

export const AllVariants: Example = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, padding: 24 }}>
      <FormFooter note="All fields marked * are required" sticky={false}>
        <Button variant="quiet">Cancel</Button>
        <Button variant="primary">Create project</Button>
      </FormFooter>
      <FormFooter note="Draft saved 2 min ago" sticky={false}>
        <Button>Save draft</Button>
        <Button variant="primary">Send invoice</Button>
      </FormFooter>
      <FormFooter sticky={false}>
        <Button variant="primary">Save changes</Button>
      </FormFooter>
    </div>
  ),
  parameters: { docsInline: true },
  description: "With the required note, with a draft note, and with no note.",
};
