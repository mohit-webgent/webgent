import { Lead } from "@prisma/client";
import { emailService } from "@/lib/services/email";
import { logger } from "@/lib/logger";

/**
 * Concise sanitized payload for lead notifications.
 * Never includes passwords, internal tokens, or unnecessary personal identifiers.
 */
export interface LeadNotificationPayload {
  id?: string;
  name: string;
  email: string;
  phone?: string | null;
  company?: string | null;
  service?: string | null;
  budget?: string | null;
  score?: number | null;
  timeline?: string | null;
  message?: string | null;
}

export interface ProviderResult {
  provider: string;
  success: boolean;
  messageId?: string;
  error?: string;
  simulated?: boolean;
}

export interface NotificationResult {
  success: boolean;
  leadId?: string;
  results: ProviderResult[];
}

export interface NotificationProvider {
  readonly name: string;
  isEnabled(): boolean;
  send(payload: LeadNotificationPayload): Promise<ProviderResult>;
}

/**
 * Derives a score priority tag from numeric lead score
 */
function getScorePriority(score?: number | null): string {
  const val = score ?? 0;
  if (val >= 70) return "🔥 High Priority";
  if (val >= 40) return "⚡ Medium Priority";
  return "📋 Standard";
}

/**
 * Formats a concise, privacy-safe text message for chat/messaging alerts
 */
export function formatLeadMessage(payload: LeadNotificationPayload): string {
  const service = payload.service || "General Inquiry";
  const budget = payload.budget || "Not Specified";
  const score = payload.score !== undefined && payload.score !== null ? `${payload.score}/100` : "N/A";
  const timeline = payload.timeline || "Flexible / Standard";
  const priority = getScorePriority(payload.score);

  return [
    `🚀 *New Inbound Lead — Webgent*`,
    `• *Name*: ${payload.name}`,
    `• *Service*: ${service}`,
    `• *Budget*: ${budget}`,
    `• *Lead Score*: ${score} (${priority})`,
    `• *Timeline*: ${timeline}`,
  ].join("\n");
}

// ----------------------------------------------------------------------
// 1. Primary: Twilio WhatsApp Notification Provider
// ----------------------------------------------------------------------
export class TwilioWhatsAppProvider implements NotificationProvider {
  readonly name = "twilio_whatsapp";

  isEnabled(): boolean {
    const accountSid = process.env.TWILIO_ACCOUNT_SID?.trim();
    const authToken = process.env.TWILIO_AUTH_TOKEN?.trim();
    const to = process.env.ADMIN_WHATSAPP_TO?.trim();

    return !!(accountSid && authToken && to);
  }

  async send(payload: LeadNotificationPayload): Promise<ProviderResult> {
    const accountSid = process.env.TWILIO_ACCOUNT_SID?.trim();
    const authToken = process.env.TWILIO_AUTH_TOKEN?.trim();
    const fromNumber = process.env.TWILIO_WHATSAPP_FROM?.trim() || "+14155238886";
    const toNumber = process.env.ADMIN_WHATSAPP_TO?.trim();

    const text = formatLeadMessage(payload);

    // Development / Test / Unconfigured Mode Simulation
    if (
      !accountSid ||
      !authToken ||
      !toNumber ||
      accountSid.startsWith("ACxxx") ||
      accountSid.length < 10
    ) {
      logger.info("[Notification:TwilioWhatsApp] Simulated send (credentials not configured)", {
        leadId: payload.id,
        recipient: toNumber || "(none configured)",
        preview: text.replace(/\n/g, " "),
      });
      return {
        provider: this.name,
        success: true,
        messageId: `sim_tw_${Date.now()}`,
        simulated: true,
      };
    }

    try {
      const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
      const formattedFrom = fromNumber.startsWith("whatsapp:") ? fromNumber : `whatsapp:${fromNumber}`;
      const formattedTo = toNumber.startsWith("whatsapp:") ? toNumber : `whatsapp:${toNumber}`;

      const formData = new URLSearchParams();
      formData.append("From", formattedFrom);
      formData.append("To", formattedTo);
      formData.append("Body", text);

      const basicAuth = Buffer.from(`${accountSid}:${authToken}`).toString("base64");

      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Basic ${basicAuth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData.toString(),
      });

      const responseData = await response.json().catch(() => ({}));

      if (!response.ok) {
        const errorMsg = responseData.message || responseData.error_message || `HTTP ${response.status}`;
        logger.error("[Notification:TwilioWhatsApp] Twilio API call failed", {
          leadId: payload.id,
          status: response.status,
          error: errorMsg,
        });
        return {
          provider: this.name,
          success: false,
          error: errorMsg,
        };
      }

      logger.info("[Notification:TwilioWhatsApp] Message sent successfully", {
        leadId: payload.id,
        sid: responseData.sid,
      });

      return {
        provider: this.name,
        success: true,
        messageId: responseData.sid,
      };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      logger.error("[Notification:TwilioWhatsApp] Network or execution error", {
        leadId: payload.id,
        error: errorMsg,
      });
      return {
        provider: this.name,
        success: false,
        error: errorMsg,
      };
    }
  }
}

