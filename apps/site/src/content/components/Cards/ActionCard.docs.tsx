import { CloudUploadIcon, Invoice01Icon, UserIcon } from "@hugeicons/core-free-icons";
import { ActionCard, Button, Grid, GridItem } from "@puckoops/camelot";
import { action, type ExampleOf, type Meta } from "@/docs";

const meta = {
  title: "ui/Cards/ActionCard",
  component: ActionCard,
  description:
    "A next step: a **28px glyph**, a **title**, one **caption** line and an **action**. Give it a ghost button, or pass `onClick` or `href` and the whole card becomes the target.",
  decorators: [
    (Example, { parameters }) => (
      <div style={{ width: parameters.frameWidth ?? 320 }}>
        <Example />
      </div>
    ),
  ],
  args: {
    icon: CloudUploadIcon,
    title: "Upload files",
    caption: "Contracts, receipts, deliverables.",
    action: <Button size="sm">Choose files</Button>,
  },
  argTypes: {
    icon: { control: false },
    title: { control: "text" },
    caption: { control: "text" },
    action: { control: false },
    centered: { control: "boolean", description: "Centred, for an empty band" },
    href: { control: "text" },
  },
} satisfies Meta<typeof ActionCard>;

export default meta;
type Example = ExampleOf<typeof meta>;

export const WithAction: Example = {
  description: "A ghost button at the bottom does the work.",
};

export const Clickable: Example = {
  args: { action: undefined, onClick: action(), title: "New invoice", icon: Invoice01Icon, caption: "Bill a client for work delivered." },
  description: "With onClick the whole card is a button and lifts on hover.",
};

export const AsLink: Example = {
  args: { action: undefined, href: "#", title: "Add a client", icon: UserIcon, caption: "Name, billing contact, currency." },
  description: "With href the whole card is a link.",
};

export const Centered: Example = {
  args: { centered: true, caption: "Drop files anywhere on this card." },
  description: "Centred, where a band would otherwise be empty.",
};

export const AllVariants: Example = {
  render: () => (
    <Grid>
      <GridItem span={4}>
        <ActionCard icon={CloudUploadIcon} title="Upload files" caption="Contracts, receipts, deliverables." action={<Button size="sm">Choose files</Button>} />
      </GridItem>
      <GridItem span={4}>
        <ActionCard icon={Invoice01Icon} title="New invoice" caption="Bill a client for work delivered." onClick={() => {}} />
      </GridItem>
      <GridItem span={4}>
        <ActionCard icon={UserIcon} title="Add a client" caption="Name, billing contact, currency." href="#" centered />
      </GridItem>
    </Grid>
  ),
  parameters: { frameWidth: "auto", layout: "padded" },
  description: "With a button, as a button, and as a centred link.",
};
