import { Pagination, Table, TBody, Td, Th, THead, Tr } from "@puckoops/camelot";
import { useState } from "react";
import { action, useArgs, type ExampleOf, type Meta } from "@/docs";

const meta = {
  title: "ui/Pagination",
  component: Pagination,
  description:
    "Page through a long list. **numbers** puts arrows around numbered pages and collapses the far pages into an ellipsis, keeping the same width as the page moves; **arrows** is Previous and Next with *Page 3 of 12*; **compact** is *3 / 12* between two icon buttons. It is **controlled**: it reports the page it wants through onPageChange and shows the page it is given.",
  args: { page: 4, pageCount: 12, variant: "numbers", siblings: 1, boundaries: 1, onPageChange: action() },
  argTypes: {
    page: { control: { type: "number", min: 1 }, description: "1-based" },
    pageCount: { control: { type: "number", min: 0 } },
    variant: { control: "inline-radio", options: ["numbers", "arrows", "compact"] },
    siblings: { control: { type: "number", min: 0, max: 3 }, description: "Pages beside the current one" },
    boundaries: { control: { type: "number", min: 0, max: 3 }, description: "Pages always shown at each end" },
    disabled: { control: "boolean" },
  },
  render: function Render(args) {
    const [, updateArgs] = useArgs();
    return (
      <Pagination
        {...args}
        onPageChange={(page) => {
          updateArgs({ page });
          args.onPageChange(page);
        }}
      />
    );
  },
} satisfies Meta<typeof Pagination>;

export default meta;
type Example = ExampleOf<typeof meta>;

export const Numbers: Example = {
  description: "Numbered pages with arrows. Click through and watch the ellipses move.",
};

export const NearTheEnd: Example = {
  args: { page: 11 },
  description: "The ellipsis moves to the start as the page nears the end.",
};

export const FewPages: Example = {
  args: { page: 2, pageCount: 5 },
  description: "When every page fits, there is no ellipsis.",
};

export const Arrows: Example = {
  args: { variant: "arrows", page: 3 },
  description: "Previous and Next with the position between, for a sequence read a page at a time.",
};

export const Compact: Example = {
  args: { variant: "compact", page: 3 },
  description: "3 / 12 between icon buttons, for a drawer or a second table.",
};

export const UnderATable: Example = {
  render: function Render() {
    const [page, setPage] = useState(1);
    const perPage = 4;
    const invoices = Array.from({ length: 22 }, (_, i) => ({ id: 2041 + i, amount: 1200 + ((i * 1370) % 9000) }));
    const shown = invoices.slice((page - 1) * perPage, page * perPage);
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 12, width: 560 }}>
        <Table
          density="compact"
          minWidth={0}
          footer={
            <span>
              {(page - 1) * perPage + 1}–{Math.min(page * perPage, invoices.length)} of {invoices.length} invoices
            </span>
          }
        >
          <THead>
            <tr>
              <Th>Invoice</Th>
              <Th numeric>Amount</Th>
            </tr>
          </THead>
          <TBody>
            {shown.map((inv) => (
              <Tr key={inv.id}>
                <Td primary>Invoice {inv.id}</Td>
                <Td numeric>£{inv.amount.toLocaleString("en-GB")}</Td>
              </Tr>
            ))}
          </TBody>
        </Table>
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <Pagination page={page} pageCount={Math.ceil(invoices.length / perPage)} onPageChange={setPage} />
        </div>
      </div>
    );
  },
  description: "Under a table, right-aligned, with the range in the table's count line.",
};

export const AllVariants: Example = {
  render: function Render() {
    const [page, setPage] = useState(6);
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 20 }}>
        <Pagination page={page} pageCount={12} onPageChange={setPage} />
        <Pagination page={page} pageCount={12} onPageChange={setPage} variant="arrows" />
        <Pagination page={page} pageCount={12} onPageChange={setPage} variant="compact" />
        <Pagination page={page} pageCount={12} onPageChange={setPage} disabled />
      </div>
    );
  },
  description: "All three variants sharing one page, and a disabled one while a page loads.",
};
