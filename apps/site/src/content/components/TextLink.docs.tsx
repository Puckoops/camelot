import { Card, TextLink } from "@puckoops/camelot";
import type { ExampleOf, Meta } from "@/docs";

const meta = {
  title: "ui/TextLink",
  component: TextLink,
  description:
    "An underlined inline link for **navigation**: inside copy, at the foot of a card, or as a back link such as *← Dashboard*. The underline sits in the strong hairline and takes the ink on hover; the forward arrow nudges 2px.",
  args: { children: "View all invoices", href: "#" },
  argTypes: {
    arrow: { control: "inline-radio", options: [undefined, "forward", "back"], description: "An arrow after or before the text" },
    children: { control: "text" },
    href: { control: "text" },
    as: { control: false },
  },
} satisfies Meta<typeof TextLink>;

export default meta;
type Example = ExampleOf<typeof meta>;

export const Default: Example = {
  description: "A plain inline link.",
};

export const Forward: Example = {
  args: { arrow: "forward", children: "All receivables" },
  description: "Leads on to the full list, at the foot of a card.",
};

export const Back: Example = {
  args: { arrow: "back", children: "Dashboard" },
  description: "Above a page title, back to where the reader came from.",
};

export const InCopy: Example = {
  render: () => (
    <Card style={{ width: 420, minHeight: 0 }}>
      <p className="small text-2">
        Invoices go to the client&apos;s billing contact. You can change it on the <TextLink href="#">client&apos;s page</TextLink> at any time, or{" "}
        <TextLink href="#">read how reminders work</TextLink>.
      </p>
    </Card>
  ),
  description: "Inside a sentence the link keeps the line's size and takes a quiet underline.",
};

export const AllVariants: Example = {
  render: () => (
    <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
      <TextLink href="#">View all invoices</TextLink>
      <TextLink href="#" arrow="forward">
        All receivables
      </TextLink>
      <TextLink href="#" arrow="back">
        Dashboard
      </TextLink>
    </div>
  ),
  description: "Plain, forward and back. Hover each.",
};
