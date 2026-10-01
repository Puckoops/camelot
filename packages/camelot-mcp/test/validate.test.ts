import { describe, expect, it } from "vitest";
import { validateCode } from "../src/validate.js";
import { fixtureRules, realCatalog } from "./fixtures.js";

const broken = `import { Chip } from "@puckoops/camelot";

export function Overdue() {
  return (
    <div style={{ color: "#b9504b", fontSize: 14 }}>
      <Chip tone="red">Overdue</Chip>
      <span style={{ background: "rgb(0 0 0)" }} />
    </div>
  );
}`;

describe("validate_code", () => {
  it("reports rule id, message, line, column and offending text for every match", () => {
    const report = validateCode(fixtureRules, broken);
    expect(report.pass).toBe(false);
    expect(report.violations).toEqual([
      expect.objectContaining({ ruleId: "tokens-only", message: "Literal hex colour.", line: 5, column: 27, text: "#b9504b" }),
      expect.objectContaining({ ruleId: "type-classes", line: 5, column: 37, text: "fontSize: 14" }),
      expect.objectContaining({ ruleId: "glyph-with-state", line: 6, column: 7, text: '<Chip tone="red">' }),
      expect.objectContaining({ ruleId: "tokens-only", message: "Literal colour function.", line: 7, text: "rgb(0 0 0)" }),
    ]);
    expect(report.violations[0]?.lineText).toBe('<div style={{ color: "#b9504b", fontSize: 14 }}>');
  });

  it("passes code that uses tokens, type classes and glyphs, and lists the rules it cannot check", () => {
    const report = validateCode(
      fixtureRules,
      `<p className="small" style={{ color: "var(--text-2)" }}><Chip tone="teal" glyph="check">Done</Chip></p>`,
    );
    expect(report.pass).toBe(true);
    expect(report.violations).toHaveLength(0);
    expect(report.checkedRules).toEqual(["tokens-only", "glyph-with-state", "type-classes"]);
    expect(report.uncheckedRules).toEqual(["one-hero"]);
  });

  it("reports a match that spans lines at the line where it starts", () => {
    const report = validateCode(fixtureRules, `const a = 1;\n<Chip\n  tone="amber"\n>\n  Waiting\n</Chip>`);
    expect(report.violations).toEqual([expect.objectContaining({ ruleId: "glyph-with-state", line: 2, column: 1 })]);
  });

  it("honours a rule's flags and skips a pattern that does not compile instead of throwing", () => {
    const report = validateCode(
      [
        { id: "no-spinner", rule: "", why: "", detect: [{ pattern: "<spinner", flags: "i", message: "Spinner." }] },
        { id: "broken", rule: "", why: "", detect: [{ pattern: "([a-z", message: "Never compiles." }] },
      ],
      "<Spinner />",
    );
    expect(report.violations.map((v) => v.ruleId)).toEqual(["no-spinner"]);
    expect(report.skippedPatterns).toEqual([expect.objectContaining({ ruleId: "broken", pattern: "([a-z" })]);
  });

  it("does not loop on a pattern that can match the empty string", () => {
    const report = validateCode([{ id: "empty", rule: "", why: "", detect: [{ pattern: "x*", message: "x" }] }], "abc x abc");
    expect(report.violations).toHaveLength(1);
    expect(report.violations[0]).toMatchObject({ line: 1, column: 5, text: "x" });
  });

  it("compiles every detect pattern in the package's rules and flags the sample they were written for", async () => {
    const catalog = await realCatalog();
    const rules = catalog.data.rules.hardRules;
    expect(rules.length).toBeGreaterThan(0);
    for (const rule of rules) for (const d of rule.detect) expect(() => new RegExp(d.pattern, d.flags)).not.toThrow();
    const report = validateCode(rules, broken);
    expect(report.pass).toBe(false);
    expect(report.skippedPatterns).toEqual([]);
  });
});
