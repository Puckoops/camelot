"use client";

import { BottomBarIcon, ChevronSmallDownIcon, ChevronSmallRightIcon, CloseAltIcon, SidebarAltIcon, SyncIcon } from "@storybook/icons";
import { cn } from "@puckoops/camelot";
import { Fragment, useEffect, useEffectEvent, useRef, useState, type CSSProperties, type ReactNode, type RefObject } from "react";
import { Highlighted } from "@/components/code/Source";
import { useManager, VIEWPORTS, VISION_FILTERS, type PanelTab } from "@/components/manager/ManagerContext";
import { Resizer } from "@/components/manager/Resizer";
import type { ApiEntry, CatalogEntry, DocsPageSource } from "@/lib/types";
import { auditElement, type AuditResult, type RuleResult } from "./a11y";
import { ArgsTable, argRows } from "./ArgsTable";
import { Canvas, useExampleArgs, type LoggedAction } from "./Canvas";
import { exampleCode } from "./source";
import type { DocsModule, ExampleOf, Meta } from "./types";
import styles from "./docs.module.css";

interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
  margin: [number, number, number, number];
  padding: [number, number, number, number];
}

function Measure({ stage }: { stage: RefObject<HTMLDivElement | null> }) {
  const [box, setBox] = useState<Box | null>(null);
  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const px = (v: string) => Number.parseFloat(v) || 0;
    const onMove = (e: PointerEvent) => {
      const target = document.elementFromPoint(e.clientX, e.clientY);
      const canvas = el.querySelector("[data-canvas]");
      if (!target || !canvas || !canvas.contains(target) || target === canvas) return setBox(null);
      const r = target.getBoundingClientRect();
      const base = el.getBoundingClientRect();
      const s = getComputedStyle(target);
      setBox({
        x: r.left - base.left + el.scrollLeft,
        y: r.top - base.top + el.scrollTop,
        w: r.width,
        h: r.height,
        margin: [px(s.marginTop), px(s.marginRight), px(s.marginBottom), px(s.marginLeft)],
        padding: [
          px(s.paddingTop) + px(s.borderTopWidth),
          px(s.paddingRight) + px(s.borderRightWidth),
          px(s.paddingBottom) + px(s.borderBottomWidth),
          px(s.paddingLeft) + px(s.borderLeftWidth),
        ],
      });
    };
    const onLeave = () => setBox(null);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, [stage]);
  if (!box) return null;
  const [mt, mr, mb, ml] = box.margin.map((v) => Math.max(v, 0)) as Box["margin"];
  const [pt, pr, pb, pl] = box.padding;
  return (
    <div className={styles.measure} aria-hidden="true">
      <div className={styles.measureMargin} style={{ left: box.x - ml, top: box.y - mt, width: box.w + ml + mr, height: box.h + mt + mb, borderWidth: `${mt}px ${mr}px ${mb}px ${ml}px` }} />
      <div className={styles.measurePadding} style={{ left: box.x, top: box.y, width: box.w, height: box.h, borderWidth: `${pt}px ${pr}px ${pb}px ${pl}px` }} />
      <div className={styles.measureContent} style={{ left: box.x + pl, top: box.y + pt, width: Math.max(box.w - pl - pr, 0), height: Math.max(box.h - pt - pb, 0) }} />
      <span className={styles.measureLabel} style={{ left: box.x, top: box.y + box.h + mb + 4 }}>
        {Math.round(box.w)} × {Math.round(box.h)}
      </span>
    </div>
  );
}

function Empty({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className={styles.panelEmpty}>
      <strong>{title}</strong>
      {children && <span>{children}</span>}
    </div>
  );
}

function ActionLog({ actions, onClear }: { actions: LoggedAction[]; onClear?: () => void }) {
  if (actions.length === 0) return <Empty title="No actions yet">Use the story and the handlers it calls show here.</Empty>;
  return (
    <>
      <ol className={styles.actionLog} aria-live="polite">
        {actions.map((a) => (
          <li key={a.id}>
            <span className={styles.actionName}>{a.name}:</span>
            <span className={styles.actionDetail}>{a.detail || "()"}</span>
          </li>
        ))}
      </ol>
      {onClear && (
        <div className={styles.panelFoot}>
          <button type="button" className={styles.action} onClick={onClear}>
            Clear
          </button>
        </div>
      )}
    </>
  );
}

