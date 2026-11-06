import ReactMarkdown from "react-markdown";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";

interface MarkdownContentProps {
  content: string;
  className?: string;
}

/**
 * Renders CMS Markdown for blog posts and case studies. Raw HTML in the source is shown as text
 * rather than executed, and unsafe link protocols are stripped by react-markdown.
 */
export function MarkdownContent({ content, className = "" }: MarkdownContentProps) {
  return (
    <div
      className={`prose prose-invert max-w-none prose-headings:text-fg prose-a:text-fg prose-strong:text-fg prose-code:text-fg prose-pre:bg-surface prose-pre:border prose-pre:border-line prose-img:rounded-xl text-fg-soft leading-relaxed text-sm sm:text-base ${className}`}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks]}
        components={{
          a: ({ href, children }) => {
            const isExternal = /^https?:\/\//i.test(href ?? "");
            return (
              <a
                href={href}
                {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              >
                {children}
              </a>
            );
          },
          img: ({ src, alt }) => (
            // Sources are arbitrary CMS URLs, so next/image's host allow-list can't apply here.
            <img src={typeof src === "string" ? src : undefined} alt={alt ?? ""} loading="lazy" decoding="async" />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
