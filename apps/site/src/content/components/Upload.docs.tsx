import { Card, Dropzone, formatBytes, UploadItem } from "@puckoops/camelot";
import { useState } from "react";
import { action, type ExampleOf, type Meta } from "@/docs";

const meta = {
  title: "ui/Upload",
  component: Dropzone,
  subcomponents: { UploadItem },
  description:
    "The visual pieces of file intake. **Dropzone** is a dashed target that takes a drop or opens the file picker, and is keyboard reachable. **UploadItem** is one row of the queue: name, kind, size, a progress bar, the percentage, and remove. Wire them to [useFileUpload](/docs/hooks/use-file-upload) for validation, concurrency and retry.",
  decorators: [
    (Example, { parameters }) => (
      <div style={{ width: parameters.frameWidth ?? 520 }}>
        <Example />
      </div>
    ),
  ],
  args: {
    onFiles: action(),
    title: "Drop files here, or browse",
    hint: "PDF, PNG, DOCX, XLSX up to 50 MB each.",
    multiple: true,
    disabled: false,
  },
  argTypes: {
    title: { control: "text" },
    hint: { control: "text" },
    accept: { control: "text", description: "An input accept string, such as .pdf,image/*" },
    multiple: { control: "boolean" },
    disabled: { control: "boolean" },
  },
} satisfies Meta<typeof Dropzone>;

export default meta;
type Example = ExampleOf<typeof meta>;

export const Default: Example = {
  description: "Drop a file or click to browse; the files are reported to onFiles.",
};

export const SingleFile: Example = {
  args: { multiple: false, title: "Drop the signed contract, or browse", hint: "One PDF up to 10 MB.", accept: ".pdf" },
  description: "One file, one type.",
};

export const Disabled: Example = {
  args: { disabled: true, hint: "Uploads open once the project is approved." },
  description: "Dimmed with a reason in the hint.",
};

export const DroppedFiles: Example = {
  render: function Render(args) {
    const [files, setFiles] = useState<File[]>([]);
    return (
      <div>
        <Dropzone
          {...args}
          onFiles={(list) => {
            setFiles((current) => [...current, ...list]);
            args.onFiles(list);
          }}
        />
        {files.map((f, i) => (
          <UploadItem
            key={`${f.name}-${i}`}
            name={f.name}
            kind={f.type ? f.type.split("/")[1]?.toUpperCase() : "File"}
            size={formatBytes(f.size)}
            progress={0}
            status="queued"
            onRemove={() => setFiles((current) => current.filter((_, j) => j !== i))}
          />
        ))}
      </div>
    );
  },
  description: "Drop real files to list them as queued rows; nothing is sent anywhere.",
};

export const Rows: Example = {
  render: () => (
    <div>
      <UploadItem name="Nordvik_signage_pilot.pdf" kind="PDF" size="3.2 MB" progress={100} status="done" onRemove={() => {}} />
      <UploadItem name="Site_photos_batch_02.zip" kind="Archive" size="18.4 MB" progress={46} status="uploading" onRemove={() => {}} />
      <UploadItem name="Brand_guidelines_v4.pdf" kind="PDF" size="6.1 MB" progress={0} status="queued" onRemove={() => {}} />
      <UploadItem
        name="Studio_walkthrough.mov"
        kind="Video"
        size="61 MB"
        progress={12}
        status="failed"
        error="The connection dropped before the file finished uploading."
        onRemove={() => {}}
      />
    </div>
  ),
  description: "UploadItem done, uploading, queued and failed with its reason.",
};

export const AllVariants: Example = {
  render: () => (
    <Card style={{ gap: 12 }}>
      <Dropzone onFiles={() => {}} hint="PDF, PNG, DOCX, XLSX up to 50 MB each." />
      <div>
        <UploadItem name="Nordvik_signage_pilot.pdf" kind="PDF" size="3.2 MB" progress={100} status="done" onRemove={() => {}} />
        <UploadItem name="Site_photos_batch_02.zip" kind="Archive" size="18.4 MB" progress={46} onRemove={() => {}} />
        <UploadItem
          name="Studio_walkthrough.mov"
          kind="Video"
          size="61 MB"
          progress={12}
          status="failed"
          error="The connection dropped before the file finished uploading."
        />
      </div>
      <Dropzone onFiles={() => {}} disabled title="Uploads are closed" hint="The project is archived." />
    </Card>
  ),
  parameters: { frameWidth: 560 },
  description: "A dropzone over its queue, and a disabled one.",
};
