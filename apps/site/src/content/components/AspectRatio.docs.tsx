import { Image01Icon, PlayIcon } from "@hugeicons/core-free-icons";
import { AspectRatio, Icon, MediaCard } from "@puckoops/camelot";
import type { ExampleOf, Meta } from "@/docs";

function Placeholder({ label, icon = Image01Icon }: { label: string; icon?: typeof Image01Icon }) {
  return (
    <div style={{ display: "grid", placeItems: "center", width: "100%", height: "100%", color: "var(--text-4)" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
        <Icon icon={icon} size={20} />
        <span className="num-sm">{label}</span>
      </div>
    </div>
  );
}

const ratios = [
  { label: "16:9", ratio: 16 / 9 },
  { label: "3:2", ratio: 3 / 2 },
  { label: "4:3", ratio: 4 / 3 },
  { label: "1:1", ratio: 1 },
  { label: "4:5", ratio: 4 / 5 },
];

const meta = {
  title: "ui/AspectRatio",
  component: AspectRatio,
  description:
    "A frame that holds media at a **fixed ratio** on --surface-2, so the layout keeps its shape while an image or a video loads. Anything inside fills it with object-fit cover. **rounded** clips to --radius-md; turn it off inside a card that already clips its media. **framed** adds a hairline.",
  decorators: [
    (Example, { parameters }) => (
      <div style={{ width: parameters.frameWidth ?? 420 }}>
        <Example />
      </div>
    ),
  ],
  args: { ratio: 16 / 9, rounded: true, framed: false },
  argTypes: {
    ratio: { control: "select", options: ratios.map((r) => r.ratio), description: "Width over height" },
    rounded: { control: "boolean" },
    framed: { control: "boolean" },
    children: { control: false },
  },
  render: (args) => (
    <AspectRatio {...args}>
      <Placeholder label="Site_photo_014.jpg" />
    </AspectRatio>
  ),
} satisfies Meta<typeof AspectRatio>;

export default meta;
type Example = ExampleOf<typeof meta>;

export const Widescreen: Example = {
  description: "16:9 for video and wide photography.",
};

export const Square: Example = {
  args: { ratio: 1, framed: true },
  parameters: { frameWidth: 240 },
  description: "1:1 with a hairline, for a logo or a thumbnail on --surface-2.",
};

export const Video: Example = {
  render: (args) => (
    <AspectRatio {...args}>
      <Placeholder label="Studio_walkthrough.mov · 02:14" icon={PlayIcon} />
    </AspectRatio>
  ),
  description: "A video poster keeps its frame before it plays.",
};

export const InAMediaCard: Example = {
  render: () => (
    <MediaCard
      media={
        <AspectRatio ratio={3 / 2} rounded={false}>
          <Placeholder label="Nordvik_signage_pilot.jpg" />
        </AspectRatio>
      }
      title="Nordvik signage pilot"
      caption="Wayfinding for the harbour office."
    />
  ),
  parameters: { frameWidth: 360 },
  description: "Unrounded inside a MediaCard, which clips the corners itself.",
};

export const AllVariants: Example = {
  render: () => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 160px)", gap: 16, alignItems: "end" }}>
      {ratios.map((r) => (
        <div key={r.label} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <AspectRatio ratio={r.ratio} framed>
            <Placeholder label={r.label} />
          </AspectRatio>
          <span className="caps text-4">{r.label}</span>
        </div>
      ))}
    </div>
  ),
  parameters: { frameWidth: "auto" },
  description: "The ratios the product uses, framed.",
};
