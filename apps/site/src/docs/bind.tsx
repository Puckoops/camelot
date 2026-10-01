"use client";

import type { ComponentType } from "react";
import { Canvas, useExampleArgs } from "./Canvas";
import { DocsView, type DocsViewProps } from "./DocsView";
import { StoryView, type StoryViewProps } from "./StoryView";
import type { DocsModule, ExampleOf, Meta } from "./types";

export function bindDocs(module: DocsModule): ComponentType<DocsViewProps> {
  return function BoundDocs(props: DocsViewProps) {
    return <DocsView module={module} {...props} />;
  };
}

export function bindStory(module: DocsModule): ComponentType<StoryViewProps> {
  return function BoundStory(props: StoryViewProps) {
    return <StoryView module={module} {...props} />;
  };
}

function ExamplePreview({ module, exportName }: { module: DocsModule; exportName: string }) {
  const meta = module.default as Meta;
  const example = module[exportName] as ExampleOf;
  const state = useExampleArgs(meta, example);
  return <Canvas bare meta={meta} example={example} name={example.name ?? exportName} state={state} />;
}

export function bindPreview(module: DocsModule): ComponentType<{ exportName: string }> {
  return function BoundPreview({ exportName }: { exportName: string }) {
    return <ExamplePreview module={module} exportName={exportName} />;
  };
}
