import type { Alternative, ApiExport, ColorToken, ComponentEntry, PropInfo, StaticToken, ThemedToken, ThemedValue, TokenUsage } from "./catalog-types.js";
import { type Catalog, shortName } from "./catalog.js";
import type { Comparison } from "./compare.js";
import { bullets, demote, fence, ic, numbered, oneLine, table, withoutTitle } from "./markdown.js";
import type { SearchHit } from "./search.js";
import type { ValidationReport } from "./validate.js";

export const COLOR_GROUPS = ["roles", "neutral", "hues", "effects"] as const;
export type ColorGroupName = (typeof COLOR_GROUPS)[number];

const MAX_INLINE_VALUES = 8;

const importPath = (catalog: Catalog) => catalog.data.package.name;

function typeCell(prop: { type: string; values?: string[] }) {
  if (prop.values?.length && prop.values.length <= MAX_INLINE_VALUES) return prop.values.map(ic).join(" · ");
  return ic(prop.type);
}

function typeShort(prop: { type: string; values?: string[] }) {
  if (prop.values?.length && prop.values.length <= MAX_INLINE_VALUES) return ic(prop.values.join(" | "));
  return ic(prop.type);
}

function propsTable(props: PropInfo[]) {
  return table(
    ["Prop", "Type", "Default", "Notes"],
    props.map((p) => [
      ic(p.name),
      typeCell(p),
      p.default ? ic(p.default) : "",
      [p.optional ? "" : "**Required.**", p.deprecated ? `Deprecated: ${p.deprecated}` : "", p.description ?? ""].filter(Boolean).join(" "),
    ]),
  );
}

function exportSection(api: ApiExport, heading = "###") {
  const parts = [`${heading} ${api.name}`];
  if (api.description) parts.push(oneLine(api.description));
  if (api.kind === "component") {
    const info = api.props;
    const notes: string[] = [];
    if (info?.props.length) parts.push(propsTable(info.props));
    if (info?.extends.length) notes.push(`Also accepts the props of ${info.extends.map(ic).join(" and ")}.`);
    if (!info?.props.length && !info?.extends.length) notes.push("Takes no props.");
    const defaults = Object.entries(info?.passThroughDefaults ?? {});
    if (defaults.length) notes.push(`Defaults for those: ${defaults.map(([k, v]) => `${ic(k)} = ${ic(v)}`).join(", ")}.`);
    if (info?.typeParameters?.length) notes.push(`Generic over ${info.typeParameters.map(ic).join(", ")}.`);
    if (notes.length) parts.push(notes.join(" "));
  } else if (api.kind === "type") {
    parts.push(typeLine(api));
  } else if (api.signature) {
    parts.push(fence([api.signature, ...(api.members ?? []).map((m) => m.signature)].join("\n"), "ts"));
    if (api.returns) parts.push(`Returns ${ic(api.returns)}.`);
  }
  return parts.join("\n\n");
}

function typeLine(api: ApiExport) {
  const generic = api.typeParameters?.length ? `<${api.typeParameters.join(", ")}>` : "";
  const name = ic(`${api.name}${generic}`);
  const about = api.description ? ` — ${oneLine(api.description)}` : "";
  if (api.values?.length) return `${name} = ${api.values.map(ic).join(" · ")}${about}`;
  if (api.fields?.length) {
    const shape = `{ ${api.fields.map((f) => `${f.name}${f.optional ? "?" : ""}: ${f.type}`).join("; ")} }`;
    const ext = api.definition ? ` (${api.definition})` : "";
    const docs = api.fields.filter((f) => f.description).map((f) => `${ic(f.name)}: ${oneLine(f.description ?? "")}`);
    return `${name} = ${ic(shape)}${ext}${about}${docs.length ? `. ${docs.join(" ")}` : ""}`;
  }
  return `${name} = ${ic(api.definition ?? "unknown")}${about}`;
}

