export type LeadStatus = "NEW" | "CONTACTED" | "PROPOSAL_SENT" | "WON" | "LOST" | "ON_HOLD";

/** One set of labels and colours for lead statuses everywhere in the admin console. */
export const LEAD_STATUS_CONFIG: Record<LeadStatus, { label: string; badge: string; value: string }> = {
  NEW: {
    label: "New",
    badge: "bg-accent/10 text-accent border-accent/30",
    value: "text-accent",
  },
  CONTACTED: {
    label: "Contacted",
    badge: "bg-white/[0.05] text-fg-soft border-line-strong",
    value: "text-fg-soft",
  },
  PROPOSAL_SENT: {
    label: "Proposal Sent",
    badge: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    value: "text-amber-400",
  },
  WON: {
    label: "Won",
    badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    value: "text-emerald-400",
  },
  LOST: {
    label: "Lost",
    badge: "bg-rose-500/10 text-rose-400 border-rose-500/30",
    value: "text-rose-400",
  },
  ON_HOLD: {
    label: "On Hold",
    badge: "bg-white/[0.03] text-fg-muted border-line",
    value: "text-fg-muted",
  },
};

export function getLeadStatusBadge(status: string): string {
  return LEAD_STATUS_CONFIG[status as LeadStatus]?.badge ?? LEAD_STATUS_CONFIG.ON_HOLD.badge;
}
