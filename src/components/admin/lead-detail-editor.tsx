"use client";

import { useState } from "react";
import {
  ArrowLeft,
  Calendar,
  Mail,
  Phone,
  Building2,
  Tag,
  DollarSign,
  Star,
  Clock,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  FileText,
  Globe,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/toast";

interface Lead {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  company?: string | null;
  service?: string | null;
  budget?: string | null;
  message: string;
  status: "NEW" | "CONTACTED" | "PROPOSAL_SENT" | "WON" | "LOST" | "ON_HOLD";
  score: number;
  notes?: string | null;
  followUpDate?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt: string;
  updatedAt: string;
}

export function LeadDetailEditor({ initialLead }: { initialLead: Lead }) {
  const router = useRouter();
  const toast = useToast();
  const [status, setStatus] = useState(initialLead.status);
  const [notes, setNotes] = useState(initialLead.notes || "");
  const [followUpDate, setFollowUpDate] = useState(
    initialLead.followUpDate ? new Date(initialLead.followUpDate).toISOString().split("T")[0] : "",
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const res = await fetch(`/api/admin/leads/${initialLead.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          notes,
          followUpDate: followUpDate ? new Date(followUpDate).toISOString() : null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        const errMsg = data.error?.message || "Failed to update lead.";
        setError(errMsg);
        toast.error(errMsg);
        setLoading(false);
        return;
      }

      setSuccess("Lead updated successfully!");
      toast.success("Lead record saved successfully");
      router.refresh();
    } catch {
      setError("An unexpected network error occurred.");
      toast.error("Network error while updating lead");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLead = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/leads/${initialLead.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Lead deleted successfully");
        router.push("/admin/leads");
      } else {
        const data = await res.json();
        toast.error(data.error?.message || "Failed to delete lead");
      }
    } catch {
      toast.error("Network error deleting lead");
    } finally {
      setDeleting(false);
      setDeleteModalOpen(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <Link
          href="/admin/leads"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Leads</span>
        </Link>

        <button
          type="button"
          onClick={() => setDeleteModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-semibold transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Delete Lead</span>
        </button>
      </div>

      <ConfirmDialog
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteLead}
        title="Delete Lead Record"
        description={`Are you sure you want to permanently delete the inquiry from ${initialLead.name}? This action cannot be reversed.`}
        confirmText="Delete Lead"
        isLoading={deleting}
      />

      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold text-white">{initialLead.name}</h1>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Star className="w-3.5 h-3.5" />
              Score: {initialLead.score}/100
            </span>
          </div>
          <p className="text-xs text-slate-400 flex items-center gap-3">
            <span>
              Inquiry ID: <code className="font-mono text-slate-300">{initialLead.id}</code>
            </span>
            <span>•</span>
            <span>Submitted {new Date(initialLead.createdAt).toLocaleString()}</span>
          </p>
        </div>
      </div>

      {error && (
        <div
          id="lead-update-error"
          className="p-4 rounded-2xl bg-red-950/60 border border-red-800/60 text-red-200 text-sm flex items-start gap-3"
        >
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div
          id="lead-update-success"
          className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-800/60 text-emerald-200 text-sm flex items-start gap-3"
        >
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <span>{success}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-400" />
              <span>Project Description & Message</span>
            </h3>
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-slate-200 text-sm leading-relaxed whitespace-pre-wrap">
              {initialLead.message}
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4">
            <h3 className="text-base font-bold text-white">Contact & Requirement Specs</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-slate-500 font-semibold uppercase text-[10px]">
                  Email Address
                </span>
                <p className="text-white font-medium flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-indigo-400" />
                  {initialLead.email}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-slate-500 font-semibold uppercase text-[10px]">
                  Phone Number
                </span>
                <p className="text-white font-medium flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-indigo-400" />
                  {initialLead.phone || "Not provided"}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-slate-500 font-semibold uppercase text-[10px]">
                  Company / Organization
                </span>
                <p className="text-white font-medium flex items-center gap-2">
                  <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                  {initialLead.company || "Individual"}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-slate-500 font-semibold uppercase text-[10px]">
                  Requested Service
                </span>
                <p className="text-white font-medium flex items-center gap-2">
                  <Tag className="w-3.5 h-3.5 text-indigo-400" />
                  {initialLead.service || "General Inquiry"}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-slate-500 font-semibold uppercase text-[10px]">
                  Estimated Budget
                </span>
                <p className="text-white font-medium flex items-center gap-2">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                  {initialLead.budget || "Not specified"}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-slate-500 font-semibold uppercase text-[10px]">
                  Client Metadata
                </span>
                <p className="text-slate-300 font-mono text-[11px] flex items-center gap-2 truncate">
                  <Globe className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  IP: {initialLead.ipAddress || "Unknown"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <form
            onSubmit={handleSave}
            className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6"
          >
            <h3 className="text-base font-bold text-white">Lead Operations</h3>

            <div>
              <label
                htmlFor="lead-status-select"
                className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2"
              >
                Lead Status
              </label>
              <select
                id="lead-status-select"
                value={status}
                onChange={(e) => setStatus(e.target.value as Lead["status"])}
                className="w-full py-2.5 px-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="NEW">NEW</option>
                <option value="CONTACTED">CONTACTED</option>
                <option value="PROPOSAL_SENT">PROPOSAL SENT</option>
                <option value="WON">WON</option>
                <option value="LOST">LOST</option>
                <option value="ON_HOLD">ON HOLD</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="lead-followup-date"
                className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2"
              >
                Scheduled Follow-up Date
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 absolute left-3 top-3 text-slate-500 pointer-events-none" />
                <input
                  id="lead-followup-date"
                  type="date"
                  value={followUpDate}
                  onChange={(e) => setFollowUpDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="lead-notes-textarea"
                className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2"
              >
                Internal Notes & Follow-up History
              </label>
              <textarea
                id="lead-notes-textarea"
                rows={6}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add internal call notes, meeting takeaways, proposal links..."
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <button
              id="save-lead-button"
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving Updates...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Lead Updates</span>
                </>
              )}
            </button>
          </form>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 text-xs text-slate-400 space-y-2">
            <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
              <span>Audit Trail</span>
            </div>
            <p>Last modified: {new Date(initialLead.updatedAt).toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