type A11yTab = "violations" | "passes" | "incomplete";
const A11Y_TABS: { id: A11yTab; label: string }[] = [
  { id: "violations", label: "Violations" },
  { id: "passes", label: "Passes" },
  { id: "incomplete", label: "Inconclusive" },
];
const IMPACT_CLASS = { critical: styles.impactCritical, serious: styles.impactSerious, moderate: styles.impactModerate, minor: styles.impactMinor };

function Rule({ rule }: { rule: RuleResult }) {
  const [open, setOpen] = useState(false);
  return (
    <li className={styles.rule}>
      <button type="button" className={styles.ruleHead} aria-expanded={open} onClick={() => setOpen((v) => !v)}>
        {open ? <ChevronSmallDownIcon size={12} /> : <ChevronSmallRightIcon size={12} />}
        <span className={styles.ruleHelp}>{rule.help}</span>
        {rule.impact && <span className={cn(styles.impact, IMPACT_CLASS[rule.impact])}>{rule.impact}</span>}
      </button>
      {open && (
        <div className={styles.ruleBody}>
          <p>{rule.description}</p>
          <a href={rule.helpUrl} target="_blank" rel="noreferrer noopener">
            Learn how to resolve this
          </a>
          <ul className={styles.ruleNodes} aria-label="Elements">
            {rule.targets.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </div>
      )}
    </li>
  );
}

function A11yPanel({ stage }: { stage: RefObject<HTMLDivElement | null> }) {
  const [tab, setTab] = useState<A11yTab>("violations");
  const [result, setResult] = useState<AuditResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [running, setRunning] = useState(true);
  const run = async () => {
    const canvas = stage.current?.querySelector<HTMLElement>("[data-canvas]");
    if (!canvas) return;
    setRunning(true);
    try {
      setResult(await auditElement(canvas));
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "The check could not run.");
    } finally {
      setRunning(false);
    }
  };
  const firstRun = useEffectEvent(() => void run());
  useEffect(() => {
    const timer = setTimeout(firstRun, 300);
    return () => clearTimeout(timer);
  }, []);
  const list = result?.[tab] ?? [];
  return (
    <>
      <div className={styles.a11yBar}>
        <div role="tablist" aria-label="Results" className={styles.panelTabs}>
          {A11Y_TABS.map((t) => (
            <button key={t.id} type="button" role="tab" aria-selected={tab === t.id} className={cn(styles.panelTab, tab === t.id && styles.panelTabOn)} onClick={() => setTab(t.id)}>
              {t.label}
              <span className={styles.badge}>{result ? result[t.id].length : "–"}</span>
            </button>
          ))}
        </div>
        <button type="button" className={styles.action} onClick={run} disabled={running}>
          <SyncIcon size={14} />
          {running ? "Running…" : "Rerun tests"}
        </button>
      </div>
      {error ? (
        <Empty title="The accessibility check could not run">{error}</Empty>
      ) : !result ? (
        <Empty title="Running accessibility checks…" />
      ) : list.length === 0 ? (
        <Empty title={tab === "violations" ? "No accessibility violations found." : tab === "passes" ? "No passing rules." : "Nothing inconclusive."} />
      ) : (
        <ul className={styles.ruleList}>
          {list.map((r) => (
            <Rule key={r.id} rule={r} />
          ))}
        </ul>
      )}
    </>
  );
}

export interface StoryPanels {
  controls?: ReactNode;
  controlsCount?: number;
  actions?: LoggedAction[];
  onClearActions?: () => void;
  code?: string;
}

