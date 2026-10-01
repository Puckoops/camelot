import { AreaChart, BarChart, Card, Grid, GridItem, LineChart, type ChartDatum } from "@puckoops/camelot";
import type { ExampleOf, Meta } from "@/docs";

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const invoiced = [18400, 21200, 19800, 26400, 24100, 29800, 22600, 31500, 28900, 34200, 30100, 36800];
const lastYear = [16200, 17900, 18600, 20100, 22800, 21400, 19700, 24300, 25100, 27600, 26900, 29400];

const monthly: ChartDatum[] = months.map((label, i) => ({ label, value: invoiced[i]!, comparison: lastYear[i]! }));
const monthlySingle: ChartDatum[] = months.map((label, i) => ({ label, value: invoiced[i]! }));
const cumulative: ChartDatum[] = months.map((label, i) => ({
  label,
  value: invoiced.slice(0, i + 1).reduce((a, b) => a + b, 0),
  comparison: lastYear.slice(0, i + 1).reduce((a, b) => a + b, 0),
}));
const hours: ChartDatum[] = ["Mon", "Tue", "Wed", "Thu", "Fri"].map((label, i) => ({ label, value: [7.5, 8, 6.5, 9, 5][i]!, comparison: 8 }));
const days: ChartDatum[] = Array.from({ length: 30 }, (_, i) => ({
  label: String(i + 1).padStart(2, "0"),
  value: Math.round(4 + 3 * Math.sin(i / 3) + (i % 5)),
}));
const margin: ChartDatum[] = months.slice(0, 9).map((label, i) => ({ label, value: [12, 8, -4, 6, 14, -9, 3, 11, 7][i]! }));

const pounds = (n: number) => `£${Math.round(n).toLocaleString("en-GB")}`;
const compactPounds = (n: number) => (Math.abs(n) >= 1000 ? `£${(n / 1000).toLocaleString("en-GB", { maximumFractionDigits: 1 })}k` : `£${n}`);

const meta = {
  title: "ui/Chart",
  component: BarChart,
  subcomponents: { LineChart, AreaChart },
  description:
    "Small dependency-free SVG charts: **BarChart** for periods or categories, **LineChart** for a trend, **AreaChart** for a total that accumulates. One **ink** series (--text-1) and a **quiet** comparison (--n-04) on one value axis, hairline gridlines, mono tick labels. Hover or focus and use the arrow keys for a readout of every series at that point; the title and description name the chart for assistive tech, which also gets the data as a table. A legend appears only when there are two series. Bars grow from the baseline and lines fade in, both by transform and opacity, and not at all with reduced motion.",
  decorators: [
    (Example, { parameters }) => (
      <div style={{ width: parameters.frameWidth ?? 640 }}>
        <Example />
      </div>
    ),
  ],
  args: {
    data: monthly,
    title: "Invoiced by month, this year against last year",
    description: "Invoiced grew in most months; December is the highest at £36,800.",
    seriesLabel: "This year",
    comparisonLabel: "Last year",
    categoryLabel: "Month",
    format: pounds,
    formatTick: compactPounds,
    height: 240,
    ticks: 4,
  },
  argTypes: {
    data: { control: "object" },
    title: { control: "text", description: "Not drawn; names the chart" },
    description: { control: "text" },
    seriesLabel: { control: "text" },
    comparisonLabel: { control: "text" },
    height: { control: { type: "range", min: 140, max: 360, step: 10 }, description: "Axis labels included" },
    ticks: { control: { type: "range", min: 2, max: 8, step: 1 } },
    legend: { control: "boolean" },
    format: { control: false },
    formatTick: { control: false },
  },
} satisfies Meta<typeof BarChart>;

export default meta;
type Example = ExampleOf<typeof meta>;

export const Bars: Example = {
  description: "This year in ink beside last year, quiet. Hover a month, or tab in and use the arrow keys.",
};

export const BarsSingleSeries: Example = {
  args: { data: monthlySingle, title: "Invoiced by month", description: undefined },
  description: "One series needs no legend; the card's heading names it.",
};

export const ManyBars: Example = {
  args: {
    data: days,
    title: "Tasks closed per day in September",
    description: undefined,
    format: (n: number) => `${n} tasks`,
    formatTick: undefined,
    seriesLabel: "Closed",
  },
  description: "Thirty slots: bars thin out and the labels skip so they never collide.",
};

export const NegativeValues: Example = {
  args: {
    data: margin,
    title: "Margin over budget by month",
    description: undefined,
    format: (n: number) => `${n}%`,
    formatTick: (n: number) => `${n}%`,
    seriesLabel: "Margin",
  },
  description: "Bars below the baseline grow downward, with the rounded end at the bottom.",
};

export const Line: Example = {
  render: (args) => <LineChart {...args} />,
  description: "A trend: the ink line over last year's quiet line, with a crosshair that snaps to the month.",
};

export const LineAgainstTarget: Example = {
  render: (args) => (
    <LineChart
      {...args}
      data={hours}
      title="Hours logged this week against the 8-hour day"
      description={undefined}
      seriesLabel="Logged"
      comparisonLabel="Target"
      format={(n) => `${n} hrs`}
      formatTick={(n) => `${n}`}
    />
  ),
  description: "The comparison can be a flat target.",
};

export const Area: Example = {
  render: (args) => (
    <AreaChart
      {...args}
      data={cumulative}
      title="Invoiced to date, this year against last year"
      description="The year to date passed last year's total in April."
    />
  ),
  description: "A total that accumulates: an ink line over a faint ink wash, last year as a quiet line.",
};

export const InACard: Example = {
  render: (args) => (
    <Card style={{ gap: 16 }}>
      <div>
        <p className="caps text-4">Invoiced</p>
        <h3 className="h3" style={{ marginTop: 4 }}>
          £323,800 this year
        </h3>
      </div>
      <BarChart {...args} height={200} />
    </Card>
  ),
  description: "On a card: the heading carries the headline, the chart the shape.",
};

export const AllVariants: Example = {
  render: () => (
    <Grid>
      <GridItem span={6}>
        <Card style={{ gap: 12 }}>
          <p className="caps text-4">BarChart</p>
          <BarChart
            data={monthly}
            title="Invoiced by month"
            seriesLabel="This year"
            comparisonLabel="Last year"
            format={pounds}
            formatTick={compactPounds}
            height={200}
          />
        </Card>
      </GridItem>
      <GridItem span={6}>
        <Card style={{ gap: 12 }}>
          <p className="caps text-4">LineChart</p>
          <LineChart
            data={monthly}
            title="Invoiced by month"
            seriesLabel="This year"
            comparisonLabel="Last year"
            format={pounds}
            formatTick={compactPounds}
            height={200}
          />
        </Card>
      </GridItem>
      <GridItem span={7}>
        <Card style={{ gap: 12 }}>
          <p className="caps text-4">AreaChart</p>
          <AreaChart
            data={cumulative}
            title="Invoiced to date"
            seriesLabel="This year"
            comparisonLabel="Last year"
            format={pounds}
            formatTick={compactPounds}
            height={200}
          />
        </Card>
      </GridItem>
      <GridItem span={5}>
        <Card style={{ gap: 12 }}>
          <p className="caps text-4">Single series</p>
          <BarChart data={hours.map(({ label, value }) => ({ label, value }))} title="Hours logged this week" format={(n) => `${n} hrs`} height={200} />
        </Card>
      </GridItem>
    </Grid>
  ),
  parameters: { frameWidth: "auto", layout: "padded" },
  description: "All three charts on a 6 + 6 and a 7 + 5 row.",
};
