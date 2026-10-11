# Camelot

**Camelot** is the Puckoops design system, packaged for React as `@puckoops/camelot`: tokens, type, and the
components Puckoops products are built from. Orbit is the first product on it; the package holds nothing
Orbit-specific, so another product can use it as-is.

> **Chrome is achromatic. State is chromatic. Layout carries the design — not colour.**

- Light is the default theme; dark is a toggle (`data-theme="dark"` on `<html>`).
- There is no accent hue. Emphasis is ink. Four hues — teal, blue, amber, red — mean state, and only the system's state components draw them.
- A screen is composed from bands on a 12-column grid, with card archetypes rather than stacked tables.

The tokens come from the design-system artifact Camelot was drawn in (published as ORBIT v3):
`src/styles/tokens.css` is its compiled `tokens.css` plus the motion durations and easings from its Motion
section. The one deliberate difference is that `.caps` is set in the mono face, which is what the shipping
prototype does.

## Install

Until the package is on a registry, install a packed build. In the Camelot repo:

```bash
npm run pack:camelot
```

Then, in the app:

```bash
npm install ../camelot/puckoops-camelot-0.2.0.tgz
```

A packed build, rather than a workspace link, keeps a single copy of React in the app.

Peer dependencies: `react` and `react-dom` 19.

## Use

```tsx
// app/layout.tsx (Next.js)
import "@puckoops/camelot/styles.css";
import { Instrument_Sans, Instrument_Serif } from "next/font/google";
import localFont from "next/font/local";
import { ThemeProvider, Toaster, TooltipProvider, themeScript } from "@puckoops/camelot";

const sans = Instrument_Sans({ subsets: ["latin"], variable: "--pk-sans" });
const serif = Instrument_Serif({ subsets: ["latin"], weight: "400", variable: "--pk-serif" });
const mono = localFont({ src: "./fonts/GeistMono-Variable.woff2", weight: "100 900", variable: "--pk-mono" });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="light" className={`${sans.variable} ${serif.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <ThemeProvider>
          <TooltipProvider>
            {children}
            <Toaster />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
```

Geist Mono ships with the app: copy `GeistMono-Variable.woff2` from the `geist` package (SIL OFL) into
`app/fonts/`. Turbopack builds can fail on the Geist Mono files Google Fonts serves.

`next/font` hashes family names, so point the tokens at its variables once, after the stylesheet:

```css
:root {
  --font-sans: var(--pk-sans), system-ui, sans-serif;
  --font-display: var(--pk-serif), Georgia, serif;
  --font-mono: var(--pk-mono), ui-monospace, monospace;
}
```

Without `next/font`, load the three families from Google Fonts and the tokens pick them up by name.

`@puckoops/camelot/tokens.css` ships the custom properties alone, for surfaces that want the palette without
the components.

## What is in it

| Group | Components |
|---|---|
| Foundations | `tokens.css`, type classes (`.hero-xl` … `.num-sm`, `.caps`, `.text-1`…`.text-4`), `.reveal`, `ThemeProvider`, `useTheme`, `themeScript`, `Icon` |
| Status | `Chip` (tone + frozen `Glyph`), `Glyph`, `PriorityMark`, `Badge` |
| Actions | `Button` (primary · ghost · quiet), `IconButton`, `TextLink`, `Menu` |
| Forms | `Field`, `Input`, `SearchInput`, `Textarea`, `Label`, `HelperText`, `Select`, `SearchSelect`, `Checkbox`, `Switch`, `RadioGroup`, `Slider`, `DateInput`, `Calendar`, `SegmentedControl`, `ChoiceGroup`, `FormFooter` |
| Navigation | `Tabs` (`TabsList`, `TabsTrigger`, `TabsContent`), `Stepper`, `Pagination`, `paginationRange` |
| Composition | `AppShell`, `Sidebar` (+ `SidebarBrand`, `SidebarSection`, `SidebarItem`, `SidebarUser`, `SidebarFooter`), `Topbar`, `Breadcrumbs`, `Page`, `PageHeader`, `Band`, `Grid` / `GridItem`, `Stack`, `Divider`, `Accordion`, `AspectRatio` |
| Cards | `Card`, `FigureCard`, `ListCard`, `MeterCard`, `ActionCard`, `MediaCard`, `Kpi`, `Meter`, `InlineMeter`, `Sparkbars` |
| Data | `Table` (`THead`, `TBody`, `Tr`, `Th`, `Td`, `TGroup`), `Board`, `BoardColumn`, `BoardCard`, `AzStrip` |
| Charts | `BarChart`, `LineChart`, `AreaChart` |
| Overlays | `Drawer`, `DrawerSection`, `DescriptionList`, `Dialog`, `Tooltip`, `Toaster` / `toast` |
| Files | `Dropzone`, `UploadItem`, `useFileUpload`, `createSignedUrlUploader`, `formatBytes` |
| States | `EmptyState`, `Skeleton`, `SampleFlag`, `Alert`, `Progress`, `ProgressCircle` |

Icons are [Hugeicons](https://hugeicons.com) Stroke Rounded. Import the icon you need from
`@hugeicons/core-free-icons` and pass it to `Icon` or any `icon*` prop.

## Rules worth memorising

- Text sits on `--surface` or `--surface-2`, never directly on `--canvas`.
- A card is `--surface` + `--hairline` + `--radius-lg` + `--shadow-card`. If it needs a fifth property, the layout is wrong.
- Product code never references a hue ramp. They appear only in `Chip`, the state glyphs of `Alert`, `Toast`, `HelperText` and `PriorityMark`, and a field's error. Every chip keeps its glyph: desaturate a screenshot and every state must still read.
- Priority is glyph and ink only, never a filled chip.
- Grid spans: 12, 8+4, 7+5, 6+6 (once per screen), 5+4+3, 4+4+4, 3×4 (counts only).
- One hero figure per screen (`FigureCard hero`), one dense table per viewport, never two tables in adjacent bands, and a screen never opens with a table.
- Table density follows the screen's job: relaxed for tables people read, default for the product, compact for a second table or a drawer.
- Empty is an `EmptyState` with one sentence and one ghost button, never "No data". Loading is `Skeleton` blocks at their real sizes, never a spinner.
- Motion is transform and opacity only. Everything is wrapped for `prefers-reduced-motion`.

## Develop

The package lives in the Camelot monorepo; the repo README covers the docs site. From the repo root:

```bash
npm run dev -w @puckoops/camelot
npm test -w @puckoops/camelot
npm run typecheck -w @puckoops/camelot
npm run build -w @puckoops/camelot
```

The build is a single ESM bundle marked `"use client"`, with component styles compiled as CSS modules and
prepended by the global sheets into `dist/styles.css`, beside `dist/tokens.css` and the type declarations.
