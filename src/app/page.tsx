"use client";

import * as React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { CheckCircle2, ShieldCheck, Database, FileCode2, Layers, Cpu } from "lucide-react";
import { CtaLink } from "@/components/ui/cta-link";

export default function HomePage() {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [testInput, setTestInput] = React.useState("");

  const foundations = [
    {
      title: "App Router & TypeScript",
      desc: "Next.js 14 App Router configured with strict TypeScript compiler rules & path aliases (@/*).",
      icon: <FileCode2 className="h-5 w-5 text-indigo-400" />,
      status: "Configured",
    },
    {
      title: "Prisma Client Singleton",
      desc: "Prisma ORM setup with global singleton connection caching & database configuration.",
      icon: <Database className="h-5 w-5 text-emerald-400" />,
      status: "Ready",
    },
    {
      title: "API & Zod Validation",
      desc: "Standardized ApiResponse<T>, error handlers, and type-safe request parsing with Zod.",
      icon: <ShieldCheck className="h-5 w-5 text-sky-400" />,
      status: "Established",
    },
    {
      title: "Structured Logging & Errors",
      desc: "Tiered JSON logger and AppError domain exception class hierarchy for backend observability.",
      icon: <Cpu className="h-5 w-5 text-purple-400" />,
      status: "Active",
    },
  ];

  return (
    <div className="space-y-10 py-4 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="space-y-3 text-center sm:text-left border-b border-slate-800 pb-8">
        <div className="inline-flex items-center gap-2">
          <Badge variant="success">Phase 1 Complete</Badge>
          <Badge variant="outline">Next.js 14.2</Badge>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-100">
          Project Architecture Foundation
        </h1>
        <p className="text-slate-400 text-base max-w-2xl">
          Scalable, production-ready infrastructure baseline configured with strict linting,
          type checking, environment isolation, database client, logger, and unified UI primitives.
        </p>
      </div>

      {/* Alert Status */}
      <Alert variant="success" title="Foundation Initialized Successfully">
        All Phase 1 requirements have been set up. Authentication, business APIs, admin features, and AI chat remain intentionally unbuilt for Phase 2.
      </Alert>

      {/* Grid of Foundations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {foundations.map((item) => (
          <Card key={item.title} className="hover:border-slate-700 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700/60">
                  {item.icon}
                </div>
                <div>
                  <CardTitle className="text-base">{item.title}</CardTitle>
                  <Badge variant="info" className="mt-1">
                    {item.status}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>{item.desc}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* UI Component Playground Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Global UI Foundations Test Bench</CardTitle>
              <CardDescription className="mt-1">
                Testing reusable design system components & interactive primitives.
              </CardDescription>
            </div>
            <Layers className="h-5 w-5 text-indigo-400" />
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Validation Test Field"
              placeholder="Type to verify input state..."
              value={testInput}
              onChange={(e) => setTestInput(e.target.value)}
              helperText="Reactive Zod validation primitive ready"
            />

            <div className="flex items-end gap-3">
              <Button variant="primary" onClick={() => setIsModalOpen(true)}>
                Test Modal Dialog
              </Button>
              <Button variant="outline" onClick={() => alert("Button click handler responsive!")}>
                Interactive Test
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Conversion CTA Banner */}
      <div className="bg-gradient-to-r from-indigo-900/40 via-purple-900/30 to-slate-900 border border-indigo-500/20 rounded-3xl p-8 sm:p-12 text-center space-y-6 relative overflow-hidden">
        <div className="space-y-3">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Ready to Build Your Next Digital Product?
          </h2>
          <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto">
            From modern web applications to enterprise software architecture, we deliver scalable engineering solutions.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <CtaLink
            href="/contact"
            label="Home Bottom Start Project"
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-indigo-600/30 transition-all hover:scale-105"
          >
            Start Your Project
          </CtaLink>
          <CtaLink
            href="/work"
            label="Home Bottom Browse Work"
            className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 font-semibold text-sm rounded-xl transition-all"
          >
            Browse Case Studies
          </CtaLink>
        </div>
      </div>

      {/* Interactive Foundation Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Foundation Verification Modal"
        description="Global modal dialog primitive with backdrop blur and escape key handler."
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-300">
            Current test input value: <span className="font-mono text-indigo-400">{testInput || "(empty)"}</span>
          </p>
          <div className="flex items-center gap-2 text-xs text-emerald-400">
            <CheckCircle2 className="h-4 w-4" />
            <span>Accessible keyboard navigation & focus trap active.</span>
          </div>
          <div className="flex justify-end pt-4">
            <Button variant="secondary" size="sm" onClick={() => setIsModalOpen(false)}>
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
