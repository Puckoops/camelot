import { FigureCard, Glyph, Grid, GridItem, Sparkbars } from "@puckoops/camelot";
import type { ExampleOf, Meta } from "@/docs";

const pounds = (pence: number) => `£${Math.round(pence / 100).toLocaleString("en-GB")}`;

function Delta({ value }: { value: number }) {
  const up = value >= 0;
  return (
    <span className="num-sm" style={{ display: "inline-flex", alignItems: "center", gap: 4, color: up ? "var(--delta-up)" : "var(--delta-down)" }}>
      <Glyph shape={up ? "triangle-filled" : "triangle-down"} size={8} />
      {up ? "+" : "−"}
      {Math.abs(value).toFixed(1)}%
    </span>
  );
}

const meta = {
  title: "ui/Cards/FigureCard",
  component: FigureCard,
  description:
    "The one number that matters: a **caps label**, a **KPI figure** in tabular mono, a **caption** that says what the number means, and an optional bar row flush to the bottom. `hero` sets the figure at 52px and is used **once per screen**.",
  decorators: [
    (Example, { parameters }) => (
      <div style={{ width: parameters.frameWidth ?? 380 }}>
        <Example />
      </div>
    ),
  ],
  args: {
    label: "Outstanding",
    value: 4832000,
    format: pounds,
    hero: false,
    caption: "Receivable across 9 open invoices, 3 of them past their due date.",
  },
  argTypes: {
    label: { control: "text" },
    value: { control: "number", description: "Changing it plays the value tick" },
    hero: { control: "boolean", description: "52px; once per screen" },
    caption: { control: "text" },
    format: { control: false },
    delta: { control: false },
    footer: { control: false },
  },
} satisfies Meta<typeof FigureCard>;

export default meta;
type Example = ExampleOf<typeof meta>;

export const Default: Example = {
  description: "A secondary figure at 30px. Change the value control to watch it count.",
};

export const Hero: Example = {
  args: {
    hero: true,
    footer: <Sparkbars values={[3, 5, 4, 7, 6, 8, 5, 9, 7, 12, 10, 11]} label="Invoiced by month, last twelve months" />,
  },
  description: "The screen's hero: 52px figure with the year's bars at the foot, the last three in ink.",
};

export const WithDelta: Example = {
  args: { label: "Hours logged", value: 312, format: undefined, caption: "Against 278 in August.", delta: <Delta value={12.2} /> },
  description: "A change against the last period, in the delta ink with a glyph for direction.",
};

export const Falling: Example = {
  args: {
    label: "Studio margin",
    value: 31,
    format: (n: number) => `${Math.round(n)}%`,
    caption: "Two fixed-fee projects ran over.",
    delta: <Delta value={-4.5} />,
  },
  description: "A fall reads in --delta-down; the glyph points down so it survives greyscale.",
};

export const AllVariants: Example = {
  render: () => (
    <Grid>
      <GridItem span={5}>
        <FigureCard
          hero
          label="Outstanding"
          value={4832000}
          format={pounds}
          caption="Receivable across 9 open invoices, 3 of them past their due date."
          footer={<Sparkbars values={[3, 5, 4, 7, 6, 8, 5, 9, 7, 12, 10, 11]} label="Invoiced by month" />}
        />
      </GridItem>
      <GridItem span={4}>
        <FigureCard label="Hours logged" value={312} caption="Against 278 in August." delta={<Delta value={12.2} />} />
      </GridItem>
      <GridItem span={3}>
        <FigureCard
          label="Studio margin"
          value={31}
          format={(n) => `${Math.round(n)}%`}
          caption="Two fixed-fee projects ran over."
          delta={<Delta value={-4.5} />}
        />
      </GridItem>
    </Grid>
  ),
  parameters: { frameWidth: "auto", layout: "padded" },
  description: "One hero and two secondary figures on a 5 + 4 + 3 row.",
};
