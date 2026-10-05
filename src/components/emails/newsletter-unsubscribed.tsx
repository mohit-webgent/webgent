import * as React from "react";
import { Section, Text, Button, Hr } from "@react-email/components";
import { EmailBaseLayout } from "./base-layout";

export interface NewsletterUnsubscribedEmailProps {
  email: string;
  resubscribeUrl?: string;
}

export function NewsletterUnsubscribedEmail({
  email,
  resubscribeUrl,
}: NewsletterUnsubscribedEmailProps) {
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://webgent.com").replace(/\/$/, "");
  const defaultResubscribeUrl = resubscribeUrl || `${appUrl}/#newsletter`;

  return (
    <EmailBaseLayout
      previewText={`Your email (${email}) has been unsubscribed from the Webgent newsletter.`}
      heading="You've Been Unsubscribed"
      subheading="We're sorry to see you go. Your subscription preferences have been updated."
    >
      <Text style={paragraphStyle}>
        Per your request, we have removed <strong>{email}</strong> from all active newsletter and
        marketing distributions. You will no longer receive periodic updates from us.
      </Text>

      <Section style={cardBoxStyle}>
        <Text style={cardTitleStyle}>UNSUBSCRIBE DETAILS</Text>
        <Text style={cardTextStyle}>
          Status: <span style={{ color: "#f87171", fontWeight: 600 }}>Unsubscribed</span>
          <br />
          Timestamp: <span style={{ color: "#e2e8f0" }}>{new Date().toUTCString()}</span>
        </Text>
      </Section>

      <Text style={paragraphStyle}>
        Did you click this link by mistake or changed your mind? You can reactivate your
        subscription at any time with one click:
      </Text>

      <Section style={{ textAlign: "center", margin: "28px 0 16px 0" }}>
        <Button href={defaultResubscribeUrl} style={buttonStyle}>
          Re-Subscribe to Newsletter
        </Button>
      </Section>

      <Hr style={hrStyle} />

      <Text style={footerHelpStyle}>
        If you have feedback on how we can improve our newsletters or engineering articles, feel
        free to reply directly to this email.
      </Text>
    </EmailBaseLayout>
  );
}

const paragraphStyle: React.CSSProperties = {
  color: "#cbd5e1",
  fontSize: "14px",
  lineHeight: "1.65",
  margin: "0 0 16px 0",
};

const cardBoxStyle: React.CSSProperties = {
  backgroundColor: "#090d16",
  border: "1px solid #1e293b",
  borderRadius: "12px",
  padding: "16px 18px",
  margin: "20px 0",
};

const cardTitleStyle: React.CSSProperties = {
  color: "#818cf8",
  fontSize: "11px",
  fontWeight: 700,
  letterSpacing: "1px",
  margin: "0 0 8px 0",
};

const cardTextStyle: React.CSSProperties = {
  color: "#94a3b8",
  fontSize: "13px",
  lineHeight: "1.6",
  margin: 0,
};

const buttonStyle: React.CSSProperties = {
  backgroundColor: "#334155",
  color: "#ffffff",
  fontWeight: 600,
  fontSize: "13px",
  textDecoration: "none",
  padding: "12px 24px",
  borderRadius: "10px",
  display: "inline-block",
  border: "1px solid #475569",
};

const hrStyle: React.CSSProperties = {
  borderColor: "#1e293b",
  margin: "24px 0 16px 0",
};

const footerHelpStyle: React.CSSProperties = {
  color: "#64748b",
  fontSize: "12px",
  lineHeight: "1.5",
  margin: 0,
};
