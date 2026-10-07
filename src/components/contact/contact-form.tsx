"use client";

import { useState, useRef } from "react";
import {
  Send,
  CheckCircle2,
  AlertCircle,
  Loader2,
  User,
  Mail,
  Phone,
  Building2,
  MessageSquare,
} from "lucide-react";
import { contactFormSchema } from "@/lib/validations/contact";
import { trackFormStart, trackFormSubmit } from "@/lib/analytics/client";

const SERVICE_OPTIONS = [
  { value: "web_development", label: "Web Applications" },
  { value: "mobile_app", label: "Mobile & Edge" },
  { value: "full_stack", label: "Full-Stack Cloud" },
  { value: "enterprise", label: "Enterprise Software" },
  { value: "ui_ux", label: "UI/UX Design Systems" },
];

const BUDGET_OPTIONS = [
  { value: "under_5k", label: "< $5,000" },
  { value: "5k_10k", label: "$5,000 - $10,000" },
  { value: "10k_25k", label: "$10,000 - $25,000" },
  { value: "25k_plus", label: "$25,000+" },
];

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [service, setService] = useState("");
  const [budget, setBudget] = useState("");
  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const hasStartedRef = useRef(false);

  const handleFieldFocus = () => {
    if (!hasStartedRef.current) {
      hasStartedRef.current = true;
      trackFormStart("contact");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validation = contactFormSchema.safeParse({
      name,
      email,
      phone,
      company,
      service,
      budget,
      message,
    });

    if (!validation.success) {
      const firstError = Object.values(validation.error.flatten().fieldErrors)[0]?.[0];
      setError(firstError || "Please check the form inputs.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim() || undefined,
          company: company.trim() || undefined,
          service: service || undefined,
          budget: budget || undefined,
          message: message.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error?.message || "Failed to submit contact request.");
        setLoading(false);
        return;
      }

      setSuccess(true);
      trackFormSubmit("contact", { service: service || undefined, budget: budget || undefined });
      setName("");
      setEmail("");
      setPhone("");
      setCompany("");
      setService("");
      setBudget("");
      setMessage("");
    } catch {
      setError("An unexpected network error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div
        id="contact-form-success"
        className="bg-[#0D0D0D] border border-white/[0.14] rounded-2xl p-8 sm:p-14 text-center space-y-6 animate-in fade-in zoom-in-95 duration-300 max-w-2xl mx-auto shadow-2xl"
      >
        <div className="w-16 h-16 bg-[#161616] text-[#F5F5F3] border border-white/[0.12] rounded-2xl flex items-center justify-center mx-auto shadow-lg">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <div className="space-y-2.5">
          <h3 className="text-2xl font-bold text-[#F5F5F3] uppercase tracking-tight">
            Inquiry Submitted Successfully
          </h3>
          <p className="text-xs sm:text-sm text-[#909090] max-w-md mx-auto leading-relaxed">
            Thank you for contacting Webgent. Our principal engineering group has logged your project
            specifications and will evaluate technical scope within one business day.
          </p>
        </div>
        <button
          onClick={() => setSuccess(false)}
          className="px-7 py-3 bg-[#E8E8E6] hover:bg-white text-[#080808] font-medium text-xs rounded-lg transition-colors active:scale-95"
        >
          Send Another Inquiry
        </button>
      </div>
    );
  }

  return (
    <div className="bg-[#0D0D0D] border border-white/[0.08] hover:border-white/[0.14] rounded-2xl p-6 sm:p-12 shadow-2xl max-w-3xl mx-auto transition-colors">
      <div className="space-y-2 mb-10 text-left">
        <h2 className="text-xl sm:text-2xl font-bold text-[#F5F5F3] tracking-tight uppercase">
          Project Specification Form
        </h2>
        <p className="text-xs sm:text-sm text-[#909090] leading-relaxed">
          Detail your requirements below and our principal engineers will evaluate technical
          feasibility, architecture stack, and development roadmap.
        </p>
      </div>

      {error && (
        <div
          id="contact-form-error"
          className="mb-8 p-4 rounded-xl bg-white/[0.03] border border-white/[0.14] text-[#E5E5E3] text-xs flex items-start gap-3 animate-in fade-in"
        >
          <AlertCircle className="w-4 h-4 text-white shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8 text-left">
        {/* Name and Email */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label
              htmlFor="contact-name"
              className="block text-xs font-mono uppercase tracking-wider text-[#A0A0A0]"
            >
              Full Name *
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#666666] group-focus-within:text-[#E5E5E3] transition-colors">
                <User className="w-4 h-4" />
              </div>
              <input
                id="contact-name"
                type="text"
                required
                value={name}
                onFocus={handleFieldFocus}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="block w-full pl-10 pr-4 py-3 bg-[#080808] border border-white/[0.10] rounded-xl text-[#F5F5F3] placeholder-[#666666] text-xs focus:outline-none focus:border-white/30 focus:bg-[#0C0C0C] transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="contact-email"
              className="block text-xs font-mono uppercase tracking-wider text-[#A0A0A0]"
            >
              Corporate Email *
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#666666] group-focus-within:text-[#E5E5E3] transition-colors">
                <Mail className="w-4 h-4" />
              </div>
              <input
                id="contact-email"
                type="email"
                required
                value={email}
                onFocus={handleFieldFocus}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@company.com"
                className="block w-full pl-10 pr-4 py-3 bg-[#080808] border border-white/[0.10] rounded-xl text-[#F5F5F3] placeholder-[#666666] text-xs focus:outline-none focus:border-white/30 focus:bg-[#0C0C0C] transition-all"
              />
            </div>
          </div>
        </div>

        {/* Phone and Company */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label
              htmlFor="contact-phone"
              className="block text-xs font-mono uppercase tracking-wider text-[#A0A0A0]"
            >
              Phone Number
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#666666] group-focus-within:text-[#E5E5E3] transition-colors">
                <Phone className="w-4 h-4" />
              </div>
              <input
                id="contact-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
                className="block w-full pl-10 pr-4 py-3 bg-[#080808] border border-white/[0.10] rounded-xl text-[#F5F5F3] placeholder-[#666666] text-xs focus:outline-none focus:border-white/30 focus:bg-[#0C0C0C] transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="contact-company"
              className="block text-xs font-mono uppercase tracking-wider text-[#A0A0A0]"
            >
              Company / Organization
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#666666] group-focus-within:text-[#E5E5E3] transition-colors">
                <Building2 className="w-4 h-4" />
              </div>
              <input
                id="contact-company"
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Acme Corp"
                className="block w-full pl-10 pr-4 py-3 bg-[#080808] border border-white/[0.10] rounded-xl text-[#F5F5F3] placeholder-[#666666] text-xs focus:outline-none focus:border-white/30 focus:bg-[#0C0C0C] transition-all"
              />
            </div>
          </div>
        </div>

        {/* Interactive "What are we building?" Service Selector */}
        <div className="space-y-3">
          <label className="block text-xs font-mono uppercase tracking-wider text-[#A0A0A0]">
            Service Domain (Optional)
          </label>
          <div className="flex flex-wrap gap-2">
            {SERVICE_OPTIONS.map((opt) => {
              const isSelected = service === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setService(isSelected ? "" : opt.value)}
                  className={`px-3.5 py-2 rounded-lg text-xs font-medium transition-all ${
                    isSelected
                      ? "bg-[#E8E8E6] text-[#080808] font-semibold shadow-sm"
                      : "bg-[#080808] border border-white/[0.10] text-[#909090] hover:text-[#F5F5F3] hover:border-white/[0.20]"
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Interactive Budget Selector */}
        <div className="space-y-3">
          <label className="block text-xs font-mono uppercase tracking-wider text-[#A0A0A0]">
            Estimated Investment Scope (Optional)
          </label>
          <div className="flex flex-wrap gap-2">
            {BUDGET_OPTIONS.map((opt) => {
              const isSelected = budget === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setBudget(isSelected ? "" : opt.value)}
                  className={`px-3.5 py-2 rounded-lg text-xs font-medium transition-all ${
                    isSelected
                      ? "bg-[#E8E8E6] text-[#080808] font-semibold shadow-sm"
                      : "bg-[#080808] border border-white/[0.10] text-[#909090] hover:text-[#F5F5F3] hover:border-white/[0.20]"
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Message */}
        <div className="space-y-2">
          <label
            htmlFor="contact-message"
            className="block text-xs font-mono uppercase tracking-wider text-[#A0A0A0]"
          >
            Technical Requirements & Overview *
          </label>
          <div className="relative group">
            <div className="absolute top-3.5 left-3.5 text-[#666666] group-focus-within:text-[#E5E5E3] pointer-events-none transition-colors">
              <MessageSquare className="w-4 h-4" />
            </div>
            <textarea
              id="contact-message"
              required
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Outline project objectives, current architecture, scale goals, and delivery milestones..."
              className="block w-full pl-10 pr-4 py-3 bg-[#080808] border border-white/[0.10] rounded-xl text-[#F5F5F3] placeholder-[#666666] text-xs focus:outline-none focus:border-white/30 focus:bg-[#0C0C0C] transition-all"
            />
          </div>
          <p className="text-[10px] text-[#666666] font-mono">
            {message.length}/20 characters minimum
          </p>
        </div>

        {/* Submit Button */}
        <button
          id="contact-submit-button"
          type="submit"
          disabled={loading}
          className="w-full py-3.5 px-6 bg-[#E8E8E6] hover:bg-white active:bg-[#D6D6D4] text-[#080808] font-semibold text-xs tracking-wider uppercase rounded-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-40 hover:-translate-y-0.5 active:translate-y-0 shadow-lg cursor-pointer"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Transmitting Requirements...</span>
            </>
          ) : (
            <>
              <span>Dispatch Project Inquiry</span>
              <Send className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
