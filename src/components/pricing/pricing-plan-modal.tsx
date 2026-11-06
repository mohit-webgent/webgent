"use client";

import {
  ArrowRight,
  MessageCircle,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
} from "lucide-react";
import Link from "next/link";
import { Turnstile } from "@/components/ui/turnstile";
import { formatCurrencyINR } from "@/data/pricing-matrix-data";
import type { PricingConfigurator } from "./use-pricing-configurator";

export function PricingPlanModal({ configurator }: { configurator: PricingConfigurator }) {
  const {
    flowMode,
    deliverySpeed,
    isSubmitModalOpen,
    setIsSubmitModalOpen,
    modalName,
    setModalName,
    modalEmail,
    setModalEmail,
    modalPhone,
    setModalPhone,
    modalNotes,
    setModalNotes,
    isSubmittingPlan,
    submitPlanSuccess,
    submitPlanError,
    setPlanTurnstileToken,
    planTurnstileRef,
    currentPackage,
    grandTotalOnetime,
    quotationUrl,
    handleSubmitPlan,
  } = configurator;

  return (
    <>
        {/* ========================================================================= */}
        {/* DIRECT PROJECT PLAN SUBMISSION MODAL (Submits request & fires email)        */}
        {/* ========================================================================= */}
        {isSubmitModalOpen && (
          <div
            role="dialog"
            aria-modal="true"
            onClick={() => setIsSubmitModalOpen(false)}
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-transparent backdrop-blur-md animate-in fade-in duration-200"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg max-h-[min(88vh,720px)] rounded-2xl bg-surface border border-line-strong shadow-2xl relative text-left overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setIsSubmitModalOpen(false)}
                className="absolute top-4 right-4 z-20 p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="overflow-y-auto modal-scrollbar p-6 sm:p-8 space-y-5 flex-1 min-h-0">
                {submitPlanSuccess ? (
                <div className="text-center py-4 space-y-4">
                  <div className="w-14 h-14 rounded-full bg-accent/15 text-accent border border-accent/30 flex items-center justify-center mx-auto shadow-lg">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>

                  <div className="space-y-1.5">
                    <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                      Request Submitted Successfully!
                    </h3>
                    <p className="text-xs sm:text-sm text-neutral-400 max-w-sm mx-auto leading-relaxed">
                      We have received your configured project plan. Mohit will review it and get in touch via email within 24 hours.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-canvas border border-line text-xs font-mono text-left space-y-1 text-neutral-300">
                    <div className="text-accent font-semibold">
                      Plan: {flowMode === "custom_only" ? "Custom Feature Build" : `${currentPackage.name} Package`}
                    </div>
                    <div>Estimated Development: {formatCurrencyINR(grandTotalOnetime)}</div>
                    <div>Delivery Speed: {deliverySpeed === "express" ? "Express SLA (+20%)" : "Standard Timeline"}</div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsSubmitModalOpen(false)}
                      className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-white hover:bg-neutral-200 text-black font-semibold text-xs transition-colors cursor-pointer"
                    >
                      Done
                    </button>
                    <a
                      href={`https://api.whatsapp.com/send?phone=919876543210&text=Hi%20Mohit,%20I%20just%20submitted%20a%20project%20plan%20from%20the%20pricing%20page%20(${flowMode === "custom_only" ? "Custom" : currentPackage.name}%20Package%20-%20${formatCurrencyINR(grandTotalOnetime)}).`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-surface-3 hover:bg-surface-3 text-white border border-line-strong text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-accent" />
                      <span>Chat on WhatsApp</span>
                    </a>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmitPlan} className="space-y-4">
                  <div className="space-y-1">
                    <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                      Submit Your Project Plan
                    </h3>
                    <p className="text-xs text-neutral-400">
                      Enter your details below to submit your configuration and dispatch the inquiry directly.
                    </p>
                  </div>

                  {/* Config Snapshot */}
                  <div className="p-3 rounded-xl bg-canvas border border-line flex items-center justify-between text-xs font-mono">
                    <div>
                      <span className="text-xs uppercase text-neutral-500 block">Plan Selection:</span>
                      <span className="text-white font-bold">
                        {flowMode === "custom_only" ? "Custom Build" : `${currentPackage.name} Package`}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs uppercase text-neutral-500 block">Estimated Cost:</span>
                      <span className="text-accent font-bold">{formatCurrencyINR(grandTotalOnetime)}</span>
                    </div>
                  </div>

                  {submitPlanError && (
                    <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/40 text-red-200 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                      <span>{submitPlanError}</span>
                    </div>
                  )}

                  {/* Name */}
                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-neutral-300">Your Name *</label>
                    <input
                      type="text"
                      required
                      value={modalName}
                      onChange={(e) => setModalName(e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full px-3.5 py-2.5 bg-canvas border border-line rounded-xl text-white text-xs placeholder-neutral-600 focus:outline-none focus:border-white transition-colors"
                    />
                  </div>

                  {/* Email & Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block text-xs font-medium text-neutral-300">Email Address *</label>
                      <input
                        type="email"
                        required
                        value={modalEmail}
                        onChange={(e) => setModalEmail(e.target.value)}
                        placeholder="name@company.com"
                        className="w-full px-3.5 py-2.5 bg-canvas border border-line rounded-xl text-white text-xs placeholder-neutral-600 focus:outline-none focus:border-white transition-colors"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-xs font-medium text-neutral-300">Phone (Optional)</label>
                      <input
                        type="tel"
                        value={modalPhone}
                        onChange={(e) => setModalPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full px-3.5 py-2.5 bg-canvas border border-line rounded-xl text-white text-xs placeholder-neutral-600 focus:outline-none focus:border-white transition-colors"
                      />
                    </div>
                  </div>

                  {/* Project Notes */}
                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-neutral-300">Project Notes (Optional)</label>
                    <textarea
                      rows={2}
                      value={modalNotes}
                      onChange={(e) => setModalNotes(e.target.value)}
                      placeholder="Reference links, deadline expectations, or specific features..."
                      className="w-full px-3.5 py-2 bg-canvas border border-line rounded-xl text-white text-xs placeholder-neutral-600 focus:outline-none focus:border-white transition-colors resize-none"
                    />
                  </div>

                  {/* Cloudflare Turnstile */}
                  <div className="pt-1">
                    <Turnstile
                      id="pricing-plan-turnstile"
                      ref={planTurnstileRef}
                      size="compact"
                      onVerify={(token) => setPlanTurnstileToken(token)}
                      onExpire={() => setPlanTurnstileToken("")}
                      onError={() => setPlanTurnstileToken("")}
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2 space-y-2">
                    <button
                      type="submit"
                      disabled={isSubmittingPlan}
                      className="w-full py-3 px-5 rounded-xl bg-accent hover:bg-accent active:scale-[0.99] text-black font-bold text-xs uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:opacity-40"
                    >
                      {isSubmittingPlan ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Submitting Plan...</span>
                        </>
                      ) : (
                        <>
                          <span>Submit Plan & Send Request</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>

                    <div className="flex items-center justify-between text-xs font-mono text-neutral-500 pt-1">
                      <span>Response SLA &lt; 24h</span>
                      <Link
                        href={quotationUrl}
                        className="text-neutral-400 hover:text-white underline transition-colors"
                        onClick={() => setIsSubmitModalOpen(false)}
                      >
                        Review on Full Contact Page →
                      </Link>
                    </div>
                  </div>
                </form>
              )}
              </div>
            </div>
          </div>
        )}
    </>
  );
}
