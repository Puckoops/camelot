import { Avatar } from "@puckoops/camelot";
import type { ExampleOf, Meta } from "@/docs";

const sizes = [20, 24, 28, 32, 36] as const;

const meta = {
  title: "ui/Avatar",
  component: Avatar,
  description:
    "**Initials** in mono on --surface-3, or a picture, in a circle for people and a rounded **square** for client logos. The full name is always there for assistive tech and as a tooltip.",
  args: { name: "Annika Revell", size: 28, square: false },
  argTypes: {
    name: { control: "text", description: "Initials come from the first and last word" },
    size: { control: "inline-radio", options: sizes, description: "Pixel size" },
    square: { control: "boolean", description: "Rounded square, for clients" },
    src: { control: "text", description: "A picture URL; initials show without one" },
  },
} satisfies Meta<typeof Avatar>;

export default meta;
type Example = ExampleOf<typeof meta>;

export const Person: Example = {
  description: "A person, at the default 28px.",
};

export const Client: Example = {
  args: { name: "Nordvik Atelier", square: true, size: 32 },
  description: "A client, as a rounded square.",
};

export const SingleName: Example = {
  args: { name: "Tom" },
  description: "One word takes its first two letters.",
};

export const Sizes: Example = {
  render: (args) => (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 16 }}>
      {sizes.map((size) => (
        <div key={size} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          <Avatar {...args} size={size} />
          <span className="num-sm text-4">{size}</span>
        </div>
      ))}
    </div>
  ),
  description: "20 and 24 in dense rows, 28 by default, 32 and 36 in headers.",
};

export const InARow: Example = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {[
        ["Annika Revell", "annika@nordvikatelier.com"],
        ["Priya Nandakumar Rao", "priya@purslane.studio"],
        ["Tomas Lind", "tomas@brightwaterfoods.com"],
      ].map(([name, email]) => (
        <div key={name} style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Avatar name={name!} size={28} />
          <div>
            <p className="small text-1">{name}</p>
            <p className="caption text-4">{email}</p>
          </div>
        </div>
      ))}
    </div>
  ),
  description: "People beside their name and email, as in an assignee list.",
};

export const AllVariants: Example = {
  render: () => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(6, max-content)", gap: 12, alignItems: "center" }}>
      <span className="caps text-4">person</span>
      {sizes.map((size) => (
        <Avatar key={size} name="Annika Revell" size={size} />
      ))}
      <span className="caps text-4">client</span>
      {sizes.map((size) => (
        <Avatar key={size} name="Brightwater Foods" size={size} square />
      ))}
    </div>
  ),
  description: "Every size, round and square.",
};
