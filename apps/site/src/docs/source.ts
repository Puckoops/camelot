import type { ExampleSource } from "@/lib/types";
import type { ExampleState } from "./Canvas";
import { jsxSource } from "./code";
import type { ExampleOf, Meta } from "./types";

/** The Code tab: the example's own code, its render source, the meta's transform, then the JSX its args render. */
export function exampleCode(meta: Meta, example: ExampleOf, source: ExampleSource, component: string | undefined, state: ExampleState) {
  if (typeof example.code === "function") return example.code(state.args as never);
  if (example.code) return example.code;
  if (source.render) return source.render;
  if (meta.code) return meta.code(state.args as never);
  return component ? jsxSource(component, source.props, state.initial, state.args) : "";
}
