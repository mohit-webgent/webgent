import * as React from "react";
import { Section, Text, Button, Hr, Link } from "@react-email/components";
import { EmailBaseLayout } from "./base-layout";

export interface NewsletterConfirmationEmailProps {
  email: string;
  token: string;
  name?: string | null;
}

export function NewsletterConfirmationEmail({
  email,
  token,
  name,
}: NewsletterConfirmationEmailProps) {
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://webgent.com").replace(/\/$/, "");
  const confirmUrl = `${appUrl}/api/newsletter/confirm?token=${encodeURIComponent(token)}`;
  const greeting = name ? `Hello ${name}` : "Hello";

  return (
    <EmailBaseLayout
      previewText="Confirm your subscription to the Webgent Engineering & Tech Insights Newsletter."
      heading="Confirm Your Subscription"
      subheading={`${greeting}, thank you for your interest in Webgent!`}
    >
      <Text style={paragraphStyle}>
        Please confirm that you want to receive our weekly engineering showcases, technical
        insights, and product design breakdowns.
      </Text>

      <Section style={{ textAlign: "center", margin: "32px 0" }}>
        <Button href={confirmUrl} style={buttonStyle}>
          Confirm My Subscription
        </Button>
      </Section>

      <Section style={infoBoxStyle}>
        <Text style={infoTitleStyle}>WHY DOUBLE OPT-IN?</Text>
        <Text style={infoTextStyle}>
          We value privacy and zero spam. By confirming your email address (
          <strong style={{ color: "#e2e8f0" }}>{email}</strong>), you ensure you only receive
          content you genuinely requested.
        </Text>
      </Section>

      <Hr style={hrStyle} />

      <Text style={fallbackNoticeStyle}>
        If the button above does not work, copy and paste this verification URL into your browser:
      </Text>
      <Text style={urlBoxStyle}>
        <Link href={confirmUrl} style={{ color: "#818cf8", wordBreak: "break-all" }}>
          {confirmUrl}
        </Link>
      </Text>

      <Text style={expiryNoticeStyle}>
        ⏳ This verification link will automatically expire in <strong>24 hours</strong>. If you did
        not subscribe to this newsletter, please disregard this email and no messages will be sent.
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

const buttonStyle: React.CSSProperties = {
  backgroundColor: "#4f46e5",
  color: "#ffffff",
  fontWeight: 700,
  fontSize: "15px",
  textDecoration: "none",
  padding: "14px 34px",
  borderRadius: "12px",
  display: "inline-block",
  boxShadow: "0 4px 14px rgba(79, 70, 229, 0.45)",
};

const infoBoxStyle: React.CSSProperties = {
  backgroundColor: "#090d16",
  border: "1px solid #1e293b",
  borderRadius: "12px",
  padding: "16px 18px",
  margin: "24px 0",
};

const infoTitleStyle: React.CSSProperties = {
  color: "#818cf8",
  fontSize: "11px",
  fontWeight: 700,
  letterSpacing: "1px",
  margin: "0 0 8px 0",
};

const infoTextStyle: React.CSSProperties = {
  color: "#94a3b8",
  fontSize: "13px",
  lineHeight: "1.5",
  margin: 0,
};

const hrStyle: React.CSSProperties = {
  borderColor: "#1e293b",
  margin: "24px 0 16px 0",
};

const fallbackNoticeStyle: React.CSSProperties = {
  color: "#64748b",
  fontSize: "12px",
  margin: "0 0 6px 0",
};

const urlBoxStyle: React.CSSProperties = {
  backgroundColor: "#0a0f1d",
  border: "1px solid #1e293b",
  borderRadius: "8px",
  padding: "10px 12px",
  fontSize: "11px",
  margin: "0 0 16px 0",
};

const expiryNoticeStyle: React.CSSProperties = {
  color: "#64748b",
  fontSize: "11px",
  lineHeight: "1.5",
  margin: 0,
};
