import { Avatar, AzStrip, Card } from "@puckoops/camelot";
import { useMemo, useState } from "react";
import { action, type ExampleOf, type Meta } from "@/docs";

const clients = [
  "Brightwater Foods",
  "Birchline Joinery",
  "Halden & Moss",
  "Harbour Lights Trust",
  "Marram Press",
  "Nordvik Atelier",
  "Northgate Café",
  "Old Harbour Books",
  "Purslane Studio",
  "Saltmarsh Records",
  "Selby & Crane",
];

const meta = {
  title: "ui/AzStrip",
  component: AzStrip,
  description:
    "A jump strip of letters above a long alphabetical list, such as Clients. Letters with entries are buttons; the rest stay quiet and inert, so the strip also shows where the list is thin.",
  args: { available: ["B", "H", "M", "N", "O", "P", "S"], active: "N", onSelect: action() },
  argTypes: {
    available: { control: "object", description: "Letters that have at least one entry" },
    active: { control: "text", description: "The letter in view" },
  },
} satisfies Meta<typeof AzStrip>;

export default meta;
type Example = ExampleOf<typeof meta>;

export const Default: Example = {
  description: "N is in view; letters without clients cannot be pressed.",
};

export const NothingActive: Example = {
  args: { active: null },
  description: "Before the reader has jumped anywhere.",
};

export const JumpToLetter: Example = {
  render: function Render() {
    const [active, setActive] = useState<string | null>(null);
    const available = useMemo(() => new Set(clients.map((c) => c[0]!.toUpperCase())), []);
    const shown = active ? clients.filter((c) => c.startsWith(active)) : clients;
    return (
      <Card style={{ width: 460, gap: 16 }}>
        <AzStrip available={available} active={active} onSelect={(l) => setActive((a) => (a === l ? null : l))} />
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {shown.map((c) => (
            <div key={c} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Avatar name={c} size={24} square />
              <span className="small text-1">{c}</span>
            </div>
          ))}
        </div>
      </Card>
    );
  },
  description: "Press a letter to jump; press it again to show everyone.",
};

export const AllVariants: Example = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <AzStrip available={"ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")} active="A" onSelect={() => {}} />
      <AzStrip available={["B", "H", "M", "N", "O", "P", "S"]} active="N" onSelect={() => {}} />
      <AzStrip available={["A"]} onSelect={() => {}} />
    </div>
  ),
  description: "A full alphabet, a sparse one, and one with a single letter.",
};
