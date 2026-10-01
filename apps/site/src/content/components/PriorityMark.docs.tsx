import { PriorityMark, Table, TBody, Td, Th, THead, Tr } from "@puckoops/camelot";
import type { ExampleOf, Meta } from "@/docs";

const meta = {
  title: "ui/PriorityMark",
  component: PriorityMark,
  description:
    "Priority as a small glyph and a word — **High / Medium / Low** or **P1 / P2 / P3**. It is never a filled chip, so a priority column stays quiet next to the one chip column a table is allowed.",
  args: { level: 1, format: "word", glyph: true },
  argTypes: {
    level: { control: "inline-radio", options: [1, 2, 3], description: "1 is the highest" },
    format: { control: "inline-radio", options: ["word", "code"], description: "High / Medium / Low or P1 / P2 / P3" },
    glyph: { control: "boolean", description: "Drop the glyph where space is tight, such as a board card" },
  },
} satisfies Meta<typeof PriorityMark>;

export default meta;
type Example = ExampleOf<typeof meta>;

export const High: Example = {
  description: "A filled triangle pointing up.",
};

export const Medium: Example = {
  args: { level: 2 },
  description: "A filled square.",
};

export const Low: Example = {
  args: { level: 3 },
  description: "A triangle pointing down, in the quietest ink.",
};

export const Codes: Example = {
  render: (args) => (
    <div style={{ display: "flex", gap: 16 }}>
      <PriorityMark {...args} level={1} format="code" />
      <PriorityMark {...args} level={2} format="code" />
      <PriorityMark {...args} level={3} format="code" />
    </div>
  ),
  description: "P1 · P2 · P3 for dense views where the word would crowd the row.",
};

export const WithoutGlyph: Example = {
  args: { glyph: false, format: "code" },
  description: "Word or code alone, for a board card footer that already carries a glyph.",
};

export const InATable: Example = {
  render: () => (
    <div style={{ width: 560 }}>
      <Table density="compact" minWidth={0}>
        <THead>
          <tr>
            <Th>Task</Th>
            <Th>Priority</Th>
            <Th numeric>Due</Th>
          </tr>
        </THead>
        <TBody>
          <Tr>
            <Td primary>Brand system rollout</Td>
            <Td>
              <PriorityMark level={1} />
            </Td>
            <Td numeric>02 Oct</Td>
          </Tr>
          <Tr>
            <Td primary>Packaging die-line audit</Td>
            <Td>
              <PriorityMark level={2} />
            </Td>
            <Td numeric>15 Oct</Td>
          </Tr>
          <Tr>
            <Td primary>Rebrand discovery notes</Td>
            <Td>
              <PriorityMark level={3} />
            </Td>
            <Td numeric>28 Oct</Td>
          </Tr>
        </TBody>
      </Table>
    </div>
  ),
  description: "A priority column reads as ink, leaving colour to the status column.",
};

export const AllVariants: Example = {
  render: () => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, max-content)", gap: "12px 24px", alignItems: "center" }}>
      {([1, 2, 3] as const).map((level) => (
        <div key={level} style={{ display: "contents" }}>
          <span className="caps text-4">Level {level}</span>
          <PriorityMark level={level} />
          <PriorityMark level={level} format="code" />
          <PriorityMark level={level} glyph={false} />
        </div>
      ))}
    </div>
  ),
  description: "Every level as a word, a code, and without its glyph.",
};
