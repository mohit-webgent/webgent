import * as React from "react";
import { Section, Text, Button, Hr } from "@react-email/components";
import { EmailBaseLayout } from "./base-layout";

export interface ContactConfirmationEmailProps {
  name: string;
  service?: string | null;
  budget?: string | null;
  message?: string;
}

export function ContactConfirmationEmail({
  name,
  service,
  budget,
  message,
}: ContactConfirmationEmailProps) {
  const firstName = name.trim().split(" ")[0] || name;
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://webgent.com").replace(/\/$/, "");

  return (
    <EmailBaseLayout
      previewText={`Thank you for reaching out to Webgent, ${firstName}! We've received your project inquiry.`}
      heading="We've Received Your Inquiry"
      subheading={`Hi ${firstName}, thank you for contacting Webgent. Our engineering team is currently reviewing your project details.`}
    >
      <Text style={paragraphStyle}>
        We take every inquiry seriously. A senior engineering director will analyze your technical requirements and respond within <strong>24 business hours</strong> with initial recommendations and scheduling options.
      </Text>

      {/* Inquiry Summary Card */}
      <Section style={summaryBoxStyle}>
        <Text style={summaryHeadingStyle}>YOUR SUBMISSION SUMMARY</Text>
        
        {service && (
          <Text style={summaryItemStyle}>
            <span style={labelStyle}>Requested Service:</span>{" "}
            <span style={valueStyle}>{service}</span>
          </Text>
        )}

        {budget && (
          <Text style={summaryItemStyle}>
            <span style={labelStyle}>Estimated Budget:</span>{" "}
            <span style={valueStyle}>{budget}</span>
          </Text>
        )}

        {message && (
          <div style={{ marginTop: "12px" }}>
            <span style={labelStyle}>Message Overview:</span>
            <Text style={messageQuoteStyle}>&ldquo;{message}&rdquo;</Text>
          </div>
        )}
      </Section>

      <Text style={paragraphStyle}>
        In the meantime, feel free to explore our recent enterprise case studies and open-source contributions.
      </Text>

      <Section style={{ textAlign: "center", margin: "28px 0 16px 0" }}>
        <Button href={`${appUrl}/work`} style={buttonStyle}>
          Explore Portfolio & Case Studies
        </Button>
      </Section>

      <Hr style={hrStyle} />

      <Text style={helpTextStyle}>
        Need immediate enterprise assistance? Reply directly to this email or contact us at{" "}
        <a href="mailto:hello@webgent.com" style={{ color: "#818cf8" }}>
          hello@webgent.com
        </a>
        .
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

const summaryBoxStyle: React.CSSProperties = {
  backgroundColor: "#090d16",
  border: "1px solid #1e293b",
  borderRadius: "12px",
  padding: "18px 20px",
  margin: "20px 0",
};

const summaryHeadingStyle: React.CSSProperties = {
  color: "#818cf8",
  fontSize: "11px",
  fontWeight: 700,
  letterSpacing: "1px",
  margin: "0 0 12px 0",
};

const summaryItemStyle: React.CSSProperties = {
  fontSize: "13px",
  margin: "6px 0",
  lineHeight: "1.5",
};

const labelStyle: React.CSSProperties = {
  color: "#94a3b8",
  fontWeight: 600,
};

const valueStyle: React.CSSProperties = {
  color: "#f1f5f9",
  fontWeight: 600,
};

const messageQuoteStyle: React.CSSProperties = {
  color: "#cbd5e1",
  fontSize: "13px",
  lineHeight: "1.5",
  fontStyle: "italic",
  backgroundColor: "#0e1526",
  padding: "10px 14px",
  borderRadius: "8px",
  borderLeft: "3px solid #6366f1",
  margin: "6px 0 0 0",
};

const buttonStyle: React.CSSProperties = {
  backgroundColor: "#4f46e5",
  color: "#ffffff",
  fontWeight: 600,
  fontSize: "14px",
  textDecoration: "none",
  padding: "12px 28px",
  borderRadius: "10px",
  display: "inline-block",
};

const hrStyle: React.CSSProperties = {
  borderColor: "#1e293b",
  margin: "24px 0 16px 0",
};

const helpTextStyle: React.CSSProperties = {
  color: "#64748b",
  fontSize: "12px",
  lineHeight: "1.5",
  margin: 0,
};
