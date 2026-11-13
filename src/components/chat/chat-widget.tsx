"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  ArrowUp,
  Check,
  Copy,
  Loader2,
  RotateCcw,
  Sparkles,
  UserPlus,
  X,
} from "lucide-react";
import { Turnstile, TurnstileRef } from "@/components/ui/turnstile";
import { EstimateCard } from "./estimate-card";
import { FormattedMessage } from "./formatted-message";
import { WhatsAppIcon } from "@/components/ui/whatsapp-icon";
import { buildWhatsAppUrl } from "@/config/whatsapp";
import { onOpenChat } from "@/lib/chat-events";
import type { ProjectEstimateResult } from "@/lib/services/ai-consultant/calculator";

interface Message {
  id: string;
  sender: "visitor" | "assistant" | "system";
  content: string;
  createdAt: string;
  estimate?: ProjectEstimateResult;
}

interface VisitorDetails {
  name: string;
  email: string;
}

const STORAGE_SESSION_KEY = "webgent_chat_session_id";
const STORAGE_VISITOR_KEY = "webgent_visitor_id";
const STORAGE_DETAILS_KEY = "webgent_visitor_details";
const STORAGE_MESSAGES_KEY = "webgent_chat_messages";

const IS_PRODUCTION = process.env.NODE_ENV === "production";
const DEV_TOKEN = "dev-mock-turnstile-token";
// Long enough for a visitor who is asked to complete a Cloudflare challenge by hand.
const VERIFY_TIMEOUT_MS = 30_000;

const QUICK_STARTERS = [
  "I want a website for my gym. What features and pages do I need, and how much will it cost?",
  "How much does a custom online store with Razorpay and a cart cost?",
  "Can you build an employee portal with attendance and logins?",
  "What can I get within a ₹20,000 budget?",
];

/** The server no longer accepts this session, so the conversation has to move to a new one. */
class SessionGoneError extends Error {}

function readStorage(key: string) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(key: string, value: string | null) {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {
    // Private browsing can block storage. The chat still works for this page view.
  }
}

