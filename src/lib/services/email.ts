import { Resend } from "resend";
import { render } from "@react-email/components";
import * as React from "react";
import { logger } from "@/lib/logger";

import {
  ContactConfirmationEmail,
  ContactConfirmationEmailProps,
} from "@/components/emails/contact-confirmation";
import {
  AdminLeadNotificationEmail,
  AdminLeadNotificationEmailProps,
} from "@/components/emails/admin-lead-notification";
import { NewsletterConfirmationEmail } from "@/components/emails/newsletter-confirmation";
import {
  NewsletterUnsubscribedEmail,
  NewsletterUnsubscribedEmailProps,
} from "@/components/emails/newsletter-unsubscribed";
import {
  NewsletterDigestEmail,
  NewsletterDigestEmailProps,
} from "@/components/emails/newsletter-digest";

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  react?: React.ReactElement;
  from?: string;
  replyTo?: string;
}

export interface EmailService {
  sendEmail(options: SendEmailOptions): Promise<boolean>;
  sendContactConfirmation(
    props: ContactConfirmationEmailProps & { email: string },
  ): Promise<boolean>;
  sendAdminNewLeadNotification(props: AdminLeadNotificationEmailProps): Promise<boolean>;
  sendNewsletterConfirmation(email: string, token: string, name?: string | null): Promise<boolean>;
  sendNewsletterWelcome(
    email: string,
    name?: string | null,
    unsubscribeToken?: string | null,
  ): Promise<boolean>;
  sendNewsletterUnsubscribed(props: NewsletterUnsubscribedEmailProps): Promise<boolean>;
  sendNewsletterDigest(to: string, props: NewsletterDigestEmailProps): Promise<boolean>;
}

class ResendEmailService implements EmailService {
  private resend: Resend | null = null;
  private isConfigured = false;

  constructor() {
    const apiKey = process.env.RESEND_API_KEY?.trim();

    if (
      apiKey &&
      apiKey.startsWith("re_") &&
      !apiKey.includes("placeholder") &&
      apiKey !== "re_123456789_abcdefg"
    ) {
      this.resend = new Resend(apiKey);
      this.isConfigured = true;
    }
  }

  private getFromAddress(override?: string): string {
    if (override) return override;
    return process.env.EMAIL_FROM || "Webgent <onboarding@resend.dev>";
  }

  private getAdminEmail(): string {
    return (
      process.env.ADMIN_NOTIFICATION_EMAIL || process.env.SEED_ADMIN_EMAIL || "admin@webgent.com"
    );
  }

  private maskEmail(email: string): string {
    const parts = email.split("@");
    if (parts.length !== 2) return "***";
    const [local, domain] = parts;
    const maskedLocal =
      local.length > 2 ? `${local[0]}***${local[local.length - 1]}` : `${local[0]}*`;
    return `${maskedLocal}@${domain}`;
  }

  async sendEmail(options: SendEmailOptions): Promise<boolean> {
    try {
      const from = this.getFromAddress(options.from);
      const recipients = Array.isArray(options.to) ? options.to : [options.to];

      let html = options.html;
      if (!html && options.react) {
        html = await render(options.react);
      }

      if (!html && !options.text) {
        logger.error(
          "[Email Service] Neither html, react, nor text was provided for email dispatch",
        );
        return false;
      }

      if (this.isConfigured && this.resend) {
        const payload = html
          ? {
              from,
              to: recipients,
              subject: options.subject,
              html,
              text: options.text,
              replyTo: options.replyTo,
            }
          : {
              from,
              to: recipients,
              subject: options.subject,
              text: options.text || "",
              replyTo: options.replyTo,
            };

        const response = await this.resend.emails.send(payload);

        if (response.error) {
          logger.error("[Email Service] Resend provider returned an error", {
            error: response.error.message,
            name: response.error.name,
            recipients: recipients.map((r) => this.maskEmail(r)),
          });
          return false;
        }

        logger.info("[Email Service] Email sent successfully via Resend", {
          id: response.data?.id,
          subject: options.subject,
          recipients: recipients.map((r) => this.maskEmail(r)),
        });

        return true;
      }

      logger.info(
        `[Email Service Simulation] Mock email dispatched for subject: "${options.subject}"`,
        {
          from,
          recipients: recipients.map((r) => this.maskEmail(r)),
          subject: options.subject,
          htmlLength: html?.length || 0,
          textPreview: options.text?.substring(0, 100),
          mode: "development/test_mock",
        },
      );

      return true;
    } catch (error) {
      logger.error("[Email Service] Unexpected error in email sending pipeline", {
        error: error instanceof Error ? error.message : String(error),
      });
      return false;
    }
  }

  async sendContactConfirmation(
    props: ContactConfirmationEmailProps & { email: string },
  ): Promise<boolean> {
    const reactElement = React.createElement(ContactConfirmationEmail, {
      name: props.name,
      service: props.service,
      budget: props.budget,
      message: props.message,
    });

    const plainText = `Hi ${props.name},\n\nThank you for reaching out to Webgent! We have received your project inquiry and a technical specialist will get in touch with you within 24 business hours.\n\nBest regards,\nThe Webgent Team`;

    return this.sendEmail({
      to: props.email,
      subject: "We've received your inquiry — Webgent",
      react: reactElement,
      text: plainText,
    });
  }

