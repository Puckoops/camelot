export interface HardRule {
  id: string;
  rule: string;
  why: string;
  /** Source patterns that break the rule; validate_code reports each match. */
  detect?: { pattern: string; flags?: string; message: string }[];
}

export const hardRules: HardRule[] = [
  {
    id: "tokens-only",
    rule: "Colour comes from tokens, never from a literal. No hex, rgb(), hsl() or named colours in product code.",
    why: "Every value resolves through tokens.css, so a palette change is one file and dark mode works everywhere.",
    detect: [
      { pattern: "(?<!href=[\"'])(?<![\\w/&])#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})\\b", message: "Literal hex colour; use a token such as var(--text-1) or a component." },
      { pattern: "\\b(?:rgb|rgba|hsl|hsla|oklch)\\(", message: "Literal colour function; use a token." },
    ],
  },
  {
    id: "no-hue-outside-chip",
    rule: "Chrome is achromatic. The teal, blue, amber and red ramps mean state and appear only inside the system's state components: Chip, the state glyphs of Alert, Toast, HelperText and PriorityMark, and a field's error. Product code never references them.",
    why: "State is chromatic and nothing else is, so a coloured pixel always means a state.",
    detect: [{ pattern: "var\\(--(?:teal|blue|amber|red)-\\d{3}\\)", message: "Hue ramp used directly; wrap the state in <Chip tone=…>." }],
  },
  {
    id: "glyph-with-state",
    rule: "Every status carries its frozen glyph: a Chip without glyph is incomplete.",
    why: "Desaturate a screenshot and every state must still read from glyph and label alone.",
    detect: [{ pattern: "<Chip(?=[\\s/>])(?![^>]*\\bglyph=)[^>]*>", message: "Chip without a glyph; pass glyph so the state survives greyscale." }],
  },
  {
    id: "type-classes",
    rule: "Text sizes come from the type classes (.h1, .h2, .h3, .body, .small, .caption, .caps, .num, .kpi …), never from inline font sizes.",
    why: "The scale and its line heights are part of the system; ad-hoc sizes drift.",
    detect: [{ pattern: "font-?[sS]ize\\s*[:=]\\s*['\"{]?\\d+(?:\\.\\d+)?(?:px|rem|em)?", message: "Literal font size; use a type class." }],
  },
  {
    id: "numbers-tabular",
    rule: "Every count, amount, date and percentage is set in the mono face with tabular figures (.num, .num-sm, .kpi, Td numeric).",
    why: "Columns of numbers line up or the table is wrong.",
  },
  {
    id: "one-hero",
    rule: "One hero figure per screen, one dense table per viewport, never two tables in adjacent bands, and a screen never opens with a table.",
    why: "Five heroes is no hero; stacked tables read as a document, not a product.",
  },
  {
    id: "grid-spans",
    rule: "Bands use the 12-column Grid with the allowed spans only: 12, 8+4, 7+5, 6+6 (once per screen), 5+4+3, 4+4+4, 3×4 (counts only).",
    why: "Unequal spans are what make a screen composed rather than stacked.",
  },
  {
    id: "icons",
    rule: "Icons are Hugeicons Stroke Rounded through <Icon> or an icon prop; currentColor, 1.5 stroke, 16/18/20/28px. No emoji, no filled icons, no second icon family.",
    why: "One optical weight across every row.",
    detect: [
      { pattern: "from ['\"]lucide-react['\"]", message: "Second icon family; use @hugeicons/core-free-icons." },
      { pattern: "from ['\"]react-icons", message: "Second icon family; use @hugeicons/core-free-icons." },
    ],
  },
  {
    id: "empty-and-loading",
    rule: 'Empty is an EmptyState (one sentence, one ghost button), never "No data". Loading is Skeleton at real sizes, never a spinner in a table.',
    why: "The final layout should be visible while it fills.",
    detect: [{ pattern: ">\\s*No data\\s*<", message: '"No data" placeholder; use <EmptyState>.' }],
  },
  {
    id: "motion",
    rule: "Animate transform and opacity only, and respect prefers-reduced-motion.",
    why: "Animating layout properties costs a layout pass and reads as lag.",
    detect: [{ pattern: "transition:\\s*(?:width|height|top|left|background-color|box-shadow)", message: "Animating a layout or paint property; animate transform or opacity." }],
  },
];

