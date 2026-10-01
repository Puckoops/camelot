"use client";

import { registry } from "@generated/registry";
import type { DocsViewProps } from "./DocsView";

export function DocsPage(props: DocsViewProps) {
  const View = registry[props.page.slug as keyof typeof registry];
  return View ? <View {...props} /> : null;
}