  async sendAdminNewLeadNotification(props: AdminLeadNotificationEmailProps): Promise<boolean> {
    const adminTo = this.getAdminEmail();

    const reactElement = React.createElement(AdminLeadNotificationEmail, props);

    const plainText = `[NEW LEAD INBOUND]\nClient: ${props.name}\nEmail: ${props.email}\nPhone: ${props.phone || "N/A"}\nCompany: ${props.company || "N/A"}\nService: ${props.service || "N/A"}\nBudget: ${props.budget || "N/A"}\nScore: ${props.score}/100\nMessage: ${props.message}`;

    return this.sendEmail({
      to: adminTo,
      subject: `⚡ New Lead: ${props.name} (${props.company || "Individual"}) — Score ${props.score}/100`,
      react: reactElement,
      text: plainText,
      replyTo: props.email,
    });
  }

  async sendNewsletterConfirmation(
    email: string,
    token: string,
    name?: string | null,
  ): Promise<boolean> {
    const reactElement = React.createElement(NewsletterConfirmationEmail, {
      email,
      token,
      name,
    });

    const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://webgent.com").replace(/\/$/, "");
    const confirmUrl = `${appUrl}/api/newsletter/confirm?token=${encodeURIComponent(token)}`;

    const plainText = `Hello${name ? ` ${name}` : ""},\n\nPlease confirm your subscription to the Webgent Newsletter by visiting:\n${confirmUrl}\n\nThis verification link is valid for 24 hours.\n\nBest regards,\nThe Webgent Team`;

    return this.sendEmail({
      to: email,
      subject: "Please confirm your subscription to Webgent Newsletter",
      react: reactElement,
      text: plainText,
    });
  }

  async sendNewsletterWelcome(
    email: string,
    name?: string | null,
    unsubscribeToken?: string | null,
  ): Promise<boolean> {
    const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://webgent.com").replace(/\/$/, "");
    const unsubUrl = unsubscribeToken
      ? `${appUrl}/api/newsletter/unsubscribe?token=${encodeURIComponent(unsubscribeToken)}`
      : `${appUrl}/api/newsletter/unsubscribe`;

    const greeting = name ? `Hello ${name}` : "Hello";
    const plainText = `${greeting},\n\nYour subscription to the Webgent Newsletter is now active! You will receive our latest engineering showcases and tech insights.\n\nTo unsubscribe at any time: ${unsubUrl}\n\nBest regards,\nThe Webgent Team`;

    const html = `
      <!DOCTYPE html>
      <html>
        <body style="font-family: sans-serif; background-color: #070a12; color: #f8fafc; padding: 40px 20px;">
          <div style="max-width: 560px; margin: 0 auto; background-color: #0f172a; border: 1px solid #1e293b; border-radius: 16px; padding: 32px;">
            <h1 style="color: #6366f1; margin-top: 0;">Welcome to Webgent Newsletter! 🎉</h1>
            <p style="color: #94a3b8; font-size: 15px; line-height: 1.6;">${greeting},</p>
            <p style="color: #94a3b8; font-size: 15px; line-height: 1.6;">
              Your subscription is now confirmed. You are officially on the list to receive our latest engineering articles, architecture breakdowns, and tech updates.
            </p>
            <p style="color: #64748b; font-size: 12px; margin-top: 32px; border-top: 1px solid #1e293b; padding-top: 16px;">
              You can <a href="${unsubUrl}" style="color: #818cf8;">unsubscribe here</a> at any time.
            </p>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({
      to: email,
      subject: "Welcome to Webgent Newsletter!",
      html,
      text: plainText,
    });
  }

  async sendNewsletterUnsubscribed(props: NewsletterUnsubscribedEmailProps): Promise<boolean> {
    const reactElement = React.createElement(NewsletterUnsubscribedEmail, props);

    const plainText = `Your email address (${props.email}) has been successfully unsubscribed from the Webgent Newsletter.\n\nBest regards,\nThe Webgent Team`;

    return this.sendEmail({
      to: props.email,
      subject: "You have been unsubscribed — Webgent",
      react: reactElement,
      text: plainText,
    });
  }

  async sendNewsletterDigest(to: string, props: NewsletterDigestEmailProps): Promise<boolean> {
    const reactElement = React.createElement(NewsletterDigestEmail, props);

    const plainText = `${props.editionTitle}\n\nFeatured: ${props.featuredArticle.title}\n${props.featuredArticle.excerpt}\n\nRead more at Webgent Blog.`;

    return this.sendEmail({
      to,
      subject: `${props.editionTitle} — Webgent`,
      react: reactElement,
      text: plainText,
    });
  }
}

export const emailService: EmailService = new ResendEmailService();
