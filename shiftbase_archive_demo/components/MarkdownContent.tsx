import Image from "next/image";
import type { ReactNode } from "react";

type MarkdownBlock =
  | { type: "heading"; level: 1 | 2 | 3; text: string }
  | { type: "paragraph"; text: string }
  | { type: "unorderedList"; items: string[] }
  | { type: "orderedList"; items: string[] }
  | { type: "taskList"; items: Array<{ checked: boolean; text: string }> }
  | { type: "quote"; text: string }
  | { type: "image"; alt: string; src: string }
  | { type: "code"; code: string }
  | { type: "table"; headers: string[]; rows: string[][] }
  | { type: "rule" };

const imagePattern = /^!\[(.*)]\((.*)\)$/;
const headingPattern = /^(#{1,3})\s+(.+)$/;
const orderedListPattern = /^\d+\.\s+(.+)$/;
const taskListPattern = /^[-*]\s+\[(x|X| )]\s+(.+)$/;
const unorderedListPattern = /^[-*]\s+(.+)$/;

function isRule(line: string) {
  return /^(-{3,}|\*{3,})$/.test(line.trim());
}

function isBlockStart(line: string) {
  const trimmed = line.trim();
  return (
    trimmed.length === 0 ||
    trimmed.startsWith("```") ||
    headingPattern.test(trimmed) ||
    imagePattern.test(trimmed) ||
    taskListPattern.test(trimmed) ||
    unorderedListPattern.test(trimmed) ||
    orderedListPattern.test(trimmed) ||
    trimmed.startsWith(">") ||
    isTableStart(trimmed) ||
    isRule(trimmed)
  );
}

function parseMarkdown(markdown: string): MarkdownBlock[] {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const blocks: MarkdownBlock[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];
    const trimmed = line.trim();

    if (!trimmed) {
      index += 1;
      continue;
    }

    if (trimmed.startsWith("```")) {
      const codeLines: string[] = [];
      index += 1;
      while (index < lines.length && !lines[index].trim().startsWith("```")) {
        codeLines.push(lines[index]);
        index += 1;
      }
      if (index < lines.length) index += 1;
      blocks.push({ type: "code", code: codeLines.join("\n") });
      continue;
    }

    const imageMatch = trimmed.match(imagePattern);
    if (imageMatch) {
      blocks.push({ type: "image", alt: imageMatch[1], src: imageMatch[2] });
      index += 1;
      continue;
    }

    const headingMatch = trimmed.match(headingPattern);
    if (headingMatch) {
      blocks.push({
        type: "heading",
        level: headingMatch[1].length as 1 | 2 | 3,
        text: headingMatch[2]
      });
      index += 1;
      continue;
    }

    if (isRule(trimmed)) {
      blocks.push({ type: "rule" });
      index += 1;
      continue;
    }

    if (isTableStart(trimmed) && isTableSeparator(lines[index + 1]?.trim() ?? "")) {
      const headers = parseTableRow(trimmed);
      const rows: string[][] = [];
      index += 2;
      while (index < lines.length && lines[index].trim().startsWith("|")) {
        rows.push(parseTableRow(lines[index].trim()));
        index += 1;
      }
      blocks.push({ type: "table", headers, rows });
      continue;
    }

    if (taskListPattern.test(trimmed)) {
      const items: Array<{ checked: boolean; text: string }> = [];
      while (index < lines.length) {
        const match = lines[index].trim().match(taskListPattern);
        if (!match) break;
        items.push({ checked: match[1].toLowerCase() === "x", text: match[2] });
        index += 1;
      }
      blocks.push({ type: "taskList", items });
      continue;
    }

    if (orderedListPattern.test(trimmed)) {
      const items: string[] = [];
      while (index < lines.length) {
        const match = lines[index].trim().match(orderedListPattern);
        if (!match) break;
        items.push(match[1]);
        index += 1;
      }
      blocks.push({ type: "orderedList", items });
      continue;
    }

    if (unorderedListPattern.test(trimmed)) {
      const items: string[] = [];
      while (index < lines.length) {
        const match = lines[index].trim().match(unorderedListPattern);
        if (!match) break;
        items.push(match[1]);
        index += 1;
      }
      blocks.push({ type: "unorderedList", items });
      continue;
    }

    if (trimmed.startsWith(">")) {
      const quoteLines: string[] = [];
      while (index < lines.length && lines[index].trim().startsWith(">")) {
        quoteLines.push(lines[index].trim().replace(/^>\s?/, ""));
        index += 1;
      }
      blocks.push({ type: "quote", text: quoteLines.join(" ") });
      continue;
    }

    const paragraphLines: string[] = [];
    while (index < lines.length && !isBlockStart(lines[index])) {
      paragraphLines.push(lines[index].trim());
      index += 1;
    }
    if (paragraphLines.length > 0) {
      blocks.push({ type: "paragraph", text: paragraphLines.join(" ") });
    } else {
      index += 1;
    }
  }

  return blocks;
}

