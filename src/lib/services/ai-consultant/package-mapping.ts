/**
 * Maps the consultant's plain-language feature ids onto the /pricing feature matrix,
 * so every price the consultant quotes comes from the same catalogue as the pricing page.
 */

import { MASTER_FEATURES, normalizeMatrixFeatureId, type MatrixFeatureItem } from "@/data/pricing-matrix-data";
import { normalizeFeatureId } from "@/lib/pricing.config";

/** An empty list means every package already includes it; null means it is quoted separately. */
export const CONSULTANT_FEATURE_TO_MATRIX: Record<string, string[] | null> = {
  contact_form: [],
  whatsapp_chat: [],
  payment_gateway: ["payments_subscriptions_gateway"],
  whatsapp_alerts: ["communication_notifications_whatsapp_business"],
  booking_calendar: ["booking_scheduling_appointment_calendar"],
  ecommerce_cart: ["ecommerce_product_catalog", "ecommerce_cart_drawer", "ecommerce_checkout_pipeline"],
  user_login: ["user_accounts_authentication"],
  admin_dashboard: ["admin_business_operations_dashboard"],
  blog: ["content_cms_blog_engine"],
  gallery_showcase: ["website_pages_media_gallery"],
  email_notifications: ["communication_notifications_transactional_email"],
  seo_basic: ["seo_analytics_onpage_technical_seo"],
  speed_optimization: ["seo_analytics_core_web_vitals"],
  animations_smooth: ["website_pages_motion_choreography"],
  multilanguage: ["website_pages_multilingual_ui"],
  ai_chatbot: ["integrations_ai_support_chatbot"],
  newsletter_subscribe: ["communication_notifications_email_newsletter"],
  live_chat_support: null,
  coupon_discounts: ["ecommerce_discounts_coupons"],
  inventory_stock: ["ecommerce_variants_inventory"],
  invoice_generation: ["payments_subscriptions_automated_invoicing"],
  customer_reviews: ["content_cms_testimonials_faq_manager"],
  video_embed: ["website_pages_media_gallery"],
  faq_accordion: ["content_cms_testimonials_faq_manager"],
  pdf_download: ["content_cms_knowledge_base"],
  analytics_tracking: ["seo_analytics_google_analytics_tracking"],
  schema_structured: ["seo_analytics_onpage_technical_seo"],
  pwa_offline: null,
  dark_mode: ["website_pages_dark_light_mode"],
  interactive_calculator: null,
};

/** A database and an editable backend, needed by any site whose content or data changes after launch. */
export const DATABASE_BACKEND_ID = "backend_database_prisma_schema";
export const EDITABLE_CONTENT_ID = "content_cms_admin_portal";

/**
 * Resolves consultant feature ids to matrix ids. Ids that are already matrix ids pass through,
 * and anything with no matrix equivalent is returned as needing a separate quote.
 */
export function mapConsultantFeatures(
  featureIds: string[],
  features: MatrixFeatureItem[] = MASTER_FEATURES,
): { matrixIds: string[]; quoteOnly: string[] } {
  const matrixIds = new Set<string>();
  const quoteOnly = new Set<string>();

  for (const rawId of featureIds) {
    const id = normalizeFeatureId(rawId);
    if (id in CONSULTANT_FEATURE_TO_MATRIX) {
      const mapped = CONSULTANT_FEATURE_TO_MATRIX[id];
      if (mapped === null) quoteOnly.add(id);
      else mapped.forEach((matrixId) => matrixIds.add(matrixId));
      continue;
    }
    const matrixId = normalizeMatrixFeatureId(rawId);
    if (features.some((f) => f.id === matrixId)) matrixIds.add(matrixId);
    else quoteOnly.add(id);
  }

  return { matrixIds: Array.from(matrixIds), quoteOnly: Array.from(quoteOnly) };
}
