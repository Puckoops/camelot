import { describe, expect, it } from "vitest";
import { realCatalog } from "./fixtures.js";

const HEX = /^#[0-9a-f]{3,8}$/i;

describe("catalogue built from the package sources", () => {
  it("accounts for every export a catalogue entry lists", async () => {
    const { data } = await realCatalog();
    expect(data.components.length).toBeGreaterThan(0);
    for (const entry of data.components) {
      for (const name of entry.exports) expect(data.api[name] !== undefined || entry.missingExports.includes(name)).toBe(true);
      expect(data.categories).toContain(entry.category);
    }
  });

  it("reads props, allowed values and defaults from the component source", async () => {
    const button = (await realCatalog()).api("Button");
    expect(button?.kind).toBe("component");
    expect(button?.props?.props).toContainEqual(
      expect.objectContaining({ name: "variant", optional: true, values: ['"primary"', '"ghost"', '"quiet"'], default: '"ghost"' }),
    );
    expect(button?.props?.extends).toEqual(["ButtonHTMLAttributes<HTMLButtonElement>"]);
  });

  it("resolves var() aliases separately for the light and dark themes", async () => {
    const { data } = await realCatalog();
    const roles = data.tokens.colors.filter((c) => c.group === "role");
    expect(roles.length).toBeGreaterThan(0);
    for (const token of data.tokens.colors) {
      expect(token.light.resolved).not.toContain("var(");
      expect(token.dark.resolved).not.toContain("var(");
    }
    const aliased = roles.find((c) => c.light.chain.length > 0 && c.light.resolved !== c.dark.resolved);
    expect(aliased?.light.resolved).toMatch(HEX);
    expect(aliased?.dark.resolved).toMatch(HEX);
    expect(data.tokens.colors.filter((c) => c.group === "hue").every((c) => c.hue && c.step)).toBe(true);
  });

  it("links every entry to its docs page and marks the ones the site's content documents", async () => {
    const { data } = await realCatalog();
    expect(data.components.find((e) => e.name === "Button")).toMatchObject({ docsPath: "/docs/components/button", hasDocs: true });
    expect(data.components.find((e) => e.name === "useFileUpload")?.docsPath).toBe("/docs/hooks/use-file-upload");
    expect(data.docs.pages).toContainEqual({
      title: "ui/Button",
      name: "Button",
      kind: "component",
      path: "/docs/components/button",
      file: "components/Button.docs.tsx",
    });
    for (const page of data.docs.pages) expect(data.components.find((e) => e.name === page.name)?.hasDocs).toBe(true);
  });

  it("reads the type classes with their declarations and font stacks", async () => {
    const { typography } = (await realCatalog()).data;
    expect(typography.classes.length).toBeGreaterThan(0);
    for (const cls of typography.classes) expect(cls.declarations["font-size"]).toBeDefined();
    const tabular = typography.classes.filter((c) => c.tabular);
    expect(tabular.length).toBeGreaterThan(0);
    expect(tabular.every((c) => c.fontStack)).toBe(true);
  });
});
