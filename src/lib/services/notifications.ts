import { Lead } from "@prisma/client";
import { logger } from "@/lib/logger";

export interface NotificationService {
  sendLeadEmailNotification(lead: Lead): Promise<boolean>;
  sendLeadWhatsAppAlert(lead: Lead): Promise<boolean>;
}

export const notificationService: NotificationService = {
  async sendLeadEmailNotification(lead: Lead): Promise<boolean> {
    logger.info(`[Notification Hook] Lead email notification queued for lead ID: ${lead.id} (${lead.email})`);
    return true;
  },

  async sendLeadWhatsAppAlert(lead: Lead): Promise<boolean> {
    logger.info(`[Notification Hook] Lead WhatsApp alert queued for lead ID: ${lead.id} (${lead.phone || "No phone"})`);
    return true;
  },
};
