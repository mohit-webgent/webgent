/**
 * Centralized WhatsApp Click-to-Chat Configuration & Utility
 * Publicly safe configuration - never put secrets here.
 */

export const WHATSAPP_CONFIG = {
  // Public WhatsApp number in E.164 digits without plus/spaces (e.g. 918800241462)
  number: (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "918800241462").replace(/[^0-9]/g, ""),
  // Formatted display number for UI cards
  displayNumber: "+91 8800241462",
  // Standard friendly default message as requested
  defaultMessage: "Hi Webgent! I visited your website and would like to know more about your services.",
};

export interface WhatsAppUrlOptions {
  phone?: string;
  message?: string;
  serviceName?: string;
}

/**
 * Builds a direct personal WhatsApp click-to-chat URL using the https://wa.me/<number>?text= format.
 */
export function buildWhatsAppUrl(options: WhatsAppUrlOptions = {}): string {
  const { phone, message, serviceName } = options;
  const rawNumber = phone || WHATSAPP_CONFIG.number;
  const cleanNumber = rawNumber.replace(/[^0-9]/g, "");

  let text = message;
  if (!text) {
    if (serviceName && serviceName.trim()) {
      text = `Hi Webgent! I visited your website and would like to know more about your ${serviceName.trim()} service.`;
    } else {
      text = WHATSAPP_CONFIG.defaultMessage;
    }
  }

  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(text)}`;
}

/**
 * Convenience helper for service-specific WhatsApp URLs
 */
export function getServiceWhatsAppUrl(serviceName: string, phone?: string): string {
  return buildWhatsAppUrl({ serviceName, phone });
}
