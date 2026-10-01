"use client";

import { cn } from "@puckoops/camelot";
import { Component, createContext, useCallback, useContext, useMemo, useState, type ComponentType, type ErrorInfo, type ReactNode, type Ref } from "react";
import { actionName, CanvasContext, isAction } from "./runtime";
import type { Args, Decorator, DocContext, ExampleOf, Meta, Parameters } from "./types";
import styles from "./docs.module.css";

export interface LoggedAction {
  id: number;
  name: string;
  detail: string;
}

let actionSeq = 0;

function describeValues(values: unknown[]) {
  return values
    .map((v) => {
      if (v && typeof v === "object" && "nativeEvent" in v) return "event";
      if (typeof v === "function") return "fn";
      try {
        return JSON.stringify(v) ?? String(v);
      } catch {
        return String(v);
      }
    })
    .join(", ");
}

interface Layer {
  index: number;
  stack: Decorator[];
  context: DocContext;
  root: () => ReactNode;
}

const LayerContext = createContext<Layer | null>(null);

/**
 * Each decorator receives Next as the example to render; Next renders the decorator below it, and the
 * innermost Next renders the example itself. The example's own decorators sit inside the meta's.
 */
function Next() {
  const layer = useContext(LayerContext)!;
  const at = layer.index - 1;
  if (at < 0) return <>{layer.root()}</>;
  return <LayerContext.Provider value={{ ...layer, index: at }}>{layer.stack[at]!(Next, layer.context as never)}</LayerContext.Provider>;
}

class ExampleBoundary extends Component<{ children: ReactNode; name: string }, { error?: Error }> {
  state: { error?: Error } = {};
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(`The ${this.props.name} example failed to render`, error, info.componentStack);
  }
  render() {
    if (!this.state.error) return this.props.children;
    return (
      <p className={cn("small", styles.failed)} role="alert">
        This example failed to render: {this.state.error.message}
      </p>
    );
  }
}

export function initialArgs(meta: Meta, example: ExampleOf): Args {
  return { ...(meta.args as Args | undefined), ...(example.args as Args | undefined) };
}

/** Owns an example's args, so useArgs inside it and the controls table can both change them. */
export function useExampleArgs(meta: Meta, example: ExampleOf) {
  const initial = useMemo(() => initialArgs(meta, example), [meta, example]);
  const [args, setArgs] = useState(initial);
  const [actions, setActions] = useState<LoggedAction[]>([]);
  const updateArgs = useCallback((patch: Args) => setArgs((current) => ({ ...current, ...patch })), []);
  const resetArgs = useCallback(() => setArgs(initial), [initial]);
  const log = useCallback(
    (name: string, values: unknown[]) => setActions((list) => [{ id: ++actionSeq, name, detail: describeValues(values) }, ...list].slice(0, 100)),
    [],
  );
  const clearActions = useCallback(() => setActions([]), []);
  return { initial, args, updateArgs, resetArgs, actions, log, clearActions };
}

export type ExampleState = ReturnType<typeof useExampleArgs>;

export function Canvas({
  meta,
  example,
  name,
  state,
  ref,
  bare,
  zoom = 1,
  className,
  viewMode = bare ? "preview" : "docs",
}: {
  meta: Meta;
  example: ExampleOf;
  name: string;
  state: ExampleState;
  ref?: Ref<HTMLDivElement>;
  /** Fills the window on its own page instead of sitting in a docs frame. */
  bare?: boolean;
  zoom?: number;
  className?: string;
  viewMode?: DocContext["viewMode"];
}) {
  const stack = useMemo<Decorator[]>(() => [...(example.decorators ?? []), ...(meta.decorators ?? [])] as Decorator[], [meta, example]);
  const parameters = useMemo<Parameters>(() => ({ ...meta.parameters, ...example.parameters }), [meta, example]);
  const { args, updateArgs, resetArgs, log } = state;
  const bound = useMemo(() => {
    const out: Args = {};
    for (const [key, value] of Object.entries(args)) out[key] = isAction(value) ? (...values: unknown[]) => log(actionName(value, key), values) : value;
    return out;
  }, [args, log]);
  const context = useMemo<DocContext>(() => ({ args: bound, parameters, name, viewMode }), [bound, parameters, name, viewMode]);
  const canvas = useMemo(() => ({ args: bound, updateArgs, resetArgs, context }), [bound, updateArgs, resetArgs, context]);
  const render = example.render ?? meta.render;
  const Rendered = meta.component as ComponentType<Args> | undefined;
  const root = () => (render ? render(bound as never, context as never) : Rendered ? <Rendered {...bound} /> : null);
  return (
    <div
      ref={ref}
      data-canvas=""
      className={cn(styles.canvas, bare && styles.bare, styles[parameters.layout ?? "centered"], className)}
      style={zoom === 1 ? undefined : { zoom }}
    >
      <ExampleBoundary name={name}>
        <CanvasContext.Provider value={canvas}>
          <LayerContext.Provider value={{ index: stack.length, stack, context, root }}>
            <Next />
          </LayerContext.Provider>
        </CanvasContext.Provider>
      </ExampleBoundary>
    </div>
  );
}
