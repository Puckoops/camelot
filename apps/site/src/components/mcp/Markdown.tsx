import { cn, Divider, Table, TBody, Td, TextLink, Th, THead, Tr } from "@puckoops/camelot";
import Link from "next/link";
import type { ReactNode } from "react";
import { CodeBlock } from "@/components/CodeBlock";
import styles from "./mcp.module.css";

type Block =
  | { kind: "heading"; level: number; text: string }
  | { kind: "paragraph"; text: string }
  | { kind: "code"; lang: string; text: string }
  | { kind: "list"; ordered: boolean; items: string[] }
  | { kind: "table"; header: string[]; rows: string[][] }
  | { kind: "quote"; text: string }
  | { kind: "rule" };

const FENCE = /^(`{3,}|~{3,})\s*([\w-]*)\s*$/;
const HEADING = /^(#{1,6})\s+(.*)$/;
const ITEM = /^\s*([-*+]|\d+[.)])\s+(.*)$/;
const TABLE_RULE = /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)*\|?\s*$/;

const splitRow = (line: string) =>
  line
    .trim()
    .replace(/^\|/, "")
    .replace(/(?<!\\)\|$/, "")
    .split(/(?<!\\)\|/)
    .map((cell) => cell.replace(/\\\|/g, "|").trim());

function startsBlock(line: string, next: string | undefined) {
  return FENCE.test(line) || HEADING.test(line) || ITEM.test(line) || /^>\s?/.test(line) || (line.trim().startsWith("|") && TABLE_RULE.test(next ?? ""));
}

export function parseMarkdown(source: string): Block[] {
  const lines = source.replace(/\r\n?/g, "\n").split("\n");
  const blocks: Block[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i] ?? "";
    if (!line.trim()) {
      i++;
      continue;
    }
    const fence = FENCE.exec(line);
    if (fence) {
      const body: string[] = [];
      i++;
      while (i < lines.length && !(lines[i] ?? "").startsWith(fence[1] ?? "```")) body.push(lines[i++] ?? "");
      i++;
      blocks.push({ kind: "code", lang: fence[2] ?? "", text: body.join("\n") });
      continue;
    }
    const heading = HEADING.exec(line);
    if (heading) {
      blocks.push({ kind: "heading", level: heading[1]?.length ?? 1, text: heading[2] ?? "" });
      i++;
      continue;
    }
    if (/^(?:-{3,}|\*{3,}|_{3,})$/.test(line.trim())) {
      blocks.push({ kind: "rule" });
      i++;
      continue;
    }
    if (line.trim().startsWith("|") && TABLE_RULE.test(lines[i + 1] ?? "")) {
      const header = splitRow(line);
      const rows: string[][] = [];
      i += 2;
      while (i < lines.length && (lines[i] ?? "").trim().startsWith("|")) rows.push(splitRow(lines[i++] ?? ""));
      blocks.push({ kind: "table", header, rows });
      continue;
    }
    if (/^>\s?/.test(line)) {
      const quote: string[] = [];
      while (i < lines.length && /^>\s?/.test(lines[i] ?? "")) quote.push((lines[i++] ?? "").replace(/^>\s?/, ""));
      blocks.push({ kind: "quote", text: quote.join(" ") });
      continue;
    }
    const item = ITEM.exec(line);
    if (item) {
      const ordered = /\d/.test(item[1] ?? "");
      const items: string[] = [];
      while (i < lines.length) {
        const current = lines[i] ?? "";
        const match = ITEM.exec(current);
        if (match && /\d/.test(match[1] ?? "") === ordered) items.push(match[2] ?? "");
        else if (current.trim() && /^\s{2,}/.test(current) && items.length) items[items.length - 1] += ` ${current.trim()}`;
        else break;
        i++;
      }
      blocks.push({ kind: "list", ordered, items });
      continue;
    }
    const paragraph: string[] = [];
    while (i < lines.length && (lines[i] ?? "").trim() && !(paragraph.length && startsBlock(lines[i] ?? "", lines[i + 1]))) {
      paragraph.push((lines[i++] ?? "").trim());
    }
    blocks.push({ kind: "paragraph", text: paragraph.join(" ") });
  }
  return blocks;
}

const INLINE = /``\s?(.+?)\s?``|`([^`]+)`|\*\*(.+?)\*\*|(?<![\w*])_(.+?)_(?!\w)|\[([^\]]+)\]\(([^)\s]+)\)|(https?:\/\/[^\s<>()]*[^\s<>().,;:!?'"])/g;

function sameOriginPath(href: string) {
  try {
    const url = new URL(href);
    return url.origin === window.location.origin ? `${url.pathname}${url.search}${url.hash}` : undefined;
  } catch {
    return undefined;
  }
}

function Inline({ text }: { text: string }) {
  const out: ReactNode[] = [];
  let last = 0;
  let key = 0;
  for (const m of text.matchAll(INLINE)) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const code = m[1] ?? m[2];
    if (code !== undefined) out.push(<code key={key++} className={cn("num-sm", styles.inlineCode)}>{code}</code>);
    else if (m[3] !== undefined) out.push(<strong key={key++} className={styles.strong}><Inline text={m[3]} /></strong>);
    else if (m[4] !== undefined) out.push(<em key={key++}><Inline text={m[4]} /></em>);
    else {
      const href = m[6] ?? m[7] ?? "";
      const local = sameOriginPath(href);
      out.push(
        local ? (
          <TextLink key={key++} as={Link} href={local}>
            {m[5] ?? href}
          </TextLink>
        ) : (
          <TextLink key={key++} href={href} target="_blank" rel="noreferrer">
            {m[5] ?? href}
          </TextLink>
        ),
      );
    }
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return <>{out}</>;
}

function renderBlock(block: Block, key: number) {
  switch (block.kind) {
    case "heading": {
      const text = <Inline text={block.text} />;
      if (block.level === 1) return <h2 key={key} className={cn("h2", styles.mdTitle)}>{text}</h2>;
      if (block.level === 2) return <h3 key={key} className={cn("h3", styles.mdHeading)}>{text}</h3>;
      return <h4 key={key} className={cn("caps", styles.mdSubheading)}>{text}</h4>;
    }
    case "paragraph":
      return <p key={key} className="small"><Inline text={block.text} /></p>;
    case "code":
      return <CodeBlock key={key} code={block.text} label={block.lang || undefined} />;
    case "list": {
      const List = block.ordered ? "ol" : "ul";
      return (
        <List key={key} className={cn(styles.list, block.ordered && styles.ordered)}>
          {block.items.map((item, i) => (
            <li key={i} className="small"><Inline text={item} /></li>
          ))}
        </List>
      );
    }
    case "table":
      return (
        <Table key={key} density="compact" minWidth={480}>
          <THead>
            <Tr>
              {block.header.map((cell, i) => <Th key={i}><Inline text={cell} /></Th>)}
            </Tr>
          </THead>
          <TBody>
            {block.rows.map((row, r) => (
              <Tr key={r}>
                {row.map((cell, c) => <Td key={c} primary={c === 0}><Inline text={cell} /></Td>)}
              </Tr>
            ))}
          </TBody>
        </Table>
      );
    case "quote":
      return <blockquote key={key} className={cn("small", styles.quote)}><Inline text={block.text} /></blockquote>;
    case "rule":
      return <Divider key={key} />;
  }
}

export function Markdown({ source, className }: { source: string; className?: string }) {
  return <div className={cn(styles.markdown, className)}>{parseMarkdown(source).map(renderBlock)}</div>;
}