function compactExport(api: ApiExport) {
  if (api.kind === "component") {
    const props = (api.props?.props ?? []).map(
      (p) => `${ic(`${p.name}${p.optional ? "?" : ""}`)} ${typeShort(p)}${p.default ? ` = ${ic(p.default)}` : ""}`,
    );
    const ext = api.props?.extends.length ? `; also ${api.props.extends.map(ic).join(", ")}` : "";
    return `**${api.name}** — ${props.join(", ") || "no props of its own"}${ext}`;
  }
  if (api.kind === "type") return typeLine(api);
  return `**${api.name}** — ${ic([api.signature ?? api.name, ...(api.members ?? []).map((m) => m.signature)].join("; "))}`;
}

function alternativeLine(catalog: Catalog, alt: Alternative) {
  const name = alt.name.split("/").pop() ?? alt.name;
  const line = `Use **${name}** instead ${alt.when}`;
  return catalog.exists(alt.name) ? line : `${line} _(${name} is not exported by ${importPath(catalog)} yet, so do not import it.)_`;
}

export function missingNames(catalog: Catalog, text: string) {
  return [...new Set(text.match(/\b(?:[A-Z][A-Za-z0-9]*|use[A-Z][A-Za-z0-9]*)\b/g) ?? [])].filter((name) => !catalog.exists(name));
}

export function renderComponentList(catalog: Catalog, category?: string) {
  const categories = category ? [category] : catalog.categories;
  const count = category ? catalog.entries.filter((e) => e.category === category).length : catalog.entries.length;
  const out = [
    category ? `# ${category} components` : "# Components",
    `${count} ${count === 1 ? "component" : "components"}${category ? "" : ` in ${catalog.categories.length} categories`}, all imported from ${ic(importPath(catalog))}. Call get_component_details for props and guidance, or compare_components to choose between two.`,
  ];
  for (const name of categories) {
    const entries = catalog.entries.filter((e) => e.category === name);
    if (!entries.length) continue;
    if (!category) out.push(`## ${name}`);
    out.push(bullets(entries.map((e) => `**${shortName(e)}** — ${e.summary} Exports ${e.exports.map(ic).join(", ")}.`)));
  }
  const extra = category ? [] : catalog.uncatalogued().filter((a) => a.kind !== "external");
  if (extra.length) {
    out.push(
      "## Exported, not catalogued yet",
      "These ship in the package without catalogue guidance. get_component_details still returns their props.",
      bullets(extra.map((a) => `${ic(a.name)} (${a.kind}, ${a.source})`)),
    );
  }
  return out.join("\n\n");
}

export function renderUncatalogued(catalog: Catalog, group: NonNullable<ReturnType<Catalog["uncataloguedGroup"]>>) {
  const { primary, members, types } = group;
  const out = [
    `# ${primary.name}`,
    `${ic(primary.name)} is exported by ${ic(importPath(catalog))} but has no catalogue entry yet, so there is no when-to-use guidance or docs page. Its API below is read from ${ic(primary.source)}.`,
    fence(`import { ${members.map((m) => m.name).join(", ")} } from "${importPath(catalog)}";`, "tsx"),
    "## API",
    ...members.map((api) => exportSection(api)),
  ];
  if (types.length) out.push("## Types", bullets(types.map(typeLine)));
  return out.join("\n\n");
}

export function renderComponentDetails(catalog: Catalog, entry: ComponentEntry, exportName?: string) {
  const out = [
    `# ${shortName(entry)}`,
    `**${entry.category}** · Docs: ${catalog.pageUrl(entry)}${entry.hasDocs ? "" : " (no docs page was found for it when the catalogue was built, so the page may not exist yet)"}`,
  ];
  if (exportName) out.push(`${ic(exportName)} is documented here, as part of ${shortName(entry)}.`);
  out.push(entry.summary, fence(entry.import, "tsx"));
  if (entry.missingExports.length) {
    out.push(`Listed but not exported by ${importPath(catalog)} yet: ${entry.missingExports.map(ic).join(", ")}. Do not import them.`);
  }
  if (entry.whenToUse) out.push("## When to use", entry.whenToUse);
  if (entry.useInstead.length) out.push("## Use something else", bullets(entry.useInstead.map((alt) => alternativeLine(catalog, alt))));
  const apis = entry.exports.map((name) => catalog.api(name)).filter((a): a is ApiExport => Boolean(a));
  if (apis.length) out.push("## API", ...apis.map((api) => exportSection(api)));
  const types = entry.types.map((name) => catalog.api(name)).filter((a): a is ApiExport => Boolean(a));
  if (types.length) out.push("## Types", bullets(types.map(typeLine)));
  return out.join("\n\n");
}

