import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";

const MAX_LEAD_MESSAGE_LENGTH = 4000;
const MAX_LEAD_NOTES_LENGTH = 20_000;
const DEDUPE_WINDOW_MS = 24 * 60 * 60 * 1000;

export interface ChatLeadInput {
  sessionId: string;
  /** The lead this chat session created earlier, stored server-side in the session metadata. */
  ownedLeadId?: string;
  name: string;
  email: string;
  service: string;
  budget?: string;
  notes?: string;
  message: string;
  ipAddress?: string;
  userAgent?: string;
  score: number;
}

export type ChatLeadResult =
  | { outcome: "created" | "updated"; leadId: string }
  | { outcome: "referenced"; leadId: string };

function appendToMessage(existing: string, addition: string): string {
  const combined = `${existing}\n---\n${addition}`;
  return combined.length > MAX_LEAD_MESSAGE_LENGTH
    ? combined.slice(combined.length - MAX_LEAD_MESSAGE_LENGTH)
    : combined;
}

/**
 * Creates or updates the lead for a chat session.
 *
 * Email addresses in chat are unverified, so an email alone gives no right to change a lead. A session
 * may only edit the lead it created. If another recent lead already uses the email, it is left intact
 * apart from a note pointing to the new session, so anyone typing someone else's address cannot
 * overwrite their details.
 */
export async function syncChatLead(input: ChatLeadInput): Promise<ChatLeadResult> {
  const email = input.email.trim().toLowerCase();

  if (input.ownedLeadId) {
    const owned = await prisma.lead.findUnique({ where: { id: input.ownedLeadId } });
    if (owned) {
      await prisma.lead.update({
        where: { id: owned.id },
        data: {
          name: input.name || owned.name,
          email,
          service: input.service,
          budget: input.budget || owned.budget,
          notes: input.notes || owned.notes,
          message: appendToMessage(owned.message, input.message),
        },
      });
      return { outcome: "updated", leadId: owned.id };
    }
  }

  const existing = await prisma.lead.findFirst({
    where: {
      email: { equals: email, mode: "insensitive" },
      createdAt: { gte: new Date(Date.now() - DEDUPE_WINDOW_MS) },
    },
    orderBy: { createdAt: "desc" },
  });

  if (existing) {
    const reference = `[Unverified] Chat session ${input.sessionId} also used this email.`;
    if ((existing.notes?.length ?? 0) < MAX_LEAD_NOTES_LENGTH && !existing.notes?.includes(input.sessionId)) {
      await prisma.lead
        .update({
          where: { id: existing.id },
          data: { notes: existing.notes ? `${existing.notes}\n${reference}` : reference },
        })
        .catch((error) => logger.warn("[ChatLeads] Could not add session note", { error: String(error) }));
    }
    return { outcome: "referenced", leadId: existing.id };
  }

  const created = await prisma.lead.create({
    data: {
      name: input.name,
      email,
      service: input.service,
      budget: input.budget,
      notes: input.notes,
      message: input.message,
      ipAddress: input.ipAddress,
      userAgent: input.userAgent,
      status: "NEW",
      score: input.score,
    },
  });

  return { outcome: "created", leadId: created.id };
}
