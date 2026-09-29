import { Lead } from "@prisma/client";
import { emailService } from "@/lib/services/email";
import { logger } from "@/lib/logger";

export interface NotificationService {
  sendLeadEmailNotification(lead: Lead): Promise<boolean>;
  sendLeadWhatsAppAlert(lead: Lead): Promise<boolean>;
}

export const notificationService: NotificationService = {
  /**
   * Dispatches both the client confirmation email and the admin inbound notification.
   * Catches errors internally to guarantee database resilience.
   */
  async sendLeadEmailNotification(lead: Lead): Promise<boolean> {
    try {
      logger.info(`[Notification Hook] Processing email notifications for lead: ${lead.id}`);

      // 1. Send confirmation to prospective client
      const clientEmailPromise = emailService.sendContactConfirmation({
        name: lead.name,
        email: lead.email,
        service: lead.service,
        budget: lead.budget,
        message: lead.message,
      });

      // 2. Send inbound notification alert to admin
      const adminEmailPromise = emailService.sendAdminNewLeadNotification({
        leadId: lead.id,
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        company: lead.company,
        service: lead.service,
        budget: lead.budget,
        message: lead.message,
        score: lead.score,
      });

      await Promise.allSettled([clientEmailPromise, adminEmailPromise]);
      return true;
    } catch (err) {
      logger.error("[Notification Hook] Failed to send lead notification emails", {
        leadId: lead.id,
        error: err instanceof Error ? err.message : String(err),
      });
      return false;
    }
  },

  async sendLeadWhatsAppAlert(lead: Lead): Promise<boolean> {
    logger.info(`[Notification Hook] Lead WhatsApp alert hook logged for lead ID: ${lead.id}`);
    return true;
  },
};
