import { describe, expect, it } from "vitest";
import { searchComponents } from "../src/search.js";
import { fixtureEntries } from "./fixtures.js";

const names = (query: string, limit?: number) => searchComponents(fixtureEntries, query, limit).map((h) => h.entry.name);

describe("search_components ranking", () => {
  it("puts an exact name first even when other entries mention it", () => {
    expect(names("Select")[0]).toBe("Select");
    expect(names("choicegroup")[0]).toBe("ChoiceGroup");
  });

  it("finds an entry by one of its exports", () => {
    expect(names("IconButton")[0]).toBe("Button");
    expect(names("icon button")[0]).toBe("Button");
  });

  it("ranks keyword matches, then breaks ties with the summary", () => {
    expect(names("dropdown").slice(0, 2)).toEqual(["Menu", "Select"]);
    expect(names("kanban")).toEqual(["Board"]);
  });

  it("rewards entries that cover every word of the query", () => {
    expect(names("status pill")[0]).toBe("Chip");
    expect(names("date picker")[0]).toBe("DateInput");
  });

  it("ignores filler words and plural endings", () => {
    expect(names("I need a date picker for the due dates")[0]).toBe("DateInput");
    expect(names("tables")[0]).toBe("Table");
  });

  it("does not treat a short stem as a prefix of an unrelated word", () => {
    expect(names("tabs")).not.toContain("Table");
  });

  it("returns nothing for an unrelated query and respects the limit", () => {
    expect(names("spaceship")).toEqual([]);
    expect(names("a", 3).length).toBeLessThanOrEqual(3);
  });

  it("reports which fields matched", () => {
    const [hit] = searchComponents(fixtureEntries, "kanban");
    expect(hit?.matched).toContain("keywords");
    expect(hit?.score).toBeGreaterThan(0);
  });
});
