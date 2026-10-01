import {
  Add01Icon,
  ArrowDown01Icon,
  Copy01Icon,
  Delete02Icon,
  Download01Icon,
  Edit02Icon,
  File01Icon,
  Invoice01Icon,
  MoreHorizontalIcon,
  Task01Icon,
  UserIcon,
} from "@hugeicons/core-free-icons";
import { Button, IconButton, Menu, MenuGroup, MenuItem, MenuLabel, MenuSeparator, SegmentedControl } from "@puckoops/camelot";
import { action, type ExampleOf, type Meta } from "@/docs";

const meta = {
  title: "ui/Menu",
  component: Menu,
  subcomponents: { MenuItem, MenuLabel, MenuSeparator, MenuGroup },
  description:
    "A dropdown of **actions or links** from one trigger: *Add new*, row actions, the account menu. Items take a 16px icon in the quiet ink, groups take a caps **MenuLabel**, and **MenuGroup** holds a control such as the appearance switch. Arrow keys move, Enter picks, Escape closes.",
  args: {
    align: "end",
    side: "bottom",
    minWidth: 200,
    trigger: (
      <Button variant="primary" iconStart={Add01Icon} iconEnd={ArrowDown01Icon}>
        Add new
      </Button>
    ),
    children: null,
  },
  argTypes: {
    align: { control: "inline-radio", options: ["start", "center", "end"] },
    side: { control: "inline-radio", options: ["top", "right", "bottom", "left"] },
    minWidth: { control: "number" },
    trigger: { control: false },
    children: { control: false },
    open: { control: false },
  },
  render: (args) => (
    <Menu {...args}>
      <MenuItem icon={Task01Icon} onSelect={action()}>
        New task
      </MenuItem>
      <MenuItem icon={File01Icon} onSelect={action()}>
        New project
      </MenuItem>
      <MenuItem icon={Invoice01Icon} onSelect={action()}>
        New invoice
      </MenuItem>
      <MenuSeparator />
      <MenuItem icon={UserIcon} onSelect={action()}>
        New client
      </MenuItem>
    </Menu>
  ),
} satisfies Meta<typeof Menu>;

export default meta;
type Example = ExampleOf<typeof meta>;

export const AddNew: Example = {
  description: "The page's primary action when it creates several kinds of thing.",
};

export const RowActions: Example = {
  args: { trigger: <IconButton icon={MoreHorizontalIcon} aria-label="Actions for Invoice 2041" />, minWidth: 180 },
  render: (args) => (
    <Menu {...args}>
      <MenuItem icon={Edit02Icon}>Edit</MenuItem>
      <MenuItem icon={Copy01Icon}>Duplicate</MenuItem>
      <MenuItem icon={Download01Icon}>Download PDF</MenuItem>
      <MenuSeparator />
      <MenuItem icon={Delete02Icon}>Delete</MenuItem>
    </Menu>
  ),
  description: "An icon button at the end of a row; its label names the row.",
};

export const Grouped: Example = {
  args: { trigger: <Button iconEnd={ArrowDown01Icon}>Export</Button>, align: "start" },
  render: (args) => (
    <Menu {...args}>
      <MenuLabel>This view</MenuLabel>
      <MenuItem>CSV</MenuItem>
      <MenuItem>PDF summary</MenuItem>
      <MenuSeparator />
      <MenuLabel>Everything</MenuLabel>
      <MenuItem>Full ledger (CSV)</MenuItem>
      <MenuItem disabled>Accountant pack (from November)</MenuItem>
    </Menu>
  ),
  description: "Caps labels group the items; a disabled item explains itself in its label.",
};

export const AccountMenu: Example = {
  args: { trigger: <IconButton icon={MoreHorizontalIcon} aria-label="Account" variant="bare" />, side: "top", align: "start", minWidth: 240 },
  render: (args) => (
    <Menu {...args}>
      <MenuLabel>annika@nordvikatelier.com</MenuLabel>
      <MenuItem>Profile</MenuItem>
      <MenuGroup>
        <SegmentedControl
          aria-label="Appearance"
          size="sm"
          defaultValue="system"
          options={[
            { value: "light", label: "Light" },
            { value: "dark", label: "Dark" },
            { value: "system", label: "System" },
          ]}
        />
      </MenuGroup>
      <MenuSeparator />
      <MenuItem>Sign out</MenuItem>
    </Menu>
  ),
  description: "The sidebar's account menu, with the appearance switch in a MenuGroup.",
};

export const AllVariants: Example = {
  render: () => (
    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
      <Menu
        trigger={
          <Button variant="primary" iconStart={Add01Icon} iconEnd={ArrowDown01Icon}>
            Add new
          </Button>
        }
        align="start"
      >
        <MenuItem icon={Task01Icon}>New task</MenuItem>
        <MenuItem icon={File01Icon}>New project</MenuItem>
      </Menu>
      <Menu trigger={<Button iconEnd={ArrowDown01Icon}>Export</Button>} align="start">
        <MenuLabel>This view</MenuLabel>
        <MenuItem>CSV</MenuItem>
        <MenuItem disabled>PDF (from November)</MenuItem>
      </Menu>
      <Menu trigger={<IconButton icon={MoreHorizontalIcon} aria-label="Row actions" />}>
        <MenuItem icon={Edit02Icon}>Edit</MenuItem>
        <MenuSeparator />
        <MenuItem icon={Delete02Icon}>Delete</MenuItem>
      </Menu>
    </div>
  ),
  description: "A primary trigger, a ghost trigger and a row's icon trigger.",
};
