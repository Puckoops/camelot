import { Alert, Button, TextLink, type AlertTone } from "@puckoops/camelot";
import { useState } from "react";
import { action, type ExampleOf, type Meta } from "@/docs";

const tones: AlertTone[] = ["neutral", "info", "success", "warning", "critical"];

const meta = {
  title: "ui/Alert",
  component: Alert,
  description:
    "A message that **stays on the page** until it is dealt with. The tone — **neutral, info, success, warning, critical** — colours only the **glyph** and a **thin left edge**, following the chip rule: the surface and the text stay achromatic, and each tone has its own glyph so it reads in greyscale. A title that states the condition, a sentence or two, at most one action, and a dismiss when it can be put away.",
  decorators: [
    (Example, { parameters }) => (
      <div style={{ width: parameters.frameWidth ?? 560 }}>
        <Example />
      </div>
    ),
  ],
  args: {
    tone: "warning",
    title: "Invoice 2041 is 12 days overdue",
    children: "Nordvik Atelier has been sent two reminders. The next goes out on Friday.",
  },
  argTypes: {
    tone: { control: "inline-radio", options: tones, description: "Colours the glyph and the edge only" },
    title: { control: "text" },
    children: { control: "text" },
    action: { control: false },
    onDismiss: { control: false },
    glyph: { control: false },
  },
} satisfies Meta<typeof Alert>;

export default meta;
type Example = ExampleOf<typeof meta>;

export const Warning: Example = {
  args: { action: <Button size="sm">Send a reminder now</Button> },
  description: "Attention needed soon; announced to assistive tech.",
};

export const Critical: Example = {
  args: {
    tone: "critical",
    title: "The bank feed stopped on 26 Sep",
    children: "Payments after that date are not in the ledger. Reconnect the account to bring them in.",
    action: <Button size="sm">Reconnect</Button>,
  },
  description: "Something is broken and blocks work.",
};

export const Info: Example = {
  args: {
    tone: "info",
    title: "September is being closed",
    children: "Entries dated before 01 Oct are read-only until the accountant finishes, usually within two days.",
    action: (
      <TextLink href="#" arrow="forward">
        What closing means
      </TextLink>
    ),
  },
  description: "Context the reader should know; it waits for them.",
};

export const Success: Example = {
  args: { tone: "success", title: "All September invoices are paid", children: "£48,320 received from nine clients." },
  description: "A condition that is now settled.",
};

export const Neutral: Example = {
  args: { tone: "neutral", title: "This is sample data", children: "Nothing here is real. Invite your team to start with your own." },
  description: "A plain note with no state.",
};

export const TitleOnly: Example = {
  args: { tone: "info", title: "Uploads over 50 MB go to cold storage and take a minute to appear.", children: undefined },
  description: "A single line when the title says it all.",
};

export const Dismissible: Example = {
  render: function Render(args) {
    const [shown, setShown] = useState(true);
    const onDismiss = action();
    return shown ? (
      <Alert
        {...args}
        tone="info"
        title="New: bulk-assign tasks"
        onDismiss={() => {
          onDismiss();
          setShown(false);
        }}
      >
        Select rows in the tracker and assign them in one go.
      </Alert>
    ) : (
      <Button size="sm" onClick={() => setShown(true)}>
        Show the alert again
      </Button>
    );
  },
  description: "A close button when the message can be put away.",
};

export const Greyscale: Example = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, filter: "grayscale(1)" }}>
      {tones.map((tone) => (
        <Alert key={tone} tone={tone} title={`${tone[0]!.toUpperCase()}${tone.slice(1)}`} />
      ))}
    </div>
  ),
  description: "Without colour, each tone still has its own glyph.",
};

export const AllVariants: Example = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <Alert tone="neutral" title="This is sample data">
        Nothing here is real.
      </Alert>
      <Alert
        tone="info"
        title="September is being closed"
        action={
          <TextLink href="#" arrow="forward">
            What closing means
          </TextLink>
        }
      >
        Entries before 01 Oct are read-only for now.
      </Alert>
      <Alert tone="success" title="All September invoices are paid" onDismiss={() => {}}>
        £48,320 received from nine clients.
      </Alert>
      <Alert tone="warning" title="Invoice 2041 is 12 days overdue" action={<Button size="sm">Send a reminder</Button>}>
        Two reminders sent so far.
      </Alert>
      <Alert tone="critical" title="The bank feed stopped on 26 Sep" action={<Button size="sm">Reconnect</Button>}>
        Later payments are missing from the ledger.
      </Alert>
    </div>
  ),
  description: "Every tone, with an action or a dismiss.",
};
