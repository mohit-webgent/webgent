import { NextResponse } from "next/server";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const PAGE_STYLES = `
  body { margin: 0; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 16px; box-sizing: border-box; background: #040405; color: #f0eee8; font-family: system-ui, -apple-system, "Segoe UI", sans-serif; }
  main { width: 100%; max-width: 420px; padding: 32px; box-sizing: border-box; text-align: center; background: #0c0c0d; border: 1px solid rgba(255,255,255,.1); border-radius: 16px; }
  h1 { margin: 0 0 12px; font-size: 24px; }
  p { margin: 0 0 24px; color: #a0a0a0; font-size: 14px; line-height: 1.6; }
  a, button { display: block; width: 100%; padding: 14px; box-sizing: border-box; border: 0; border-radius: 10px; font: 600 14px system-ui, sans-serif; text-decoration: none; cursor: pointer; background: #f26a1f; color: #140802; }
  a.secondary { margin-top: 10px; background: transparent; color: #a0a0a0; }
`;

function renderPage(title: string, body: string, status: number) {
  const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="robots" content="noindex" />
    <title>${escapeHtml(title)} — Webgent</title>
    <style>${PAGE_STYLES}</style>
  </head>
  <body><main>${body}</main></body>
</html>`;

  return new NextResponse(html, {
    status,
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" },
  });
}

/** Shows the outcome of a confirm or unsubscribe request. */
export function renderStatusPage(title: string, message: string, isSuccess: boolean) {
  return renderPage(
    title,
    `<h1>${escapeHtml(title)}</h1><p>${escapeHtml(message)}</p><a href="/">Return to homepage</a>`,
    isSuccess ? 200 : 400,
  );
}

/**
 * Asks the visitor to press a button. Email security scanners open every link in a message, so
 * opening a link must never change anything. Only the POST from this form does.
 */
export function renderActionPage({
  title,
  message,
  action,
  buttonLabel,
}: {
  title: string;
  message: string;
  action: string;
  buttonLabel: string;
}) {
  return renderPage(
    title,
    `<h1>${escapeHtml(title)}</h1><p>${escapeHtml(message)}</p><form method="post" action="${escapeHtml(action)}"><button type="submit">${escapeHtml(buttonLabel)}</button></form><a class="secondary" href="/">Cancel</a>`,
    200,
  );
}
