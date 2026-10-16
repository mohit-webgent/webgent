"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import {
  X,
  Send,
  Loader2,
  User,
  UserPlus,
  RotateCcw,
  Check,
  AlertCircle,
  ChevronDown,
  ArrowRight,
  Copy,
  CheckCheck,
  BadgeCheck,
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
  const [turnstileError, setTurnstileError] = useState<string | null>(null);
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
            name: visitorDetails.name?.trim() || undefined,
            email: visitorDetails.email?.trim() || undefined,
            initialMessage: initialMsg?.trim() || undefined,
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

  const handleToggleOpen = () => {
    const nextOpen = !isOpen;
    setIsOpen(nextOpen);
    if (nextOpen && !sessionId && !savedDetails) {
      setShowDetailsForm(true);
    }
  };

  const handleResetSession = () => {
    try {
      localStorage.removeItem(STORAGE_SESSION_KEY);
    } catch {}
    setSessionId(null);
    setMessages([]);
    setError(null);
    setTurnstileToken("");
    setTurnstileError(null);
    turnstileRef.current?.reset();
    setShowDetailsForm(true);
  };

  const handleSaveDetails = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!turnstileToken) {
      setTurnstileError("Security verification is required. Please complete the verification challenge above.");
      return;
    }

    if (!visitorDetails.name.trim() && !visitorDetails.email.trim()) {
      setTurnstileError("Please enter your name or email before saving details.");
      return;
    }

    if (visitorDetails.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(visitorDetails.email.trim())) {
      setTurnstileError("Please enter a valid email address.");
      return;
    }

    try {
      localStorage.setItem(STORAGE_DETAILS_KEY, JSON.stringify(visitorDetails));
    } catch {}
    setSavedDetails(true);
    setTurnstileError(null);

    if (!sessionId) {
      const newSessionId = await initSession(undefined, turnstileToken);
      if (!newSessionId) {
        return;
      }
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
    if (!content || loading || initializing) return;

    if (!sessionId && !turnstileToken) {
      setShowDetailsForm(true);
      setError("Please complete the security verification challenge in Project Lead Details to start chatting.");
      return;
    }

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
        activeSessionId = await initSession(undefined, turnstileToken);
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
      {/* FLOATING LAUNCHER BUTTON (WhatsApp / Instagram Direct Message Style)*/}
      {/* =================================================================== */}
      <div className="fixed bottom-4 sm:bottom-6 right-3 sm:right-6 z-50 flex items-center gap-2.5 sm:gap-3">
        {!isOpen && (
          <button
            type="button"
            onClick={handleToggleOpen}
            className="hidden md:flex items-center gap-2.5 px-3.5 py-2 rounded-full bg-[#0D0E14]/95 hover:bg-[#141622] text-xs text-[#E5E5E3] hover:text-white border border-white/[0.14] hover:border-emerald-500/40 shadow-[0_8px_30px_rgba(0,0,0,0.6)] backdrop-blur-xl transition-all group cursor-pointer"
          >
            <div className="relative w-6 h-6 rounded-full overflow-hidden border border-emerald-500/50 shrink-0">
              <Image
                src="/images/mohit-verma.jpg"
                alt="Mohit Verma"
                fill
                sizes="24px"
                className="object-cover"
              />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-[12px] font-semibold flex items-center gap-1 leading-tight">
                <span>Chat with Mohit</span>
                <BadgeCheck className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400/20" />
              </span>
              <span className="text-[10px] text-emerald-400 flex items-center gap-1 leading-tight font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Active now</span>
              </span>
            </div>
          </button>
        )}

        <button
          type="button"
          id="webgent-chat-widget-button"
          onClick={handleToggleOpen}
          aria-label={isOpen ? "Close chat" : "Open direct chat with Mohit Verma"}
          className={`relative w-12 h-12 sm:w-13 sm:h-13 rounded-2xl transition-all duration-300 flex items-center justify-center border shadow-2xl cursor-pointer ${
            isOpen
              ? "bg-[#14151B] text-[#F5F5F3] hover:bg-[#1E2028] border-white/[0.2] rotate-90"
              : "bg-gradient-to-br from-[#161824] via-[#0E1017] to-[#0A0B0E] text-white hover:border-emerald-500/40 border-white/[0.15] hover:scale-105 active:scale-95 shadow-[0_10px_35px_rgba(0,0,0,0.6)]"
          }`}
        >
          {isOpen ? (
            <X className="w-5 h-5 transition-transform duration-200" />
          ) : (
            <>
              <div className="relative w-8 h-8 rounded-full overflow-hidden border border-emerald-500/50 shadow-inner">
                <Image
                  src="/images/mohit-verma.jpg"
                  alt="Mohit Verma"
                  fill
                  sizes="32px"
                  className="object-cover"
                />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#090A0D] shadow-[0_0_8px_rgba(52,211,153,0.9)]" />
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
      {/* WHATSAPP / INSTAGRAM DM STYLE FLOATING CHAT CARD                    */}
      {/* Compact non-full-page dimensions on both mobile & desktop           */}
      {/* =================================================================== */}
      {isOpen && (
        <div
          id="webgent-chat-window"
          role="dialog"
          aria-label="Direct Chat with Mohit Verma"
          className="fixed inset-x-3 bottom-20 sm:inset-x-auto sm:right-6 sm:bottom-22 z-50 w-auto sm:w-[400px] max-w-[420px] h-[520px] max-h-[82vh] rounded-[26px] bg-[#0A0B10]/95 border border-white/[0.14] shadow-[0_24px_70px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 fade-in duration-300"
        >
          {/* Header (Instagram / WhatsApp Profile Bar) */}
          <div className="px-3.5 py-2.5 bg-[#111219]/90 border-b border-white/[0.08] flex items-center justify-between gap-3 shrink-0 backdrop-blur-md">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="relative shrink-0">
                <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-emerald-500/40 relative shadow-md bg-[#1C1E2A]">
                  <Image
                    src="/images/mohit-verma.jpg"
                    alt="Mohit Verma"
                    fill
                    sizes="36px"
                    className="object-cover"
                  />
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-[#0A0B10]" />
              </div>

              <div className="min-w-0 text-left">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-xs sm:text-sm font-bold text-[#F5F5F3] truncate tracking-tight">
                    Mohit Verma
                  </h3>
                  <BadgeCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0 fill-emerald-400/20" />
                </div>
                <div className="text-[11px] truncate leading-tight">
                  {loading ? (
                    <span className="text-emerald-400 font-semibold flex items-center gap-1 animate-pulse">
                      <span>typing</span>
                      <span className="inline-flex gap-0.5">
                        <span className="w-1 h-1 rounded-full bg-emerald-400 animate-bounce" />
                        <span className="w-1 h-1 rounded-full bg-emerald-400 animate-bounce [animation-delay:0.2s]" />
                        <span className="w-1 h-1 rounded-full bg-emerald-400 animate-bounce [animation-delay:0.4s]" />
                      </span>
                    </span>
                  ) : (
                    <span className="text-[#969694] flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 inline-block" />
                      <span className="text-emerald-400 font-medium">Active now</span>
                      <span className="text-[#666666]">· Webgent</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Header Action Icons */}
            <div className="flex items-center gap-0.5 shrink-0">
              <button
                type="button"
                onClick={() => setShowDetailsForm((prev) => !prev)}
                title={savedDetails ? "Contact info attached" : "Attach your contact details"}
                className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                  savedDetails
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : "text-[#8E8E8C] hover:text-[#F5F5F3] hover:bg-white/[0.08]"
                }`}
              >
                {savedDetails ? <Check className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
              </button>

              <button
                type="button"
                onClick={handleResetSession}
                title="Restart conversation"
                className="p-1.5 rounded-full text-[#8E8E8C] hover:text-[#F5F5F3] hover:bg-white/[0.08] transition-colors cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                title="Close chat"
                className="p-1.5 rounded-full text-[#8E8E8C] hover:text-[#F5F5F3] hover:bg-white/[0.08] transition-colors cursor-pointer"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Contact Details Sheet (Turnstile Protected) */}
          {showDetailsForm && (
            <div className="p-3.5 bg-[#0F1118] border-b border-white/[0.08] text-xs shrink-0 animate-in slide-in-from-top-2 duration-200 shadow-md max-h-[260px] overflow-y-auto modal-scrollbar">
              <form onSubmit={handleSaveDetails} className="space-y-2.5 text-left">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[#E5E5E3] flex items-center gap-1.5 text-[11px] tracking-wide">
                    <User className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Project Lead Details</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowDetailsForm(false)}
                    className="text-[#8A8A8A] hover:text-white p-1 rounded-full cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-[11px] text-[#8E8E8C] leading-snug">
                  Leave your contact details so Mohit can follow up with architecture blueprints and custom proposals.
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={visitorDetails.name}
                    onChange={(e) =>
                      setVisitorDetails((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="Your name"
                    className="px-2.5 py-1.5 rounded-xl bg-[#07080A] border border-white/[0.12] text-[#F5F5F3] placeholder-[#666666] focus:outline-none focus:border-emerald-500/50 text-xs transition-colors"
                  />
                  <input
                    type="email"
                    value={visitorDetails.email}
                    onChange={(e) =>
                      setVisitorDetails((prev) => ({ ...prev, email: e.target.value }))
                    }
                    placeholder="Your email"
                    className="px-2.5 py-1.5 rounded-xl bg-[#07080A] border border-white/[0.12] text-[#F5F5F3] placeholder-[#666666] focus:outline-none focus:border-emerald-500/50 text-xs transition-colors"
                  />
                </div>
                <div className="pt-0.5">
                  <Turnstile
                    id="chat-details-turnstile"
                    ref={turnstileRef}
                    size="compact"
                    onVerify={(token) => {
                      setTurnstileToken(token);
                      setTurnstileError(null);
                    }}
                    onExpire={() => {
                      setTurnstileToken("");
                      setTurnstileError("Verification token expired. Please retry.");
                      turnstileRef.current?.reset();
                    }}
                    onError={() => {
                      setTurnstileToken("");
                      setTurnstileError("Security verification failed. Please try again.");
                      turnstileRef.current?.reset();
                    }}
                  />
                </div>

                {/* Verification Feedback */}
                {!turnstileToken && !turnstileError && (
                  <div className="flex items-center gap-1.5 text-[11px] text-amber-400 font-mono py-0.5">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>Security verification in progress. Please complete the challenge before saving.</span>
                  </div>
                )}
                {turnstileError && (
                  <div className="flex items-center gap-1.5 text-[11px] text-red-400 font-mono py-0.5">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{turnstileError}</span>
                  </div>
                )}
                {turnstileToken && (
                  <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-mono py-0.5">
                    <Check className="w-3.5 h-3.5 shrink-0" />
                    <span>Security challenge verified.</span>
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    id="chat-details-submit-button"
                    type="submit"
                    disabled={!turnstileToken || initializing}
                    className="px-3.5 py-1.5 rounded-lg bg-white hover:bg-[#EAEAEA] active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed text-black font-semibold text-[11px] transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
                  >
                    {initializing ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <span>Save Details</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto modal-scrollbar px-3.5 py-3 space-y-3.5 overscroll-contain">
            {/* Soft Date Separator */}
            <div className="flex justify-center my-0.5">
              <span className="px-2.5 py-0.5 rounded-full bg-white/[0.05] border border-white/[0.07] text-[10px] font-medium text-[#8E8E8C] tracking-wide">
                Today
              </span>
            </div>

            {/* Natural Instagram-style Welcome Profile Intro Card */}
            {messages.length === 0 && (
              <div className="py-2 space-y-3 text-center">
                <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-emerald-500/40 mx-auto relative shadow-xl bg-[#1A1C28]">
                  <Image
                    src="/images/mohit-verma.jpg"
                    alt="Mohit Verma"
                    fill
                    sizes="56px"
                    className="object-cover"
                  />
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-white flex items-center justify-center gap-1">
                    <span>Mohit Verma</span>
                    <BadgeCheck className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400/20" />
                  </h4>
                  <p className="text-[11px] text-[#8E8E8C]">Founder & Lead Developer @ Webgent</p>
                </div>

                <div className="p-3 rounded-2xl bg-[#14151F] border border-white/[0.08] text-left space-y-1.5 text-xs text-[#DFDFDC] leading-relaxed shadow-sm">
                  <p>
                    Hey! 👋 I&apos;m here to answer questions on project pricing, MVPs, technical architectures, or scoping your modern web application.
                  </p>
                  <p className="text-[11px] text-[#8E8E8C]">
                    Tap an inquiry below or type directly to chat!
                  </p>
                </div>

                {/* Instagram Quick Reply Story Pills */}
                <div className="flex flex-col gap-1.5 pt-1 text-left">
                  {QUICK_STARTERS.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => handleSendMessage(prompt)}
                      className="group px-3 py-2 rounded-xl bg-[#11121A] hover:bg-[#191B26] text-xs text-[#C5C5C2] hover:text-white border border-white/[0.07] hover:border-emerald-500/30 transition-all flex items-center justify-between gap-2 cursor-pointer shadow-sm active:scale-[0.99]"
                    >
                      <span className="leading-snug">{prompt}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#666666] group-hover:text-emerald-400 transition-transform group-hover:translate-x-0.5 shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Message Thread (WhatsApp / Instagram Message Bubbles) */}
            {messages.map((msg) => {
              const isUser = msg.sender === "visitor";
              const timeString = new Date(msg.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              });

              return (
                <div
                  key={msg.id}
                  className={`flex items-end gap-2 ${isUser ? "justify-end" : "justify-start"} text-left`}
                >
                  {!isUser && (
                    <div className="w-6 h-6 rounded-full overflow-hidden border border-emerald-500/30 shrink-0 relative bg-[#1A1C28] mb-0.5">
                      <Image
                        src="/images/mohit-verma.jpg"
                        alt="Mohit"
                        fill
                        sizes="24px"
                        className="object-cover"
                      />
                    </div>
                  )}

                  <div
                    className={`group/msg relative max-w-[82%] px-3.5 py-2.5 shadow-md ${
                      isUser
                        ? "bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 text-white rounded-2xl rounded-tr-xs"
                        : "bg-[#161722] border border-white/[0.08] text-[#E8E8E6] rounded-2xl rounded-tl-xs"
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words text-[12.5px] leading-relaxed">
                      {msg.content}
                    </p>

                    {/* WhatsApp-style Timestamp & Read Receipts */}
                    <div
                      className={`flex items-center justify-end gap-1.5 mt-1 text-[9px] select-none ${
                        isUser ? "text-white/75" : "text-[#7A7A78]"
                      }`}
                    >
                      <span>{timeString}</span>
                      {isUser && (
                        <span title="Delivered & Read">
                          <CheckCheck className="w-3 h-3 text-emerald-200 inline" />
                        </span>
                      )}
                      {!isUser && (
                        <button
                          type="button"
                          onClick={() => handleCopyMessage(msg.id, msg.content)}
                          className="opacity-0 group-hover/msg:opacity-100 transition-opacity hover:text-white flex items-center gap-0.5 cursor-pointer ml-1"
                          title="Copy message"
                        >
                          {copiedId === msg.id ? (
                            <CheckCheck className="w-2.5 h-2.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-2.5 h-2.5" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Live WhatsApp/Instagram Typing Bubble */}
            {loading && (
              <div className="flex items-end gap-2 text-left">
                <div className="w-6 h-6 rounded-full overflow-hidden border border-emerald-500/30 shrink-0 relative bg-[#1A1C28] mb-0.5">
                  <Image
                    src="/images/mohit-verma.jpg"
                    alt="Mohit"
                    fill
                    sizes="24px"
                    className="object-cover"
                  />
                </div>
                <div className="px-3.5 py-2.5 rounded-2xl rounded-tl-xs bg-[#161722] border border-white/[0.08] shadow-sm flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" />
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

          {/* Quick Context Story Pills (Visible when in conversation) */}
          {messages.length > 0 && (
            <div className="px-3 py-1 bg-[#0D0E15] border-t border-white/[0.06] flex items-center gap-1.5 overflow-x-auto scrollbar-none text-[10.5px] shrink-0">
              <button
                type="button"
                onClick={() => handleSendMessage("Can you give me an estimate for a custom web app?")}
                className="px-2.5 py-0.5 rounded-full bg-white/[0.05] hover:bg-white/[0.09] text-[#A0A0A0] hover:text-white border border-white/[0.08] whitespace-nowrap transition-colors cursor-pointer"
              >
                💰 Price Estimate
              </button>
              <button
                type="button"
                onClick={() => handleSendMessage("How fast can Webgent deliver an MVP?")}
                className="px-2.5 py-0.5 rounded-full bg-white/[0.05] hover:bg-white/[0.09] text-[#A0A0A0] hover:text-white border border-white/[0.08] whitespace-nowrap transition-colors cursor-pointer"
              >
                ⚡ MVP Timeline
              </button>
              <button
                type="button"
                onClick={() => handleSendMessage("I want to discuss hiring Webgent for my project")}
                className="px-2.5 py-0.5 rounded-full bg-white/[0.05] hover:bg-white/[0.09] text-[#A0A0A0] hover:text-white border border-white/[0.08] whitespace-nowrap transition-colors cursor-pointer"
              >
                🚀 Hire Mohit
              </button>
            </div>
          )}

          {/* WhatsApp / Instagram Pill Input Bar */}
          <div className="p-2.5 bg-[#0D0E15] border-t border-white/[0.08] shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <div className="flex-1 rounded-full bg-[#14151F] border border-white/[0.12] focus-within:border-emerald-500/50 focus-within:ring-1 focus-within:ring-emerald-500/20 transition-all pl-3.5 pr-2 py-1.5 flex items-center gap-2">
                <textarea
                  ref={inputRef}
                  rows={1}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Message Mohit..."
                  disabled={loading || initializing}
                  className="flex-1 bg-transparent border-0 text-xs text-[#F5F5F3] placeholder-[#666666] focus:outline-none transition-all resize-none max-h-20 py-1"
                />
              </div>

              {/* Circular Send Button */}
              <button
                type="submit"
                disabled={!inputText.trim() || loading || initializing}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all shrink-0 cursor-pointer ${
                  inputText.trim() && !loading && !initializing
                    ? "bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_0_12px_rgba(16,185,129,0.35)] scale-100"
                    : "bg-white/[0.06] text-white/30 cursor-not-allowed scale-95"
                }`}
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                ) : (
                  <Send className="w-4 h-4 ml-0.5" />
                )}
              </button>
            </form>

            <div className="flex items-center justify-between text-[10px] text-[#666666] mt-1.5 px-2">
              <span>Direct inquiry · Enter ↵</span>
              <button
                type="button"
                onClick={() => setShowDetailsForm((prev) => !prev)}
                className="hover:text-emerald-400 transition-colors cursor-pointer flex items-center gap-1 font-medium"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>{savedDetails ? "Details attached" : "Attach contact details"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
