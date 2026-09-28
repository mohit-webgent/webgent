"use client";

import { useState } from "react";
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
      const firstError = Object.values(
        validation.error.flatten().fieldErrors
      )[0]?.[0];
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
        className="bg-slate-900/90 border border-emerald-500/30 rounded-3xl p-8 sm:p-12 text-center space-y-6 animate-in fade-in zoom-in-95 duration-300 max-w-2xl mx-auto"
      >
        <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-extrabold text-white">
            Inquiry Submitted Successfully!
          </h3>
          <p className="text-sm text-slate-300 max-w-md mx-auto">
            Thank you for reaching out to Webgent. Our team has received your message and will review your project details shortly.
          </p>
        </div>
        <button
          onClick={() => setSuccess(false)}
          className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm rounded-xl border border-slate-700 transition-all"
        >
          Send Another Message
        </button>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl max-w-3xl mx-auto">
      <div className="space-y-2 mb-8">
        <h2 className="text-2xl font-extrabold text-white tracking-tight">
          Let&apos;s Build Something Exceptional
        </h2>
        <p className="text-sm text-slate-400">
          Fill out the form below and our engineering team will get back to you within 24 hours.
        </p>
      </div>

      {error && (
        <div
          id="contact-form-error"
          className="mb-8 p-4 rounded-2xl bg-red-950/60 border border-red-800/60 text-red-200 text-sm flex items-start gap-3 animate-in fade-in"
        >
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Full Name */}
          <div>
            <label
              htmlFor="contact-name"
              className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2"
            >
              Full Name <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <User className="w-4 h-4" />
              </div>
              <input
                id="contact-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="block w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>
          </div>

          {/* Email Address */}
          <div>
            <label
              htmlFor="contact-email"
              className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2"
            >
              Email Address <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Mail className="w-4 h-4" />
              </div>
              <input
                id="contact-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@company.com"
                className="block w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Phone Number */}
          <div>
            <label
              htmlFor="contact-phone"
              className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2"
            >
              Phone Number
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Phone className="w-4 h-4" />
              </div>
              <input
                id="contact-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
                className="block w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>
          </div>

          {/* Company Name */}
          <div>
            <label
              htmlFor="contact-company"
              className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2"
            >
              Company / Organization
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Building2 className="w-4 h-4" />
              </div>
              <input
                id="contact-company"
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Acme Corp"
                className="block w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Service Needed */}
          <div>
            <label
              htmlFor="contact-service"
              className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2"
            >
              Service Required
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Briefcase className="w-4 h-4" />
              </div>
              <select
                id="contact-service"
                value={service}
                onChange={(e) => setService(e.target.value)}
                className="block w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              >
                <option value="">Select a service...</option>
                <option value="web_development">Web Development</option>
                <option value="mobile_app">Mobile App Development</option>
                <option value="full_stack">Full Stack Engineering</option>
                <option value="enterprise">Enterprise Custom Software</option>
                <option value="ui_ux">UI/UX Design</option>
              </select>
            </div>
          </div>

          {/* Project Budget */}
          <div>
            <label
              htmlFor="contact-budget"
              className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2"
            >
              Estimated Budget
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <DollarSign className="w-4 h-4" />
              </div>
              <select
                id="contact-budget"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="block w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              >
                <option value="">Select budget range...</option>
                <option value="under_5k">&lt; $5,000</option>
                <option value="5k_10k">$5,000 - $10,000</option>
                <option value="10k_25k">$10,000 - $25,000</option>
                <option value="25k_plus">$25,000+</option>
              </select>
            </div>
          </div>
        </div>

        {/* Message / Project Description */}
        <div>
          <label
            htmlFor="contact-message"
            className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2"
          >
            Project Description <span className="text-red-400">*</span>
          </label>
          <div className="relative">
            <div className="absolute top-3.5 left-3.5 text-slate-500 pointer-events-none">
              <MessageSquare className="w-4 h-4" />
            </div>
            <textarea
              id="contact-message"
              required
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tell us about your project goals, timelines, and technical requirements (min 20 characters)..."
              className="block w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {message.length}/20 characters minimum
          </p>
        </div>

        {/* Submit Button */}
        <button
          id="contact-submit-button"
          type="submit"
          disabled={loading}
          className="w-full py-4 px-6 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-xl shadow-indigo-600/25 flex items-center justify-center gap-2.5 transition-all disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Sending Inquiry...</span>
            </>
          ) : (
            <>
              <span>Submit Inquiry</span>
              <Send className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
