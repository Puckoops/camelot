"use client";

import { stories } from "@generated/registry";
import type { StoryViewProps } from "./StoryView";

export function StoryPage(props: StoryViewProps) {
  const View = stories[props.page.slug as keyof typeof stories];
  return View ? <View {...props} /> : null;
}