export function renderComparison(catalog: Catalog, cmp: Comparison) {
  const label = (s: Comparison["a"]) => s.exportName ?? s.name;
  const A = label(cmp.a);
  const B = label(cmp.b);
  const out = [`# ${A} vs ${B}`];
  if (cmp.sameEntry && cmp.a.entry) {
    out.push(`Both are part of **${shortName(cmp.a.entry)}**, so the choice is spelled out in its guidance:`, cmp.a.entry.whenToUse);
    return out.join("\n\n");
  }
  const known = [cmp.a, cmp.b].filter((s) => s.entry);
  if (known.length === 2) {
    out.push(
      table(
        ["", A, B],
        [
          ["Category", cmp.a.entry!.category, cmp.b.entry!.category],
          ["What it is", cmp.a.entry!.summary, cmp.b.entry!.summary],
          ["Import", ic(cmp.a.entry!.import), ic(cmp.b.entry!.import)],
        ],
      ),
    );
  }
  for (const s of [cmp.a, cmp.b]) {
    if (!s.entry) {
      out.push(
        `**${label(s)}** is not in the catalogue${s.exported ? "" : `, and ${importPath(catalog)} does not export it`}.${cmp.guidance.length ? " What the catalogue says about it:" : ""}`,
      );
    }
  }
  out.push("## Which to use");
  if (cmp.guidance.length) {
    out.push(bullets(cmp.guidance.map((g) => `Use **${g.instead}** instead of **${g.of}** ${g.when}`)));
    const one = cmp.guidance.length === 1 ? cmp.guidance[0] : undefined;
    if (one && known.length === 2) out.push(`Otherwise **${one.of}** is the default of the two.`);
  } else {
    out.push("Neither names the other as an alternative, so decide from what each is for:");
  }
  for (const s of known) out.push(`**${label(s)}** — ${s.entry!.whenToUse || s.entry!.summary}`);
  if (cmp.shared.length) {
    out.push(
      "## Both also point to",
      bullets(cmp.shared.map((alt) => `**${alt.name}** — ${A}: use it ${alt.fromA} ${B}: use it ${alt.fromB}`)),
    );
  }
  if (known.length) out.push(`Props for either: get_component_details with ${known.map((s) => ic(label(s))).join(" or ")}.`);
  return out.join("\n\n");
}

export function renderSearch(query: string, hits: SearchHit[], alsoExported: string[] = []) {
  const extra = alsoExported.length
    ? `Also exported but not catalogued yet: ${alsoExported.map(ic).join(", ")}. get_component_details returns their props.`
    : "";
  if (!hits.length) {
    return [
      `# Search: "${query}"`,
      `No catalogued component matches. Try a broader word (such as "input", "status", "table"), or get_components for the full list.`,
      extra,
    ]
      .filter(Boolean)
      .join("\n\n");
  }
  return [
    `# Search: "${query}"`,
    numbered(hits.map((h) => `**${shortName(h.entry)}** (${h.entry.category}) — ${h.entry.summary} _Matched ${h.matched.join(", ")}; score ${h.score}._`)),
    extra,
    "Call get_component_details with a name for its props and guidance.",
  ]
    .filter(Boolean)
    .join("\n\n");
}

function via(value: ThemedValue) {
  return value.chain.length ? `${ic(value.resolved)} via ${value.chain.map(ic).join(" → ")}` : ic(value.resolved);
}

function usageCell(usage: TokenUsage[], limit = 3) {
  const byProperty = new Map<string, string[]>();
  for (const u of usage) for (const p of u.properties) byProperty.set(p, [...(byProperty.get(p) ?? []), u.component]);
  return [...byProperty.entries()]
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, 3)
    .map(([property, owners]) => `${property}: ${owners.slice(0, limit).join(", ")}${owners.length > limit ? ` +${owners.length - limit}` : ""}`)
    .join("; ");
}