export interface ElementMapping {
  element: string;
  use: string;
  note?: string;
}

export const elementMapping: ElementMapping[] = [
  { element: "<button>", use: "Button / IconButton", note: "IconButton needs aria-label." },
  { element: "<a> in copy", use: "TextLink" },
  { element: "<input type=text|email|number>", use: "Field + Input" },
  { element: '<input type="search">', use: "SearchInput" },
  { element: "<textarea>", use: "Field + Textarea" },
  { element: "<select>", use: "Select" },
  { element: '<input type="checkbox">', use: "Checkbox (or Switch for an instant setting)" },
  { element: '<input type="radio">', use: "RadioGroup, or ChoiceGroup for chip-style options" },
  { element: '<input type="date">', use: "DateInput" },
  { element: '<input type="file">', use: "Dropzone + useFileUpload" },
  { element: "<table>", use: "Table / THead / TBody / Tr / Th / Td" },
  { element: "<dialog>", use: "Dialog, or Drawer for a record" },
  { element: "<progress>", use: "Meter / Progress" },
  { element: "<hr>", use: "Divider" },
  { element: "<nav> sidebar", use: "Sidebar + SidebarSection + SidebarItem inside AppShell" },
  { element: "<h1> page title", use: "PageHeader" },
  { element: "<section> with a heading", use: "Band" },
  { element: "status <span>", use: "Chip with tone and glyph" },
];

export const iconsGuide = `Icons are Hugeicons, Stroke Rounded (MIT, free tier).

  npm install @hugeicons/core-free-icons

  import { Search01Icon } from "@hugeicons/core-free-icons";
  import { Icon, Button } from "@puckoops/camelot";

  <Icon icon={Search01Icon} size={16} />
  <Button iconStart={Add01Icon}>Add new</Button>

Sizes: 16 in tables and the sidebar, 18 in nav, 20 in buttons, 28 on an Action card. Stroke is 1.5 and colour is currentColor,
so an icon takes the ink around it: --text-4 at rest, --text-1 when current or inside a primary button.

Common names: DashboardSquare02Icon, Task01Icon, Calendar03Icon, MoneyExchange01Icon, CloudUploadIcon, PackageIcon,
Invoice01Icon, Search01Icon, FilterIcon, Add01Icon, Cancel01Icon, ArrowRight01Icon, ArrowDown01Icon, MoreHorizontalIcon,
Link04Icon, Attachment01Icon, UserIcon, Calendar01Icon, Download01Icon.

Status glyphs (○ ◌ ◐ ◇ ↺ ✓ □ △ ◆) are not icons: use <Glyph shape=…> or pass glyph to Chip.`;

export const appSetup = `// 1. Install
//   npm install @puckoops/camelot @hugeicons/core-free-icons

// 2. app/layout.tsx (Next.js App Router)
import "@puckoops/camelot/styles.css";
import "./globals.css";
import { themeScript } from "@puckoops/camelot/helpers";
import { Instrument_Sans, Instrument_Serif, Geist_Mono } from "next/font/google";
import { Providers } from "./providers";

const sans = Instrument_Sans({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--pk-sans" });
const serif = Instrument_Serif({ subsets: ["latin"], weight: "400", variable: "--pk-serif" });
const mono = Geist_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--pk-mono" });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="light" className={\`\${sans.variable} \${serif.variable} \${mono.variable}\`} suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: themeScript }} /></head>
      <body><Providers>{children}</Providers></body>
    </html>
  );
}

// 3. app/providers.tsx
"use client";
import { ThemeProvider, Toaster, TooltipProvider } from "@puckoops/camelot";
export function Providers({ children }: { children: React.ReactNode }) {
  return <ThemeProvider><TooltipProvider>{children}<Toaster /></TooltipProvider></ThemeProvider>;
}

/* 4. app/globals.css — point the font tokens at next/font's variables */
:root {
  --font-sans: var(--pk-sans), system-ui, sans-serif;
  --font-display: var(--pk-serif), Georgia, serif;
  --font-mono: var(--pk-mono), ui-monospace, monospace;
}`;
