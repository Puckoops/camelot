export const ic = (text: string) => (text.includes("`") ? `\`\` ${text} \`\`` : `\`${text}\``);

export const oneLine = (text: string) => text.replace(/\s+/g, " ").trim();

export function fence(text: string, lang = "") {
  const ticks = text.includes("```") ? "````" : "```";
  return `${ticks}${lang}\n${text.replace(/\n+$/, "")}\n${ticks}`;
}

export function table(headers: string[], rows: string[][]) {
  const cell = (text: string) => oneLine(text).replace(/\|/g, "\\|");
  return [
    `| ${headers.map(cell).join(" | ")} |`,
    `| ${headers.map(() => "---").join(" | ")} |`,
    ...rows.map((row) => `| ${row.map(cell).join(" | ")} |`),
  ].join("\n");
}

export const bullets = (items: string[]) => items.map((item) => `- ${item}`).join("\n");

export const numbered = (items: string[]) => items.map((item, i) => `${i + 1}. ${item}`).join("\n");

export function demote(markdown: string, levels = 1) {
  let inFence = false;
  return markdown
    .split("\n")
    .map((line) => {
      if (/^(```|~~~)/.test(line)) inFence = !inFence;
      if (inFence || !/^#{1,5} /.test(line)) return line;
      return `${"#".repeat(levels)}${line}`;
    })
    .join("\n");
}

export const withoutTitle = (markdown: string) => markdown.replace(/^# .*\n+/, "");