function BrandMark({ size = "h-8 w-8 text-sm" }: { size?: string }) {
  return (
    <span aria-hidden="true" className={`flex shrink-0 items-center justify-center rounded-lg bg-accent font-display font-bold text-accent-fg ${size}`}>
      W
    </span>
  );
}

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [failedMessage, setFailedMessage] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showDetails, setShowDetails] = useState(false);
  const [details, setDetails] = useState<VisitorDetails>({ name: "", email: "" });
  const [detailsError, setDetailsError] = useState<string | null>(null);
  const [savedDetails, setSavedDetails] = useState(false);

  // Refs hold what async sends must read at the moment they run, not when they were scheduled.
  const sessionIdRef = useRef<string | null>(null);
  const visitorIdRef = useRef<string | null>(null);
  const detailsRef = useRef<VisitorDetails>({ name: "", email: "" });
  const loadingRef = useRef(false);
  const isOpenRef = useRef(false);
  const tokenRef = useRef<string>(IS_PRODUCTION ? "" : DEV_TOKEN);
  const tokenWaiters = useRef<Array<(token: string) => void>>([]);
  const turnstileRef = useRef<TurnstileRef>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    isOpenRef.current = isOpen;
    window.dispatchEvent(new CustomEvent("webgent:chat-widget-toggle", { detail: { isOpen } }));
    if (!isOpen) return;
    setHasOpened(true);
    setUnreadCount(0);
    const timer = setTimeout(() => inputRef.current?.focus(), 150);
    return () => clearTimeout(timer);
  }, [isOpen]);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (scroller) scroller.scrollTo({ top: scroller.scrollHeight, behavior: "smooth" });
  }, [messages, loading, error, isOpen]);

  useEffect(() => {
    sessionIdRef.current = readStorage(STORAGE_SESSION_KEY);
    visitorIdRef.current = readStorage(STORAGE_VISITOR_KEY);
    try {
      const storedDetails = readStorage(STORAGE_DETAILS_KEY);
      if (storedDetails) {
        const parsed = JSON.parse(storedDetails) as VisitorDetails;
        detailsRef.current = parsed;
        setDetails(parsed);
        setSavedDetails(Boolean(parsed.email));
      }
      const storedMessages = readStorage(STORAGE_MESSAGES_KEY);
      if (storedMessages) {
        const parsed = JSON.parse(storedMessages);
        if (Array.isArray(parsed)) setMessages(parsed);
      }
    } catch {
      writeStorage(STORAGE_MESSAGES_KEY, null);
    }
  }, []);

  useEffect(() => {
    if (messages.length > 0) writeStorage(STORAGE_MESSAGES_KEY, JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen]);

  const handleToken = useCallback((token: string) => {
    tokenRef.current = token;
    tokenWaiters.current.splice(0).forEach((resolve) => resolve(token));
  }, []);

  /** Verification runs quietly in the background, so sending never waits behind a separate form. */
  const waitForToken = useCallback(async () => {
    if (tokenRef.current) return tokenRef.current;
    setStatusText("Verifying you're human…");
    try {
      return await new Promise<string>((resolve, reject) => {
        const timer = setTimeout(
          () => reject(new Error("Security verification is taking too long. Please try again.")),
          VERIFY_TIMEOUT_MS,
        );
        tokenWaiters.current.push((token) => {
          clearTimeout(timer);
          resolve(token);
        });
      });
    } finally {
      setStatusText(null);
    }
  }, []);

  const clearSession = () => {
    sessionIdRef.current = null;
    writeStorage(STORAGE_SESSION_KEY, null);
  };

  const startSession = useCallback(async () => {
    const token = await waitForToken();
    const response = await fetch("/api/chat/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        visitorId: visitorIdRef.current || undefined,
        name: detailsRef.current.name.trim() || undefined,
        email: detailsRef.current.email.trim() || undefined,
        turnstileToken: token,
      }),
    });

    // A Turnstile token is single use, so a fresh one is requested whatever the outcome.
    if (IS_PRODUCTION) {
      tokenRef.current = "";
      turnstileRef.current?.reset();
    }

    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || "Could not start the conversation.");

    sessionIdRef.current = data.sessionId;
    visitorIdRef.current = data.visitorId;
    writeStorage(STORAGE_SESSION_KEY, data.sessionId);
    writeStorage(STORAGE_VISITOR_KEY, data.visitorId);
    return data.sessionId as string;
  }, [waitForToken]);

  const postMessage = useCallback(async (sessionId: string, content: string) => {
    const { name, email } = detailsRef.current;
    const response = await fetch("/api/chat/message", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId,
        message: content,
        visitorInfo: name || email ? { name: name || undefined, email: email || undefined } : undefined,
      }),
    });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      if (data.code === "SESSION_NOT_FOUND" || data.code === "SESSION_CLOSED") throw new SessionGoneError();
      throw new Error(data.error || "Your message couldn't be delivered.");
    }
    return data;
  }, []);

  const deliver = useCallback(
    async (content: string) => {
      loadingRef.current = true;
      setLoading(true);
      setError(null);
      setFailedMessage(null);
      setSuggestions([]);

      try {
        let reply;
        try {
          reply = await postMessage(sessionIdRef.current ?? (await startSession()), content);
        } catch (sendError) {
          if (!(sendError instanceof SessionGoneError)) throw sendError;

          // The old conversation ended on the server. Carry on in a new one without bothering the visitor.
          clearSession();
          setMessages((previous) => [
            ...previous.filter((message) => message.sender !== "system"),
            { id: `system_${Date.now()}`, sender: "system", content: "Earlier conversation ended. Continuing in a new one.", createdAt: new Date().toISOString() },
          ]);
          reply = await postMessage(await startSession(), content);
        }

        setMessages((previous) => [
          ...previous,
          {
            id: `ai_${Date.now()}`,
            sender: "assistant",
            content: reply.message,
            createdAt: new Date().toISOString(),
            estimate: reply.estimate,
          },
        ]);
        setSuggestions(Array.isArray(reply.followUpSuggestions) ? reply.followUpSuggestions : []);
        if (!isOpenRef.current) setUnreadCount((count) => count + 1);
      } catch (sendError) {
        setFailedMessage(content);
        setError(sendError instanceof Error && !(sendError instanceof SessionGoneError) ? sendError.message : "Your message couldn't be delivered.");
      } finally {
        loadingRef.current = false;
        setLoading(false);
      }
    },
    [postMessage, startSession],
  );

  const send = useCallback(
    (text?: string) => {
      const content = (text ?? inputRef.current?.value ?? "").trim();
      if (!content || loadingRef.current) return;

      setInputText("");
      setMessages((previous) => [
        ...previous,
        { id: `visitor_${Date.now()}`, sender: "visitor", content, createdAt: new Date().toISOString() },
      ]);
      void deliver(content);
    },
    [deliver],
  );

  useEffect(
    () =>
      onOpenChat(({ message }) => {
        setIsOpen(true);
        if (message) send(message);
      }),
    [send],
  );

  const handleReset = () => {
    clearSession();
    writeStorage(STORAGE_MESSAGES_KEY, null);
    setMessages([]);
    setError(null);
    setFailedMessage(null);
    setSuggestions([]);
    setShowDetails(false);
    inputRef.current?.focus();
  };

  const handleSaveDetails = (event: React.FormEvent) => {
    event.preventDefault();
    const name = details.name.trim();
    const email = details.email.trim();

    if (!name && !email) {
      setDetailsError("Please enter your name or email.");
      return;
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setDetailsError("Please enter a valid email address.");
      return;
    }

    const next = { name, email };
    detailsRef.current = next;
    writeStorage(STORAGE_DETAILS_KEY, JSON.stringify(next));
    setSavedDetails(Boolean(email));
    setDetailsError(null);
    setShowDetails(false);

    // The details travel with this message, which is what records them against the project.
    if (messages.some((message) => message.sender === "visitor")) {
      send("I'd like to prepare a project inquiry with the scope and estimate we discussed.");
    }
  };

  const handleCopy = (id: string, text: string) => {
    void navigator.clipboard?.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <>
      {/* Loads when the chat is first opened. Invisible unless Cloudflare asks for an interaction. */}
      {IS_PRODUCTION && hasOpened && (
        <div className={isOpen ? "fixed bottom-[8.5rem] right-6 z-[61]" : "pointer-events-none fixed bottom-0 right-0 z-0 opacity-0"}>
          <Turnstile
            id="chat-turnstile"
            ref={turnstileRef}
            size="compact"
            appearance="interaction-only"
            onVerify={handleToken}
            onExpire={() => {
              tokenRef.current = "";
            }}
            onError={() => {
              tokenRef.current = "";
            }}
          />
        </div>
      )}

      {!isOpen && (
        <button
          type="button"
          id="webgent-chat-widget-button"
          onClick={() => setIsOpen(true)}
          aria-label="Open the Webgent AI consultant"
          className="group fixed bottom-4 right-3 z-50 flex h-11 items-center gap-2 rounded-xl bg-accent pl-3 pr-3.5 text-sm font-semibold text-accent-fg shadow-lift transition-all duration-300 ease-expo-out hover:-translate-y-0.5 hover:bg-accent-hover sm:bottom-6 sm:right-6"
        >
          <Sparkles className="h-4 w-4" />
          <span>Ask AI</span>
          {unreadCount > 0 && (
            <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-fg text-[0.6875rem] font-semibold text-canvas">
              {unreadCount}
            </span>
          )}
        </button>
      )}

      {isOpen && (
        <div
          id="webgent-chat-window"
          role="dialog"
          aria-label="Webgent AI consultant"
          className="anim-pop fixed inset-0 z-[60] flex flex-col overflow-hidden bg-surface textured sm:inset-auto sm:bottom-6 sm:right-6 sm:h-[38rem] sm:max-h-[calc(100svh-3rem)] sm:w-[25.5rem] sm:rounded-2xl sm:border sm:border-line-strong sm:shadow-lift"
        >
          <header className="flex shrink-0 items-center justify-between gap-3 border-b border-line bg-surface-2 px-3.5 py-3">
            <div className="flex min-w-0 items-center gap-2.5">
              <BrandMark />
              <div className="min-w-0">
                <h2 className="truncate font-display text-sm font-semibold">Webgent AI consultant</h2>
                <p className="flex items-center gap-1.5 truncate text-xs text-fg-muted" aria-live="polite">
                  <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${loading ? "animate-pulse bg-accent" : "bg-success"}`} />
                  {statusText || (loading ? "Working on it…" : "Scopes and prices your project")}
                </p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-0.5 text-fg-muted">
              <a
                href={buildWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Chat with Mohit on WhatsApp (opens in a new tab)"
                title="Talk to Mohit on WhatsApp"
                className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-white/[0.07] hover:text-whatsapp"
              >
                <WhatsAppIcon className="h-4 w-4 fill-current" />
              </a>
              <button
                type="button"
                onClick={() => setShowDetails((open) => !open)}
                aria-expanded={showDetails}
                aria-label={savedDetails ? "Edit your contact details" : "Add your contact details"}
                title={savedDetails ? "Contact details added" : "Add your contact details"}
                className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-white/[0.07] ${savedDetails ? "text-success" : "hover:text-fg"}`}
              >
                {savedDetails ? <Check className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
              </button>
              <button
                type="button"
                onClick={handleReset}
                aria-label="Start a new conversation"
                title="Start a new conversation"
                className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-white/[0.07] hover:text-fg"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Close chat"
                title="Close"
                className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-white/[0.07] hover:text-fg"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </header>

          {showDetails && (
            <form noValidate onSubmit={handleSaveDetails} className="anim-pop shrink-0 space-y-2.5 border-b border-line bg-surface-2 p-3.5">
              <p className="text-[0.8125rem] leading-snug text-fg-soft">Leave your details and Mohit will follow up personally with a proposal.</p>
              <div className="grid grid-cols-2 gap-2">
                <input
                  aria-label="Your name"
                  value={details.name}
                  onChange={(event) => setDetails((previous) => ({ ...previous, name: event.target.value }))}
                  placeholder="Your name"
                  autoComplete="name"
                  className="field !min-h-9 !px-3 !py-1.5 !text-[0.8125rem]"
                />
                <input
                  aria-label="Your email"
                  type="email"
                  value={details.email}
                  onChange={(event) => setDetails((previous) => ({ ...previous, email: event.target.value }))}
                  placeholder="you@email.com"
                  autoComplete="email"
                  className="field !min-h-9 !px-3 !py-1.5 !text-[0.8125rem]"
                />
              </div>
              {detailsError && (
                <p role="alert" className="flex items-center gap-1.5 text-xs text-red-300">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  {detailsError}
                </p>
              )}
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowDetails(false)} className="btn btn-sm btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={loading} className="btn btn-sm btn-light">
                  Save details
                </button>
              </div>
            </form>
          )}

          <div ref={scrollerRef} data-lenis-prevent className="modal-scrollbar flex-1 space-y-3 overflow-y-auto overscroll-contain p-3.5">
            {messages.length === 0 && (
              <div className="anim-pop space-y-3">
                <div className="rounded-xl rounded-tl-sm bg-surface-2 p-3.5 text-[0.875rem] leading-relaxed text-fg-soft">
                  <p className="font-medium text-fg">Tell me what you want to build.</p>
                  <p className="mt-1">I&apos;ll suggest the pages and features, and give you a clear price and timeline in seconds.</p>
                </div>
                <div className="space-y-1.5">
                  {QUICK_STARTERS.map((prompt, index) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => send(prompt)}
                      style={{ "--i": index + 1 } as React.CSSProperties}
                      className="anim-pop group flex w-full items-center justify-between gap-3 rounded-lg border border-line px-3 py-2 text-left text-[0.8125rem] leading-snug text-fg-soft transition-colors hover:border-line-strong hover:bg-surface-2 hover:text-fg"
                    >
                      <span>{prompt}</span>
                      <ArrowRight className="h-3.5 w-3.5 shrink-0 text-fg-muted transition-transform duration-300 group-hover:translate-x-0.5 group-hover:text-accent" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((message) => {
              if (message.sender === "system") {
                return (
                  <p key={message.id} className="anim-pop py-1 text-center text-xs text-fg-muted">
                    {message.content}
                  </p>
                );
              }

              const isVisitor = message.sender === "visitor";
              return (
                <div key={message.id} className={`anim-pop flex ${isVisitor ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`group/message relative min-w-0 rounded-xl px-3.5 py-2.5 text-[0.875rem] leading-relaxed ${
                      isVisitor ? "max-w-[85%] rounded-tr-sm bg-accent text-accent-fg" : "w-full rounded-tl-sm bg-surface-2 text-fg-soft"
                    }`}
                  >
                    <FormattedMessage content={message.content} isUser={isVisitor} />
                    {message.estimate && <EstimateCard estimate={message.estimate} onInquireNow={() => setShowDetails(true)} />}
                    {!isVisitor && (
                      <button
                        type="button"
                        onClick={() => handleCopy(message.id, message.content)}
                        aria-label="Copy message"
                        className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-md bg-surface-3 text-fg-muted opacity-0 transition-opacity hover:text-fg focus-visible:opacity-100 group-hover/message:opacity-100"
                      >
                        {copiedId === message.id ? <Check className="h-3 w-3 text-success" /> : <Copy className="h-3 w-3" />}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="anim-pop flex w-fit items-center gap-1.5 rounded-xl rounded-tl-sm bg-surface-2 px-3.5 py-3" aria-label="The consultant is typing">
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-fg-muted [animation-delay:-0.3s]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-fg-muted [animation-delay:-0.15s]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-fg-muted" />
              </div>
            )}

            {error && (
              <div role="alert" className="anim-pop space-y-2.5 rounded-lg border border-red-400/25 bg-red-400/[0.07] p-3 text-[0.8125rem] text-red-200">
                <p className="flex items-start gap-2">
                  <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  {error}
                </p>
                <div className="flex flex-wrap gap-2 pl-5">
                  {failedMessage && (
                    <button type="button" onClick={() => void deliver(failedMessage)} className="btn btn-sm btn-secondary">
                      Retry
                    </button>
                  )}
                  <a href={buildWhatsAppUrl()} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-secondary">
                    <WhatsAppIcon className="h-3.5 w-3.5 fill-current text-whatsapp" />
                    Message Mohit
                  </a>
                </div>
              </div>
            )}
          </div>

          {suggestions.length > 0 && !loading && (
            <div className="scrollbar-none flex shrink-0 gap-1.5 overflow-x-auto border-t border-line px-3 py-2" data-lenis-prevent>
              {suggestions.map((suggestion, index) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => send(suggestion)}
                  style={{ "--i": index } as React.CSSProperties}
                  className="anim-pop chip shrink-0 whitespace-nowrap transition-colors hover:border-line-strong hover:text-fg"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}

          <form
            onSubmit={(event) => {
              event.preventDefault();
              send();
            }}
            className="shrink-0 border-t border-line p-2.5"
          >
            <div className="flex items-end gap-2 rounded-xl border border-line-strong bg-surface-2 p-1.5 transition-colors focus-within:border-accent/70">
              <textarea
                ref={inputRef}
                rows={1}
                value={inputText}
                maxLength={1000}
                aria-label="Your message"
                onChange={(event) => setInputText(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    send();
                  }
                }}
                placeholder="Describe your project…"
                className="max-h-24 min-w-0 flex-1 resize-none bg-transparent px-2 py-1.5 text-[0.875rem] text-fg outline-none [field-sizing:content]"
              />
              <button
                type="submit"
                aria-label="Send message"
                disabled={!inputText.trim() || loading}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-fg transition-colors hover:bg-accent-hover disabled:bg-surface-3 disabled:text-fg-muted"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowUp className="h-4 w-4" />}
              </button>
            </div>
            <p className="mt-1.5 px-1 text-[0.6875rem] text-fg-muted">AI estimates are a starting point. Mohit confirms every final quote.</p>
          </form>
        </div>
      )}
    </>
  );
}
