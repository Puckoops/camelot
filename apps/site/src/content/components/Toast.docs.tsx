import { Button, toast } from "@puckoops/camelot";
import type { ExampleOf, Meta } from "@/docs";

interface ToastArgs {
  title: string;
  description?: string;
  tone: "default" | "success" | "error";
}

function ToastDemo({ title, description, tone }: ToastArgs) {
  return (
    <Button
      variant="primary"
      onClick={() => {
        if (tone === "success") toast.success(title, description || undefined);
        else if (tone === "error") toast.error(title, description || undefined);
        else toast(title, { description: description || undefined });
      }}
    >
      Show toast
    </Button>
  );
}

const meta = {
  title: "ui/Toast",
  component: ToastDemo,
  description:
    "A transient message in the corner after something happened — saved, failed, uploaded. Call **toast()**, **toast.success()** or **toast.error()** from anywhere; mount **Toaster** once near the root. Success and error carry their glyph; a toast leaves after five seconds or on a swipe.",
  code: ({ title, description, tone }) => {
    const text = JSON.stringify(title);
    const more = description ? JSON.stringify(description) : "";
    if (tone === "success") return `toast.success(${text}${more ? `, ${more}` : ""});`;
    if (tone === "error") return `toast.error(${text}${more ? `, ${more}` : ""});`;
    return more ? `toast(${text}, { description: ${more} });` : `toast(${text});`;
  },
  args: { title: "Project created", description: "Rebrand discovery · Purslane Studio", tone: "success" },
  argTypes: {
    title: { control: "text" },
    description: { control: "text" },
    tone: { control: "inline-radio", options: ["default", "success", "error"], description: "toast, toast.success or toast.error" },
  },
} satisfies Meta<typeof ToastDemo>;

export default meta;
type Example = ExampleOf<typeof meta>;

export const Success: Example = {
  description: "toast.success after a mutation: a check glyph in the settled ink.",
};

export const Failure: Example = {
  args: { title: "Could not save the invoice", description: "The connection dropped. Your changes are still here.", tone: "error" },
  description: "toast.error: say what failed and that nothing was lost.",
};

export const Plain: Example = {
  args: { title: "Link copied", description: "", tone: "default" },
  description: "toast() with a title only, for small confirmations.",
};

export const AllVariants: Example = {
  render: () => (
    <div style={{ display: "flex", gap: 8 }}>
      <Button onClick={() => toast("Link copied")}>toast()</Button>
      <Button onClick={() => toast.success("Invoice sent", "Invoice 2046 · Purslane Studio")}>toast.success()</Button>
      <Button onClick={() => toast.error("Upload failed", "Site_photos_batch_02.zip is over 50 MB.")}>toast.error()</Button>
    </div>
  ),
  code: `toast("Link copied");
toast.success("Invoice sent", "Invoice 2046 · Purslane Studio");
toast.error("Upload failed", "Site_photos_batch_02.zip is over 50 MB.");`,
  description: "One button per call. Toaster is already mounted by the site, as it would be in the app root.",
};
