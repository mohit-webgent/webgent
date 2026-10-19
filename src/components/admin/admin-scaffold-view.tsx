"use client";

import React from "react";
import Link from "next/link";
import { AlertCircle, ArrowLeft, Clock, Database, Layers, ShieldCheck } from "lucide-react";

interface AdminScaffoldViewProps {
  title: string;
  description: string;
  group: "Content" | "Business" | "AI Consultant" | "System";
  icon: React.ComponentType<{ className?: string }>;
  targetStorage: string;
  publicConsumers: string[];
  plannedFeatures: string[];
  adminOnly?: boolean;
}

export function AdminScaffoldView({
  title,
  description,
  group,
  icon: Icon,
  targetStorage,
  publicConsumers,
  plannedFeatures,
  adminOnly = false,
}: AdminScaffoldViewProps) {
  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              {group} Group
            </span>
            {adminOnly && (
              <span className="px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                Admin Only
              </span>
            )}
            <span className="px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider rounded-md bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1">
              <Clock className="w-3 h-3 text-amber-400" />
              Scaffolded (Step 1)
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Icon className="w-6 h-6" />
            </div>
            <span>{title}</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1.5 max-w-2xl leading-relaxed">
            {description}
          </p>
        </div>

        <Link
          href="/admin"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-semibold text-slate-300 hover:text-white transition-all self-start sm:self-auto"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Dashboard</span>
        </Link>
      </div>

      {/* Scaffold Notice Alert */}
      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-200 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <p className="font-bold text-amber-300">
            Route Scaffolded — Scheduled for Step 2 Implementation
          </p>
          <p className="text-amber-200/80 leading-relaxed">
            This module has been mounted in the Next.js admin router with server-side authentication guards. Mutating forms and mock inputs are deliberately withheld in Step 1 to avoid writing mock or unvalidated data to production storage.
          </p>
        </div>
      </div>

      {/* Architectural Specifications Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Storage Mapping */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
            <Database className="w-4 h-4" />
            <span>Target Storage / Entity</span>
          </div>
          <p className="text-sm font-semibold text-white font-mono">{targetStorage}</p>
          <p className="text-xs text-slate-400 leading-relaxed">
            Persisted in PostgreSQL via Prisma ORM or managed key-value site configuration.
          </p>
        </div>

        {/* Public Consumers */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <Layers className="w-4 h-4" />
            <span>Public Consumers</span>
          </div>
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {publicConsumers.map((c) => (
              <span
                key={c}
                className="px-2 py-0.5 text-[11px] font-mono rounded bg-slate-800 text-slate-300 border border-slate-700"
              >
                {c}
              </span>
            ))}
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Auto-revalidated upon publication via cache invalidation hooks.
          </p>
        </div>

        {/* Access Restriction */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-sky-400 text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            <span>Role Authorization</span>
          </div>
          <p className="text-sm font-semibold text-white">
            {adminOnly ? "ADMIN role required" : "ADMIN & EDITOR roles permitted"}
          </p>
          <p className="text-xs text-slate-400 leading-relaxed">
            Enforced by server-side session guards on both page requests and API mutations.
          </p>
        </div>
      </div>

      {/* Planned Features List */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
        <h2 className="text-sm font-bold text-white tracking-tight uppercase tracking-wider">
          Planned Step 2 Capabilities for this Screen
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {plannedFeatures.map((feat, index) => (
            <div
              key={index}
              className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-300"
            >
              <span className="w-5 h-5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-[10px] shrink-0">
                {index + 1}
              </span>
              <span>{feat}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