function hueRule(catalog: Catalog) {
  const rules = catalog.data.rules.hardRules;
  return rules.find((r) => r.id === "no-hue-outside-chip") ?? rules.find((r) => /\bchip\b/i.test(r.rule) && /\b(hue|ramp)/i.test(r.rule));
}

function renderRoles(colors: ColorToken[]) {
  return [
    "## Roles",
    "Semantic tokens. Reach for these first; each resolves to the neutral ramp and flips with the theme.",
    table(
      ["Token", "Light", "Dark", "Used for"],
      colors.map((c) => [ic(c.name), via(c.light), via(c.dark), usageCell(c.usage)]),
    ),
  ].join("\n\n");
}

function renderNeutral(colors: ColorToken[]) {
  return [
    "## Neutral ramp",
    "The achromatic ramp every role resolves to. Prefer the role tokens; use a step directly only when no role fits.",
    table(
      ["Token", "Light", "Dark", "Used for"],
      colors.map((c) => [ic(c.name), ic(c.light.resolved), ic(c.dark.resolved), usageCell(c.usage)]),
    ),
  ].join("\n\n");
}

function renderHues(catalog: Catalog, colors: ColorToken[]) {
  const rule = hueRule(catalog);
  const hues = [...new Set(colors.map((c) => c.hue ?? c.family))];
  const steps = [...new Set(colors.map((c) => c.step ?? ""))].sort((a, b) => Number(a) - Number(b));
  const cell = (hue: string, step: string) => {
    const c = colors.find((x) => (x.hue ?? x.family) === hue && x.step === step);
    if (!c) return "";
    return c.light.resolved === c.dark.resolved ? ic(c.light.resolved) : `${ic(c.light.resolved)} / ${ic(c.dark.resolved)}`;
  };
  const tone = catalog.api("Chip")?.props?.props.find((p) => p.name === "tone");
  const toneType = tone ? catalog.api(tone.type) : undefined;
  const out = ["## Hue ramps — only inside Chip"];
  if (rule) out.push(`> **${rule.id}**: ${rule.rule} ${rule.why}`);
  if (tone?.values?.length) {
    out.push(
      `To show a state, use ${ic('<Chip tone="…" glyph="…">')} with tone ${tone.values.map(ic).join(" · ")}${toneType?.description ? ` (${oneLine(toneType.description)})` : ""}. Never reference these variables in product code.`,
    );
  }
  out.push(table(["Step", ...hues], steps.map((step) => [step, ...hues.map((hue) => cell(hue, step))])));
  return out.join("\n\n");
}

function renderEffects(effects: ThemedToken[]) {
  return [
    "## Effects",
    "Themed values that are not colours, such as elevation. Dark mode flattens card shadows.",
    table(
      ["Token", "Light", "Dark", "Used for"],
      effects.map((e) => [ic(e.name), ic(e.light.resolved), ic(e.dark.resolved), usageCell(e.usage)]),
    ),
  ].join("\n\n");
}

export function renderColorTokens(catalog: Catalog, group?: ColorGroupName) {
  const t = catalog.data.tokens;
  const out = [
    "# Colour tokens",
    `Reference tokens as ${ic("var(--name)")} and never write a literal colour. Light is ${t.selectors.light.map(ic).join(", ") || ic(":root")}; dark overrides it under ${t.selectors.dark.map(ic).join(", ")} on ${ic("<html>")}.`,
  ];
  const tagline = catalog.data.principles.tagline;
  if (tagline) out.push(`> ${tagline}`);
  const roles = t.colors.filter((c) => c.group === "role");
  const neutral = t.colors.filter((c) => c.group === "neutral");
  const hues = t.colors.filter((c) => c.group === "hue");
  if ((!group || group === "roles") && roles.length) out.push(renderRoles(roles));
  if ((!group || group === "neutral") && neutral.length) out.push(renderNeutral(neutral));
  if ((!group || group === "hues") && hues.length) out.push(renderHues(catalog, hues));
  if ((!group || group === "effects") && t.effects.length) out.push(renderEffects(t.effects));
  const surfaceRule = catalog.data.principles.readmeRules.filter((r) => /--surface|--canvas|card is/i.test(r));
  if (surfaceRule.length && (!group || group === "roles")) out.push("## Pairing", bullets(surfaceRule));
  out.push("Spacing, radius, layout and motion tokens are in get_full_guide.");
  return out.join("\n\n");
}

