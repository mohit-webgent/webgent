"use client";

import { useState, useEffect, useCallback } from "react";
import {
  MessageSquareQuote,
  Plus,
  Star,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Trash2,
  Edit2,
  ArrowUp,
  ArrowDown,
  Loader2,
  Sparkles,
  Building,
  User,
  Quote,
} from "lucide-react";
import { ImageUpload } from "@/components/admin/image-upload";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

interface Testimonial {
  id: string;
  clientName: string;
  clientTitle: string | null;
  designation: string | null;
  company: string | null;
  content: string;
  quote: string;
  avatarUrl: string | null;
  photoUrl: string | null;
  rating: number;
  featured: boolean;
  status: "APPROVED" | "PENDING" | "REJECTED";
  order: number;
  createdAt: string;
}

export function TestimonialsManager() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Testimonial | null>(null);
  const [formData, setFormData] = useState({
    clientName: "",
    designation: "",
    company: "",
    quote: "",
    avatarUrl: "",
    rating: 5,
    featured: false,
    status: "APPROVED" as "APPROVED" | "PENDING" | "REJECTED",
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchTestimonials = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (statusFilter !== "ALL") params.set("status", statusFilter);

      const res = await fetch(`/api/admin/testimonials?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setTestimonials(json.data);
      }
    } catch (err) {
      console.error("Failed to load testimonials:", err);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    fetchTestimonials();
  }, [fetchTestimonials]);

  const handleOpenCreateModal = () => {
    setEditingItem(null);
    setFormData({
      clientName: "",
      designation: "",
      company: "",
      quote: "",
      avatarUrl: "",
      rating: 5,
      featured: false,
      status: "APPROVED",
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: Testimonial) => {
    setEditingItem(item);
    setFormData({
      clientName: item.clientName,
      designation: item.designation || item.clientTitle || "",
      company: item.company || "",
      quote: item.quote || item.content || "",
      avatarUrl: item.avatarUrl || item.photoUrl || "",
      rating: item.rating,
      featured: item.featured,
      status: item.status,
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSaveTestimonial = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSubmitting(true);

    try {
      const url = editingItem
        ? `/api/admin/testimonials/${editingItem.id}`
        : "/api/admin/testimonials";
      const method = editingItem ? "PUT" : "POST";

      const payload = {
        clientName: formData.clientName,
        designation: formData.designation || null,
        company: formData.company || null,
        quote: formData.quote,
        avatarUrl: formData.avatarUrl || null,
        rating: formData.rating,
        featured: formData.featured,
        status: formData.status,
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        setFormError(json.error?.message || "Failed to save testimonial.");
        return;
      }

      setIsModalOpen(false);
      fetchTestimonials();
    } catch {
      setFormError("A network error occurred. Please try again.");
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: "APPROVED" | "REJECTED" | "PENDING") => {
    try {
      setActionLoading(id);
      const res = await fetch(`/api/admin/testimonials/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const json = await res.json();
      if (json.success) {
        setTestimonials((prev) => prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t)));
      }
    } catch (err) {
      console.error("Status update error:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = (id: string) => {
    setDeleteTargetId(id);
  };

  const confirmDelete = async () => {
    if (!deleteTargetId) return;
    try {
      setDeleting(true);
      const res = await fetch(`/api/admin/testimonials/${deleteTargetId}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        setTestimonials((prev) => prev.filter((t) => t.id !== deleteTargetId));
      }
    } catch (err) {
      console.error("Delete error:", err);
    } finally {
      setDeleting(false);
      setDeleteTargetId(null);
    }
  };

  const handleMoveOrder = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= testimonials.length) return;

    const copy = [...testimonials];
    const temp = copy[index];
    copy[index] = copy[targetIndex];
    copy[targetIndex] = temp;

    const reordered = copy.map((item, idx) => ({ id: item.id, order: idx }));
    setTestimonials(copy);

    try {
      await fetch("/api/admin/testimonials/reorder", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: reordered }),
      });
    } catch (err) {
      console.error("Failed to reorder testimonials:", err);
      fetchTestimonials();
    }
  };

  const counts = {
    total: testimonials.length,
    approved: testimonials.filter((t) => t.status === "APPROVED").length,
    pending: testimonials.filter((t) => t.status === "PENDING").length,
    rejected: testimonials.filter((t) => t.status === "REJECTED").length,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <MessageSquareQuote className="w-6 h-6 text-pink-400" />
            <span>Testimonials & Reviews</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage client reviews, approve quotes, ratings, and social proof order.
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-semibold text-sm shadow-lg shadow-pink-600/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Testimonial</span>
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total</p>
          <p className="text-2xl font-extrabold text-white mt-1">{counts.total}</p>
        </div>
        <div className="bg-emerald-950/20 border border-emerald-800/40 rounded-2xl p-4">
          <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
            Approved
          </p>
          <p className="text-2xl font-extrabold text-emerald-300 mt-1">{counts.approved}</p>
        </div>
        <div className="bg-amber-950/20 border border-amber-800/40 rounded-2xl p-4">
          <p className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Pending</p>
          <p className="text-2xl font-extrabold text-amber-300 mt-1">{counts.pending}</p>
        </div>
        <div className="bg-rose-950/20 border border-rose-800/40 rounded-2xl p-4">
          <p className="text-xs font-semibold text-rose-400 uppercase tracking-wider">Rejected</p>
          <p className="text-2xl font-extrabold text-rose-300 mt-1">{counts.rejected}</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-slate-900/40 border border-slate-800/80 p-4 rounded-2xl">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by client, company, or quote..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-pink-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {(["ALL", "APPROVED", "PENDING", "REJECTED"] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                statusFilter === status
                  ? "bg-pink-600 text-white shadow-md shadow-pink-600/30"
                  : "bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              }`}
            >
              {status.charAt(0) + status.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-pink-500 mb-2" />
          <p className="text-sm">Loading testimonials...</p>
        </div>
      ) : testimonials.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/30 border border-slate-800/60 rounded-3xl p-8">
          <MessageSquareQuote className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No testimonials found</h3>
          <p className="text-sm text-slate-400 max-w-sm mx-auto mt-1">
            {search || statusFilter !== "ALL"
              ? "No testimonials match your current filters."
              : "Create your first client testimonial to display social proof on the website."}
          </p>
          {!search && statusFilter === "ALL" && (
            <button
              onClick={handleOpenCreateModal}
              className="mt-4 px-4 py-2 rounded-xl bg-pink-600 hover:bg-pink-500 text-white text-xs font-semibold transition-all"
            >
              Add First Testimonial
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {testimonials.map((item, index) => (
            <div
              key={item.id}
              className="group bg-slate-900/80 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-5 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-4 flex-1">
                <div className="flex flex-col items-center gap-1 shrink-0 pt-0.5">
                  <button
                    disabled={index === 0}
                    onClick={() => handleMoveOrder(index, "up")}
                    className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-all"
                    title="Move Up"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <span className="text-[11px] font-mono font-bold text-slate-500">
                    #{item.order}
                  </span>
                  <button
                    disabled={index === testimonials.length - 1}
                    onClick={() => handleMoveOrder(index, "down")}
                    className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-all"
                    title="Move Down"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                </div>

                <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-800 border border-slate-700/60 shrink-0 flex items-center justify-center">
                  {item.avatarUrl || item.photoUrl ? (
                    <img
                      src={item.avatarUrl || item.photoUrl || ""}
                      alt={item.clientName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-6 h-6 text-slate-400" />
                  )}
                </div>

                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-bold text-white text-base leading-tight">
                      {item.clientName}
                    </h3>
                    {(item.designation || item.clientTitle || item.company) && (
                      <span className="text-xs text-slate-400">
                        {[item.designation || item.clientTitle, item.company]
                          .filter(Boolean)
                          .join(" • ")}
                      </span>
                    )}

                    {item.featured && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-pink-500/10 border border-pink-500/30 text-pink-300 text-[10px] font-semibold">
                        <Sparkles className="w-3 h-3" />
                        <span>Featured</span>
                      </span>
                    )}

                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                        item.status === "APPROVED"
                          ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
                          : item.status === "PENDING"
                            ? "bg-amber-500/10 border border-amber-500/30 text-amber-400"
                            : "bg-rose-500/10 border border-rose-500/30 text-rose-400"
                      }`}
                    >
                      {item.status === "APPROVED" && <CheckCircle2 className="w-3 h-3" />}
                      {item.status === "PENDING" && <Clock className="w-3 h-3" />}
                      {item.status === "REJECTED" && <XCircle className="w-3 h-3" />}
                      <span>{item.status}</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-0.5 text-amber-400">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${
                          i < item.rating ? "fill-amber-400 text-amber-400" : "text-slate-700"
                        }`}
                      />
                    ))}
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed italic line-clamp-2">
                    &ldquo;{item.quote || item.content}&rdquo;
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                {item.status !== "APPROVED" && (
                  <button
                    disabled={actionLoading === item.id}
                    onClick={() => handleStatusChange(item.id, "APPROVED")}
                    className="px-2.5 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold transition-all flex items-center gap-1"
                    title="Approve Testimonial"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Approve</span>
                  </button>
                )}

                {item.status !== "REJECTED" && (
                  <button
                    disabled={actionLoading === item.id}
                    onClick={() => handleStatusChange(item.id, "REJECTED")}
                    className="px-2.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-semibold transition-all flex items-center gap-1"
                    title="Reject Testimonial"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Reject</span>
                  </button>
                )}

                <button
                  onClick={() => handleOpenEditModal(item)}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all"
                  title="Edit Testimonial"
                >
                  <Edit2 className="w-4 h-4" />
                </button>

                <button
                  disabled={actionLoading === item.id}
                  onClick={() => handleDelete(item.id)}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-all"
                  title="Delete Testimonial"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <MessageSquareQuote className="w-5 h-5 text-pink-400" />
                <span>{editingItem ? "Edit Testimonial" : "Create Testimonial"}</span>
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-xl text-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleSaveTestimonial} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-slate-300 font-semibold flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-pink-400" />
                    <span>Client Name *</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sarah Jenkins"
                    value={formData.clientName}
                    onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:border-pink-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-300 font-semibold flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-pink-400" />
                    <span>Designation / Role</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. VP of Product"
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:border-pink-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-300 font-semibold">Company / Organization</label>
                <input
                  type="text"
                  placeholder="e.g. Apex Global Systems"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:border-pink-500"
                />
              </div>

              <div className="space-y-1.5">
                <ImageUpload
                  label="Client Photo / Avatar"
                  folder="testimonials"
                  value={formData.avatarUrl}
                  onChange={(url) => setFormData({ ...formData, avatarUrl: url })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-300 font-semibold flex items-center gap-1.5">
                  <Quote className="w-3.5 h-3.5 text-pink-400" />
                  <span>Testimonial Quote / Content *</span>
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Share the client's detailed quote or review..."
                  value={formData.quote}
                  onChange={(e) => setFormData({ ...formData, quote: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:border-pink-500 leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                <div className="space-y-1.5">
                  <label className="text-slate-300 font-semibold">Rating (1 to 5 Stars)</label>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setFormData({ ...formData, rating: star })}
                        className="p-1 text-slate-500 hover:text-amber-400 focus:outline-none"
                      >
                        <Star
                          className={`w-5 h-5 ${
                            star <= formData.rating
                              ? "fill-amber-400 text-amber-400"
                              : "text-slate-700"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-300 font-semibold">Approval Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: e.target.value as "APPROVED" | "PENDING" | "REJECTED",
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-pink-500"
                  >
                    <option value="APPROVED">Approved (Public)</option>
                    <option value="PENDING">Pending Approval</option>
                    <option value="REJECTED">Rejected</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="featuredCheckbox"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-pink-600 focus:ring-0"
                  />
                  <label
                    htmlFor="featuredCheckbox"
                    className="text-slate-300 font-semibold cursor-pointer"
                  >
                    Highlight as Featured
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-5 py-2 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-semibold text-xs shadow-lg shadow-pink-600/30 transition-all flex items-center gap-2"
                >
                  {formSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingItem ? "Save Changes" : "Create Testimonial"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={!!deleteTargetId}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={confirmDelete}
        title="Delete Testimonial"
        description="Are you sure you want to permanently delete this client review? This action cannot be reversed."
        confirmText="Delete Review"
        isLoading={deleting}
      />
    </div>
  );
}
