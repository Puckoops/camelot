"use client";

import { ChevronSmallDownIcon, UndoIcon } from "@storybook/icons";
import { cn } from "@puckoops/camelot";
import { useId, useState } from "react";
import { InlineMarkdown } from "@/components/InlineMarkdown";
import type { ApiEntry, PropDoc } from "@/lib/types";
import type { ExampleState } from "./Canvas";
import { isAction } from "./runtime";
import type { ArgType, ControlKind, Meta } from "./types";
import styles from "./docs.module.css";

function literal(text: string): unknown {
  if (text === "true") return true;
  if (text === "false") return false;
  if (/^-?\d+(\.\d+)?$/.test(text)) return Number(text);
  const quoted = /^["'](.*)["']$/s.exec(text);
  return quoted ? quoted[1] : text;
}

export interface Control {
  kind: ControlKind;
  options?: unknown[];
  min?: number;
  max?: number;
  step?: number;
}

export function controlFor(prop: PropDoc | undefined, argType: ArgType | undefined, value: unknown): Control | null {
  if (argType?.control === false) return null;
  const declared = argType?.control;
  const options = argType?.options ? [...argType.options] : prop?.values?.map(literal);
  if (typeof declared === "string") return { kind: declared, options };
  if (declared) return { kind: declared.type, options, min: declared.min, max: declared.max, step: declared.step };
  if (options?.length) return { kind: options.length <= 4 ? "inline-radio" : "select", options };
  if (prop?.type === "boolean" || typeof value === "boolean") return { kind: "boolean" };
  if (prop?.type === "number" || typeof value === "number") return { kind: "number" };
  if (prop?.type === "string" || typeof value === "string") return { kind: "text" };
  return null;
}

function ObjectControl({ label, value, onChange }: { label: string; value: unknown; onChange: (v: unknown) => void }) {
  const [text, setText] = useState(() => JSON.stringify(value, null, 2) ?? "");
  const [invalid, setInvalid] = useState(false);
  return (
    <textarea
      aria-label={label}
      aria-invalid={invalid || undefined}
      className={cn(styles.input, "num-sm")}
      value={text}
      onChange={(e) => setText(e.target.value)}
      onBlur={() => {
        try {
          onChange(JSON.parse(text));
          setInvalid(false);
        } catch {
          setInvalid(true);
        }
      }}
    />
  );
}

function SetButton({ kind, onClick }: { kind: string; onClick: () => void }) {
  return (
    <button type="button" className={styles.setButton} onClick={onClick}>
      Set {kind}
    </button>
  );
}

export function ControlInput({ name, control, value, onChange }: { name: string; control: Control; value: unknown; onChange: (v: unknown) => void }) {
  const id = useId();
  const label = name;
  switch (control.kind) {
    case "boolean":
      if (value === undefined) return <SetButton kind="boolean" onClick={() => onChange(false)} />;
      return (
        <label className={styles.toggle}>
          <input type="checkbox" role="switch" aria-label={label} checked={Boolean(value)} onChange={(e) => onChange(e.target.checked)} />
          <span className={cn(!value && styles.toggleOn)}>False</span>
          <span className={cn(Boolean(value) && styles.toggleOn)}>True</span>
        </label>
      );
    case "range": {
      const min = control.min ?? 0;
      const max = control.max ?? 100;
      const current = typeof value === "number" ? value : min;
      return (
        <div className={styles.range}>
          <span>{min}</span>
          <input type="range" aria-label={label} min={min} max={max} step={control.step ?? 1} value={current} onChange={(e) => onChange(Number(e.target.value))} />
          <span>{max}</span>
          <span className={styles.rangeValue}>{current}</span>
        </div>
      );
    }
    case "number":
      return (
        <input
          aria-label={label}
          type="number"
          className={styles.input}
          min={control.min}
          max={control.max}
          step={control.step}
          placeholder="Edit number…"
          value={value === undefined || value === null ? "" : String(value)}
          onChange={(e) => onChange(e.target.value === "" ? undefined : Number(e.target.value))}
        />
      );
    case "inline-radio":
    case "radio": {
      const options = control.options ?? [];
      return (
        <fieldset className={cn(styles.radios, control.kind === "inline-radio" && styles.inlineRadios)}>
          <legend>{label}</legend>
          {options.map((o) => (
            <label key={String(o)} className={styles.radio}>
              <input type="radio" name={id} checked={value === o} onChange={() => onChange(o)} />
              {String(o)}
            </label>
          ))}
        </fieldset>
      );
    }
    case "select": {
      const options = control.options ?? [];
      const at = options.findIndex((o) => o === value);
      return (
        <span className={styles.selectWrap}>
          <select aria-label={label} className={styles.select} value={at < 0 ? "" : String(at)} onChange={(e) => onChange(e.target.value === "" ? undefined : options[Number(e.target.value)])}>
            <option value="">Choose option…</option>
            {options.map((o, i) => (
              <option key={String(o)} value={String(i)}>
                {String(o)}
              </option>
            ))}
          </select>
          <ChevronSmallDownIcon size={12} aria-hidden="true" />
        </span>
      );
    }
    case "object":
      if (value === undefined) return <SetButton kind="object" onClick={() => onChange({})} />;
      return <ObjectControl label={label} value={value} onChange={onChange} />;
    case "color":
      return (
        <span className={styles.colorWrap}>
          <input type="color" aria-label={`${label} swatch`} value={typeof value === "string" && /^#[0-9a-f]{6}$/i.test(value) ? value : "#000000"} onChange={(e) => onChange(e.target.value)} />
          <input aria-label={label} className={styles.input} placeholder="Choose color…" value={typeof value === "string" ? value : ""} onChange={(e) => onChange(e.target.value)} />
        </span>
      );
    default:
      if (value === undefined) return <SetButton kind="string" onClick={() => onChange("")} />;
      return <textarea aria-label={label} className={styles.input} rows={1} placeholder="Edit string…" value={typeof value === "string" ? value : ""} onChange={(e) => onChange(e.target.value)} />;
  }
}

function Chips({ values, className }: { values: string[]; className?: string }) {
  return (
    <span className={cn(styles.chips, className)}>
      {values.map((v) => (
        <span key={v} className={cn(styles.chip, v.length > 28 && styles.chipLong)}>
          {v}
        </span>
      ))}
    </span>
  );
}

export interface ArgRow {
  name: string;
  label?: string;
  prop?: PropDoc;
  /** What an arg without prop docs holds, inferred from its value the way Storybook infers it. */
  inferred?: string;
  description?: string;
  control?: Control | null;
}

function inferType(value: unknown) {
  if (isAction(value) || typeof value === "function") return "function";
  if (Array.isArray(value)) return "array";
  if (value && typeof value === "object") return "$$typeof" in value ? "ReactNode" : "object";
  return value === undefined || value === null ? undefined : typeof value;
}

/** Storybook's order, required first: args the docs set that no prop describes, then the documented props, then controls declared on their own. */
export function argRows(api: ApiEntry | undefined, meta: Meta | undefined, state: ExampleState | undefined): ArgRow[] {
  const props = api?.props?.props ?? [];
  const documented = new Set(props.map((p) => p.name));
  const argTypes = (meta?.argTypes ?? {}) as Record<string, ArgType | undefined>;
  const fromArgs = state ? Object.keys(state.initial).filter((k) => !documented.has(k)) : [];
  const names = [...new Set([...fromArgs, ...props.map((p) => p.name), ...(state ? Object.keys(argTypes) : [])])];
  const rows: ArgRow[] = [];
  for (const name of names) {
    const prop = props.find((p) => p.name === name);
    const argType = argTypes[name];
    const value = state ? (state.args[name] ?? state.initial[name]) : undefined;
    const control = state ? controlFor(prop, argType, value) : null;
    const inferred = prop ? undefined : inferType(state?.initial[name]);
    if (!prop && !control && !inferred) continue;
    rows.push({ name, label: argType?.name, prop, inferred, description: argType?.description ?? prop?.description, control });
  }
  const optional = (row: ArgRow) => Number(row.prop?.optional ?? true);
  return rows.sort((a, b) => optional(a) - optional(b));
}

export function ArgsTable({
  rows: given,
  state,
  variant = "docs",
  emptyText,
}: {
  rows: ArgRow[];
  state?: ExampleState;
  /** The addon panel sorts its rows by name, as Storybook's does; the docs page keeps them in source order. */
  variant?: "docs" | "panel";
  emptyText: string;
}) {
  if (given.length === 0) return <p className={styles.empty}>{emptyText}</p>;
  const rows = variant === "panel" ? [...given].sort((a, b) => Number(a.prop?.optional ?? true) - Number(b.prop?.optional ?? true) || a.name.localeCompare(b.name)) : given;
  const controls = Boolean(state);
  return (
    <table className={cn(styles.args, variant === "docs" ? styles.boxed : styles.panelArgs, !controls && styles.readOnly)}>
      <thead>
        <tr>
          <th className={styles.colName}>Name</th>
          <th className={styles.colDescription}>Description</th>
          <th className={styles.colDefault}>Default</th>
          {controls && (
            <th className={styles.colControl}>
              <span className={styles.controlHead}>
                <span>Control</span>
                <button type="button" className={styles.iconButton} aria-label="Reset controls" title="Reset controls" onClick={state!.resetArgs}>
                  <UndoIcon size={14} />
                </button>
              </span>
            </th>
          )}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => {
          const types = row.prop ? (row.prop.values?.length ? row.prop.values : [row.prop.type]) : row.inferred ? [row.inferred] : [];
          return (
            <tr key={row.name}>
              <td>
                <span className={styles.argName}>{row.label ?? row.name}</span>
                {row.prop && !row.prop.optional && (
                  <span className={styles.required} title="Required">
                    *
                  </span>
                )}
              </td>
              <td>
                <div className={styles.argDescription}>{row.description && <InlineMarkdown text={row.description.replace(/\n/g, " ")} />}</div>
                {types.length > 0 && <Chips values={types} />}
              </td>
              <td>{row.prop?.default ? <Chips values={[row.prop.default]} className={styles.defaultChips} /> : <span>-</span>}</td>
              {controls && (
                <td>
                  {row.control ? <ControlInput name={row.name} control={row.control} value={state!.args[row.name]} onChange={(v) => state!.updateArgs({ [row.name]: v })} /> : <span>-</span>}
                </td>
              )}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