function isSafeLink(value: string) {
  return /^(https?:\/\/|mailto:|\/|#)/.test(value);
}

function isTableStart(line: string) {
  return line.startsWith("|") && line.endsWith("|");
}

function isTableSeparator(line: string) {
  if (!isTableStart(line)) return false;
  return parseTableRow(line).every((cell) => /^:?-{3,}:?$/.test(cell));
}

function parseTableRow(line: string) {
  return line
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
}

function renderInlineMarkdown(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const pattern = /(`[^`\n]+`|\*\*[^*\n]+\*\*|\*[^*\n]+\*|\[[^\]\n]+]\([^)]+\))/g;
  let cursor = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > cursor) nodes.push(text.slice(cursor, match.index));

    const token = match[0];
    const key = `${keyPrefix}-${match.index}`;

    if (token.startsWith("`")) {
      nodes.push(<code className="rounded bg-soft px-1.5 py-0.5 text-[0.92em] text-ink" key={key}>{token.slice(1, -1)}</code>);
    } else if (token.startsWith("**")) {
      nodes.push(<strong className="font-bold text-ink" key={key}>{token.slice(2, -2)}</strong>);
    } else if (token.startsWith("*")) {
      nodes.push(<em key={key}>{token.slice(1, -1)}</em>);
    } else {
      const linkMatch = token.match(/^\[([^\]]+)]\(([^)]+)\)$/);
      if (linkMatch && isSafeLink(linkMatch[2])) {
        nodes.push(
          <a className="font-semibold text-primary underline underline-offset-4 hover:text-primary-dark" href={linkMatch[2]} key={key}>
            {linkMatch[1]}
          </a>
        );
      } else {
        nodes.push(token);
      }
    }

    cursor = match.index + token.length;
  }

  if (cursor < text.length) nodes.push(text.slice(cursor));
  return nodes;
}

export function MarkdownContent({ markdown, className = "" }: { markdown: string; className?: string }) {
  const blocks = parseMarkdown(markdown);

  return (
    <div className={`grid gap-4 leading-7 text-muted ${className}`}>
      {blocks.map((block, blockIndex) => {
        const key = `${block.type}-${blockIndex}`;

        if (block.type === "heading") {
          const sizeClass = block.level === 1 ? "text-2xl" : block.level === 2 ? "text-xl" : "text-lg";
          const content = renderInlineMarkdown(block.text, key);
          if (block.level === 1) return <h1 className={`${sizeClass} font-bold tracking-tight text-ink`} key={key}>{content}</h1>;
          if (block.level === 2) return <h2 className={`${sizeClass} font-bold tracking-tight text-ink`} key={key}>{content}</h2>;
          return <h3 className={`${sizeClass} font-bold tracking-tight text-ink`} key={key}>{content}</h3>;
        }

        if (block.type === "image") {
          return (
            <Image
              className="w-full rounded-2xl border border-line object-cover"
              src={block.src}
              alt={block.alt}
              width={1200}
              height={675}
              sizes="(min-width: 1024px) 720px, 100vw"
              key={key}
            />
          );
        }

        if (block.type === "unorderedList") {
          return (
            <ul className="grid list-disc gap-2 pl-5 text-sm leading-6" key={key}>
              {block.items.map((item, itemIndex) => <li key={`${key}-${itemIndex}`}>{renderInlineMarkdown(item, `${key}-${itemIndex}`)}</li>)}
            </ul>
          );
        }

        if (block.type === "orderedList") {
          return (
            <ol className="grid list-decimal gap-2 pl-5 text-sm leading-6" key={key}>
              {block.items.map((item, itemIndex) => <li key={`${key}-${itemIndex}`}>{renderInlineMarkdown(item, `${key}-${itemIndex}`)}</li>)}
            </ol>
          );
        }

        if (block.type === "taskList") {
          return (
            <ul className="grid gap-2 text-sm leading-6" key={key}>
              {block.items.map((item, itemIndex) => (
                <li className="flex gap-2" key={`${key}-${itemIndex}`}>
                  <input className="mt-1.5 h-4 w-4 shrink-0 accent-primary" checked={item.checked} readOnly type="checkbox" />
                  <span>{renderInlineMarkdown(item.text, `${key}-${itemIndex}`)}</span>
                </li>
              ))}
            </ul>
          );
        }

        if (block.type === "quote") {
          return (
            <blockquote className="border-l-4 border-primary/30 bg-soft px-4 py-3 text-sm font-medium leading-7 text-ink" key={key}>
              {renderInlineMarkdown(block.text, key)}
            </blockquote>
          );
        }

        if (block.type === "code") {
          return (
            <pre className="overflow-x-auto rounded-xl border border-line bg-ink p-4 text-xs leading-6 text-white" key={key}>
              <code>{block.code}</code>
            </pre>
          );
        }

        if (block.type === "table") {
          return (
            <div className="overflow-x-auto rounded-xl border border-line" key={key}>
              <table className="min-w-full divide-y divide-line text-sm">
                <thead className="bg-soft text-left text-xs font-semibold text-ink">
                  <tr>
                    {block.headers.map((header, headerIndex) => (
                      <th className="px-3 py-2" key={`${key}-head-${headerIndex}`}>{renderInlineMarkdown(header, `${key}-head-${headerIndex}`)}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-line bg-white">
                  {block.rows.map((row, rowIndex) => (
                    <tr key={`${key}-row-${rowIndex}`}>
                      {block.headers.map((_, cellIndex) => (
                        <td className="px-3 py-2" key={`${key}-cell-${rowIndex}-${cellIndex}`}>
                          {renderInlineMarkdown(row[cellIndex] ?? "", `${key}-cell-${rowIndex}-${cellIndex}`)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }

        if (block.type === "rule") {
          return <hr className="border-line" key={key} />;
        }

        return <p key={key}>{renderInlineMarkdown(block.text, key)}</p>;
      })}
    </div>
  );
}