function AddonPanel({ stage, controls, controlsCount, actions = [], onClearActions, code }: StoryPanels & { stage: RefObject<HTMLDivElement | null> }) {
  const m = useManager();
  const tab = m.panelTab;
  const tabs: { id: PanelTab; label: string; count?: number }[] = [
    { id: "controls", label: "Controls", count: controlsCount || undefined },
    { id: "actions", label: "Actions", count: actions.length || undefined },
    { id: "code", label: "Code" },
    { id: "a11y", label: "Accessibility" },
  ];
  return (
    <section data-theme="light" className={styles.panel} aria-label="Addons">
      <Resizer
        label="Resize the addon panel"
        orientation={m.panelRight ? "vertical" : "horizontal"}
        size={m.panelRight ? m.sizes.panelWidth : m.sizes.panelHeight}
        direction={-1}
        onResize={(v) => m.resize(m.panelRight ? "panelWidth" : "panelHeight", v)}
        className={styles.panelResizer}
      />
      <div className={styles.panelBar}>
        <div role="tablist" aria-label="Addons" className={styles.panelTabs}>
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              id={`addon-tab-${t.id}`}
              aria-selected={tab === t.id}
              aria-controls="addon-panel"
              className={cn(styles.panelTab, tab === t.id && styles.panelTabOn)}
              onClick={() => m.setPanelTab(t.id)}
            >
              {t.label}
              {t.count !== undefined && <span className={styles.badge}>{t.count}</span>}
            </button>
          ))}
        </div>
        <div className={styles.panelTools}>
          <button type="button" className={styles.iconButton} aria-label={m.panelRight ? "Move addon panel to bottom" : "Move addon panel to right"} title="Change addons orientation" onClick={m.togglePanelSide}>
            {m.panelRight ? <BottomBarIcon size={14} /> : <SidebarAltIcon size={14} />}
          </button>
          <button type="button" className={styles.iconButton} aria-label="Hide addon panel" title="Hide addon panel" onClick={m.togglePanel}>
            <CloseAltIcon size={14} />
          </button>
        </div>
      </div>
      <div id="addon-panel" role="tabpanel" aria-labelledby={`addon-tab-${tab}`} className={styles.panelBody}>
        {tab === "controls" && (controls ?? <Empty title="This story is not configured to handle controls.">Its docs page lists everything it shows.</Empty>)}
        {tab === "actions" && <ActionLog actions={actions} onClear={onClearActions} />}
        {tab === "code" && (code ? <Highlighted code={code} className={styles.highlighted} /> : <Empty title="No code for this story." />)}
        {tab === "a11y" && <A11yPanel stage={stage} />}
      </div>
    </section>
  );
}

/** Storybook's story view: the canvas with the toolbar's tools applied, and the addon panel beside or below it. */
export function StoryStage({ children, panels }: { children: (zoom: number) => ReactNode; panels: StoryPanels }) {
  const m = useManager();
  const stage = useRef<HTMLDivElement>(null);
  const viewport = VIEWPORTS.find((v) => v.id === m.viewport);
  const vision = VISION_FILTERS.find((v) => v.id === m.vision);
  const canvas = <Fragment key={m.remount}>{children(m.zoom)}</Fragment>;
  return (
    <div
      className={cn(styles.story, m.panelRight && styles.storyRight)}
      style={{ "--sb-panel-h": `${m.sizes.panelHeight}px`, "--sb-panel-w": `${m.sizes.panelWidth}px` } as CSSProperties}
    >
      <div ref={stage} className={styles.stage}>
        <div className={styles.stageFrame} style={vision ? { filter: vision.filter } : undefined}>
          {viewport ? (
            <div className={styles.viewport} style={{ width: viewport.width, height: viewport.height }}>
              {canvas}
            </div>
          ) : (
            canvas
          )}
        </div>
        {m.measure && <Measure stage={stage} />}
      </div>
      {m.panel && !m.fullscreen && <AddonPanel stage={stage} {...panels} />}
    </div>
  );
}

export interface StoryViewProps {
  page: DocsPageSource;
  entry: CatalogEntry;
  api: ApiEntry[];
  exportName: string;
}

export function StoryView({ module, page, api, exportName }: StoryViewProps & { module: DocsModule }) {
  const meta = module.default as Meta;
  const example = module[exportName] as ExampleOf;
  const source = page.examples.find((e) => e.export === exportName)!;
  const state = useExampleArgs(meta, example);
  const main = api.find((a) => a.name === page.component);
  const rows = argRows(main, meta, state);
  const name = example.name ?? source.name;
  return (
    <StoryStage
      panels={{
        controls: rows.length ? <ArgsTable rows={rows} state={state} variant="panel" emptyText="" /> : undefined,
        controlsCount: rows.length,
        actions: state.actions,
        onClearActions: state.clearActions,
        code: exampleCode(meta, example, source, page.component, state),
      }}
    >
      {(zoom) => <Canvas meta={meta} example={example} name={name} state={state} zoom={zoom} viewMode="preview" className={styles.storyCanvas} />}
    </StoryStage>
  );
}

/** A story whose content is a page of its own, such as a token table or an MCP page. */
export function StaticStory({ children, layout = "padded", code }: { children: ReactNode; layout?: "padded" | "fullscreen"; code?: string }) {
  return (
    <StoryStage panels={{ code }}>
      {(zoom) => (
        <div data-canvas="" className={cn(styles.canvas, styles.storyCanvas, styles[layout])} style={zoom === 1 ? undefined : { zoom }}>
          {children}
        </div>
      )}
    </StoryStage>
  );
}
