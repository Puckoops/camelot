import { Button, Card, Chip, DescriptionList, Meter, SegmentedControl, ThemeProvider, themeScript, useTheme, type ThemePreference } from "@puckoops/camelot";
import type { ExampleOf, Meta } from "@/docs";

function Appearance({ showSample }: { showSample?: boolean }) {
  const { preference, resolved, setPreference } = useTheme();
  return (
    <Card style={{ width: 440, gap: 20 }}>
      <div>
        <p className="caps text-4">Appearance</p>
        <p className="small text-3" style={{ marginTop: 4 }}>
          System follows the operating system. The choice is kept in localStorage and applied before first paint by themeScript.
        </p>
      </div>
      <SegmentedControl<ThemePreference>
        aria-label="Appearance"
        value={preference}
        onValueChange={setPreference}
        options={[
          { value: "light", label: "Light" },
          { value: "dark", label: "Dark" },
          { value: "system", label: "System" },
        ]}
      />
      <DescriptionList
        items={[
          { label: "Preference", value: <span className="num">{preference}</span> },
          { label: "Resolved", value: <span className="num">{resolved}</span> },
          { label: "html data-theme", value: <span className="num">{resolved}</span> },
        ]}
      />
      {showSample && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            <Chip tone="teal" glyph="check">
              Done
            </Chip>
            <Chip tone="blue" glyph="circle-half">
              In Progress
            </Chip>
            <Chip tone="amber" glyph="redo">
              Re-do
            </Chip>
            <Chip tone="red" glyph="triangle">
              Overdue
            </Chip>
          </div>
          <Meter percent={64} label="Budget consumed" />
          <div style={{ display: "flex", gap: 8 }}>
            <Button variant="primary">Primary</Button>
            <Button>Ghost</Button>
            <Button variant="quiet">Quiet</Button>
          </div>
        </div>
      )}
    </Card>
  );
}

const meta = {
  title: "ui/Theme",
  component: ThemeProvider,
  description:
    "Light is the default and dark is a toggle: **ThemeProvider** resolves a light / dark / system preference onto `<html data-theme>`, **useTheme** reads and sets it, and **themeScript** — inlined in `<head>` — applies the stored choice before first paint so there is no flash. Here the example and the site's theme switch stay in step.",
  args: { children: null },
  argTypes: { children: { control: false }, defaultPreference: { control: false } },
} satisfies Meta<typeof ThemeProvider>;

export default meta;
type Example = ExampleOf<typeof meta>;

export const SwitchPreference: Example = {
  name: "Switch preference",
  render: () => <Appearance />,
  description: "useTheme's preference and setPreference driving the segmented switch.",
};

export const ThemeScript: Example = {
  render: () => (
    <Card style={{ width: 640, gap: 12 }}>
      <p className="caps text-4">In the document head</p>
      <pre
        className="num-sm"
        style={{
          margin: 0,
          padding: 16,
          overflowX: "auto",
          whiteSpace: "pre-wrap",
          wordBreak: "break-all",
          borderRadius: "var(--radius-md)",
          background: "var(--surface-2)",
          color: "var(--text-2)",
        }}
      >
        {`<script dangerouslySetInnerHTML={{ __html: themeScript }} />\n\n${themeScript}`}
      </pre>
    </Card>
  ),
  description: "The pre-paint script. It mirrors ThemeProvider's resolution and has no dependencies.",
};

export const AllVariants: Example = {
  render: () => <Appearance showSample />,
  description: "The switch with a sample of chips, a meter and buttons that follow it.",
};
