/**
 * Reads the message from a failed admin API response. Routes return the error either as a string or
 * as { code, message }, and passing that object to the UI would crash React, so always go through here.
 */
export function getApiErrorMessage(body: unknown, fallback: string): string {
  if (!body || typeof body !== "object") {
    return fallback;
  }

  const { error, message } = body as { error?: unknown; message?: unknown };

  if (typeof error === "string" && error) {
    return error;
  }
  if (error && typeof error === "object") {
    const nested = (error as { message?: unknown }).message;
    if (typeof nested === "string" && nested) {
      return nested;
    }
  }
  return typeof message === "string" && message ? message : fallback;
}
