import type { ComponentType, JSXElementConstructor, ReactNode } from "react";

export type Args = Record<string, unknown>;

export type ControlKind = "text" | "boolean" | "number" | "radio" | "inline-radio" | "select" | "object" | "color" | "range";

export interface ArgType {
  /** false hides the prop from the controls; omit it to infer a control from the prop's type. */
  control?: ControlKind | false | { type: ControlKind; min?: number; max?: number; step?: number };
  options?: readonly unknown[];
  description?: string;
  /** The label in the controls table, when the arg's key is not what a reader should see. */
  name?: string;
}

export interface Parameters {
  /** centered (the default) sits the example in the middle of the canvas; padded and fullscreen give it the width. */
  layout?: "centered" | "padded" | "fullscreen";
  /** Read by a meta decorator that frames its examples at a set width. */
  frameWidth?: number | string;
  [key: string]: unknown;
}

export interface DocContext<A = Args> {
  args: A;
  parameters: Parameters;
  name: string;
  /** docs inside a docs page; preview on a story page or the example's full-screen page. */
  viewMode: "docs" | "preview";
}

export type Decorator<A = Args> = (Example: ComponentType, context: DocContext<A>) => ReactNode;

type PropsOf<C> = C extends JSXElementConstructor<infer P> ? P : C extends object ? C : Args;

/** The default export of a *.docs.tsx file: which catalogue entry it documents and the args every example starts from. */
export interface Meta<C = unknown> {
  /** "ui/<catalogue name>" or "Hooks/<hook name>"; it must match an entry in the package's catalogue. */
  title: string;
  component?: C;
  subcomponents?: Record<string, ComponentType<never>>;
  /** Markdown shown under the summary: **bold**, *italic*, `code` and [links](/docs/...). */
  description?: string;
  args?: Partial<PropsOf<C>>;
  argTypes?: { [K in keyof PropsOf<C>]?: ArgType } & Record<string, ArgType>;
  decorators?: Decorator<PropsOf<C>>[];
  parameters?: Parameters;
  render?: (args: PropsOf<C>, context: DocContext<PropsOf<C>>) => ReactNode;
  /** The Code tab for args-only examples, when the rendered JSX is not what a reader should copy. */
  code?: (args: PropsOf<C>) => string;
}

type MetaArgs<M> = M extends { component: infer C } ? PropsOf<C> : M extends { args: infer A } ? A : Args;

/** A named export of a *.docs.tsx file: a story. The first is the docs page's preview with the controls. */
export interface ExampleOf<M = Meta> {
  name?: string;
  description?: string;
  args?: Partial<MetaArgs<M>>;
  argTypes?: Record<string, ArgType>;
  decorators?: Decorator<MetaArgs<M>>[];
  parameters?: Parameters;
  render?: (args: MetaArgs<M>, context: DocContext<MetaArgs<M>>) => ReactNode;
  /** The Code tab, as written or from the current args, in place of the render source or the rendered JSX. */
  code?: string | ((args: MetaArgs<M>) => string);
}

/** A docs file as the renderer receives it. Each file's meta is typed against its own component, so the default stays unknown here. */
export interface DocsModule {
  default: unknown;
  [exportName: string]: unknown;
}
