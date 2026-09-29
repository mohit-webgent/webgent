import { logger } from "@/lib/logger";

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
}

/**
 * Service abstraction for sending transactional and newsletter emails.
 * Ready to be connected to providers like Resend, SendGrid, Amazon SES, or Nodemailer.
 */
export interface EmailService {
  sendEmail(options: SendEmailOptions): Promise<boolean>;
  sendNewsletterConfirmation(email: string, token: string, name?: string | null): Promise<boolean>;
  sendNewsletterWelcome(email: string, name?: string | null, unsubscribeToken?: string | null): Promise<boolean>;
}

class MockEmailService implements EmailService {
  private defaultFrom = process.env.EMAIL_FROM || "Webgent Newsletter <newsletter@webgent.com>";
  private appUrl = (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/$/, "");

  /**
   * Generic send email method.
   * Logs email payload to console in development and test environments.
   */
  async sendEmail(options: SendEmailOptions): Promise<boolean> {
    const from = options.from || this.defaultFrom;
    
    logger.info(`[Email Service] Sending email to "${options.to}" with subject: "${options.subject}"`, {
      from,
      to: options.to,
      subject: options.subject,
      previewText: options.text?.substring(0, 100),
    });

    return true;
  }

  /**
   * Sends the double opt-in confirmation email containing the secure confirmation token link.
   */
  async sendNewsletterConfirmation(email: string, token: string, name?: string | null): Promise<boolean> {
    const confirmUrl = `${this.appUrl}/api/newsletter/confirm?token=${encodeURIComponent(token)}`;
    const greeting = name ? `Hello ${name}` : "Hello";

    const subject = "Please confirm your subscription to Webgent Newsletter";
    const text = `${greeting},\n\nThank you for subscribing to Webgent! Please confirm your email address by clicking the link below:\n\n${confirmUrl}\n\nThis confirmation link is valid for 24 hours. If you did not request this subscription, please ignore this email.\n\nBest regards,\nThe Webgent Team`;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${subject}</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b0f19; color: #f8fafc; padding: 40px 20px; margin: 0;">
          <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 560px; background-color: #111827; border: 1px solid #1f2937; border-radius: 16px; overflow: hidden;">
            <tr>
              <td style="padding: 36px 32px 20px 32px; text-align: center; border-bottom: 1px solid #1f2937;">
                <h1 style="color: #6366f1; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">WEBGENT</h1>
              </td>
            </tr>
            <tr>
              <td style="padding: 32px;">
                <h2 style="color: #ffffff; margin-top: 0; font-size: 20px; font-weight: 700;">Confirm your subscription</h2>
                <p style="color: #94a3b8; font-size: 15px; line-height: 1.6;">${greeting},</p>
                <p style="color: #94a3b8; font-size: 15px; line-height: 1.6;">
                  Thank you for subscribing to our newsletter! To finish setting up your subscription and ensure you want to receive our updates, please confirm your email address below.
                </p>
                <div style="text-align: center; margin: 32px 0;">
                  <a href="${confirmUrl}" style="display: inline-block; background-color: #4f46e5; color: #ffffff; font-weight: 600; font-size: 15px; text-decoration: none; padding: 14px 32px; border-radius: 10px; box-shadow: 0 4px 14px rgba(79, 70, 229, 0.4);">
                    Confirm Subscription
                  </a>
                </div>
                <p style="color: #64748b; font-size: 13px; line-height: 1.5;">
                  Or copy and paste this link in your browser:<br />
                  <a href="${confirmUrl}" style="color: #818cf8; word-break: break-all;">${confirmUrl}</a>
                </p>
                <p style="color: #64748b; font-size: 12px; margin-top: 24px; border-top: 1px solid #1f2937; padding-top: 20px;">
                  Note: This confirmation link will expire in 24 hours. If you didn't request this email, you can safely ignore it.
                </p>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `;

    return this.sendEmail({
      to: email,
      subject,
      text,
      html,
    });
  }

  /**
   * Sends welcome email once subscription is confirmed.
   */
  async sendNewsletterWelcome(email: string, name?: string | null, unsubscribeToken?: string | null): Promise<boolean> {
    const unsubscribeUrl = unsubscribeToken
      ? `${this.appUrl}/api/newsletter/unsubscribe?token=${encodeURIComponent(unsubscribeToken)}`
      : `${this.appUrl}/newsletter/unsubscribe`;
    const greeting = name ? `Hello ${name}` : "Hello";

    const subject = "Welcome to Webgent Newsletter!";
    const text = `${greeting},\n\nYour subscription is now active! You'll receive our latest updates, industry insights, and engineering showcases.\n\nTo unsubscribe at any time, visit: ${unsubscribeUrl}\n\nBest regards,\nThe Webgent Team`;

    const html = `
      <!DOCTYPE html>
      <html>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b0f19; color: #f8fafc; padding: 40px 20px; margin: 0;">
          <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 560px; background-color: #111827; border: 1px solid #1f2937; border-radius: 16px; overflow: hidden;">
            <tr>
              <td style="padding: 36px 32px 20px 32px; text-align: center; border-bottom: 1px solid #1f2937;">
                <h1 style="color: #6366f1; margin: 0; font-size: 24px; font-weight: 800;">WEBGENT</h1>
              </td>
            </tr>
            <tr>
              <td style="padding: 32px;">
                <h2 style="color: #ffffff; margin-top: 0; font-size: 20px; font-weight: 700;">You're on the list! 🎉</h2>
                <p style="color: #94a3b8; font-size: 15px; line-height: 1.6;">${greeting},</p>
                <p style="color: #94a3b8; font-size: 15px; line-height: 1.6;">
                  Your subscription to the Webgent Newsletter has been successfully verified. You're all set to receive our exclusive articles, engineering updates, and product launches.
                </p>
                <p style="color: #64748b; font-size: 12px; margin-top: 32px; border-top: 1px solid #1f2937; padding-top: 20px;">
                  If you ever want to unsubscribe, you can <a href="${unsubscribeUrl}" style="color: #818cf8;">click here</a>.
                </p>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `;

    return this.sendEmail({
      to: email,
      subject,
      text,
      html,
    });
  }
}

export const emailService: EmailService = new MockEmailService();
