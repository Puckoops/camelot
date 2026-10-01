import type { ComponentType } from "react";
import { TOKEN_PAGES, type TokenSlug } from "@/lib/pages";
import { description as effects, EffectsTokens } from "./Effects";
import { description as motion, MotionTokens } from "./Motion";
import { description as semantic, SemanticTokens } from "./Semantic";
import { description as spacing, SpacingTokens } from "./Spacing";
import { description as typography, TypographyTokens } from "./Typography";

interface TokenContent {
  description: string;
  summary: string;
  Content: ComponentType;
  code: string;
}

const CONTENT: Record<TokenSlug, TokenContent> = {
  semantic: {
    description: semantic,
    summary: "Camelot's colour roles with their light and dark values, the neutral ramp they draw from and the four state hues, read from tokens.css.",
    Content: SemanticTokens,
    code: "<SemanticTokens />",
  },
  typography: {
    description: typography,
    summary: "Camelot's three typefaces and every type class, each with a live sample, its size and line height, weight and tracking, and when to reach for it.",
    Content: TypographyTokens,
    code: "<TypographyTokens />",
  },
  effects: {
    description: effects,
    summary: "Camelot's shadows, hairlines, scrim, washes and focus ring, shown on real surfaces with their light and dark values.",
    Content: EffectsTokens,
    code: "<EffectsTokens />",
  },
  spacing: {
    description: spacing,
    summary: "Camelot's spacing scale drawn to scale, its radii on real boxes, and the fixed layout sizes of the shell, grid, controls and table rows.",
    Content: SpacingTokens,
    code: "<SpacingTokens />",
  },
  motion: {
    description: motion,
    summary: "Camelot's durations and easings, each with a demo you can replay, and the rules that bind them: transform and opacity only, and reduced motion respected.",
    Content: MotionTokens,
    code: "<MotionTokens />",
  },
};

export function tokenPage(slug: string) {
  const page = TOKEN_PAGES.find((t) => t.slug === slug);
  return page && { ...page, ...CONTENT[page.slug] };
}
