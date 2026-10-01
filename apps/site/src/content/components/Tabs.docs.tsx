import { Card, Chip, DescriptionList, ListCard, Tabs, TabsContent, TabsList, TabsTrigger, UploadItem } from "@puckoops/camelot";
import { useState } from "react";
import { action, type ExampleOf, type Meta } from "@/docs";

function ProjectSections() {
  return (
    <>
      <TabsContent value="overview">
        <DescriptionList
          items={[
            { label: "Client", value: "Nordvik Atelier" },
            { label: "Budget", value: <span className="num">£28,000</span> },
            {
              label: "Status",
              value: (
                <Chip tone="blue" glyph="circle-half">
                  In Progress
                </Chip>
              ),
            },
          ]}
        />
      </TabsContent>
      <TabsContent value="tasks">
        <ListCard
          title="Open tasks"
          rows={[
            { label: "Signage proofs", value: "03 Oct" },
            { label: "Stationery print run", value: "09 Oct" },
            { label: "Website header", value: "15 Oct" },
          ]}
        />
      </TabsContent>
      <TabsContent value="files">
        <UploadItem name="Nordvik_signage_pilot.pdf" kind="PDF" size="3.2 MB" progress={100} status="done" />
        <UploadItem name="Brand_guidelines_v4.pdf" kind="PDF" size="6.1 MB" progress={100} status="done" />
      </TabsContent>
      <TabsContent value="activity">
        <p className="small text-3">Moved to In Progress by Annika Revell on 24 Sep.</p>
      </TabsContent>
    </>
  );
}

const meta = {
  title: "ui/Tabs",
  component: Tabs,
  subcomponents: { TabsList, TabsTrigger, TabsContent },
  description:
    "Sections of one surface that the reader switches between; only the chosen section is rendered. **underline** is for the sections of a page or a record, with an ink rule under the chosen tab; **segmented** sits inside a card, a drawer or a panel. A **count** after the label is a neutral Badge. Arrow keys move between tabs, and a disabled tab is skipped.",
  decorators: [
    (Example, { parameters }) => (
      <div style={{ width: parameters.frameWidth ?? 560 }}>
        <Example />
      </div>
    ),
  ],
  args: { variant: "underline", defaultValue: "overview", onValueChange: action(), activationMode: "automatic" },
  argTypes: {
    variant: { control: "inline-radio", options: ["underline", "segmented"] },
    defaultValue: { control: "select", options: ["overview", "tasks", "files", "activity"] },
    activationMode: { control: "inline-radio", options: ["automatic", "manual"], description: "manual waits for Enter or Space" },
    value: { control: false },
    children: { control: false },
  },
  render: (args) => (
    <Tabs {...args}>
      <TabsList aria-label="Project">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="tasks" count={12}>
          Tasks
        </TabsTrigger>
        <TabsTrigger value="files" count={2}>
          Files
        </TabsTrigger>
        <TabsTrigger value="activity">Activity</TabsTrigger>
      </TabsList>
      <ProjectSections />
    </Tabs>
  ),
} satisfies Meta<typeof Tabs>;

export default meta;
type Example = ExampleOf<typeof meta>;

export const Underline: Example = {
  description: "The sections of a project, with counts on Tasks and Files.",
};

export const Segmented: Example = {
  args: { variant: "segmented" },
  description: "Inside a panel: the chosen tab rises onto the surface.",
};

export const WithoutCounts: Example = {
  render: (args) => (
    <Tabs {...args} defaultValue="details">
      <TabsList aria-label="Client">
        <TabsTrigger value="details">Details</TabsTrigger>
        <TabsTrigger value="billing">Billing</TabsTrigger>
        <TabsTrigger value="people">People</TabsTrigger>
      </TabsList>
      <TabsContent value="details">
        <p className="small text-2">Nordvik Atelier, Oslo. Client since March 2024.</p>
      </TabsContent>
      <TabsContent value="billing">
        <p className="small text-2">Invoices to accounts@nordvikatelier.com, 30 days.</p>
      </TabsContent>
      <TabsContent value="people">
        <p className="small text-2">Annika Revell, Tomas Lind.</p>
      </TabsContent>
    </Tabs>
  ),
  description: "One or two words per tab.",
};

export const DisabledTab: Example = {
  render: (args) => (
    <Tabs {...args} defaultValue="overview">
      <TabsList aria-label="Project">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="tasks" count={12}>
          Tasks
        </TabsTrigger>
        <TabsTrigger value="files" disabled>
          Files
        </TabsTrigger>
        <TabsTrigger value="activity">Activity</TabsTrigger>
      </TabsList>
      <ProjectSections />
    </Tabs>
  ),
  description: "Files is unavailable until the project has a folder; the arrow keys skip it.",
};

export const InACard: Example = {
  render: function Render() {
    const [tab, setTab] = useState("week");
    return (
      <Card style={{ gap: 0 }}>
        <Tabs value={tab} onValueChange={setTab} variant="segmented">
          <TabsList aria-label="Period">
            <TabsTrigger value="week">This week</TabsTrigger>
            <TabsTrigger value="month">This month</TabsTrigger>
          </TabsList>
          <TabsContent value="week">
            <p className="small text-2">14 tasks due, 3 invoices to send.</p>
          </TabsContent>
          <TabsContent value="month">
            <p className="small text-2">58 tasks due, 9 invoices to send.</p>
          </TabsContent>
        </Tabs>
      </Card>
    );
  },
  description: "Segmented tabs, controlled, at the top of a card.",
};

export const AllVariants: Example = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
      {(["underline", "segmented"] as const).map((variant) => (
        <div key={variant}>
          <p className="caps text-4" style={{ marginBottom: 12 }}>
            {variant}
          </p>
          <Tabs variant={variant} defaultValue="tasks">
            <TabsList aria-label={`Project, ${variant}`}>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="tasks" count={12}>
                Tasks
              </TabsTrigger>
              <TabsTrigger value="files" count={2}>
                Files
              </TabsTrigger>
              <TabsTrigger value="activity" disabled>
                Activity
              </TabsTrigger>
            </TabsList>
            <ProjectSections />
          </Tabs>
        </div>
      ))}
    </div>
  ),
  description: "Both variants with counts and a disabled tab.",
};
