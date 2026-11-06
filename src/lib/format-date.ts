const IST = "Asia/Kolkata";

/**
 * Fixed locale and time zone, so the server (UTC on Vercel) and the browser render the same text.
 * Without this, React reports a hydration mismatch.
 */
export function formatDate(value: string | number | Date): string {
  return new Date(value).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: IST });
}

export function formatDateTime(value: string | number | Date): string {
  return new Date(value).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: IST,
  });
}
