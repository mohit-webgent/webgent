"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
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
  ArrowRight,
  Bot,
  Copy,
  CheckCheck,
} from "lucide-react";
import { Turnstile, TurnstileRef } from "@/components/ui/turnstile";

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
  "How does Webgent calculate project pricing?",
  "What is your recommended tech stack for modern web apps?",
  "How can I book a technical discovery call?",
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
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [showDetailsForm, setShowDetailsForm] = useState(false);
  const [visitorDetails, setVisitorDetails] = useState<VisitorDetails>({ name: "", email: "" });
  const [savedDetails, setSavedDetails] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");
  const turnstileRef = useRef<TurnstileRef>(null);

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
      setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
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
    async (initialMsg?: string, tokenOverride?: string) => {
      setInitializing(true);
      setError(null);
      const activeToken = tokenOverride || turnstileToken;
      try {
        const res = await fetch("/api/chat/start", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            visitorId: visitorId || undefined,
            name: visitorDetails.name || undefined,
            email: visitorDetails.email || undefined,
            initialMessage: initialMsg,
            turnstileToken: activeToken || undefined,
          }),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          turnstileRef.current?.reset();
          setTurnstileToken("");
          throw new Error(errData.error || "Could not initialize chat session");
        }

        const data = await res.json();
        setSessionId(data.sessionId);
        setVisitorId(data.visitorId);
        turnstileRef.current?.reset();
        setTurnstileToken("");

        try {
          localStorage.setItem(STORAGE_SESSION_KEY, data.sessionId);
          localStorage.setItem(STORAGE_VISITOR_KEY, data.visitorId);
        } catch {}

        return data.sessionId as string;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Connection failed";
        setError(msg);
        turnstileRef.current?.reset();
        setTurnstileToken("");
        return null;
      } finally {
        setInitializing(false);
      }
    },
    [visitorId, visitorDetails, turnstileToken],
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

  const handleSaveDetails = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!visitorDetails.name && !visitorDetails.email) return;

    try {
      localStorage.setItem(STORAGE_DETAILS_KEY, JSON.stringify(visitorDetails));
    } catch {}
    setSavedDetails(true);

    if (!sessionId) {
      await initSession(undefined, turnstileToken);
    }
    setShowDetailsForm(false);
  };

  const handleCopyMessage = (id: string, text: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
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
      {/* =================================================================== */}
      {/* FLOATING LAUNCHER BUTTON                                            */}
      {/* =================================================================== */}
      <div className="fixed bottom-4 sm:bottom-6 right-3 sm:right-6 z-50 flex items-center gap-2.5 sm:gap-3">
        {!isOpen && (
          <button
            type="button"
            onClick={handleToggleOpen}
            className="hidden md:flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-[#0D0E12]/90 hover:bg-[#151720] text-xs font-mono tracking-wider uppercase text-[#E5E5E3] hover:text-white border border-white/[0.14] hover:border-white/[0.28] shadow-[0_8px_30px_rgba(0,0,0,0.6)] backdrop-blur-xl transition-all group"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-[11px] font-semibold">AI Concierge</span>
            <Sparkles className="w-3.5 h-3.5 text-emerald-400 transition-transform group-hover:rotate-12" />
          </button>
        )}

        <button
          type="button"
          id="webgent-chat-widget-button"
          onClick={handleToggleOpen}
          aria-label={isOpen ? "Close chat" : "Open Webgent AI Concierge"}
          className={`relative w-12 h-12 sm:w-13 sm:h-13 rounded-2xl transition-all duration-300 flex items-center justify-center border shadow-2xl cursor-pointer ${
            isOpen
              ? "bg-[#14151B] text-[#F5F5F3] hover:bg-[#1E2028] border-white/[0.2] rotate-90"
              : "bg-gradient-to-br from-[#12131A] via-[#0C0D12] to-[#08080C] text-white hover:border-white/[0.3] border-white/[0.15] hover:scale-105 active:scale-95"
          }`}
        >
          {isOpen ? (
            <X className="w-5 h-5 transition-transform duration-200" />
          ) : (
            <>
              <div className="relative">
                <Bot className="w-5 h-5 sm:w-5.5 sm:h-5.5 text-white" />
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]" />
              </div>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-emerald-400 text-black text-[10px] font-bold flex items-center justify-center shadow-lg animate-pulse">
                  {unreadCount}
                </span>
              )}
            </>
          )}
        </button>
      </div>

      {/* =================================================================== */}
      {/* ULTRA-PREMIUM CHAT WINDOW                                           */}
      {/* Responsive: full height drawer on mobile, floating card on desktop  */}
      {/* =================================================================== */}
      {isOpen && (
        <div
          id="webgent-chat-window"
          role="dialog"
          aria-label="Webgent AI Concierge"
          className="fixed inset-x-2 bottom-2 sm:inset-x-auto sm:right-6 sm:bottom-22 z-50 w-auto sm:w-[440px] h-[calc(100dvh-1.5rem)] sm:h-[620px] max-h-[740px] rounded-2xl bg-[#090A0D]/95 border border-white/[0.14] shadow-[0_24px_70px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 fade-in duration-300"
        >
          {/* Mobile Drag Indicator */}
          <div className="sm:hidden w-10 h-1 bg-white/20 rounded-full mx-auto my-1.5 shrink-0" />

          {/* Header */}
          <div className="px-4 py-3.5 bg-[#0D0E14] border-b border-white/[0.08] flex items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#1A1D27] to-[#10121A] border border-white/[0.14] flex items-center justify-center text-white shadow-inner">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-[#090A0D]" />
              </div>
              <div className="text-left">
                <h3 className="text-xs sm:text-sm font-bold text-[#F5F5F3] flex items-center gap-1.5 uppercase tracking-wide font-mono">
                  <span>Webgent AI</span>
                  <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-sans font-medium tracking-normal">
                    Lead Concierge
                  </span>
                </h3>
                <p className="text-[10.5px] text-[#8E8E8C] flex items-center gap-1">
                  <span>Architecture & Scope Assistant</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setShowDetailsForm((prev) => !prev)}
                title={savedDetails ? "Contact info attached" : "Attach your contact details"}
                className={`p-2 rounded-lg transition-colors cursor-pointer ${
                  savedDetails
                    ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                    : "text-[#8A8A8A] hover:text-[#F5F5F3] hover:bg-white/[0.06]"
                }`}
              >
                {savedDetails ? <Check className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
              </button>

              <button
                type="button"
                onClick={handleResetSession}
                title="Restart conversation"
                className="p-2 rounded-lg text-[#8A8A8A] hover:text-[#F5F5F3] hover:bg-white/[0.06] transition-colors cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                title="Minimize chat"
                className="p-2 rounded-lg text-[#8A8A8A] hover:text-[#F5F5F3] hover:bg-white/[0.06] transition-colors cursor-pointer"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Contact Details Drawer (Optional) */}
          {showDetailsForm && (
            <div className="p-3.5 bg-[#0F1118] border-b border-white/[0.08] text-xs shrink-0 animate-in slide-in-from-top-2 duration-200">
              <form onSubmit={handleSaveDetails} className="space-y-2.5 text-left">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-[#E5E5E3] flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider">
                    <User className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Project Lead Details</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowDetailsForm(false)}
                    className="text-[#8A8A8A] hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-[11px] text-[#8E8E8C]">
                  Attach your details so our engineering leads can send proposals or architecture roadmaps.
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={visitorDetails.name}
                    onChange={(e) =>
                      setVisitorDetails((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="Your name"
                    className="px-2.5 py-1.5 rounded-lg bg-[#07080A] border border-white/[0.12] text-[#F5F5F3] placeholder-[#666666] focus:outline-none focus:border-white/30 text-xs"
                  />
                  <input
                    type="email"
                    value={visitorDetails.email}
                    onChange={(e) =>
                      setVisitorDetails((prev) => ({ ...prev, email: e.target.value }))
                    }
                    placeholder="Your email"
                    className="px-2.5 py-1.5 rounded-lg bg-[#07080A] border border-white/[0.12] text-[#F5F5F3] placeholder-[#666666] focus:outline-none focus:border-white/30 text-xs"
                  />
                </div>
                <div className="pt-1">
                  <Turnstile
                    id="chat-details-turnstile"
                    ref={turnstileRef}
                    size="compact"
                    onVerify={setTurnstileToken}
                    onExpire={() => setTurnstileToken("")}
                    onError={() => setTurnstileToken("")}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="submit"
                    className="px-3 py-1 rounded-lg bg-white hover:bg-[#EAEAEA] text-black font-semibold text-[11px] transition-colors cursor-pointer"
                  >
                    Save Details
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 overscroll-contain">
            {/* Welcome Studio Card */}
            <div className="p-3.5 rounded-xl bg-gradient-to-br from-[#0F1118] to-[#0A0B0E] border border-white/[0.08] shadow-lg text-left space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-semibold">
                  Webgent Engineering Concierge
                </span>
              </div>
              <p className="text-xs text-[#E5E5E3] leading-relaxed">
                Welcome. I can calculate project estimates, explain technical architectures, or connect you directly with principal developer <strong>Mohit Verma</strong>.
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.06] text-[10px] font-mono text-[#A0A0A0]">
                  Next.js 15
                </span>
                <span className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.06] text-[10px] font-mono text-[#A0A0A0]">
                  Full-Stack Cloud
                </span>
                <span className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.06] text-[10px] font-mono text-[#A0A0A0]">
                  AI Integrations
                </span>
              </div>
            </div>

            {/* Quick Starters if conversation is empty */}
            {messages.length === 0 && (
              <div className="pt-2 space-y-2 text-left">
                <span className="text-[10px] uppercase font-mono tracking-wider text-[#777777] block">
                  Suggested Inquiries
                </span>
                <div className="flex flex-col gap-1.5">
                  {QUICK_STARTERS.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => handleSendMessage(prompt)}
                      className="group text-left px-3.5 py-2.5 rounded-xl bg-[#0D0E14] hover:bg-[#151722] text-xs text-[#B5B5B3] hover:text-[#F5F5F3] border border-white/[0.07] hover:border-white/[0.2] transition-all flex items-center justify-between gap-2 shadow-sm cursor-pointer"
                    >
                      <span className="leading-snug">{prompt}</span>
                      <ArrowRight className="w-3 h-3 text-[#666666] group-hover:text-white transition-transform group-hover:translate-x-0.5 shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Message Thread */}
            {messages.map((msg) => {
              const isUser = msg.sender === "visitor";
              const timeString = new Date(msg.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              });

              return (
                <div
                  key={msg.id}
                  className={`flex items-end gap-2.5 ${isUser ? "flex-row-reverse" : "flex-row"} text-left`}
                >
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs shadow-sm ${
                      isUser
                        ? "bg-white text-black font-semibold"
                        : "bg-[#14161F] text-emerald-400 border border-white/[0.12]"
                    }`}
                  >
                    {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                  </div>

                  <div
                    className={`group/msg relative max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed shadow-lg ${
                      isUser
                        ? "bg-gradient-to-br from-[#EDEDEB] to-[#DFDFDC] text-[#0A0A0B] font-medium rounded-br-none"
                        : "bg-[#11131A] border border-white/[0.08] text-[#E5E5E3] rounded-bl-none"
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                    <div
                      className={`flex items-center justify-between gap-2 mt-1.5 pt-1 border-t text-[9px] font-mono ${
                        isUser
                          ? "border-black/10 text-black/60"
                          : "border-white/[0.06] text-[#777777]"
                      }`}
                    >
                      <span>{timeString}</span>
                      {!isUser && (
                        <button
                          type="button"
                          onClick={() => handleCopyMessage(msg.id, msg.content)}
                          className="opacity-0 group-hover/msg:opacity-100 transition-opacity hover:text-white flex items-center gap-1 cursor-pointer"
                          title="Copy reply"
                        >
                          {copiedId === msg.id ? (
                            <CheckCheck className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                          <span>Copy</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Live Thinking Status */}
            {loading && (
              <div className="flex items-start gap-2.5 text-left">
                <div className="w-7 h-7 rounded-lg bg-[#14161F] text-emerald-400 border border-white/[0.12] flex items-center justify-center shrink-0">
                  <Bot className="w-3.5 h-3.5 animate-pulse" />
                </div>
                <div className="rounded-2xl rounded-bl-none bg-[#11131A] border border-white/[0.08] p-3 text-xs text-[#909090] flex items-center gap-2 shadow-sm">
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" />
                  </div>
                  <span className="text-[11px] font-mono text-[#A0A0A0]">Analyzing technical inquiry...</span>
                </div>
              </div>
            )}

            {/* Error Notification */}
            {error && (
              <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/30 text-[#F5C2C2] text-xs flex items-center justify-between gap-2 text-left">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                  <span>{error}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleSendMessage()}
                  className="px-2 py-1 rounded bg-red-900/60 hover:bg-red-800 font-medium text-[11px] text-white cursor-pointer"
                >
                  Retry
                </button>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Context Chips */}
          <div className="px-3.5 py-1.5 bg-[#0B0C12] border-t border-white/[0.06] flex items-center gap-1.5 overflow-x-auto scrollbar-none text-[10px] font-mono shrink-0">
            <button
              type="button"
              onClick={() => handleSendMessage("Can you give me an estimate for a custom web app?")}
              className="px-2.5 py-1 rounded-md bg-white/[0.04] hover:bg-white/[0.08] text-[#A0A0A0] hover:text-white border border-white/[0.06] whitespace-nowrap transition-colors cursor-pointer"
            >
              Get Price Estimate
            </button>
            <button
              type="button"
              onClick={() => handleSendMessage("How fast can Webgent deliver an MVP?")}
              className="px-2.5 py-1 rounded-md bg-white/[0.04] hover:bg-white/[0.08] text-[#A0A0A0] hover:text-white border border-white/[0.06] whitespace-nowrap transition-colors cursor-pointer"
            >
              MVP Timelines
            </button>
            <button
              type="button"
              onClick={() => handleSendMessage("I want to discuss hiring Webgent for my project")}
              className="px-2.5 py-1 rounded-md bg-white/[0.04] hover:bg-white/[0.08] text-[#A0A0A0] hover:text-white border border-white/[0.06] whitespace-nowrap transition-colors cursor-pointer"
            >
              Consult Mohit Verma
            </button>
          </div>

          {/* Input Bar */}
          <div className="p-3 bg-[#0D0E14] border-t border-white/[0.08] shrink-0">
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
                placeholder="Ask regarding tech stack, scoping, or estimates..."
                disabled={loading || initializing}
                className="flex-1 p-2.5 max-h-28 rounded-xl bg-[#07080A] border border-white/[0.12] text-xs text-[#F5F5F3] placeholder-[#666666] focus:outline-none focus:border-white/40 focus:ring-1 focus:ring-white/20 transition-all resize-none disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!inputText.trim() || loading || initializing}
                className="p-2.5 rounded-xl bg-white hover:bg-[#EAEAEA] active:scale-95 disabled:opacity-30 text-black transition-all shrink-0 cursor-pointer shadow-md"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </form>

            <div className="flex items-center justify-between text-[10px] font-mono text-[#666666] mt-2 px-1">
              <span>Enter ↵ to send</span>
              <button
                type="button"
                onClick={() => setShowDetailsForm((prev) => !prev)}
                className="hover:text-emerald-400 transition-colors cursor-pointer flex items-center gap-1"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>{savedDetails ? "Contact info attached" : "Attach contact details"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
