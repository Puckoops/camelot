"use client";

import { createContext, useContext } from "react";
import type { Args, DocContext } from "./types";

const ACTION = Symbol.for("camelot.docs.action");

type Action = ((...values: unknown[]) => void) & { [ACTION]: string | true };

/** A handler whose calls show in the example's action log. Named after its prop unless you name it. */
export function action(name?: string): (...values: unknown[]) => void {
  return Object.assign(() => {}, { [ACTION]: name ?? true });
}

export function isAction(value: unknown): value is Action {
  return typeof value === "function" && ACTION in value;
}

export function actionName(value: Action, prop: string) {
  const name = value[ACTION];
  return typeof name === "string" ? name : prop;
}

export interface CanvasState {
  args: Args;
  updateArgs: (patch: Args) => void;
  resetArgs: () => void;
  context: DocContext;
}

export const CanvasContext = createContext<CanvasState | null>(null);

export function useCanvas() {
  const state = useContext(CanvasContext);
  if (!state) throw new Error("This hook works only inside a docs example.");
  return state;
}

/** The example's current args and a setter, for a controlled example that writes its value back. */
export function useArgs<A extends Args = Args>(): [A, (patch: Partial<A>) => void, () => void] {
  const { args, updateArgs, resetArgs } = useCanvas();
  return [args as A, updateArgs as (patch: Partial<A>) => void, resetArgs];
}
