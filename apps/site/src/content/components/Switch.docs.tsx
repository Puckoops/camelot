import { Card, Divider, Switch, toast } from "@puckoops/camelot";
import { useState } from "react";
import { action, type ExampleOf, type Meta } from "@/docs";

const meta = {
  title: "ui/Switch",
  component: Switch,
  description:
    'An on/off **setting that applies the moment it flips** — notifications, auto-archive, a public link. The thumb slides and the track fills with ink by opacity. In a settings list use **labelPosition="start"** so labels align and switches line up at the end. When the choice is saved with a form, use Checkbox.',
  args: { label: "Email me when an invoice is overdue", onCheckedChange: action(), size: "md", labelPosition: "end", defaultChecked: false },
  argTypes: {
    label: { control: "text" },
    description: { control: "text" },
    size: { control: "inline-radio", options: ["sm", "md"] },
    labelPosition: { control: "inline-radio", options: ["end", "start"] },
    checked: { control: "boolean" },
    defaultChecked: { control: "boolean" },
    disabled: { control: "boolean" },
  },
} satisfies Meta<typeof Switch>;

export default meta;
type Example = ExampleOf<typeof meta>;

export const Default: Example = {
  description: "Off, with its label after it.",
};

export const On: Example = {
  args: { defaultChecked: true },
  description: "On: ink track, inverse thumb.",
};

export const WithDescription: Example = {
  args: { label: "Public link", description: "Anyone with the link can view the files in this folder." },
  description: "A sentence under the label says what the setting does.",
};

export const Small: Example = {
  args: { size: "sm", label: "Show weekends" },
  description: "Small, for a toolbar or a card header.",
};

export const Disabled: Example = {
  args: { disabled: true, defaultChecked: true, label: "Two-step sign-in", description: "Required for everyone in the studio." },
  description: "Locked on by a policy, with the reason.",
};

export const SettingsList: Example = {
  render: function Render() {
    const [settings, setSettings] = useState({ overdue: true, sentBack: true, digest: false });
    const flip = (key: keyof typeof settings, label: string) => (on: boolean) => {
      setSettings((s) => ({ ...s, [key]: on }));
      toast(`${label} ${on ? "on" : "off"}`);
    };
    return (
      <Card style={{ width: 460, gap: 16 }}>
        <p className="caps text-4">Notifications</p>
        <Switch
          labelPosition="start"
          label="Overdue invoices"
          description="The morning after an invoice passes its due date."
          checked={settings.overdue}
          onCheckedChange={flip("overdue", "Overdue invoices")}
        />
        <Divider />
        <Switch
          labelPosition="start"
          label="Tasks sent back"
          description="When a reviewer moves your task to Re-do."
          checked={settings.sentBack}
          onCheckedChange={flip("sentBack", "Tasks sent back")}
        />
        <Divider />
        <Switch
          labelPosition="start"
          label="Weekly digest"
          description="Monday at 08:00, one email."
          checked={settings.digest}
          onCheckedChange={flip("digest", "Weekly digest")}
        />
      </Card>
    );
  },
  description: "Labels first and switches at the end; each flip applies at once and confirms with a toast.",
};

export const AllVariants: Example = {
  render: () => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, max-content)", gap: "16px 40px" }}>
      <Switch label="Off" />
      <Switch label="On" defaultChecked />
      <Switch label="Small off" size="sm" />
      <Switch label="Small on" size="sm" defaultChecked />
      <Switch label="Disabled off" disabled />
      <Switch label="Disabled on" disabled defaultChecked />
    </div>
  ),
  description: "Both sizes, on and off, and disabled.",
};
