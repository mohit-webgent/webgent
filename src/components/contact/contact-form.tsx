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
  Briefcase,
  DollarSign,
  MessageSquare,
} from "lucide-react";
import { contactFormSchema } from "@/lib/validations/contact";
import { trackFormStart, trackFormSubmit } from "@/lib/analytics/client";

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
        className="bg-[#0D0D0D] border border-white/[0.12] rounded-xl p-8 sm:p-12 text-center space-y-6 animate-in fade-in zoom-in-95 duration-200 max-w-2xl mx-auto"
      >
        <div className="w-14 h-14 bg-[#141414] text-[#F5F5F3] border border-white/[0.10] rounded-xl flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-7 h-7" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-[#F5F5F3]">Inquiry Submitted Successfully</h3>
          <p className="text-xs sm:text-sm text-[#909090] max-w-md mx-auto">
            Thank you for contacting Webgent. Our architecture team has logged your requirements and
            will respond within one business day.
          </p>
        </div>
        <button
          onClick={() => setSuccess(false)}
          className="px-6 py-2.5 bg-[#E8E8E6] hover:bg-white text-[#080808] font-medium text-xs rounded-lg transition-colors"
        >
          Send Another Inquiry
        </button>
      </div>
    );
  }

  return (
    <div className="bg-[#0D0D0D] border border-white/[0.08] rounded-xl p-6 sm:p-10 shadow-xl max-w-3xl mx-auto">
      <div className="space-y-2 mb-8">
        <h2 className="text-xl font-bold text-[#F5F5F3] tracking-tight uppercase">
          Project Specification Form
        </h2>
        <p className="text-xs sm:text-sm text-[#909090]">
          Detail your requirements below and our principal engineers will evaluate technical
          feasibility and scope.
        </p>
      </div>

      {error && (
        <div
          id="contact-form-error"
          className="mb-8 p-3.5 rounded-lg bg-white/[0.03] border border-white/[0.12] text-[#D0D0CE] text-xs flex items-start gap-3 animate-in fade-in"
        >
          <AlertCircle className="w-4 h-4 text-white shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label
              htmlFor="contact-name"
              className="block text-xs font-mono uppercase tracking-wider text-[#A0A0A0] mb-2"
            >
              Full Name *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#666666]">
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
                className="block w-full pl-10 pr-4 py-2.5 bg-[#080808] border border-white/[0.10] rounded-lg text-[#F5F5F3] placeholder-[#666666] text-xs focus:outline-none focus:border-white/20 transition-colors"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="contact-email"
              className="block text-xs font-mono uppercase tracking-wider text-[#A0A0A0] mb-2"
            >
              Corporate Email *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#666666]">
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
                className="block w-full pl-10 pr-4 py-2.5 bg-[#080808] border border-white/[0.10] rounded-lg text-[#F5F5F3] placeholder-[#666666] text-xs focus:outline-none focus:border-white/20 transition-colors"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label
              htmlFor="contact-phone"
              className="block text-xs font-mono uppercase tracking-wider text-[#A0A0A0] mb-2"
            >
              Phone Number
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#666666]">
                <Phone className="w-4 h-4" />
              </div>
              <input
                id="contact-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
                className="block w-full pl-10 pr-4 py-2.5 bg-[#080808] border border-white/[0.10] rounded-lg text-[#F5F5F3] placeholder-[#666666] text-xs focus:outline-none focus:border-white/20 transition-colors"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="contact-company"
              className="block text-xs font-mono uppercase tracking-wider text-[#A0A0A0] mb-2"
            >
              Company / Organization
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#666666]">
                <Building2 className="w-4 h-4" />
              </div>
              <input
                id="contact-company"
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Acme Corp"
                className="block w-full pl-10 pr-4 py-2.5 bg-[#080808] border border-white/[0.10] rounded-lg text-[#F5F5F3] placeholder-[#666666] text-xs focus:outline-none focus:border-white/20 transition-colors"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label
              htmlFor="contact-service"
              className="block text-xs font-mono uppercase tracking-wider text-[#A0A0A0] mb-2"
            >
              Service Domain
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#666666]">
                <Briefcase className="w-4 h-4" />
              </div>
              <select
                id="contact-service"
                value={service}
                onChange={(e) => setService(e.target.value)}
                className="block w-full pl-10 pr-4 py-2.5 bg-[#080808] border border-white/[0.10] rounded-lg text-[#F5F5F3] text-xs focus:outline-none focus:border-white/20 transition-colors"
              >
                <option value="">Select an engineering domain...</option>
                <option value="web_development">Web Application Architecture</option>
                <option value="mobile_app">Mobile & Edge Systems</option>
                <option value="full_stack">Full-Stack Cloud Engineering</option>
                <option value="enterprise">Enterprise Custom Software</option>
                <option value="ui_ux">UI/UX Design Systems</option>
              </select>
            </div>
          </div>

          <div>
            <label
              htmlFor="contact-budget"
              className="block text-xs font-mono uppercase tracking-wider text-[#A0A0A0] mb-2"
            >
              Estimated Investment
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#666666]">
                <DollarSign className="w-4 h-4" />
              </div>
              <select
                id="contact-budget"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="block w-full pl-10 pr-4 py-2.5 bg-[#080808] border border-white/[0.10] rounded-lg text-[#F5F5F3] text-xs focus:outline-none focus:border-white/20 transition-colors"
              >
                <option value="">Select investment scope...</option>
                <option value="under_5k">&lt; $5,000</option>
                <option value="5k_10k">$5,000 - $10,000</option>
                <option value="10k_25k">$10,000 - $25,000</option>
                <option value="25k_plus">$25,000+</option>
              </select>
            </div>
          </div>
        </div>

        <div>
          <label
            htmlFor="contact-message"
            className="block text-xs font-mono uppercase tracking-wider text-[#A0A0A0] mb-2"
          >
            Technical Requirements & Overview *
          </label>
          <div className="relative">
            <div className="absolute top-3 left-3 text-[#666666] pointer-events-none">
              <MessageSquare className="w-4 h-4" />
            </div>
            <textarea
              id="contact-message"
              required
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Outline project objectives, current architecture, scale goals, and delivery milestones..."
              className="block w-full pl-10 pr-4 py-2.5 bg-[#080808] border border-white/[0.10] rounded-lg text-[#F5F5F3] placeholder-[#666666] text-xs focus:outline-none focus:border-white/20 transition-colors"
            />
          </div>
          <p className="text-[10px] text-[#666666] font-mono mt-1">
            {message.length}/20 characters minimum
          </p>
        </div>

        <button
          id="contact-submit-button"
          type="submit"
          disabled={loading}
          className="w-full py-3 px-6 bg-[#E8E8E6] hover:bg-white active:bg-[#D6D6D4] text-[#080808] font-medium text-xs rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-40"
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
