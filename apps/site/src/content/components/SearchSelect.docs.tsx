import { Add01Icon } from "@hugeicons/core-free-icons";
import { Button, Field, SearchSelect, toast, type SearchSelectOption } from "@puckoops/camelot";
import { useState } from "react";
import { action, useArgs, type ExampleOf, type Meta } from "@/docs";

const names = [
  "Birchline Joinery",
  "Brightwater Foods",
  "Cairn & Co",
  "Driftwood Dental",
  "Eastmoor Estates",
  "Fennel Kitchen",
  "Glasshouse Theatre",
  "Halden & Moss",
  "Harbour Lights Trust",
  "Ivel Valley Cycles",
  "Juniper Legal",
  "Kestrel Aviation",
  "Larchfield School",
  "Marram Press",
  "Nordvik Atelier",
  "Northgate Café",
  "Old Harbour Books",
  "Purslane Studio",
  "Quayside Market",
  "Ravenscar Hotel",
  "Saltmarsh Records",
  "Selby & Crane",
  "Tidewell Water",
  "Upland Orchards",
  "Wrenfield Farm",
];

const clients: SearchSelectOption[] = names.map((label, i) => ({
  value: label
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z]+/g, "-")
    .replace(/^-|-$/g, ""),
  label,
  meta: `${label
    .replace(/[^A-Z]/g, "")
    .padEnd(2, "X")
    .slice(0, 3)}-${String(101 + i * 7).padStart(3, "0")}`,
  keywords: i === 14 ? ["annika@nordvikatelier.com"] : undefined,
  disabled: label === "Juniper Legal",
}));

const meta = {
  title: "ui/SearchSelect",
  component: SearchSelect,
  description:
    "A searchable single select for **long lists** such as clients or projects. The trigger is the same field as **Select**; it opens a popover with a **search box** over a **filtered list** — label starts first, then word starts, then anywhere, ignoring case and accents. **↑ ↓** move, **Enter** picks, **Esc** closes and returns focus. Typing a letter on the closed trigger opens it with that letter searched. When nothing matches it says so, and a **footer** can offer to add the missing option.",
  decorators: [
    (Example, { parameters }) => (
      <div style={{ width: parameters.frameWidth ?? 320 }}>
        <Example />
      </div>
    ),
  ],
  args: { options: clients, placeholder: "Select client", searchPlaceholder: "Search clients", value: null, onValueChange: action(), "aria-label": "Client" },
  argTypes: {
    placeholder: { control: "text" },
    searchPlaceholder: { control: "text" },
    disabled: { control: "boolean" },
    value: { control: "select", options: [null, ...clients.map((c) => c.value)] },
    options: { control: "object" },
    empty: { control: false },
    footer: { control: false },
  },
  render: function Render(args) {
    const [, updateArgs] = useArgs();
    return (
      <SearchSelect
        {...args}
        onValueChange={(value) => {
          updateArgs({ value });
          args.onValueChange?.(value);
        }}
      />
    );
  },
} satisfies Meta<typeof SearchSelect>;

export default meta;
type Example = ExampleOf<typeof meta>;

export const Default: Example = {
  description: "Twenty-five clients. Open it and type nor, or press a letter on the closed trigger.",
};

export const Chosen: Example = {
  args: { value: "nordvik-atelier" },
  description: "A chosen client; reopening highlights it and ticks it.",
};

export const InAField: Example = {
  render: function Render() {
    const [client, setClient] = useState<string | null>(null);
    const [touched] = useState(false);
    return (
      <Field
        label="Client"
        required
        hint="Invoices go to the client's billing contact."
        error={touched && !client ? "Choose the client this project is for." : undefined}
      >
        <SearchSelect options={clients} value={client} onValueChange={setClient} placeholder="Select client" searchPlaceholder="Search clients" name="client" />
      </Field>
    );
  },
  description: "Inside Field: the label names the trigger, the hint and error reach it, and name posts the value.",
};

export const WithAddAction: Example = {
  args: {
    footer: (
      <Button
        variant="quiet"
        size="sm"
        iconStart={Add01Icon}
        style={{ width: "100%", justifyContent: "flex-start" }}
        onClick={() => toast("Add client opened")}
      >
        Add client
      </Button>
    ),
    empty: (query: string) => (
      <>
        No client called “{query.trim()}”. <br />
        Add them below.
      </>
    ),
  },
  description: "A footer offers to add the client that was not found; the empty message points to it.",
};

export const DisabledOption: Example = {
  description: "Juniper Legal is archived: visible, skipped by the arrow keys, not pickable.",
};

export const Disabled: Example = {
  args: { disabled: true, value: "purslane-studio" },
  description: "Locked once the project has invoices.",
};

export const AllVariants: Example = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, width: 320 }}>
      <SearchSelect aria-label="Empty" options={clients} placeholder="Select client" searchPlaceholder="Search clients" />
      <SearchSelect aria-label="Chosen" options={clients} defaultValue="halden-moss" searchPlaceholder="Search clients" />
      <SearchSelect aria-label="Invalid" options={clients} placeholder="Select client" searchPlaceholder="Search clients" aria-invalid />
      <SearchSelect aria-label="Disabled" options={clients} defaultValue="purslane-studio" disabled />
    </div>
  ),
  parameters: { frameWidth: "auto" },
  description: "Empty, chosen, invalid and disabled.",
};
