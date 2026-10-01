"use client";

import { previews } from "@generated/registry";

export function Preview({ slug, exportName }: { slug: string; exportName: string }) {
  const View = previews[slug as keyof typeof previews];
  return View ? <View exportName={exportName} /> : null;
}
