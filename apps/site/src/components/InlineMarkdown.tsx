import Link from "next/link";
import type { ReactNode } from "react";

const TOKEN = /(\\[\\`*_[\]()]|\*\*(?:\\.|[^*])+\*\*|`[^`]+`|\*[^*\s](?:\\.|[^*])*\*|_[^_\s](?:\\.|[^_])*_|\[[^\]]+\]\([^)\s]+\))/g;

const unescape = (text: string) => text.replace(/\\([\\`*_[\]()])/g, "$1");

/** Inline markdown only: **bold**, *italic*, `code`, [links](href) and backslash escapes. Anything else stays text. */
export function InlineMarkdown({ text }: { text: string }) {
  const parts: ReactNode[] = [];
  let last = 0;
  for (const match of text.matchAll(TOKEN)) {
    const token = match[0];
    const at = match.index ?? 0;
    if (at > last) parts.push(text.slice(last, at));
    const key = `${at}`;
    if (token.startsWith("\\")) parts.push(token.slice(1));
    else if (token.startsWith("**")) parts.push(<strong key={key}>{unescape(token.slice(2, -2))}</strong>);
    else if (token.startsWith("`")) parts.push(<code key={key}>{token.slice(1, -1)}</code>);
    else if (token.startsWith("[")) {
      const [, label, href] = /^\[([^\]]+)\]\(([^)\s]+)\)$/.exec(token) ?? [];
      parts.push(
        href?.startsWith("/") ? (
          <Link key={key} href={href}>
            {label}
          </Link>
        ) : (
          <a key={key} href={href} target="_blank" rel="noreferrer noopener">
            {label}
          </a>
        ),
      );
    } else parts.push(<em key={key}>{unescape(token.slice(1, -1))}</em>);
    last = at + token.length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return <>{parts}</>;
}
