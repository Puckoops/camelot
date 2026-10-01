import { FilterIcon } from "@hugeicons/core-free-icons";
import { Button, Chip, EmptyState, PriorityMark, Table, TBody, Td, TextLink, TGroup, Th, THead, Tr } from "@puckoops/camelot";
import { useState } from "react";
import type { ExampleOf, Meta } from "@/docs";

const rows = [
  {
    id: "2041",
    item: "Invoice 2041 — brand system",
    client: "Nordvik Atelier",
    state: (
      <Chip tone="red" glyph="triangle">
        Overdue
      </Chip>
    ),
    due: "02 Oct",
    amount: "£14,200",
  },
  {
    id: "ins",
    item: "Studio insurance renewal",
    client: "Internal",
    state: (
      <Chip tone="amber" glyph="diamond-filled">
        Payable
      </Chip>
    ),
    due: "04 Oct",
    amount: "£1,880",
  },
  {
    id: "2044",
    item: "Invoice 2044 — packaging art",
    client: "Brightwater Foods",
    state: (
      <Chip tone="blue" glyph="diamond">
        Receivable
      </Chip>
    ),
    due: "09 Oct",
    amount: "£9,600",
  },
  {
    id: "2046",
    item: "Invoice 2046 — September retainer",
    client: "Purslane Studio",
    state: (
      <Chip tone="blue" glyph="diamond">
        Receivable
      </Chip>
    ),
    due: "15 Oct",
    amount: "£3,150",
  },
  {
    id: "print",
    item: "Print run, signage pilot",
    client: "Nordvik Atelier",
    state: (
      <Chip tone="amber" glyph="diamond-filled">
        Payable
      </Chip>
    ),
    due: "21 Oct",
    amount: "£2,260",
  },
];

function Head() {
  return (
    <THead>
      <tr>
        <Th>Item</Th>
        <Th>Client</Th>
        <Th>Direction</Th>
        <Th numeric>Due</Th>
        <Th numeric>Amount</Th>
      </tr>
    </THead>
  );
}

function Body() {
  return (
    <TBody>
      {rows.map((r) => (
        <Tr key={r.id} interactive>
          <Td primary truncate>
            {r.item}
          </Td>
          <Td>{r.client}</Td>
          <Td>{r.state}</Td>
          <Td numeric>{r.due}</Td>
          <Td numeric>{r.amount}</Td>
        </Tr>
      ))}
    </TBody>
  );
}

const footer = (
  <>
    <span>5 obligations</span>
    <span>Receivable £26,950 · Payable £4,140</span>
  </>
);

const meta = {
  title: "ui/Table",
  component: Table,
  subcomponents: { THead, TBody, Tr, Th, Td, TGroup },
  description:
    "The product's table: a sticky **caps header** on --surface-2, three **densities**, **numeric** cells in right-aligned tabular mono, a **count line** under it, and an **empty state that keeps the header**. The first column reads in --text-1, the rest in --text-2. An **interactive row with onClick** is a tab stop and opens on Enter or Space; keys pressed on a control inside it are left to that control, and a row that holds its own link passes `tabIndex={-1}` so the link is the one stop. One dense table per viewport, never two in adjacent bands, and never the first thing on a screen.",
  parameters: { layout: "padded" },
  args: { density: "default", minWidth: 640, footer },
  argTypes: {
    density: { control: "inline-radio", options: ["relaxed", "default", "compact"], description: "52, 44 or 36px rows" },
    minWidth: { control: "number", description: "Below this the table scrolls sideways" },
    footer: { control: false },
    empty: { control: false },
    isEmpty: { control: "boolean", description: "Shows empty in place of the rows" },
  },
  render: (args) => (
    <Table {...args}>
      <Head />
      <Body />
    </Table>
  ),
} satisfies Meta<typeof Table>;

export default meta;
type Example = ExampleOf<typeof meta>;

export const Default: Example = {
  description: "44px rows, for the product's main tables.",
};

export const Relaxed: Example = {
  args: { density: "relaxed" },
  description: "52px rows, for a table people read rather than scan.",
};

export const Compact: Example = {
  args: { density: "compact" },
  description: "36px rows, for a second table or a drawer.",
};

export const Empty: Example = {
  args: {
    isEmpty: true,
    footer: undefined,
    empty: <EmptyState icon={FilterIcon} title="Nothing matches these filters." action={<Button size="sm">Clear filters</Button>} />,
  },
  render: (args) => (
    <Table {...args}>
      <Head />
      <TBody />
    </Table>
  ),
  description: "Filtered to nothing: the header stays so the reader keeps their place.",
};

