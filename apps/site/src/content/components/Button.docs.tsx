import { Add01Icon, ArrowDown01Icon, ArrowRight01Icon, Delete02Icon, MoreHorizontalIcon } from "@hugeicons/core-free-icons";
import { Button, IconButton } from "@puckoops/camelot";
import { action, type ExampleOf, type Meta } from "@/docs";

const meta = {
  title: "ui/Button",
  component: Button,
  description:
    "A one-shot action. **primary** is ink-filled and appears once per section; **ghost** is outlined for secondary actions; **quiet** is filled for low-emphasis actions such as Cancel. Icons come from Hugeicons and inherit the button's ink.",
  args: { children: "Continue", variant: "primary", size: "md", onClick: action() },
  argTypes: {
    variant: { control: "inline-radio", options: ["primary", "ghost", "quiet"], description: "Visual weight" },
    size: { control: "inline-radio", options: ["sm", "md", "lg"], description: "32px, 36px (default) or 44px" },
    iconStart: { control: false },
    iconEnd: { control: false },
    asChild: { control: false },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Example = ExampleOf<typeof meta>;

export const Primary: Example = {};

export const Ghost: Example = {
  args: { variant: "ghost", children: "Save draft" },
  description: "Secondary actions beside a primary, or on their own in a filter row.",
};

export const Quiet: Example = {
  args: { variant: "quiet", children: "Cancel" },
  description: "The lowest weight: Cancel, Clear, dismissive actions.",
};

export const WithIcons: Example = {
  args: { iconStart: Add01Icon, iconEnd: ArrowDown01Icon, children: "Add new" },
  description: "Icons sit 8px from the label and take its ink.",
};

export const Sizes: Example = {
  render: (args) => (
    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
      <Button {...args} size="sm">
        Small
      </Button>
      <Button {...args} size="md">
        Medium
      </Button>
      <Button {...args} size="lg" iconEnd={ArrowRight01Icon}>
        Large
      </Button>
    </div>
  ),
  description: "Large is for the landing page; the product uses medium and small.",
};

export const Loading: Example = {
  args: { loading: true, children: "Saving…" },
};

export const Disabled: Example = {
  args: { disabled: true, children: "Create project" },
};

export const IconOnly: Example = {
  render: () => (
    <div style={{ display: "flex", gap: 8 }}>
      <IconButton icon={MoreHorizontalIcon} aria-label="More actions" />
      <IconButton icon={Delete02Icon} aria-label="Delete" size="sm" />
      <IconButton icon={MoreHorizontalIcon} aria-label="More actions" variant="bare" />
    </div>
  ),
  description: "IconButton is 32px (or 28px small) and always needs an aria-label.",
};

export const AllVariants: Example = {
  render: () => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, max-content)", gap: 12, alignItems: "center" }}>
      {(["primary", "ghost", "quiet"] as const).map((variant) => (
        <div key={variant} style={{ display: "contents" }}>
          <span className="caps text-4">{variant}</span>
          <Button variant={variant}>Default</Button>
          <Button variant={variant} iconStart={Add01Icon}>
            With icon
          </Button>
          <Button variant={variant} disabled>
            Disabled
          </Button>
        </div>
      ))}
    </div>
  ),
  description: "Every variant at rest, with an icon, and disabled. Hover and tab to see the states.",
};
