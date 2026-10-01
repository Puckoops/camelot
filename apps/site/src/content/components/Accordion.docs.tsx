import { Accordion, AccordionItem, DescriptionList, Switch } from "@puckoops/camelot";
import { useState, type ComponentType } from "react";
import type { ExampleOf, Meta } from "@/docs";

interface AccordionArgs {
  type: "single" | "multiple";
  collapsible?: boolean;
  defaultValue?: string;
  variant?: "plain" | "framed";
}

function Sections() {
  return (
    <>
      <AccordionItem value="billing" title="Billing details" meta="GBP">
        <DescriptionList
          items={[
            { label: "Billing contact", value: "accounts@nordvikatelier.com" },
            { label: "Terms", value: "30 days" },
            { label: "VAT number", value: <span className="num">GB 318 4471 20</span> },
          ]}
        />
      </AccordionItem>
      <AccordionItem value="engagements" title="Past engagements" meta="4">
        <p>Brand system (2024), signage pilot (2025), two annual reports. Files for each are in Inventory.</p>
      </AccordionItem>
      <AccordionItem value="notes" title="Notes for the team">
        <p>Annika signs off print proofs herself; send them as PDF, never as a link.</p>
      </AccordionItem>
      <AccordionItem value="archive" title="Archive this client" disabled>
        <p>Archiving needs an owner.</p>
      </AccordionItem>
    </>
  );
}

const meta = {
  title: "ui/Accordion",
  component: Accordion as ComponentType<AccordionArgs>,
  subcomponents: { AccordionItem },
  description:
    'Sections that open in place. **type="single"** keeps one open at a time (add **collapsible** to let it close); **type="multiple"** lets several stay open. Each **AccordionItem** has a title, an optional quiet meta such as a count, and its content. Opening fades the content in and turns the chevron; nothing animates its height.',
  decorators: [
    (Example, { parameters }) => (
      <div style={{ width: parameters.frameWidth ?? 520 }}>
        <Example />
      </div>
    ),
  ],
  args: { type: "single", collapsible: true, defaultValue: "billing", variant: "plain" },
  argTypes: {
    type: { control: "inline-radio", options: ["single", "multiple"], description: "One open at a time, or several" },
    collapsible: { control: "boolean", description: "single only: the open section can close" },
    variant: { control: "inline-radio", options: ["plain", "framed"], description: "Hairlines only, or on a card surface" },
    defaultValue: { control: "text", description: "The section open at first" },
  },
  render: ({ type, collapsible, defaultValue, variant }) =>
    type === "multiple" ? (
      <Accordion type="multiple" variant={variant} defaultValue={defaultValue ? [defaultValue] : []}>
        <Sections />
      </Accordion>
    ) : (
      <Accordion type="single" variant={variant} collapsible={collapsible} defaultValue={defaultValue}>
        <Sections />
      </Accordion>
    ),
} satisfies Meta<ComponentType<AccordionArgs>>;

export default meta;
type Example = ExampleOf<typeof meta>;

export const Single: Example = {
  description: "One section at a time; the last is disabled.",
};

export const Multiple: Example = {
  render: ({ variant }) => (
    <Accordion type="multiple" variant={variant} defaultValue={["billing", "notes"]}>
      <Sections />
    </Accordion>
  ),
  description: "Several sections open together.",
};

export const Framed: Example = {
  args: { variant: "framed" },
  description: "On a card surface, for a settings page.",
};

export const Controlled: Example = {
  render: function Render() {
    const [open, setOpen] = useState("notifications");
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <Accordion type="single" collapsible value={open} onValueChange={setOpen} variant="framed">
          <AccordionItem value="notifications" title="Notifications">
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <Switch label="Overdue invoices" defaultChecked labelPosition="start" />
              <Switch label="Tasks sent back" labelPosition="start" />
            </div>
          </AccordionItem>
          <AccordionItem value="security" title="Sign-in and security">
            <p>Two-step sign-in is on for everyone in the studio.</p>
          </AccordionItem>
        </Accordion>
        <p className="caption text-3">Open: {open || "nothing"}</p>
      </div>
    );
  },
  description: "Controlled from state, with settings inside a section.",
};

export const AllVariants: Example = {
  render: () => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 32, width: 960 }}>
      <div>
        <p className="caps text-4" style={{ marginBottom: 12 }}>
          plain
        </p>
        <Accordion type="single" collapsible defaultValue="billing">
          <Sections />
        </Accordion>
      </div>
      <div>
        <p className="caps text-4" style={{ marginBottom: 12 }}>
          framed
        </p>
        <Accordion type="multiple" defaultValue={["engagements"]} variant="framed">
          <Sections />
        </Accordion>
      </div>
    </div>
  ),
  parameters: { frameWidth: "auto" },
  description: "Plain and framed, single and multiple.",
};
