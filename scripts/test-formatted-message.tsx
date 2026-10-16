import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { FormattedMessage } from "../src/components/chat/formatted-message";

const sampleMarkdown = `**Webgent** is an elite digital engineering agency.

### Core Services
- High-performance web applications with \`Next.js 14\`
- Fast stores with [Edayaa Case Study](/work/edayaa)

1. Milestone 50/50
2. 100% Code ownership`;

const html = renderToStaticMarkup(React.createElement(FormattedMessage, { content: sampleMarkdown }));
console.log("RENDERED HTML:\n" + html);

const assertions = [
  { tag: "<strong", label: "Bold tag" },
  { tag: "<ul", label: "Unordered list" },
  { tag: "<li", label: "List item" },
  { tag: "<h4", label: "Header h4" },
  { tag: "<code", label: "Inline code" },
  { tag: "<a", label: "Link anchor" },
];

for (const a of assertions) {
  if (!html.includes(a.tag)) {
    console.error(`❌ Missing ${a.label} in output`);
    process.exit(1);
  }
}

console.log("✅ All Markdown components successfully rendered to proper HTML tags!");