// ----------------------------------------------------------------------
// 2. Alternative: WhatsApp Business Cloud API (Meta Graph API)
// ----------------------------------------------------------------------
export class WhatsAppCloudProvider implements NotificationProvider {
  readonly name = "whatsapp_cloud";

  isEnabled(): boolean {
    const token = process.env.WHATSAPP_API_TOKEN?.trim();
    const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID?.trim();
    const to = process.env.ADMIN_WHATSAPP_TO?.trim();
    return !!(token && phoneId && to);
  }

  async send(payload: LeadNotificationPayload): Promise<ProviderResult> {
    const token = process.env.WHATSAPP_API_TOKEN?.trim();
    const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID?.trim();
    const to = process.env.ADMIN_WHATSAPP_TO?.trim()?.replace(/[^0-9]/g, "");

    const text = formatLeadMessage(payload);

    if (!token || !phoneId || !to) {
      return {
        provider: this.name,
        success: true,
        simulated: true,
      };
    }

    try {
      const url = `https://graph.facebook.com/v18.0/${phoneId}/messages`;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to,
          type: "text",
          text: { preview_url: false, body: text },
        }),
      });

      const responseData = await response.json().catch(() => ({}));

      if (!response.ok) {
        const errorMsg = responseData.error?.message || `HTTP ${response.status}`;
        logger.error("[Notification:WhatsAppCloud] Cloud API error", {
          leadId: payload.id,
          error: errorMsg,
        });
        return {
          provider: this.name,
          success: false,
          error: errorMsg,
        };
      }

      return {
        provider: this.name,
        success: true,
        messageId: responseData.messages?.[0]?.id,
      };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      logger.error("[Notification:WhatsAppCloud] Request failed", {
        leadId: payload.id,
        error: errorMsg,
      });
      return {
        provider: this.name,
        success: false,
        error: errorMsg,
      };
    }
  }
}

// ----------------------------------------------------------------------
// 3. Optional: Slack Incoming Webhook Provider
// ----------------------------------------------------------------------
export class SlackWebhookProvider implements NotificationProvider {
  readonly name = "slack_webhook";

  isEnabled(): boolean {
    const webhookUrl = process.env.SLACK_WEBHOOK_URL?.trim();
    return !!(webhookUrl && /^https?:\/\//i.test(webhookUrl));
  }

  async send(payload: LeadNotificationPayload): Promise<ProviderResult> {
    const webhookUrl = process.env.SLACK_WEBHOOK_URL?.trim();

    if (!webhookUrl || !/^https?:\/\//i.test(webhookUrl)) {
      return {
        provider: this.name,
        success: true,
        simulated: true,
      };
    }

    try {
      const service = payload.service || "General Inquiry";
      const budget = payload.budget || "Not Specified";
      const score = payload.score !== undefined && payload.score !== null ? `${payload.score}/100` : "N/A";
      const timeline = payload.timeline || "Flexible / Standard";

      const body = {
        text: `🚀 *New Lead Inbound: ${payload.name}*`,
        blocks: [
          {
            type: "header",
            text: {
              type: "plain_text",
              text: "🚀 New Webgent Lead Inbound",
              emoji: true,
            },
          },
          {
            type: "section",
            fields: [
              { type: "mrkdwn", text: `*Name:*\n${payload.name}` },
              { type: "mrkdwn", text: `*Service:*\n${service}` },
              { type: "mrkdwn", text: `*Budget:*\n${budget}` },
              { type: "mrkdwn", text: `*Lead Score:*\n${score} (${getScorePriority(payload.score)})` },
              { type: "mrkdwn", text: `*Timeline:*\n${timeline}` },
            ],
          },
        ],
      };

      const res = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errorText = await res.text().catch(() => "");
        logger.error("[Notification:Slack] Webhook call returned non-200", {
          status: res.status,
          error: errorText,
          leadId: payload.id,
        });
        return {
          provider: this.name,
          success: false,
          error: errorText || `HTTP ${res.status}`,
        };
      }

      logger.info("[Notification:Slack] Sent notification to Slack channel", { leadId: payload.id });
      return {
        provider: this.name,
        success: true,
      };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      logger.error("[Notification:Slack] Failed to execute Slack webhook", {
        leadId: payload.id,
        error: errorMsg,
      });
      return {
        provider: this.name,
        success: false,
        error: errorMsg,
      };
    }
  }
}

// ----------------------------------------------------------------------
// 4. Admin & Client Email Notification Provider (Resend)
// ----------------------------------------------------------------------
export class EmailNotificationProvider implements NotificationProvider {
  readonly name = "email";

  isEnabled(): boolean {
    return true; // Always enabled; fallback/simulated mode handled in emailService
  }

