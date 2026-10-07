"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  MessageCircle,
  X,
  Send,
  Loader2,
  Sparkles,
  User,
  UserPlus,
  RotateCcw,
  Check,
  AlertCircle,
  ChevronDown,
} from "lucide-react";

interface Message {
  id: string;
  sender: "visitor" | "assistant";
  content: string;
  createdAt: string;
}

interface VisitorDetails {
  name: string;
  email: string;
}

const STORAGE_SESSION_KEY = "webgent_chat_session_id";
const STORAGE_VISITOR_KEY = "webgent_visitor_id";
const STORAGE_DETAILS_KEY = "webgent_visitor_details";

const QUICK_STARTERS = [
  "What services does Webgent offer?",
  "How does Webgent scope project pricing?",
  "What technologies do you use?",
  "I want to build a custom web application",
];

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [visitorId, setVisitorId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const [showDetailsForm, setShowDetailsForm] = useState(false);
  const [visitorDetails, setVisitorDetails] = useState<VisitorDetails>({ name: "", email: "" });
  const [savedDetails, setSavedDetails] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback((smooth = true) => {
    messagesEndRef.current?.scrollIntoView({
      behavior: smooth ? "smooth" : "auto",
    });
  }, []);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom(false);
      setUnreadCount(0);
    }
  }, [isOpen, scrollToBottom]);

  useEffect(() => {
    scrollToBottom(true);
  }, [messages, loading, scrollToBottom]);

  useEffect(() => {
    try {
      const storedSession = localStorage.getItem(STORAGE_SESSION_KEY);
      const storedVisitor = localStorage.getItem(STORAGE_VISITOR_KEY);
      const storedDetails = localStorage.getItem(STORAGE_DETAILS_KEY);

      if (storedSession) setSessionId(storedSession);
      if (storedVisitor) setVisitorId(storedVisitor);
      if (storedDetails) {
        const parsed = JSON.parse(storedDetails);
        setVisitorDetails(parsed);
        if (parsed.email) setSavedDetails(true);
      }
    } catch {}
  }, []);

  const initSession = useCallback(
    async (initialMsg?: string) => {
      setInitializing(true);
      setError(null);
      try {
        const res = await fetch("/api/chat/start", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            visitorId: visitorId || undefined,
            name: visitorDetails.name || undefined,
            email: visitorDetails.email || undefined,
            initialMessage: initialMsg,
          }),
        });

        if (!res.ok) {
          throw new Error("Could not initialize chat session");
        }

        const data = await res.json();
        setSessionId(data.sessionId);
        setVisitorId(data.visitorId);

        try {
          localStorage.setItem(STORAGE_SESSION_KEY, data.sessionId);
          localStorage.setItem(STORAGE_VISITOR_KEY, data.visitorId);
        } catch {}

        return data.sessionId as string;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Connection failed";
        setError(msg);
        return null;
      } finally {
        setInitializing(false);
      }
    },
    [visitorId, visitorDetails],
  );

  const handleToggleOpen = async () => {
    const nextOpen = !isOpen;
    setIsOpen(nextOpen);
    if (nextOpen && !sessionId) {
      await initSession();
    }
  };

  const handleResetSession = async () => {
    try {
      localStorage.removeItem(STORAGE_SESSION_KEY);
    } catch {}
    setSessionId(null);
    setMessages([]);
    setError(null);
    await initSession();
  };

  const handleSaveDetails = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!visitorDetails.name && !visitorDetails.email) return;

    try {
      localStorage.setItem(STORAGE_DETAILS_KEY, JSON.stringify(visitorDetails));
    } catch {}
    setSavedDetails(true);
    setShowDetailsForm(false);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const content = (textToSend || inputText).trim();
    if (!content || loading) return;

    setError(null);
    setInputText("");

    const tempVisitorMsg: Message = {
      id: `temp_${Date.now()}`,
      sender: "visitor",
      content,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempVisitorMsg]);
    setLoading(true);

    try {
      let activeSessionId = sessionId;
      if (!activeSessionId) {
        activeSessionId = await initSession(content);
        if (!activeSessionId) {
          throw new Error("Unable to establish chat connection");
        }
      }

      const res = await fetch("/api/chat/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: activeSessionId,
          message: content,
          visitorInfo:
            visitorDetails.name || visitorDetails.email
              ? {
                  name: visitorDetails.name || undefined,
                  email: visitorDetails.email || undefined,
                }
              : undefined,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to deliver message");
      }

      const json = await res.json();
      const replyMsg: Message = {
        id: `ai_${Date.now()}`,
        sender: "assistant",
        content: json.message,
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, replyMsg]);
      if (!isOpen) {
        setUnreadCount((c) => c + 1);
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Error sending message";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      <div className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-50 flex items-center gap-2.5 sm:gap-3">
        {!isOpen && (
          <button
            type="button"
            onClick={handleToggleOpen}
            className="hidden md:flex items-center gap-2 px-3.5 py-2 rounded-full bg-[#141414] hover:bg-[#1C1C1C] text-xs font-medium text-[#B5B5B3] hover:text-[#F5F5F3] border border-white/[0.10] shadow-lg backdrop-blur-md transition-all group"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-white/70" />
            <span>Chat with Webgent AI</span>
          </button>
        )}

        <button
          type="button"
          id="webgent-chat-widget-button"
          onClick={handleToggleOpen}
          aria-label={isOpen ? "Close chat" : "Open chat concierge"}
          className={`relative p-3 sm:p-3.5 rounded-full transition-all duration-200 flex items-center justify-center border ${
            isOpen
              ? "bg-[#181818] text-[#F5F5F3] hover:bg-[#222222] border-white/[0.14]"
              : "bg-[#141414] text-white hover:bg-[#1E1E1E] border-white/[0.12] shadow-xl hover:border-white/[0.22]"
          }`}
        >
          {isOpen ? (
            <X className="w-5 h-5 transition-transform duration-200" />
          ) : (
            <>
              <MessageCircle className="w-5 h-5 transition-transform duration-200" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#E8E8E6] text-[#080808] text-[9px] font-bold flex items-center justify-center shadow-md">
                  {unreadCount}
                </span>
              )}
            </>
          )}
        </button>
      </div>

      {isOpen && (
        <div
          id="webgent-chat-window"
          className="fixed bottom-16 sm:bottom-24 right-2 sm:right-6 z-50 w-[calc(100vw-1rem)] sm:w-[400px] h-[520px] sm:h-[560px] max-h-[calc(100vh-5rem)] rounded-xl bg-[#0D0D0D] border border-white/[0.10] shadow-2xl backdrop-blur-xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-200"
        >
          <div className="p-4 bg-[#111111] border-b border-white/[0.08] flex items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-9 h-9 rounded-lg bg-[#181818] border border-white/[0.10] flex items-center justify-center text-[#F5F5F3]">
                  <Sparkles className="w-4 h-4 text-[#C5C5C3]" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-white/80 border-2 border-[#0D0D0D]" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[#F5F5F3] flex items-center gap-1.5">
                  <span>Webgent AI</span>
                  <span className="px-1.5 py-0.5 rounded-md bg-white/[0.05] text-[#909090] border border-white/[0.08] text-[10px] font-medium">
                    Concierge
                  </span>
                </h3>
                <p className="text-[11px] text-[#909090]">Engineering & Solutions Assistant</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setShowDetailsForm((prev) => !prev)}
                title={savedDetails ? "Contact info attached" : "Add your contact details"}
                className={`p-2 rounded-lg transition-colors ${
                  savedDetails
                    ? "bg-white/[0.08] text-[#F5F5F3] border border-white/[0.12]"
                    : "text-[#8A8A8A] hover:text-[#F5F5F3] hover:bg-white/[0.04]"
                }`}
              >
                {savedDetails ? <Check className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
              </button>

              <button
                type="button"
                onClick={handleResetSession}
                title="Restart conversation"
                className="p-2 rounded-lg text-[#8A8A8A] hover:text-[#F5F5F3] hover:bg-white/[0.04] transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                title="Minimize chat"
                className="p-2 rounded-lg text-[#8A8A8A] hover:text-[#F5F5F3] hover:bg-white/[0.04] transition-colors"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </div>

          {showDetailsForm && (
            <div className="p-3.5 bg-[#141414] border-b border-white/[0.08] text-xs shrink-0">
              <form onSubmit={handleSaveDetails} className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-[#E5E5E3] flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-[#A0A0A0]" />
                    <span>Follow-up Contact Details (Optional)</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowDetailsForm(false)}
                    className="text-[#8A8A8A] hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-[11px] text-[#909090]">
                  Share your info so our engineering leads can send proposals or project notes.
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={visitorDetails.name}
                    onChange={(e) =>
                      setVisitorDetails((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="Your name"
                    className="px-2.5 py-1.5 rounded-lg bg-[#080808] border border-white/[0.10] text-[#F5F5F3] placeholder-[#666666] focus:outline-none focus:border-white/20 text-xs"
                  />
                  <input
                    type="email"
                    value={visitorDetails.email}
                    onChange={(e) =>
                      setVisitorDetails((prev) => ({ ...prev, email: e.target.value }))
                    }
                    placeholder="Your email"
                    className="px-2.5 py-1.5 rounded-lg bg-[#080808] border border-white/[0.10] text-[#F5F5F3] placeholder-[#666666] focus:outline-none focus:border-white/20 text-xs"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="submit"
                    className="px-3 py-1 rounded-lg bg-[#E8E8E6] hover:bg-white text-[#080808] font-medium text-[11px] transition-colors"
                  >
                    Save Details
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div className="flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-[#181818] text-[#C5C5C3] border border-white/[0.10] flex items-center justify-center shrink-0 mt-0.5">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <div className="max-w-[85%] rounded-lg bg-[#141414] border border-white/[0.07] p-3 text-xs text-[#E5E5E3] leading-relaxed space-y-2">
                <p>
                  Hello. I am the <strong>Webgent AI Concierge</strong>.
                </p>
                <p className="text-[#B5B5B3]">
                  We engineer high-performance web applications, cloud infrastructure, and modern
                  digital platforms.
                </p>
                <p className="text-[11px] text-[#909090]">
                  How can we assist you today? You can select a technical topic below or type your
                  inquiry.
                </p>
              </div>
            </div>

            {messages.length === 0 && (
              <div className="pt-2 pl-9 space-y-1.5">
                <span className="text-[10px] uppercase font-mono tracking-wider text-[#666666]">
                  Suggested Topics
                </span>
                <div className="flex flex-col gap-1.5">
                  {QUICK_STARTERS.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => handleSendMessage(prompt)}
                      className="text-left px-3 py-2 rounded-lg bg-[#121212] hover:bg-[#1A1A1A] text-xs text-[#B5B5B3] hover:text-[#F5F5F3] border border-white/[0.06] transition-colors"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg) => {
              const isUser = msg.sender === "visitor";
              const timeString = new Date(msg.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              });

              return (
                <div
                  key={msg.id}
                  className={`flex items-end gap-2.5 ${isUser ? "flex-row-reverse" : "flex-row"}`}
                >
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs ${
                      isUser
                        ? "bg-[#E8E8E6] text-[#080808]"
                        : "bg-[#181818] text-[#C5C5C3] border border-white/[0.10]"
                    }`}
                  >
                    {isUser ? (
                      <User className="w-3.5 h-3.5" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5" />
                    )}
                  </div>

                  <div
                    className={`max-w-[85%] rounded-lg p-3 text-xs leading-relaxed ${
                      isUser
                        ? "bg-[#222222] border border-white/[0.10] text-[#F5F5F3]"
                        : "bg-[#141414] border border-white/[0.07] text-[#E5E5E3]"
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                    <span
                      className={`block text-[9px] mt-1 text-right ${
                        isUser ? "text-[#909090]" : "text-[#666666]"
                      }`}
                    >
                      {timeString}
                    </span>
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#181818] text-[#C5C5C3] border border-white/[0.10] flex items-center justify-center shrink-0">
                  <Sparkles className="w-3.5 h-3.5 animate-spin" />
                </div>
                <div className="rounded-lg bg-[#141414] border border-white/[0.07] p-2.5 text-xs text-[#909090] flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce" />
                  </div>
                  <span className="text-[11px]">Processing...</span>
                </div>
              </div>
            )}

            {error && (
              <div className="p-3 rounded-lg bg-white/[0.03] border border-white/[0.12] text-[#D0D0CE] text-xs flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-[#E5E5E3]" />
                  <span>{error}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleSendMessage()}
                  className="px-2 py-1 rounded bg-white/[0.10] hover:bg-white/[0.16] font-medium text-[11px] text-white"
                >
                  Retry
                </button>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="p-3 bg-[#111111] border-t border-white/[0.08] shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-end gap-2"
            >
              <textarea
                ref={inputRef}
                rows={1}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Inquire regarding Webgent architecture..."
                disabled={loading || initializing}
                className="flex-1 p-2.5 max-h-28 rounded-lg bg-[#080808] border border-white/[0.10] text-xs text-[#F5F5F3] placeholder-[#666666] focus:outline-none focus:border-white/20 transition-colors resize-none disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!inputText.trim() || loading || initializing}
                className="p-2.5 rounded-lg bg-[#E8E8E6] hover:bg-white disabled:opacity-30 text-[#080808] transition-colors shrink-0"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </form>

            <div className="flex items-center justify-between text-[10px] text-[#666666] mt-2 px-1">
              <span>Press Enter to dispatch</span>
              <button
                type="button"
                onClick={() => setShowDetailsForm((prev) => !prev)}
                className="hover:text-[#A0A0A0] transition-colors"
              >
                {savedDetails ? "Contact info attached" : "Leave contact details"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
