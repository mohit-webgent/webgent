import * as React from "react";
import { Link, Text } from "@react-email/components";
import { EmailActions, EmailBaseLayout, EmailButton, emailColors, emailLink, emailText, getAppUrl } from "./base-layout";

export interface NewsletterConfirmationEmailProps {
  email: string;
  token: string;
  name?: string | null;
}

export function NewsletterConfirmationEmail({ email, token, name }: NewsletterConfirmationEmailProps) {
  const confirmUrl = `${getAppUrl()}/api/newsletter/confirm?token=${encodeURIComponent(token)}`;

  return (
    <EmailBaseLayout
      previewText="Please confirm your subscription to the Webgent newsletter."
      heading="Confirm your subscription"
      subheading={`${name ? `Hello ${name}` : "Hello"}, thanks for your interest in Webgent.`}
    >
      <Text style={emailText}>
        Please confirm that <strong style={{ color: emailColors.text }}>{email}</strong> should receive articles on web development and running a website that works.
      </Text>

      <EmailActions>
        <EmailButton href={confirmUrl}>Confirm subscription</EmailButton>
      </EmailActions>

      <Text style={{ color: emailColors.muted, fontSize: "13px", lineHeight: "1.6", margin: "24px 0 6px" }}>If the button doesn&apos;t work, open this link:</Text>
      <Text style={{ fontSize: "13px", lineHeight: "1.5", margin: "0 0 16px", wordBreak: "break-all" }}>
        <Link href={confirmUrl} style={emailLink}>
          {confirmUrl}
        </Link>
      </Text>

      <Text style={{ color: emailColors.muted, fontSize: "13px", lineHeight: "1.6", margin: 0 }}>
        This link expires in 24 hours. If you didn&apos;t subscribe, you can ignore this email and nothing more will be sent.
      </Text>
    </EmailBaseLayout>
  );
}
