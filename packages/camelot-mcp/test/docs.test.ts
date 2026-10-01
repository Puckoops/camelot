import { describe, expect, it } from "vitest";
import { docsNameOf, docsPathOf, docsTitle } from "../scripts/catalog/docs.js";

describe("docs pages", () => {
  it("puts components and hooks at the site's kebab-case slugs", () => {
    expect(docsPathOf("Button")).toBe("/docs/components/button");
    expect(docsPathOf("SegmentedControl")).toBe("/docs/components/segmented-control");
    expect(docsPathOf("Cards/FigureCard")).toBe("/docs/components/cards-figure-card");
    expect(docsPathOf("useFileUpload")).toBe("/docs/hooks/use-file-upload");
  });

  it("reads the meta title of a default export given inline or through a const", () => {
    const viaConst = `const meta = { title: "ui/Cards/FigureCard", component: FigureCard } satisfies Meta<typeof FigureCard>;\nexport default meta;`;
    expect(docsTitle("FigureCard.docs.tsx", viaConst)).toBe("ui/Cards/FigureCard");
    expect(docsTitle("useFileUpload.docs.tsx", `export default { title: "Hooks/useFileUpload" };`)).toBe("Hooks/useFileUpload");
    expect(docsTitle("Draft.docs.tsx", `export const Primary = { args: { title: "ui/Button" } };`)).toBeUndefined();
    expect(docsNameOf("ui/Cards/FigureCard")).toBe("Cards/FigureCard");
    expect(docsNameOf("Hooks/useFileUpload")).toBe("useFileUpload");
  });
});
