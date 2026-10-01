import { AspectRatio, Card, Grid, GridItem, MediaCard } from "@puckoops/camelot";
import type { ExampleOf, Meta } from "@/docs";

function Artwork({ seed = 0 }: { seed?: number }) {
  const offset = seed * 36;
  return (
    <AspectRatio ratio={16 / 9} rounded={false}>
      <svg viewBox="0 0 320 180" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
        <rect width="320" height="180" style={{ fill: "var(--surface-2)" }} />
        <circle cx={200 + offset / 2} cy={70} r={42} style={{ fill: "var(--n-04)" }} />
        <rect x={40} y={96 - offset / 6} width={150} height={52} rx={10} style={{ fill: "var(--n-05)" }} />
        <rect x={40} y={160 - offset / 6} width={236} height={6} rx={3} style={{ fill: "var(--n-04)" }} />
        <circle cx={70 + offset} cy={52} r={10} style={{ fill: "var(--text-1)" }} />
      </svg>
    </AspectRatio>
  );
}

const meta = {
  title: "ui/Cards/Card",
  component: Card,
  subcomponents: { MediaCard },
  description:
    "The base card: **--surface + --hairline + --radius-lg + --shadow-card**, 148px tall at least. Every archetype is built on it; reach for it only when none fits. **MediaCard** bleeds an image to three edges above a title, for the landing page.",
  decorators: [
    (Example, { parameters }) => (
      <div style={{ width: parameters.frameWidth ?? 360 }}>
        <Example />
      </div>
    ),
  ],
  args: { padding: "default", interactive: false },
  argTypes: {
    padding: { control: "inline-radio", options: ["default", "flush"], description: "flush drops the padding for content that bleeds" },
    interactive: { control: "boolean", description: "Lifts to --shadow-raised on hover" },
  },
  render: (args) => (
    <Card {...args}>
      <p className="caps text-4">Next invoice</p>
      <h3 className="h3" style={{ marginTop: 12 }}>
        Invoice 2047 · Purslane Studio
      </h3>
      <p className="small text-3" style={{ marginTop: 4 }}>
        Goes out on 04 Oct for the September retainer.
      </p>
    </Card>
  ),
} satisfies Meta<typeof Card>;

export default meta;
type Example = ExampleOf<typeof meta>;

export const Default: Example = {
  description: "Four properties and nothing else.",
};

export const Interactive: Example = {
  args: { interactive: true },
  description: "A card that opens something lifts on hover.",
};

export const Flush: Example = {
  args: { padding: "flush" },
  render: (args) => (
    <Card {...args}>
      <Artwork />
      <div style={{ padding: 24 }}>
        <h3 className="h3">Content that bleeds</h3>
        <p className="small text-3" style={{ marginTop: 4 }}>
          Flush clips the corners and leaves the padding to you.
        </p>
      </div>
    </Card>
  ),
  description: "No padding and clipped corners, for media or a table that bleeds.",
};

export const Media: Example = {
  render: () => <MediaCard media={<Artwork />} title="Nordvik signage pilot" caption="Wayfinding for the harbour office, delivered in June." />,
  description: "MediaCard: the image bleeds to the top and sides; the title sits below on the surface.",
};

export const AllVariants: Example = {
  render: () => (
    <Grid>
      <GridItem span={4}>
        <Card>
          <p className="caps text-4">Default</p>
          <p className="small text-3" style={{ marginTop: 8 }}>
            Surface, hairline, radius, shadow.
          </p>
        </Card>
      </GridItem>
      <GridItem span={4}>
        <Card interactive>
          <p className="caps text-4">Interactive</p>
          <p className="small text-3" style={{ marginTop: 8 }}>
            Hover to see it lift.
          </p>
        </Card>
      </GridItem>
      <GridItem span={4}>
        <MediaCard media={<Artwork seed={1} />} title="Brightwater packaging" caption="Die-lines and print proofs." />
      </GridItem>
    </Grid>
  ),
  parameters: { frameWidth: "auto", layout: "padded" },
  description: "The base card at rest, interactive, and as a MediaCard.",
};
