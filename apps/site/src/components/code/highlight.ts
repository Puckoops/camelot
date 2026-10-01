import { highlight, type LanguageName } from "sugar-high";

/** Sugar-high's HTML, with a JSX attribute's quoted value told apart from other strings the way Storybook's Prism theme colours it. */
export function highlightCode(code: string, lang: LanguageName = "typescript") {
  let last = "";
  let beforeLast = "";
  let inAttr = false;
  return highlight(code, {
    lang,
    mark(token) {
      if (token.type === "space") return;
      if (token.type === "string") {
        inAttr = inAttr || (last === "sign:=" && beforeLast === "property");
        if (inAttr) {
          token.className += " sh__token--attr";
          token.style.color = "var(--sh-attr)";
        }
      } else inAttr = false;
      beforeLast = last;
      last = token.type === "sign" ? `sign:${token.value}` : token.type;
    },
  });
}
