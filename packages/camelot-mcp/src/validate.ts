import type { HardRule } from "./catalog-types.js";

export interface Violation {
  ruleId: string;
  message: string;
  line: number;
  column: number;
  text: string;
  lineText: string;
}

export interface SkippedPattern {
  ruleId: string;
  pattern: string;
  error: string;
}

export interface ValidationReport {
  pass: boolean;
  lineCount: number;
  violations: Violation[];
  truncated: boolean;
  checkedRules: string[];
  uncheckedRules: string[];
  skippedPatterns: SkippedPattern[];
}

export const MAX_VIOLATIONS = 200;

/** Grows a match to the end of the value it starts, so `fontSize: 1` reads as `fontSize: 14` and `rgb(` as `rgb(0 0 0)`. */
function widen(code: string, start: number, end: number) {
  if (code[end - 1] === "(") {
    const close = code.indexOf(")", end);
    if (close >= 0 && close - end <= 80) return code.slice(start, close + 1);
  }
  if (!/[\w.%-]/.test(code[end - 1] ?? "")) return code.slice(start, end);
  const tail = /^[\w.%-]{0,40}/.exec(code.slice(end))?.[0] ?? "";
  return code.slice(start, end + tail.length);
}

const clip = (text: string, max = 120) => {
  const flat = text.replace(/\s+/g, " ").trim();
  return flat.length > max ? `${flat.slice(0, max - 1)}…` : flat;
};

export function validateCode(rules: HardRule[], code: string): ValidationReport {
  const lines = code.split("\n");
  const lineStarts: number[] = [0];
  for (let i = 0; i < code.length; i++) if (code[i] === "\n") lineStarts.push(i + 1);
  const locate = (index: number) => {
    let lo = 0;
    let hi = lineStarts.length - 1;
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1;
      if (lineStarts[mid]! <= index) lo = mid;
      else hi = mid - 1;
    }
    return { line: lo + 1, column: index - lineStarts[lo]! + 1 };
  };

  const violations: Violation[] = [];
  const checkedRules: string[] = [];
  const uncheckedRules: string[] = [];
  const skippedPatterns: SkippedPattern[] = [];
  let truncated = false;

  for (const rule of rules) {
    if (!rule.detect.length) {
      uncheckedRules.push(rule.id);
      continue;
    }
    checkedRules.push(rule.id);
    for (const detect of rule.detect) {
      let pattern: RegExp;
      try {
        const flags = [...new Set(`${(detect.flags ?? "").replace(/[gy]/g, "")}g`)].join("");
        pattern = new RegExp(detect.pattern, flags);
      } catch (error) {
        skippedPatterns.push({ ruleId: rule.id, pattern: detect.pattern, error: error instanceof Error ? error.message : String(error) });
        continue;
      }
      for (const match of code.matchAll(pattern)) {
        if (!match[0]) continue;
        if (violations.length >= MAX_VIOLATIONS) {
          truncated = true;
          break;
        }
        const { line, column } = locate(match.index);
        violations.push({
          ruleId: rule.id,
          message: detect.message,
          line,
          column,
          text: clip(widen(code, match.index, match.index + match[0].length)),
          lineText: clip(lines[line - 1] ?? ""),
        });
      }
    }
  }
  violations.sort((a, b) => a.line - b.line || a.column - b.column || a.ruleId.localeCompare(b.ruleId));
  return {
    pass: violations.length === 0,
    lineCount: lines.length,
    violations,
    truncated,
    checkedRules,
    uncheckedRules,
    skippedPatterns,
  };
}
