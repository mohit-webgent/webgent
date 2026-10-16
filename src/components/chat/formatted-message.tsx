import React from "react";

interface FormattedMessageProps {
  content: string;
  isUser?: boolean;
}

/**
 * Parses inline formatting: bold (**text**), italic (*text*), code (`code`), and links ([text](url))
 * Returns an array of ReactNodes without using dangerouslySetInnerHTML.
 */
function parseInline(text: string, isUser = false): React.ReactNode[] {
  const elements: React.ReactNode[] = [];
  // Regex to match inline elements: bold, link, code, italic
  const inlineRegex = /(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\)|`[^`]+`|\*[^*]+\*)/g;

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = inlineRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      elements.push(text.slice(lastIndex, match.index));
    }

    const token = match[0];
    const key = `inline_${match.index}_${token.slice(0, 5)}`;

    if (token.startsWith("**") && token.endsWith("**")) {
      const inner = token.slice(2, -2);
      elements.push(
        <strong
          key={key}
          className={isUser ? "font-bold text-white" : "font-semibold text-white"}
        >
          {inner}
        </strong>,
      );
    } else if (token.startsWith("[") && token.includes("](") && token.endsWith(")")) {
      const splitIdx = token.indexOf("](");
      const linkText = token.slice(1, splitIdx);
      const linkUrl = token.slice(splitIdx + 2, -1);
      const isInternal = linkUrl.startsWith("/") || linkUrl.startsWith("#");

      elements.push(
        <a
          key={key}
          href={linkUrl}
          target={isInternal ? "_self" : "_blank"}
          rel={isInternal ? undefined : "noopener noreferrer"}
          className={
            isUser
              ? "underline text-white font-medium hover:opacity-90"
              : "text-emerald-400 hover:text-emerald-300 underline font-medium transition-colors"
          }
        >
          {linkText}
        </a>,
      );
    } else if (token.startsWith("`") && token.endsWith("`")) {
      const code = token.slice(1, -1);
      elements.push(
        <code
          key={key}
          className={
            isUser
              ? "px-1 py-0.5 rounded bg-white/20 font-mono text-[11px]"
              : "px-1.5 py-0.5 rounded bg-white/[0.08] text-emerald-300 font-mono text-[11px] border border-white/[0.06]"
          }
        >
          {code}
        </code>,
      );
    } else if (token.startsWith("*") && token.endsWith("*")) {
      const italic = token.slice(1, -1);
      elements.push(
        <em key={key} className="italic opacity-90">
          {italic}
        </em>,
      );
    } else {
      elements.push(token);
    }

    lastIndex = inlineRegex.lastIndex;
  }

  if (lastIndex < text.length) {
    elements.push(text.slice(lastIndex));
  }

  return elements;
}

/**
 * Lightweight, safe React Markdown Renderer.
 * Supports paragraphs, lists, headings, links, code, and bold styling
 * without any dangerouslySetInnerHTML or heavy dependencies.
 */
export function FormattedMessage({ content, isUser = false }: FormattedMessageProps) {
  if (!content) return null;

  // Split content into line blocks
  const rawLines = content.replace(/\r\n/g, "\n").split("\n");
  const blocks: React.ReactNode[] = [];

  let currentList: { type: "ul" | "ol"; items: string[] } | null = null;
  let currentParagraphLines: string[] = [];

  const flushParagraph = (idx: number) => {
    if (currentParagraphLines.length > 0) {
      const text = currentParagraphLines.join("\n").trim();
      if (text) {
        blocks.push(
          <p
            key={`p_${idx}_${blocks.length}`}
            className={`text-[12.5px] leading-relaxed break-words ${
              isUser ? "text-white" : "text-[#E2E2DF]"
            }`}
          >
            {parseInline(text, isUser)}
          </p>,
        );
      }
      currentParagraphLines = [];
    }
  };

  const flushList = (idx: number) => {
    if (currentList && currentList.items.length > 0) {
      const isOrdered = currentList.type === "ol";
      blocks.push(
        <ul
          key={`list_${idx}_${blocks.length}`}
          className="space-y-1.5 my-1.5 pl-0.5"
        >
          {currentList.items.map((item, itemIdx) => (
            <li
              key={`item_${itemIdx}`}
              className="flex items-start gap-2 text-[12px] text-[#DFDFDC] leading-relaxed"
            >
              {isOrdered ? (
                <span className="font-mono text-emerald-400 font-semibold text-[11px] shrink-0 mt-0.5">
                  {itemIdx + 1}.
                </span>
              ) : (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 mt-1.5" />
              )}
              <span className="flex-1 break-words">
                {parseInline(item, isUser)}
              </span>
            </li>
          ))}
        </ul>,
      );
      currentList = null;
    }
  };

  rawLines.forEach((line, idx) => {
    const trimmed = line.trim();

    // 1. Blank line: flush active list or paragraph
    if (!trimmed) {
      flushParagraph(idx);
      flushList(idx);
      return;
    }

    // 2. Headings: ###, ##, #
    if (trimmed.startsWith("### ")) {
      flushParagraph(idx);
      flushList(idx);
      blocks.push(
        <h4
          key={`h4_${idx}`}
          className="text-[12px] font-bold text-white tracking-wide uppercase mt-2 mb-1 text-emerald-400/90"
        >
          {parseInline(trimmed.slice(4), isUser)}
        </h4>,
      );
      return;
    }

    if (trimmed.startsWith("## ")) {
      flushParagraph(idx);
      flushList(idx);
      blocks.push(
        <h3
          key={`h3_${idx}`}
          className="text-[13px] font-bold text-white tracking-tight mt-2.5 mb-1"
        >
          {parseInline(trimmed.slice(3), isUser)}
        </h3>,
      );
      return;
    }

    if (trimmed.startsWith("# ")) {
      flushParagraph(idx);
      flushList(idx);
      blocks.push(
        <h2
          key={`h2_${idx}`}
          className="text-[13.5px] font-bold text-white tracking-tight mt-3 mb-1.5"
        >
          {parseInline(trimmed.slice(2), isUser)}
        </h2>,
      );
      return;
    }

    // 3. Unordered list: - item, * item, • item
    const ulMatch = trimmed.match(/^[-*•]\s+(.+)$/);
    if (ulMatch) {
      flushParagraph(idx);
      if (!currentList || currentList.type !== "ul") {
        flushList(idx);
        currentList = { type: "ul", items: [] };
      }
      currentList.items.push(ulMatch[1]);
      return;
    }

    // 4. Ordered list: 1. item, 2. item
    const olMatch = trimmed.match(/^\d+\.\s+(.+)$/);
    if (olMatch) {
      flushParagraph(idx);
      if (!currentList || currentList.type !== "ol") {
        flushList(idx);
        currentList = { type: "ol", items: [] };
      }
      currentList.items.push(olMatch[1]);
      return;
    }

    // 5. Standard line inside paragraph
    if (currentList) {
      flushList(idx);
    }
    currentParagraphLines.push(line);
  });

  // Final flush
  flushParagraph(rawLines.length);
  flushList(rawLines.length);

  return <div className="space-y-1.5">{blocks}</div>;
}
