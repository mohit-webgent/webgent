const OPEN_CHAT_EVENT = "webgent:open-chat";

export interface OpenChatDetail {
  /** Sent to the consultant as soon as the chat opens. */
  message?: string;
}

/** Opens the AI consultant from anywhere on the site. */
export function openChat(message?: string) {
  window.dispatchEvent(new CustomEvent<OpenChatDetail>(OPEN_CHAT_EVENT, { detail: { message } }));
}

export function onOpenChat(handler: (detail: OpenChatDetail) => void) {
  const listener = (event: Event) => handler((event as CustomEvent<OpenChatDetail>).detail ?? {});
  window.addEventListener(OPEN_CHAT_EVENT, listener);
  return () => window.removeEventListener(OPEN_CHAT_EVENT, listener);
}
