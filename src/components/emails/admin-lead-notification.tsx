import * as React from "react";
import { Section, Text, Button, Hr } from "@react-email/components";
import { EmailBaseLayout } from "./base-layout";

export interface AdminLeadNotificationEmailProps {
  leadId: string;
  name: string;
  email: string;
  phone?: string | null;
  company?: string | null;
  service?: string | null;
  budget?: string | null;
  message: string;
  score: number;
}

export function AdminLeadNotificationEmail({
  leadId,
  name,
  email,
  phone,
  company,
  service,
  budget,
  message,
  score,
}: AdminLeadNotificationEmailProps) {
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://webgent.com").replace(/\/$/, "");
  const leadAdminUrl = `${appUrl}/admin/leads/${leadId}`;

  const scoreColor = score >= 70 ? "#10b981" : score >= 40 ? "#f59e0b" : "#94a3b8";
  const scoreCategory = score >= 70 ? "High Intent" : score >= 40 ? "Medium Intent" : "General Inquiry";

  return (
    <EmailBaseLayout
      previewText={`New Lead Alert: ${name} (${company || "Individual"}) — Score ${score}/100`}
      heading="⚡ New Inbound Client Lead"
      subheading="A prospective client has submitted an inquiry through the Webgent contact portal."
    >
      {/* Score Header Pill */}
      <Section style={{ textAlign: "center", marginBottom: "20px" }}>
        <span
          style={{
            backgroundColor: `${scoreColor}15`,
            border: `1px solid ${scoreColor}40`,
            color: scoreColor,
            fontSize: "12px",
            fontWeight: 700,
            padding: "6px 14px",
            borderRadius: "20px",
            display: "inline-block",
            letterSpacing: "0.5px",
          }}
        >
          Lead Score: {score} / 100 • {scoreCategory}
        </span>
      </Section>

      {/* Client Detail Table Card */}
      <Section style={cardSectionStyle}>
        <Text style={sectionTitleStyle}>CONTACT DETAILS</Text>
        
        <table width="100%" border={0} cellPadding={0} cellSpacing={0} style={{ fontSize: "13px" }}>
          <tr>
            <td style={tableLabelStyle}>Client Name:</td>
            <td style={tableValueStyle}><strong>{name}</strong></td>
          </tr>
          <tr>
            <td style={tableLabelStyle}>Email Address:</td>
            <td style={tableValueStyle}>
              <a href={`mailto:${email}`} style={{ color: "#818cf8" }}>
                {email}
              </a>
            </td>
          </tr>
          {phone && (
            <tr>
              <td style={tableLabelStyle}>Phone:</td>
              <td style={tableValueStyle}>
                <a href={`tel:${phone}`} style={{ color: "#818cf8" }}>
                  {phone}
                </a>
              </td>
            </tr>
          )}
          {company && (
            <tr>
              <td style={tableLabelStyle}>Company:</td>
              <td style={tableValueStyle}>{company}</td>
            </tr>
          )}
        </table>
      </Section>

      {/* Project Scope Card */}
      <Section style={cardSectionStyle}>
        <Text style={sectionTitleStyle}>PROJECT SCOPE</Text>
        
        <table width="100%" border={0} cellPadding={0} cellSpacing={0} style={{ fontSize: "13px" }}>
          <tr>
            <td style={tableLabelStyle}>Requested Service:</td>
            <td style={tableValueStyle}>{service || "Not Specified"}</td>
          </tr>
          <tr>
            <td style={tableLabelStyle}>Budget Range:</td>
            <td style={tableValueStyle}>
              <span style={{ color: "#34d399", fontWeight: 600 }}>
                {budget || "Not Specified"}
              </span>
            </td>
          </tr>
        </table>

        <div style={{ marginTop: "14px" }}>
          <span style={tableLabelStyle}>Client Message:</span>
          <Text style={messageTextStyle}>&ldquo;{message}&rdquo;</Text>
        </div>
      </Section>

      {/* Action Button */}
      <Section style={{ textAlign: "center", margin: "28px 0 16px 0" }}>
        <Button href={leadAdminUrl} style={buttonStyle}>
          View & Manage Lead in Admin CRM
        </Button>
      </Section>

      <Hr style={hrStyle} />

      <Text style={footerNoticeStyle}>
        Lead ID: <span style={{ fontFamily: "monospace" }}>{leadId}</span>. Notification dispatched automatically via Webgent Lead Routing Engine.
      </Text>
    </EmailBaseLayout>
  );
}

const cardSectionStyle: React.CSSProperties = {
  backgroundColor: "#090d16",
  border: "1px solid #1e293b",
  borderRadius: "12px",
  padding: "16px 18px",
  marginBottom: "16px",
};

const sectionTitleStyle: React.CSSProperties = {
  color: "#818cf8",
  fontSize: "11px",
  fontWeight: 700,
  letterSpacing: "1px",
  margin: "0 0 10px 0",
};

const tableLabelStyle: React.CSSProperties = {
  color: "#94a3b8",
  paddingBottom: "8px",
  width: "36%",
  verticalAlign: "top",
};

const tableValueStyle: React.CSSProperties = {
  color: "#f1f5f9",
  paddingBottom: "8px",
  width: "64%",
  verticalAlign: "top",
};

const messageTextStyle: React.CSSProperties = {
  backgroundColor: "#0f172a",
  color: "#cbd5e1",
  padding: "12px",
  borderRadius: "8px",
  borderLeft: "3px solid #6366f1",
  fontSize: "13px",
  lineHeight: "1.6",
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
  boxShadow: "0 4px 12px rgba(79, 70, 229, 0.35)",
};

const hrStyle: React.CSSProperties = {
  borderColor: "#1e293b",
  margin: "24px 0 16px 0",
};

const footerNoticeStyle: React.CSSProperties = {
  color: "#475569",
  fontSize: "11px",
  textAlign: "center",
  margin: 0,
};
