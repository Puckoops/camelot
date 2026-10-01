import { Delete02Icon, Download01Icon, Edit02Icon, MoreHorizontalIcon } from "@hugeicons/core-free-icons";
import { IconButton, Tooltip } from "@puckoops/camelot";
import type { ExampleOf, Meta } from "@/docs";

const meta = {
  title: "ui/Tooltip",
  component: Tooltip,
  description:
    "A short **ink label** on hover or focus, after 300ms: it names an icon-only control or shows the full value of something truncated. Never interactive content — a tooltip cannot be clicked into. Mount **TooltipProvider** once near the root.",
  args: { content: "More actions", side: "top", children: <IconButton icon={MoreHorizontalIcon} aria-label="More actions" /> },
  argTypes: {
    content: { control: "text" },
    side: { control: "inline-radio", options: ["top", "right", "bottom", "left"] },
    children: { control: false },
  },
} satisfies Meta<typeof Tooltip>;

export default meta;
type Example = ExampleOf<typeof meta>;

export const Default: Example = {
  description: "Hover or tab to the button.",
};

export const Sides: Example = {
  render: () => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, max-content)", gap: 48, padding: 48 }}>
      {(["top", "right", "bottom", "left"] as const).map((side) => (
        <Tooltip key={side} content={`Shown on the ${side}`} side={side}>
          <IconButton icon={MoreHorizontalIcon} aria-label={`Tooltip on the ${side}`} />
        </Tooltip>
      ))}
    </div>
  ),
  description: "Top by default; it flips when there is no room.",
};

export const TruncatedValue: Example = {
  render: () => (
    <Tooltip content="Invoice 2044 — packaging art, second print run and die-line corrections">
      <span
        tabIndex={0}
        className="small text-1"
        style={{ display: "inline-block", maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
      >
        Invoice 2044 — packaging art, second print run and die-line corrections
      </span>
    </Tooltip>
  ),
  description: "The full text of a value cut off by its column.",
};

export const Toolbar: Example = {
  render: () => (
    <div style={{ display: "flex", gap: 4 }}>
      {[
        [Edit02Icon, "Edit"],
        [Download01Icon, "Download PDF"],
        [Delete02Icon, "Delete"],
      ].map(([icon, label]) => (
        <Tooltip key={label as string} content={label as string}>
          <IconButton icon={icon as typeof Edit02Icon} aria-label={label as string} variant="bare" />
        </Tooltip>
      ))}
    </div>
  ),
  description: "A row of icon buttons, each named by its tooltip and its aria-label.",
};

export const AllVariants: Example = {
  render: () => (
    <div style={{ display: "flex", alignItems: "center", gap: 24, padding: 32 }}>
      <Tooltip content="More actions">
        <IconButton icon={MoreHorizontalIcon} aria-label="More actions" />
      </Tooltip>
      <Tooltip content="Download PDF" side="bottom">
        <IconButton icon={Download01Icon} aria-label="Download PDF" variant="bare" />
      </Tooltip>
      <Tooltip content="Nordvik Atelier — brand system, signage and annual report" side="right">
        <span
          tabIndex={0}
          className="small text-2"
          style={{ display: "inline-block", maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
        >
          Nordvik Atelier — brand system, signage and annual report
        </span>
      </Tooltip>
    </div>
  ),
  description: "On an icon button, a bare icon and a truncated value.",
};
