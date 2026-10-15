"use client";

import React, { useState, useRef, useEffect } from "react";
import { CheckCircle2, AlertCircle, Loader2, Mail, Phone, MapPin, Copy, Check } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { contactFormSchema } from "@/lib/validations/contact";
import { trackFormStart, trackFormSubmit } from "@/lib/analytics/client";
import { FOUNDER_PROFILE } from "@/data/founder-profile";

export function ContactForm() {
  const searchParams = useSearchParams();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [prefilledService, setPrefilledService] = useState<string | null>(null);
  const [prefilledBudget, setPrefilledBudget] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const hasStartedRef = useRef(false);

  const contactEmail = FOUNDER_PROFILE.email || "mohitvermag75@gmail.com";
  const contactPhone = "+91 98765 43210";
  const contactAddress = FOUNDER_PROFILE.location || "Gurugram / Noida, India";

  useEffect(() => {
    if (!searchParams) return;
    const prefillMsg = searchParams.get("message");
    const prefillService = searchParams.get("service");
    const prefillBudget = searchParams.get("budget");

    if (prefillMsg) setMessage(prefillMsg);
    if (prefillService) setPrefilledService(prefillService);
    if (prefillBudget) setPrefilledBudget(prefillBudget);
  }, [searchParams]);

  const handleFieldFocus = () => {
    if (!hasStartedRef.current) {
      hasStartedRef.current = true;
      trackFormStart("contact");
    }
  };

  const handleCopyEmail = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(contactEmail);
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validation = contactFormSchema.safeParse({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim() || undefined,
      service: prefilledService || undefined,
      budget: prefilledBudget || undefined,
      message: message.trim(),
    });

    if (!validation.success) {
      const firstError = Object.values(validation.error.flatten().fieldErrors)[0]?.[0];
      setError(firstError || "Please fill in all required fields (message should be at least 20 characters).");
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
          service: prefilledService || undefined,
          budget: prefilledBudget || undefined,
          message: message.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error?.message || "Something went wrong. Please try again.");
        setLoading(false);
        return;
      }

      setSuccess(true);
      trackFormSubmit("contact", { service: prefilledService || undefined, budget: prefilledBudget || undefined });
      setName("");
      setEmail("");
      setPhone("");
      setMessage("");
    } catch {
      setError("An unexpected network error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
      {/* =================================================================== */}
      {/* LEFT SIDE: "Have a Project in Mind? Let's Talk!" CARD               */}
      {/* =================================================================== */}
      <div className="lg:col-span-5 bg-[#0F1014] border border-white/[0.07] rounded-[24px] p-7 sm:p-9 md:p-10 flex flex-col justify-between shadow-2xl text-left relative overflow-hidden">
        {/* Subtle Ambient Light Corner */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-20 -left-20 w-44 h-44 bg-white/[0.03] rounded-full blur-3xl"
        />

        <div className="space-y-4">
          <h2 className="text-3xl sm:text-4xl lg:text-[40px] font-bold text-white tracking-tight leading-[1.15]">
            Have a Project in Mind? Let&apos;s Talk!
          </h2>
          <p className="text-sm sm:text-base text-neutral-400 leading-relaxed font-normal">
            Have questions or need assistance? Contact us at Webgent for support or to discuss your project.
          </p>
        </div>

        {/* Contact Info List with Dark Squircle Badges */}
        <div className="space-y-6 pt-10 sm:pt-14">
          {/* Email */}
          <div className="flex items-center gap-4 group">
            <button
              type="button"
              onClick={handleCopyEmail}
              title="Click to copy email"
              className="w-12 h-12 rounded-xl bg-[#1A1C24] border border-white/[0.08] group-hover:border-white/20 flex items-center justify-center text-white shrink-0 transition-all cursor-pointer shadow-sm"
            >
              {copiedEmail ? <Check className="w-5 h-5 text-emerald-400" /> : <Mail className="w-5 h-5 text-white" />}
            </button>
            <div className="min-w-0">
              <span className="block text-xs text-neutral-400 font-medium">Email:</span>
              <a
                href={`mailto:${contactEmail}`}
                className="block text-sm sm:text-base text-white hover:text-neutral-200 font-medium truncate transition-colors"
              >
                {contactEmail}
              </a>
            </div>
          </div>

          {/* Phone */}
          <div className="flex items-center gap-4 group">
            <a
              href="https://api.whatsapp.com/send?phone=919876543210&text=Hi%20Mohit,%20I%20would%20like%20to%20discuss%20a%20project%20with%20Webgent."
              target="_blank"
              rel="noopener noreferrer"
              className="w-12 h-12 rounded-xl bg-[#1A1C24] border border-white/[0.08] group-hover:border-white/20 flex items-center justify-center text-white shrink-0 transition-all shadow-sm"
            >
              <Phone className="w-5 h-5 text-white" />
            </a>
            <div className="min-w-0">
              <span className="block text-xs text-neutral-400 font-medium">Phone</span>
              <a
                href="https://api.whatsapp.com/send?phone=919876543210&text=Hi%20Mohit,%20I%20would%20like%20to%20discuss%20a%20project%20with%20Webgent."
                target="_blank"
                rel="noopener noreferrer"
                className="block text-sm sm:text-base text-white hover:text-neutral-200 font-medium transition-colors"
              >
                {contactPhone}
              </a>
            </div>
          </div>

          {/* Address */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#1A1C24] border border-white/[0.08] flex items-center justify-center text-white shrink-0 shadow-sm">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <span className="block text-xs text-neutral-400 font-medium">Address</span>
              <span className="block text-sm sm:text-base text-white font-medium">
                {contactAddress}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* RIGHT SIDE: THE CLEAN CONTACT FORM                                  */}
      {/* =================================================================== */}
      <div className="lg:col-span-7 flex flex-col justify-center text-left">
        {success ? (
          <div
            id="contact-form-success"
            className="w-full bg-[#0F1014] border border-white/[0.08] rounded-[24px] p-8 sm:p-12 text-center space-y-5 shadow-2xl animate-in fade-in duration-300"
          >
            <div className="w-16 h-16 rounded-full bg-[#F27A1A]/15 text-[#F27A1A] border border-[#F27A1A]/30 flex items-center justify-center mx-auto shadow-lg">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Thank You for Reaching Out!
              </h3>
              <p className="text-sm text-neutral-400 max-w-md mx-auto leading-relaxed">
                Your message has been sent successfully. We will review your project details and respond within 24 hours.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setSuccess(false)}
              className="mt-4 px-8 py-3 rounded-xl bg-[#F27A1A] hover:bg-[#E06D12] active:scale-95 text-white font-semibold text-sm transition-all duration-200 shadow-[0_4px_20px_rgba(242,122,26,0.35)] cursor-pointer"
            >
              Send Another Message
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div
                id="contact-form-error"
                className="p-4 rounded-xl bg-red-950/40 border border-red-500/40 text-red-200 text-xs sm:text-sm flex items-start gap-3 animate-in fade-in"
              >
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Your Name */}
            <div className="space-y-2">
              <label htmlFor="contact-name" className="block text-sm font-medium text-white">
                Your Name
              </label>
              <input
                id="contact-name"
                type="text"
                required
                value={name}
                onFocus={handleFieldFocus}
                onChange={(e) => setName(e.target.value)}
                placeholder="Davit Smith"
                className="w-full px-4 py-3.5 bg-[#0F1014] border border-white/[0.08] focus:border-white/30 rounded-xl text-white placeholder-neutral-600 text-sm focus:outline-none transition-all duration-200"
              />
            </div>

            {/* Email & Phone (optional) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              <div className="space-y-2">
                <label htmlFor="contact-email" className="block text-sm font-medium text-white">
                  Email
                </label>
                <input
                  id="contact-email"
                  type="email"
                  required
                  value={email}
                  onFocus={handleFieldFocus}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@domin.com"
                  className="w-full px-4 py-3.5 bg-[#0F1014] border border-white/[0.08] focus:border-white/30 rounded-xl text-white placeholder-neutral-600 text-sm focus:outline-none transition-all duration-200"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="contact-phone" className="block text-sm font-medium text-white">
                  Phone (optional)
                </label>
                <input
                  id="contact-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 332 245 666"
                  className="w-full px-4 py-3.5 bg-[#0F1014] border border-white/[0.08] focus:border-white/30 rounded-xl text-white placeholder-neutral-600 text-sm focus:outline-none transition-all duration-200"
                />
              </div>
            </div>

            {/* If coming from Pricing Matrix, show configured plan tag */}
            {prefilledService && (
              <div className="p-3 rounded-xl bg-[#1A1C24] border border-white/10 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#F27A1A]" />
                  <span className="text-neutral-400">Configured Plan:</span>
                  <span className="text-white font-semibold">{prefilledService}</span>
                </div>
                <span className="text-neutral-400 text-[11px] font-mono">Plan details pre-filled below</span>
              </div>
            )}

            {/* About Project */}
            <div className="space-y-2">
              <label htmlFor="contact-message" className="block text-sm font-medium text-white">
                About Project
              </label>
              <textarea
                id="contact-message"
                required
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tell us about your project, timeline, and goals..."
                className="w-full px-4 py-3.5 bg-[#0F1014] border border-white/[0.08] focus:border-white/30 rounded-xl text-white placeholder-neutral-600 text-sm focus:outline-none transition-all duration-200 resize-none min-h-[140px]"
              />
              <span className={`block text-[11px] font-mono ${message.length >= 20 ? "text-neutral-500" : "text-neutral-600"}`}>
                {message.length}/20 characters minimum
              </span>
            </div>

            {/* Submit Button (Vibrant Orange Theme) */}
            <div className="pt-2">
              <button
                id="contact-submit-button"
                type="submit"
                disabled={loading}
                className="px-9 py-3.5 rounded-xl bg-[#F27A1A] hover:bg-[#E06D12] active:scale-95 text-white font-semibold text-sm transition-all duration-200 shadow-[0_4px_24px_rgba(242,122,26,0.35)] cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <span>Submit Now</span>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
