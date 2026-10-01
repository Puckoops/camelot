import { Grid, GridItem, MeterCard } from "@puckoops/camelot";
import type { ExampleOf, Meta } from "@/docs";

const meta = {
  title: "ui/Cards/MeterCard",
  component: MeterCard,
  description:
    "One **share of a whole**: a title, the percentage as a KPI, an ink bar on the series track, and a caption with the raw numbers. Values over 100 fill the bar and keep their number.",
  decorators: [
    (Example, { parameters }) => (
      <div style={{ width: parameters.frameWidth ?? 320 }}>
        <Example />
      </div>
    ),
  ],
  args: { title: "Studio capacity", percent: 78, caption: "31 of 40 booked hours this week." },
  argTypes: {
    title: { control: "text" },
    percent: { control: { type: "range", min: 0, max: 130, step: 1 }, description: "0–100; more keeps its number" },
    caption: { control: "text" },
  },
} satisfies Meta<typeof MeterCard>;

export default meta;
type Example = ExampleOf<typeof meta>;

export const Default: Example = {
  description: "Drag the percent control to watch the bar and the figure move together.",
};

export const Empty: Example = {
  args: { title: "Retainer used", percent: 0, caption: "Nothing billed against October yet." },
  description: "Zero is a real value: the track shows, the figure reads 0%.",
};

export const Full: Example = {
  args: { title: "Budget allocated", percent: 100, caption: "£42,000 of £42,000 committed." },
  description: "Exactly used.",
};

export const Over: Example = {
  args: { title: "Hours against estimate", percent: 112, caption: "56 of 50 estimated hours." },
  description: "Past 100 the bar stays full and the figure tells the overrun.",
};

export const AllVariants: Example = {
  render: () => (
    <Grid>
      {[
        { title: "Retainer used", percent: 0, caption: "Nothing billed yet." },
        { title: "Studio capacity", percent: 78, caption: "31 of 40 hours." },
        { title: "Budget allocated", percent: 100, caption: "£42,000 of £42,000." },
        { title: "Against estimate", percent: 112, caption: "56 of 50 hours." },
      ].map((m) => (
        <GridItem key={m.title} span={3}>
          <MeterCard {...m} />
        </GridItem>
      ))}
    </Grid>
  ),
  parameters: { frameWidth: "auto", layout: "padded" },
  description: "Empty, partial, full and over, as a 3 × 4 row of counts.",
};
