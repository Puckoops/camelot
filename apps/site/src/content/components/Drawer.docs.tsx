import { Button, Card, Chip, DescriptionList, Dialog, Drawer, DrawerSection, Field, Input, PriorityMark, Select, Textarea } from "@puckoops/camelot";
import { useState } from "react";
import { useArgs, type ExampleOf, type Meta } from "@/docs";

const record = [
  { label: "Client", value: "Nordvik Atelier" },
  { label: "Assignee", value: "Annika Revell" },
  { label: "Priority", value: <PriorityMark level={1} /> },
  {
    label: "Status",
    value: (
      <Chip tone="blue" glyph="circle-half">
        In Progress
      </Chip>
    ),
  },
  { label: "Due", value: <span className="num">02 Oct 2026</span> },
  { label: "Budget", value: <span className="num">£28,000</span> },
];

const meta = {
  title: "ui/Drawer",
  component: Drawer,
  subcomponents: { DrawerSection, DescriptionList, Dialog },
  description:
    "A **480px right sheet** over the scrim for creating or inspecting one record: a header with the title and close, a scrolling body of **DrawerSection**s split by the strong hairline, and a footer for the actions. **DescriptionList** is its field rows. **Dialog** is the centred version for a confirmation or a question that blocks the flow.",
  args: { title: "Brand system rollout", description: "Task · Nordvik Atelier", open: false, width: 480, children: null },
  argTypes: {
    title: { control: "text" },
    description: { control: "text" },
    open: { control: "boolean", description: "Controlled open state" },
    width: { control: { type: "range", min: 360, max: 720, step: 40 } },
    trigger: { control: false },
    footer: { control: false },
    children: { control: false },
  },
  render: function Render(args) {
    const [, updateArgs] = useArgs();
    return (
      <>
        <Button variant="primary" onClick={() => updateArgs({ open: true })}>
          Open task
        </Button>
        <Drawer
          {...args}
          onOpenChange={(open) => updateArgs({ open })}
          footer={
            <>
              <Button variant="quiet" onClick={() => updateArgs({ open: false })}>
                Close
              </Button>
              <Button variant="primary">Mark done</Button>
            </>
          }
        >
          <DrawerSection>
            <DescriptionList items={record} />
          </DrawerSection>
          <DrawerSection title="Brief">
            <p className="small text-2">
              Roll the new identity out across stationery, signage and the website header. Print proofs go to Annika before anything is ordered.
            </p>
          </DrawerSection>
          <DrawerSection title="Activity">
            <p className="small text-3">Moved to In Progress by Annika Revell on 24 Sep.</p>
          </DrawerSection>
        </Drawer>
      </>
    );
  },
} satisfies Meta<typeof Drawer>;

export default meta;
type Example = ExampleOf<typeof meta>;

export const RecordDetail: Example = {
  description: "A record opened from a list: fields, brief and activity in sections. Toggle open in the controls or press the button.",
};

export const CreateForm: Example = {
  render: function Render() {
    const [open, setOpen] = useState(false);
    return (
      <Drawer
        open={open}
        onOpenChange={setOpen}
        trigger={<Button variant="primary">Add client</Button>}
        title="Add client"
        footer={
          <>
            <Button variant="quiet" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={() => setOpen(false)}>
              Save client
            </Button>
          </>
        }
      >
        <DrawerSection>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <Field label="Client name" required>
              <Input placeholder="Nordvik Atelier" />
            </Field>
            <Field label="Billing email" hint="Invoices go here.">
              <Input type="email" placeholder="accounts@nordvikatelier.com" />
            </Field>
            <Field label="Currency">
              <Select
                defaultValue="gbp"
                options={[
                  { value: "gbp", label: "GBP · Pound sterling" },
                  { value: "eur", label: "EUR · Euro" },
                  { value: "nok", label: "NOK · Norwegian krone" },
                ]}
              />
            </Field>
          </div>
        </DrawerSection>
        <DrawerSection title="Notes">
          <Field label="Anything the team should know">
            <Textarea rows={3} />
          </Field>
        </DrawerSection>
      </Drawer>
    );
  },
  description: "A short create form with Cancel and the one primary action in the footer.",
};

export const Confirmation: Example = {
  render: function Render() {
    const [open, setOpen] = useState(false);
    return (
      <Dialog
        open={open}
        onOpenChange={setOpen}
        trigger={<Button>Delete invoice</Button>}
        title="Delete Invoice 2041?"
        description="It has not been sent. This cannot be undone."
        footer={
          <>
            <Button variant="quiet" onClick={() => setOpen(false)}>
              Keep it
            </Button>
            <Button variant="primary" onClick={() => setOpen(false)}>
              Delete invoice
            </Button>
          </>
        }
      >
        <p className="small text-2">The line items and the attached timesheet stay on the project.</p>
      </Dialog>
    );
  },
  description: "Dialog: a centred question that blocks the flow, with the safe choice first.",
};

export const Rows: Example = {
  render: () => (
    <Card style={{ width: 440 }}>
      <DescriptionList items={record} />
    </Card>
  ),
  description: "DescriptionList on its own: a 128px caption label and a small value per row.",
};

export const AllVariants: Example = {
  render: function Render() {
    const [drawer, setDrawer] = useState(false);
    const [dialog, setDialog] = useState(false);
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 24 }}>
        <div style={{ display: "flex", gap: 8 }}>
          <Button variant="primary" onClick={() => setDrawer(true)}>
            Open drawer
          </Button>
          <Button onClick={() => setDialog(true)}>Open dialog</Button>
        </div>
        <Card style={{ width: 480 }}>
          <DrawerSection title="Details">
            <DescriptionList items={record.slice(0, 3)} />
          </DrawerSection>
          <DrawerSection title="Budget">
            <DescriptionList items={record.slice(4)} />
          </DrawerSection>
        </Card>
        <Drawer
          open={drawer}
          onOpenChange={setDrawer}
          title="Brand system rollout"
          description="Task · Nordvik Atelier"
          footer={
            <Button variant="primary" onClick={() => setDrawer(false)}>
              Done
            </Button>
          }
        >
          <DrawerSection>
            <DescriptionList items={record} />
          </DrawerSection>
        </Drawer>
        <Dialog
          open={dialog}
          onOpenChange={setDialog}
          title="Archive Nordvik Atelier?"
          description="Their projects and files stay searchable."
          footer={
            <Button variant="primary" onClick={() => setDialog(false)}>
              Archive
            </Button>
          }
        >
          <p className="small text-2">You can restore an archived client at any time.</p>
        </Dialog>
      </div>
    );
  },
  description: "Both overlays from their triggers, and the sections and rows inline on a card.",
};
