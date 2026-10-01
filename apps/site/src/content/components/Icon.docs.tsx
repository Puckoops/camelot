import {
  Add01Icon,
  ArrowDown01Icon,
  ArrowRight01Icon,
  Attachment01Icon,
  Calendar01Icon,
  Calendar03Icon,
  Cancel01Icon,
  CloudUploadIcon,
  DashboardSquare02Icon,
  Download01Icon,
  FilterIcon,
  Invoice01Icon,
  Link04Icon,
  MoneyExchange01Icon,
  MoreHorizontalIcon,
  PackageIcon,
  Search01Icon,
  Task01Icon,
  UserIcon,
} from "@hugeicons/core-free-icons";
import { Button, Icon } from "@puckoops/camelot";
import type { ExampleOf, Meta } from "@/docs";

const common = {
  DashboardSquare02Icon,
  Task01Icon,
  Calendar03Icon,
  MoneyExchange01Icon,
  CloudUploadIcon,
  PackageIcon,
  Invoice01Icon,
  Search01Icon,
  FilterIcon,
  Add01Icon,
  Cancel01Icon,
  ArrowRight01Icon,
  ArrowDown01Icon,
  MoreHorizontalIcon,
  Link04Icon,
  Attachment01Icon,
  UserIcon,
  Calendar01Icon,
  Download01Icon,
};

const meta = {
  title: "ui/Icon",
  component: Icon,
  description:
    "Hugeicons Stroke Rounded at a 1.5 stroke, in `currentColor`, so an icon takes the ink around it. **16** in tables and the sidebar, **18** in nav, **20** in buttons, **28** on an Action card. Import the icon from `@hugeicons/core-free-icons` and pass it in; there is no second icon family and no emoji.",
  args: { icon: CloudUploadIcon, size: 20, strokeWidth: 1.5 },
  argTypes: {
    icon: { control: false },
    size: { control: "inline-radio", options: [16, 18, 20, 28], description: "Pixel size" },
    strokeWidth: { control: { type: "range", min: 1, max: 2, step: 0.25 }, description: "Stays 1.5 in product" },
    label: { control: "text", description: "Only when the icon carries meaning on its own" },
  },
} satisfies Meta<typeof Icon>;

export default meta;
type Example = ExampleOf<typeof meta>;

export const Default: Example = {
  description: "An icon at button size in the surrounding ink.",
};

export const Sizes: Example = {
  render: (args) => (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 24 }}>
      {([16, 18, 20, 28] as const).map((size) => (
        <div key={size} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          <Icon {...args} size={size} />
          <span className="num-sm text-4">{size}</span>
        </div>
      ))}
    </div>
  ),
  description: "The four sizes the system uses, and no others.",
};

export const TakesTheInk: Example = {
  render: () => (
    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
      <span className="text-4" style={{ display: "inline-flex" }}>
        <Icon icon={Task01Icon} size={18} />
      </span>
      <span className="text-1" style={{ display: "inline-flex" }}>
        <Icon icon={Task01Icon} size={18} />
      </span>
      <Button variant="primary" iconStart={Add01Icon}>
        Add new
      </Button>
      <Button iconEnd={ArrowDown01Icon}>Export</Button>
    </div>
  ),
  description: "--text-4 at rest, --text-1 when current, and whatever ink the button gives it.",
};

export const Labelled: Example = {
  args: { icon: Attachment01Icon, size: 16, label: "Has attachments" },
  description: "Give a label only when the icon stands alone and means something; otherwise it is hidden from assistive tech.",
};

export const AllVariants: Example = {
  render: () => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 8, width: 720 }}>
      {Object.entries(common).map(([name, icon]) => (
        <div
          key={name}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "10px 12px",
            border: "var(--border-w) solid var(--hairline)",
            borderRadius: "var(--radius-md)",
            background: "var(--surface)",
            color: "var(--text-2)",
          }}
        >
          <Icon icon={icon} size={16} />
          <span className="num-sm text-3" style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
            {name}
          </span>
        </div>
      ))}
    </div>
  ),
  description: "The icons the product reaches for most, by import name.",
};
