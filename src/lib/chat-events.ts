const OPEN_CHAT_EVENT = "webgent:open-chat";

export interface OpenChatDetail {
  /** Sent to the consultant as soon as the chat opens. */
  message?: string;
}

let openChatListeners = 0;

/**
 * Opens the AI consultant from anywhere on the site. When the chat is switched off in
 * Admin → Settings there is no widget to open, so the visitor goes to the contact page instead.
 */
export function openChat(message?: string) {
  if (openChatListeners === 0) {
    window.location.assign(new URL("/contact", window.location.origin).href);
    return;
  }
  window.dispatchEvent(new CustomEvent<OpenChatDetail>(OPEN_CHAT_EVENT, { detail: { message } }));
}

export function onOpenChat(handler: (detail: OpenChatDetail) => void) {
  const listener = (event: Event) => handler((event as CustomEvent<OpenChatDetail>).detail ?? {});
  window.addEventListener(OPEN_CHAT_EVENT, listener);
  openChatListeners += 1;
  return () => {
    window.removeEventListener(OPEN_CHAT_EVENT, listener);
    openChatListeners -= 1;
  };
}