  async send(payload: LeadNotificationPayload): Promise<ProviderResult> {
    try {
      // 1. Inbound alert to admin
      const adminPromise = emailService.sendAdminNewLeadNotification({
        leadId: payload.id || "new-lead",
        name: payload.name,
        email: payload.email,
        phone: payload.phone,
        company: payload.company,
        service: payload.service,
        budget: payload.budget,
        message: payload.message || "",
        score: payload.score ?? 0,
      });

      // 2. Confirmation copy to prospective client
      const clientPromise = emailService.sendContactConfirmation({
        name: payload.name,
        email: payload.email,
        service: payload.service,
        budget: payload.budget,
        message: payload.message || "",
      });

      const [adminRes, clientRes] = await Promise.allSettled([adminPromise, clientPromise]);
      const adminSuccess = adminRes.status === "fulfilled" && Boolean(adminRes.value);
      const clientSuccess = clientRes.status === "fulfilled" && Boolean(clientRes.value);

      const success = adminSuccess || clientSuccess;

      return {
        provider: this.name,
        success,
        messageId: `email_lead_${payload.id || Date.now()}`,
      };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      logger.error("[Notification:Email] Failed to dispatch emails", {
        leadId: payload.id,
        error: errorMsg,
      });
      return {
        provider: this.name,
        success: false,
        error: errorMsg,
      };
    }
  }
}

// ----------------------------------------------------------------------
// NotificationService: Central Abstraction
// ----------------------------------------------------------------------
export class NotificationService {
  private providers: Map<string, NotificationProvider> = new Map();

  constructor() {
    // Register default providers
    this.registerProvider(new TwilioWhatsAppProvider());
    this.registerProvider(new WhatsAppCloudProvider());
    this.registerProvider(new SlackWebhookProvider());
    this.registerProvider(new EmailNotificationProvider());
  }

  /**
   * Register a new notification provider.
   * Enables seamless addition of future providers without altering core logic.
   */
  registerProvider(provider: NotificationProvider): void {
    this.providers.set(provider.name, provider);
  }

  /**
   * Unregister an existing provider
   */
  unregisterProvider(name: string): boolean {
    return this.providers.delete(name);
  }

  /**
   * Get all registered providers
   */
  getProviders(): NotificationProvider[] {
    return Array.from(this.providers.values());
  }

  /**
   * Dispatches new lead notification across all registered and enabled channels.
   *
   * Guarantees:
   * 1. Concise lead information (name, service, budget, lead score, timeline)
   * 2. No unnecessary sensitive data exposure
   * 3. Failures are caught and logged safely
   * 4. Failure will never corrupt or roll back the primary database record
   */
  async sendNewLeadNotification(
    lead: Lead | LeadNotificationPayload
  ): Promise<NotificationResult> {
    const payload: LeadNotificationPayload = {
      id: lead.id,
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      company: lead.company,
      service: lead.service,
      budget: lead.budget,
      score: "score" in lead ? lead.score : undefined,
      timeline: "timeline" in lead && lead.timeline ? lead.timeline : extractTimeline(lead),
      message: lead.message,
    };

    logger.info(`[NotificationService] Dispatching new lead notification`, {
      leadId: payload.id,
      score: payload.score,
    });

    const activeProviders = this.getProviders();
    const sendPromises = activeProviders.map(async (provider) => {
      try {
        return await provider.send(payload);
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        logger.error(`[NotificationService] Unexpected error in provider ${provider.name}`, {
          leadId: payload.id,
          error: errorMsg,
        });
        return {
          provider: provider.name,
          success: false,
          error: errorMsg,
        };
      }
    });

    const settled = await Promise.allSettled(sendPromises);
    const results: ProviderResult[] = settled.map((res, idx) => {
      if (res.status === "fulfilled") {
        return res.value;
      }
      return {
        provider: activeProviders[idx].name,
        success: false,
        error: String(res.reason),
      };
    });

    // Check if at least one provider succeeded
    const anySuccess = results.some((r) => r.success);

    return {
      success: anySuccess,
      leadId: payload.id,
      results,
    };
  }

  // Backwards compatibility methods
  async sendLeadEmailNotification(lead: Lead): Promise<boolean> {
    const res = await this.sendNewLeadNotification(lead);
    return res.success;
  }

  async sendLeadWhatsAppAlert(lead: Lead): Promise<boolean> {
    const twilio = this.providers.get("twilio_whatsapp");
    if (!twilio) return true;
    const res = await twilio.send(lead);
    return res.success;
  }
}

/**
 * Extracts or infers project timeline from notes, message, or budget
 */
function extractTimeline(lead: Lead | LeadNotificationPayload): string {
  const text = `${"notes" in lead ? lead.notes || "" : ""} ${lead.message || ""}`.toLowerCase();

  if (text.includes("urgent") || text.includes("asap") || text.includes("immediately")) {
    return "Immediate / Urgent";
  }
  if (text.includes("1 month") || text.includes("30 days") || text.includes("4 weeks")) {
    return "1 Month";
  }
  if (text.includes("quarter") || text.includes("3 months") || text.includes("90 days")) {
    return "1-3 Months";
  }
  if (text.includes("6 months") || text.includes("long term")) {
    return "3-6 Months";
  }

  return "Flexible / Standard";
}

export const notificationService = new NotificationService();