export function renderTypography(catalog: Catalog) {
  const { classes, inkClasses } = catalog.data.typography;
  const fonts = catalog.data.tokens.fonts;
  const core = new Set(["font-family", "font-size", "line-height", "font-weight", "letter-spacing"]);
  const out = [
    "# Typography",
    `Text sizes come from these classes, never from inline font sizes. Put the class on the element: ${ic('<h1 className="h1">')}, ${ic('<span className="num">')}.`,
  ];
  const rules = catalog.data.rules.hardRules.filter((r) => /type class|tabular|font size/i.test(r.rule));
  if (rules.length) out.push(bullets(rules.map((r) => `**${r.id}** — ${r.rule}`)));
  if (fonts.length) {
    out.push(
      "## Fonts",
      table(
        ["Token", "Stack", "Classes"],
        fonts.map((f) => [ic(f.name), ic(f.resolved), classes.filter((c) => c.fontToken === f.name).map((c) => ic(`.${c.name}`)).join(" ")]),
      ),
    );
  }
  out.push(
    "## Type classes",
    table(
      ["Class", "Font", "Size / line height", "Weight", "Tracking", "Notes"],
      classes.map((c) => {
        const d = c.declarations;
        const extra = Object.entries(d)
          .filter(([k]) => !core.has(k) && k !== "font-variant-numeric")
          .map(([k, v]) => `${k}: ${v}`);
        const notes = [c.tabular ? "tabular figures" : "", ...extra, c.note ?? ""].filter(Boolean).join(". ");
        return [
          ic(`.${c.name}`),
          c.fontToken ? c.fontToken.replace(/^--font-/, "") : (d["font-family"] ?? ""),
          [d["font-size"], d["line-height"]].filter(Boolean).join(" / "),
          d["font-weight"] ?? "",
          d["letter-spacing"] ?? "",
          notes,
        ];
      }),
    ),
  );
  if (inkClasses.length) {
    out.push(
      "## Ink classes",
      "Colour-only classes for text on a surface.",
      table(["Class", "Token", "Light", "Dark"], inkClasses.map((c) => [ic(`.${c.name}`), ic(c.token), ic(c.light), ic(c.dark)])),
    );
  }
  return out.join("\n\n");
}

