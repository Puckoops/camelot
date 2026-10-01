import { FilterIcon, Invoice01Icon, PackageIcon, Task01Icon } from "@hugeicons/core-free-icons";
import { Button, EmptyState, Table, TBody, Th, THead } from "@puckoops/camelot";
import type { ExampleOf, Meta } from "@/docs";

const meta = {
  title: "ui/EmptyState",
  component: EmptyState,
  description:
    "What shows where content would be: a **28px glyph**, **one sentence** that says what is missing, an optional line of detail, and **one ghost button** that fixes it. Never *No data*.",
  decorators: [
    (Example, { parameters }) => (
      <div style={{ width: parameters.frameWidth ?? 520 }}>
        <Example />
      </div>
    ),
  ],
  args: {
    icon: PackageIcon,
    title: "Nothing filed for this client yet.",
    action: <Button>Upload files</Button>,
    framed: false,
  },
  argTypes: {
    icon: { control: false },
    title: { control: "text", description: "One sentence" },
    description: { control: "text" },
    action: { control: false },
    framed: { control: "boolean", description: "On its own card, for an empty band" },
  },
} satisfies Meta<typeof EmptyState>;

export default meta;
type Example = ExampleOf<typeof meta>;

export const Default: Example = {
  description: "Inside a container that already has a surface.",
};

export const Framed: Example = {
  args: { framed: true },
  description: "On its own card when a whole band is empty.",
};

export const WithDescription: Example = {
  args: {
    icon: Invoice01Icon,
    title: "No invoices have been raised this month.",
    description: "Invoices appear here once they are sent. Drafts stay on the project.",
    action: <Button>New invoice</Button>,
    framed: true,
  },
  description: "A second line when the reader needs to know why.",
};

export const FilteredToNothing: Example = {
  render: () => (
    <Table
      isEmpty
      minWidth={0}
      empty={<EmptyState icon={FilterIcon} title="Nothing matches these filters." action={<Button size="sm">Clear filters</Button>} />}
    >
      <THead>
        <tr>
          <Th>Task</Th>
          <Th>Assignee</Th>
          <Th numeric>Due</Th>
        </tr>
      </THead>
      <TBody />
    </Table>
  ),
  description: "Inside a filtered table the header stays and the way out is one button.",
};

export const AllVariants: Example = {
  render: () => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 24, width: 880 }}>
      <EmptyState framed icon={PackageIcon} title="Nothing filed for this client yet." action={<Button>Upload files</Button>} />
      <EmptyState
        framed
        icon={Task01Icon}
        title="No tasks are assigned to you."
        description="New work shows up here as soon as someone assigns it."
        action={<Button>Browse the backlog</Button>}
      />
    </div>
  ),
  parameters: { frameWidth: "auto" },
  description: "With and without a second line.",
};