export const Grouped: Example = {
  render: (args) => (
    <Table {...args} footer={<span>3 groups · 5 tasks</span>}>
      <THead>
        <tr>
          <Th>Task</Th>
          <Th>Status</Th>
          <Th>Priority</Th>
          <Th numeric>Due</Th>
        </tr>
      </THead>
      <TBody>
        <TGroup>Overdue</TGroup>
        <Tr>
          <Td primary>Brand system rollout</Td>
          <Td>
            <Chip tone="red" glyph="triangle">
              Blocked
            </Chip>
          </Td>
          <Td>
            <PriorityMark level={1} />
          </Td>
          <Td numeric>28 Sep</Td>
        </Tr>
        <TGroup>This week</TGroup>
        <Tr>
          <Td primary>Packaging die-line audit</Td>
          <Td>
            <Chip tone="blue" glyph="circle-half">
              In Progress
            </Chip>
          </Td>
          <Td>
            <PriorityMark level={2} />
          </Td>
          <Td numeric>02 Oct</Td>
        </Tr>
        <Tr>
          <Td primary>Signage proofs to print</Td>
          <Td>
            <Chip tone="blue" glyph="diamond">
              In Review
            </Chip>
          </Td>
          <Td>
            <PriorityMark level={2} />
          </Td>
          <Td numeric>03 Oct</Td>
        </Tr>
        <TGroup>Later</TGroup>
        <Tr>
          <Td primary>Rebrand discovery notes</Td>
          <Td>
            <Chip glyph="square">Backlog</Chip>
          </Td>
          <Td>
            <PriorityMark level={3} />
          </Td>
          <Td numeric>12 Oct</Td>
        </Tr>
        <Tr>
          <Td primary>Annual report photography</Td>
          <Td>
            <Chip glyph="circle">To Do</Chip>
          </Td>
          <Td>
            <PriorityMark level={3} />
          </Td>
          <Td numeric>20 Oct</Td>
        </Tr>
      </TBody>
    </Table>
  ),
  description: "TGroup rows in caps on --surface-2 split the list by due date.",
};

export const Numeric: Example = {
  render: (args) => (
    <Table {...args} footer={<span>Totals include VAT at 20%</span>}>
      <THead>
        <tr>
          <Th>Client</Th>
          <Th numeric>Invoiced</Th>
          <Th numeric>Paid</Th>
          <Th numeric>Outstanding</Th>
          <Th numeric>Days late</Th>
        </tr>
      </THead>
      <TBody>
        {[
          ["Nordvik Atelier", "£48,200", "£34,000", "£14,200", "12"],
          ["Brightwater Foods", "£21,600", "£12,000", "£9,600", "0"],
          ["Purslane Studio", "£9,450", "£6,300", "£3,150", "0"],
          ["Halden & Moss", "£2,480", "£0", "£2,480", "31"],
        ].map(([client, ...values]) => (
          <Tr key={client}>
            <Td primary>{client}</Td>
            {values.map((v, i) => (
              <Td key={i} numeric>
                {v}
              </Td>
            ))}
          </Tr>
        ))}
      </TBody>
    </Table>
  ),
  description: "Numbers right-aligned in tabular mono, so the columns line up digit for digit.",
};

export const SelectedRow: Example = {
  render: function Render(args) {
    const [selected, setSelected] = useState("2044");
    return (
      <Table {...args} footer={<span>Click a row to select it</span>}>
        <Head />
        <TBody>
          {rows.map((r) => (
            <Tr key={r.id} interactive selected={selected === r.id} onClick={() => setSelected(r.id)}>
              <Td primary truncate>
                {r.item}
              </Td>
              <Td>{r.client}</Td>
              <Td>{r.state}</Td>
              <Td numeric>{r.due}</Td>
              <Td numeric>{r.amount}</Td>
            </Tr>
          ))}
        </TBody>
      </Table>
    );
  },
  description: "Click a row, or Tab to it and press Enter: the selected row takes --surface-3 and an ink edge.",
};

export const RowWithItsOwnLink: Example = {
  render: function Render(args) {
    const [opened, setOpened] = useState<string | null>(null);
    return (
      <Table {...args} footer={<span>{opened ? `Opened ${opened}` : "Tab lands on each link, not on the rows"}</span>}>
        <Head />
        <TBody>
          {rows.map((r) => (
            <Tr key={r.id} interactive tabIndex={-1} onClick={() => setOpened(r.item)}>
              <Td primary truncate>
                <TextLink href="#" onClick={(e) => e.preventDefault()}>
                  {r.item}
                </TextLink>
              </Td>
              <Td>{r.client}</Td>
              <Td>{r.state}</Td>
              <Td numeric>{r.due}</Td>
              <Td numeric>{r.amount}</Td>
            </Tr>
          ))}
        </TBody>
      </Table>
    );
  },
  description: "Rows that contain their own link pass tabIndex={-1}: the pointer can still click the row, and the keyboard stops once per row, on the link.",
};

export const AllVariants: Example = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
      {(["relaxed", "default", "compact"] as const).map((density) => (
        <div key={density} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <span className="caps text-4">{density}</span>
          <Table density={density} footer={footer}>
            <Head />
            <Body />
          </Table>
        </div>
      ))}
    </div>
  ),
  description: "The three densities, one above the other for comparison only; a screen never stacks tables like this.",
};
