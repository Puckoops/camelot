export type Impact = "minor" | "moderate" | "serious" | "critical";

export interface RuleResult {
  id: string;
  impact: Impact | null;
  help: string;
  description: string;
  helpUrl: string;
  targets: string[];
}

export interface AuditResult {
  violations: RuleResult[];
  passes: RuleResult[];
  incomplete: RuleResult[];
}

let queue: Promise<unknown> = Promise.resolve();

type AxeResult = { id: string; impact?: string | null; help: string; description: string; helpUrl: string; nodes: { target: unknown }[] };

const toRule = (r: AxeResult): RuleResult => ({
  id: r.id,
  impact: (r.impact ?? null) as Impact | null,
  help: r.help,
  description: r.description,
  helpUrl: r.helpUrl,
  targets: r.nodes.map((n) => String(n.target)),
});

/** axe refuses to start while another run is in progress, so runs are queued. */
export function auditElement(element: HTMLElement): Promise<AuditResult> {
  const run = queue.then(async () => {
    const { default: axe } = await import("axe-core");
    const results = await axe.run(element, { rules: { region: { enabled: false } } });
    return { violations: results.violations.map(toRule), passes: results.passes.map(toRule), incomplete: results.incomplete.map(toRule) };
  });
  queue = run.catch(() => undefined);
  return run;
}