function guideToMarkdown(text: string) {
  const out: string[] = [];
  let block: string[] = [];
  const flush = () => {
    const groups: string[][] = [];
    let current: string[] = [];
    for (const line of block) {
      if (line.trim()) current.push(line);
      else if (current.length) {
        groups.push(current);
        current = [];
      }
    }
    if (current.length) groups.push(current);
    for (const group of groups) {
      const indent = Math.min(...group.map((l) => l.match(/^\s*/)?.[0].length ?? 0));
      const body = group.map((l) => l.slice(indent)).join("\n");
      out.push(fence(body, /^(npm|npx|pnpm|yarn) /.test(body) ? "bash" : "tsx"), "");
    }
    block = [];
  };
  for (const line of text.split("\n")) {
    if (/^\s{2,}\S/.test(line) || (!line.trim() && block.length)) {
      block.push(line);
      continue;
    }
    flush();
    out.push(line);
  }
  flush();
  return out.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

export function renderIconsGuide(catalog: Catalog) {
  const out = ["# Icons", guideToMarkdown(catalog.data.rules.iconsGuide)];
  const icon = catalog.api("Icon");
  if (icon?.kind === "component" && icon.props) out.push("## Icon props", propsTable(icon.props.props));
  const glyph = catalog.api("Glyph")?.props?.props.find((p) => p.name === "shape");
  if (glyph?.values?.length) out.push(`Glyph shapes: ${glyph.values.map(ic).join(" · ")}.`);
  const rules = catalog.data.rules.hardRules.filter((r) => r.id === "icons" || /icon/i.test(r.rule));
  if (rules.length) out.push("## Rule", bullets(rules.map((r) => `**${r.id}** — ${r.rule} ${r.why}`)));
  return out.join("\n\n");
}

export function renderHardRules(catalog: Catalog) {
  const { hardRules } = catalog.data.rules;
  const { tagline, readmeRules } = catalog.data.principles;
  const checked = hardRules.filter((r) => r.detect.length).length;
  const out = ["# Hard rules"];
  if (tagline) out.push(`> ${tagline}`);
  out.push(
    `Follow every rule when writing UI with ${ic(importPath(catalog))}. validate_code checks ${checked} of the ${hardRules.length} automatically; review the rest yourself.`,
  );
  hardRules.forEach((rule, i) => {
    out.push(
      `## ${i + 1}. ${rule.id} — ${rule.detect.length ? "checked by validate_code" : "review by hand"}`,
      rule.rule,
      `Why: ${rule.why}`,
    );
    if (rule.detect.length) out.push(`validate_code flags: ${rule.detect.map((d) => d.message).join(" · ")}`);
  });
  if (readmeRules.length) out.push("## Also worth memorising", bullets(readmeRules));
  return out.join("\n\n");
}

export function renderElementMapping(catalog: Catalog) {
  const rows = catalog.data.rules.elementMapping.map((m) => {
    const missing = missingNames(catalog, m.use);
    const note = [m.note ?? "", missing.length ? `Not exported yet: ${missing.join(", ")}.` : ""].filter(Boolean).join(" ");
    return [ic(m.element), m.use, note];
  });
  return [
    "# Element mapping",
    `Reach for the component, not the raw element. Names marked "not exported yet" are planned; use the first option that exists.`,
    table(["Instead of", "Use", "Note"], rows),
  ].join("\n\n");
}

export function renderAppSetup(catalog: Catalog) {
  const peers = Object.entries(catalog.data.package.peerDependencies);
  return [
    "# App setup",
    `${ic(importPath(catalog))} ${catalog.data.package.version}${peers.length ? `, peer dependencies ${peers.map(([name, range]) => `${ic(name)} ${range}`).join(", ")}` : ""}.`,
    fence(catalog.data.rules.appSetup, "tsx"),
    "Next: get_hard_rules before the first screen, get_icons_guide for icons, get_color_tokens and get_typography for styling.",
  ].join("\n\n");
}

export function renderDocs(catalog: Catalog, entry?: ComponentEntry) {
  if (entry) {
    return [
      `# ${shortName(entry)} docs`,
      catalog.pageUrl(entry),
      entry.hasDocs
        ? "The page has a live playground with controls, the API, when to use it, and examples."
        : "No docs page was found for it when the catalogue was built, so the page may not exist yet.",
    ].join("\n\n");
  }
  return [
    "# Docs",
    `The docs site is at ${catalog.docsUrl}. A component's page is ${ic("/docs/components/<slug>")} and a hook's is ${ic("/docs/hooks/<slug>")}, where the slug is the catalogue name in kebab case.`,
    bullets([`Introduction: ${catalog.introUrl()}`, `This MCP server: ${catalog.mcpDocsUrl()}`]),
    table(
      ["Component", "Category", "URL", "Docs page"],
      catalog.entries.map((e) => [shortName(e), e.category, catalog.pageUrl(e), e.hasDocs ? "yes" : "not yet"]),
    ),
  ].join("\n\n");
}

export function renderValidation(catalog: Catalog, report: ValidationReport) {
  const rules = new Map(catalog.data.rules.hardRules.map((r) => [r.id, r]));
  const broken = [...new Set(report.violations.map((v) => v.ruleId))];
  const out = [`# validate_code: ${report.pass ? "PASS" : "FAIL"}`];
  out.push(
    report.pass
      ? `No violations of the ${report.checkedRules.length} machine-checkable rules in ${report.lineCount} ${report.lineCount === 1 ? "line" : "lines"}.`
      : `${report.violations.length}${report.truncated ? "+" : ""} ${report.violations.length === 1 ? "violation" : "violations"} of ${broken.length} ${broken.length === 1 ? "rule" : "rules"} in ${report.lineCount} ${report.lineCount === 1 ? "line" : "lines"} (checked ${report.checkedRules.length} rules).`,
  );
  if (!report.pass) {
    out.push(
      table(
        ["Line", "Rule", "Problem", "Offending text"],
        report.violations.map((v) => [`${v.line}:${v.column}`, ic(v.ruleId), v.message, ic(v.text)]),
      ),
      "## How to fix",
      bullets(broken.map((id) => `**${id}** — ${rules.get(id)?.rule ?? ""}`)),
    );
  }
  if (report.skippedPatterns.length) {
    out.push(`Skipped patterns that do not compile: ${report.skippedPatterns.map((s) => `${s.ruleId} ${ic(s.pattern)}`).join(", ")}.`);
  }
  if (report.uncheckedRules.length) {
    out.push(
      "## Not machine-checked",
      "Review these by hand:",
      bullets(report.uncheckedRules.map((id) => `**${id}** — ${rules.get(id)?.rule ?? ""}`)),
    );
  }
  return out.join("\n\n");
}

function scaleTable(tokens: StaticToken[]) {
  return table(["Token", "Value", "Used for"], tokens.map((t) => [ic(t.name), ic(t.resolved), usageCell(t.usage)]));
}

export function renderTokenScales(catalog: Catalog) {
  const t = catalog.data.tokens;
  const out = ["# Spacing, radius, layout and motion"];
  if (t.spacing.length) out.push("## Spacing", scaleTable(t.spacing));
  if (t.radius.length) out.push("## Radius", scaleTable(t.radius));
  if (t.layout.length) out.push("## Layout", scaleTable(t.layout));
  if (t.motion.length) out.push("## Motion", scaleTable(t.motion));
  if (t.utilities.length) {
    out.push(
      "## Utility classes",
      bullets(t.utilities.map((u) => `${ic(`.${u.name}`)} (${u.source}${u.context.length ? `, inside ${u.context.join(" ")}` : ""}) — ${ic(Object.entries(u.declarations).map(([k, v]) => `${k}: ${v}`).join("; "))}`)),
    );
  }
  return out.join("\n\n");
}

export function renderFullGuide(catalog: Catalog) {
  const { package: pkg, principles, generatedAt } = catalog.data;
  const out = [
    "# Camelot — the complete guide",
    `Generated from ${ic(`${pkg.name}@${pkg.version}`)} sources at ${generatedAt}. Components come from ${ic(pkg.name)}; the stylesheet is ${ic(`${pkg.name}/styles.css`)}.`,
  ];
  if (principles.tagline) out.push(`> ${principles.tagline}`);
  if (principles.points.length) out.push(bullets(principles.points));
  out.push(demote(renderHardRules(catalog)), demote(renderAppSetup(catalog)));
  out.push("## Components", withoutTitle(renderComponentList(catalog)).split("\n\n")[0] ?? "");
  for (const category of catalog.categories) {
    out.push(`### ${category}`);
    for (const entry of catalog.entries.filter((e) => e.category === category)) {
      const apis = entry.exports.map((name) => catalog.api(name)).filter((a): a is ApiExport => Boolean(a));
      const types = entry.types.map((name) => catalog.api(name)).filter((a): a is ApiExport => Boolean(a));
      out.push(
        `#### ${shortName(entry)}`,
        `${entry.summary} ${ic(entry.import)}`,
        ...(entry.whenToUse ? [entry.whenToUse] : []),
        ...(entry.useInstead.length ? [bullets(entry.useInstead.map((alt) => alternativeLine(catalog, alt)))] : []),
        bullets([...apis.map(compactExport), ...types.map(typeLine)]),
      );
    }
  }
  out.push(
    demote(renderElementMapping(catalog)),
    demote(renderColorTokens(catalog).replace(/\n\nSpacing, radius, layout and motion tokens are in get_full_guide\.$/, "")),
    demote(renderTypography(catalog)),
    demote(renderTokenScales(catalog)),
    demote(renderIconsGuide(catalog)),
    demote(renderDocs(catalog)),
    "## Checking your work",
    "Run validate_code on every file you write. It reports the rule, line and offending text for each machine-checkable rule; the rules it cannot check are listed so you can review them.",
  );
  return out.join("\n\n");
}
