import { Card, Grid, GridItem, Skeleton, Table, TBody, Td, Th, THead, Tr } from "@puckoops/camelot";
import type { ExampleOf, Meta } from "@/docs";

const meta = {
  title: "ui/Skeleton",
  component: Skeleton,
  description:
    "Loading is the final layout in **--surface-2 blocks at their real sizes**, pulsing in opacity — never a spinner. Lay skeletons out exactly where the text, figures and rows will land, so nothing jumps when the data arrives.",
  args: { width: 240, height: 14 },
  argTypes: {
    width: { control: "text", description: "Any CSS width" },
    height: { control: "number", description: "Match the line height it stands in for" },
    radius: { control: "text", description: "A token such as var(--radius-full)" },
  },
} satisfies Meta<typeof Skeleton>;

export default meta;
type Example = ExampleOf<typeof meta>;

export const Line: Example = {
  description: "One line of body text.",
};

export const Paragraph: Example = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 9, width: 360 }}>
      <Skeleton width="100%" />
      <Skeleton width="92%" />
      <Skeleton width="64%" />
    </div>
  ),
  description: "Ragged widths read as text; equal widths read as a table.",
};

export const FigureCardLoading: Example = {
  render: () => (
    <div style={{ width: 380 }}>
      <Card>
        <Skeleton width={96} height={11} />
        <Skeleton width={180} height={34} style={{ marginTop: 16 }} />
        <Skeleton width="80%" height={13} style={{ marginTop: 12 }} />
        <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 56, marginTop: 24 }}>
          {[40, 60, 50, 80, 70, 90, 55, 100, 75, 60, 85, 95].map((h, i) => (
            <Skeleton key={i} width="100%" height={`${h}%`} radius="2px" />
          ))}
        </div>
      </Card>
    </div>
  ),
  description: "A FigureCard while it loads: label, figure, caption and bars at their real sizes.",
};

export const TableRows: Example = {
  render: () => (
    <div style={{ width: 640 }}>
      <Table minWidth={0} aria-busy="true">
        <THead>
          <tr>
            <Th>Item</Th>
            <Th>Client</Th>
            <Th numeric>Amount</Th>
          </tr>
        </THead>
        <TBody>
          {[70, 55, 80, 62].map((w, i) => (
            <Tr key={i}>
              <Td>
                <Skeleton width={`${w}%`} />
              </Td>
              <Td>
                <Skeleton width="60%" />
              </Td>
              <Td numeric>
                <Skeleton width={64} style={{ marginLeft: "auto" }} />
              </Td>
            </Tr>
          ))}
        </TBody>
      </Table>
    </div>
  ),
  description: "Rows keep the header and the row height, so the table does not jump.",
};

export const Avatar: Example = {
  render: () => (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <Skeleton width={28} height={28} radius="var(--radius-full)" />
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <Skeleton width={120} height={12} />
        <Skeleton width={160} height={10} />
      </div>
    </div>
  ),
  description: "A person row: a round block where the avatar goes.",
};

export const AllVariants: Example = {
  render: () => (
    <div style={{ width: 960 }}>
      <Grid>
        {[5, 4, 3].map((span) => (
          <GridItem key={span} span={span as 5 | 4 | 3}>
            <Card>
              <Skeleton width={88} height={11} />
              <Skeleton width="60%" height={34} style={{ marginTop: 16 }} />
              <Skeleton width="85%" height={13} style={{ marginTop: 12 }} />
            </Card>
          </GridItem>
        ))}
      </Grid>
    </div>
  ),
  description: "A band of cards loading on a 5 + 4 + 3 row.",
};
