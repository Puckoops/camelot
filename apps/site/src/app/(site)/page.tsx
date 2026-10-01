import type { Metadata } from "next";
import { Intro } from "@/components/intro/Intro";
import { themes, tokenCount } from "@/components/tokens/parse";
import { DocsWrapper } from "@/docs/Doc";
import { catalog } from "@/lib/data";

export const metadata: Metadata = {
  title: { absolute: "Introduction · Camelot" },
  description: "Camelot, the Puckoops design system: the components, tokens and rules every Puckoops product is built from, and where to start with each.",
};

export default function IntroductionPage() {
  return (
    <DocsWrapper>
      <Intro components={catalog.components.length} tokens={tokenCount} themes={themes.length} rules={catalog.rules.hardRules} />
    </DocsWrapper>
  );
}
