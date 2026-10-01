import { describe, expect, it } from "vitest";
import { compareComponents } from "../src/compare.js";
import { renderComparison } from "../src/render.js";
import { fixtureCatalog } from "./fixtures.js";

const catalog = fixtureCatalog();

describe("compare_components", () => {
  it("takes the verdict from the first component's use-instead guidance", () => {
    const cmp = compareComponents(catalog, "Select", "SegmentedControl");
    expect(cmp.guidance).toEqual([
      { instead: "SegmentedControl", of: "Select", when: "for two to five options that should all stay visible." },
    ]);
    const md = renderComparison(catalog, cmp);
    expect(md).toContain("Use **SegmentedControl** instead of **Select** for two to five options that should all stay visible.");
    expect(md).toContain("Otherwise **Select** is the default of the two.");
  });

  it("combines the guidance of both sides whatever the argument order", () => {
    const forward = compareComponents(catalog, "Chip", "PriorityMark");
    const backward = compareComponents(catalog, "PriorityMark", "Chip");
    expect(forward.guidance).toHaveLength(2);
    expect(forward.guidance).toContainEqual({ instead: "PriorityMark", of: "Chip", when: "for priority, which is glyph and ink only." });
    expect(forward.guidance).toContainEqual({ instead: "Chip", of: "PriorityMark", when: "for a status or stage, not a priority." });
    expect(new Set(backward.guidance.map((g) => g.instead))).toEqual(new Set(forward.guidance.map((g) => g.instead)));
  });

  it("lists the alternatives both components point to", () => {
    const cmp = compareComponents(catalog, "Select", "SegmentedControl");
    expect(cmp.shared).toEqual([
      { name: "ChoiceGroup", fromA: "for options shown as chips.", fromB: "when the options are form values rather than views." },
    ]);
  });

  it("resolves short names, full names and exports", () => {
    const cmp = compareComponents(catalog, "table", "ListCard");
    expect(cmp.a.entry?.name).toBe("Table");
    expect(cmp.b.entry?.name).toBe("Cards/ListCard");
    expect(cmp.guidance.map((g) => g.instead)).toEqual(["ListCard", "Table"]);
  });

  it("says when two names belong to the same entry", () => {
    const cmp = compareComponents(catalog, "IconButton", "Button");
    expect(cmp.sameEntry).toBe(true);
    expect(renderComparison(catalog, cmp)).toContain("Both are part of **Button**");
  });

  it("keeps the guidance about a component that is not in the catalogue and warns against importing it", () => {
    const cmp = compareComponents(catalog, "Chip", "Badge");
    expect(cmp.b.entry).toBeUndefined();
    expect(cmp.b.exported).toBe(false);
    expect(cmp.guidance).toEqual([{ instead: "Badge", of: "Chip", when: "for a count or a neutral tag that is not a state." }]);
    expect(renderComparison(catalog, cmp)).toContain("**Badge** is not in the catalogue, and @puckoops/camelot does not export it");
  });

  it("falls back to each component's own guidance when neither names the other", () => {
    const cmp = compareComponents(catalog, "Board", "TextLink");
    expect(cmp.guidance).toEqual([]);
    expect(renderComparison(catalog, cmp)).toContain("Neither names the other as an alternative");
  });
});
