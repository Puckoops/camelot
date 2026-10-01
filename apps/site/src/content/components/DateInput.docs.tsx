import { Calendar, DateInput, Field, formatIsoDate, type IsoDate } from "@puckoops/camelot";
import { useState } from "react";
import { action, useArgs, type ExampleOf, type Meta } from "@/docs";

const meta = {
  title: "ui/DateInput",
  component: DateInput,
  subcomponents: { Calendar },
  description:
    "A date field that opens a month calendar. Values travel as **YYYY-MM-DD** strings, so a picked day never moves with the viewer's timezone; the field shows it as *30 Sep 2026*. Today is ringed, the chosen day is ink.",
  decorators: [
    (Example, { parameters }) => (
      <div style={{ width: parameters.frameWidth ?? 280 }}>
        <Example />
      </div>
    ),
  ],
  args: { value: "2026-09-30", onChange: action(), placeholder: "dd mmm yyyy", clearable: false },
  argTypes: {
    value: { control: "text", description: "YYYY-MM-DD or null" },
    min: { control: "text", description: "Earliest pickable day, YYYY-MM-DD" },
    max: { control: "text", description: "Latest pickable day, YYYY-MM-DD" },
    clearable: { control: "boolean", description: "Adds Clear to the calendar footer" },
    disabled: { control: "boolean" },
    placeholder: { control: "text" },
  },
  render: function Render(args) {
    const [, updateArgs] = useArgs();
    return (
      <DateInput
        {...args}
        aria-label="Date"
        onChange={(value) => {
          updateArgs({ value });
          args.onChange(value);
        }}
      />
    );
  },
} satisfies Meta<typeof DateInput>;

export default meta;
type Example = ExampleOf<typeof meta>;

export const Default: Example = {
  description: "A chosen date; open it to see today ringed and the day filled.",
};

export const Empty: Example = {
  args: { value: null },
  description: "The placeholder shows the format the field will use.",
};

export const Clearable: Example = {
  args: { clearable: true },
  description: "Clear sits beside Today for optional dates.",
};

export const WithBounds: Example = {
  args: { value: "2026-10-12", min: "2026-10-05", max: "2026-10-30" },
  description: "Days outside min and max are drawn but cannot be picked.",
};

export const InAField: Example = {
  render: function Render() {
    const [due, setDue] = useState<IsoDate | null>(null);
    return (
      <Field
        label="Due date"
        required
        error={due && due < "2026-10-01" ? "Choose a day from 01 Oct onwards." : undefined}
        hint="The client sees this on the invoice."
      >
        <DateInput value={due} onChange={setDue} clearable />
      </Field>
    );
  },
  description: "Inside Field; pick a September day to see the error.",
};

export const Disabled: Example = {
  args: { disabled: true },
  description: "Locked, as on a sent invoice.",
};

export const CalendarOnly: Example = {
  render: function Render() {
    const [day, setDay] = useState<IsoDate>("2026-10-09");
    return (
      <div
        style={{
          padding: 12,
          border: "var(--border-w) solid var(--hairline)",
          borderRadius: "var(--radius-md)",
          background: "var(--surface)",
          width: "fit-content",
        }}
      >
        <Calendar value={day} onSelect={setDay} />
        <p className="caption text-3" style={{ marginTop: 8 }}>
          Chosen: <span className="num">{formatIsoDate(day)}</span>
        </p>
      </div>
    );
  },
  parameters: { frameWidth: "auto" },
  description: "Calendar on its own, for a side panel or a drawer.",
};

export const AllVariants: Example = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, width: 280 }}>
      <DateInput aria-label="Chosen" value="2026-09-30" onChange={() => {}} />
      <DateInput aria-label="Empty" value={null} onChange={() => {}} />
      <DateInput aria-label="Invalid" value="2026-09-02" onChange={() => {}} aria-invalid />
      <DateInput aria-label="Disabled" value="2026-10-02" onChange={() => {}} disabled />
    </div>
  ),
  description: "Chosen, empty, invalid and disabled.",
};
