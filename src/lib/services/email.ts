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
import { NewsletterWelcomeEmail } from "@/components/emails/newsletter-welcome";
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

    const plainText = `Hi ${props.name},\n\nThank you for reaching out to Webgent! We have received your project inquiry and Mohit will get in touch with you within 24 business hours.\n\nBest regards,\nWebgent`;

    return this.sendEmail({
      to: props.email,
      subject: "We've received your inquiry — Webgent",
      react: reactElement,
      text: plainText,
      // The sending address has no inbox, so replies have to go to one that is read.
      replyTo: this.getAdminEmail(),
    });
  }

  async sendAdminNewLeadNotification(props: AdminLeadNotificationEmailProps): Promise<boolean> {
    const adminTo = this.getAdminEmail();

    const reactElement = React.createElement(AdminLeadNotificationEmail, props);

    const plainText = `New project inquiry\n\nClient: ${props.name}\nEmail: ${props.email}\nPhone: ${props.phone || "N/A"}\nCompany: ${props.company || "N/A"}\nService: ${props.service || "N/A"}\nBudget: ${props.budget || "N/A"}\nScore: ${props.score}/100\nMessage: ${props.message}`;

    return this.sendEmail({
      to: adminTo,
      subject: `New inquiry: ${props.name}${props.company ? ` (${props.company})` : ""}`,
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

    const plainText = `Hello${name ? ` ${name}` : ""},\n\nPlease confirm your subscription to the Webgent Newsletter by visiting:\n${confirmUrl}\n\nThis verification link is valid for 24 hours.\n\nBest regards,\nWebgent`;

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
    const plainText = `${greeting},\n\nYour subscription to the Webgent Newsletter is now active! You will receive our latest engineering showcases and tech insights.\n\nTo unsubscribe at any time: ${unsubUrl}\n\nBest regards,\nWebgent`;

    return this.sendEmail({
      to: email,
      subject: "Welcome to Webgent Newsletter!",
      react: React.createElement(NewsletterWelcomeEmail, { name, unsubscribeUrl: unsubUrl }),
      text: plainText,
    });
  }

  async sendNewsletterUnsubscribed(props: NewsletterUnsubscribedEmailProps): Promise<boolean> {
    const reactElement = React.createElement(NewsletterUnsubscribedEmail, props);

    const plainText = `Your email address (${props.email}) has been successfully unsubscribed from the Webgent Newsletter.\n\nBest regards,\nWebgent`;

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
