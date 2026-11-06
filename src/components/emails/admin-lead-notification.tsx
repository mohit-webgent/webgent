import * as React from "react";
import { Text } from "@react-email/components";
import {
  EmailActions,
  EmailBaseLayout,
  EmailButton,
  EmailClientMessage,
  EmailDetails,
  EmailSectionTitle,
  emailColors,
  emailLink,
  getAppUrl,
} from "./base-layout";
import { formatBudget } from "./email-format";

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

function priorityOf(score: number) {
  if (score >= 70) return "High";
  if (score >= 40) return "Medium";
  return "Standard";
}

export function AdminLeadNotificationEmail({ leadId, name, email, phone, company, service, budget, message, score }: AdminLeadNotificationEmailProps) {
  const firstName = name.trim().split(/\s+/)[0] || name;
  const replySubject = encodeURIComponent(`Your Webgent inquiry${service ? `: ${service}` : ""}`);

  return (
    <EmailBaseLayout
      previewText={`${name}${service ? ` is asking about ${service}` : " sent a new inquiry"}.`}
      heading="New project inquiry"
      subheading={`${name}${company ? ` from ${company}` : ""} contacted you through the website.`}
    >
      <EmailSectionTitle>Client details</EmailSectionTitle>
      <EmailDetails
        rows={[
          { label: "Name", value: name },
          {
            label: "Email",
            value: (
              <a href={`mailto:${email}`} style={emailLink}>
                {email}
              </a>
            ),
          },
          {
            label: "Phone",
            value: phone ? (
              <a href={`tel:${phone}`} style={emailLink}>
                {phone}
              </a>
            ) : null,
          },
          { label: "Company", value: company },
        ]}
      />

      <EmailSectionTitle>Project details</EmailSectionTitle>
      <EmailDetails
        rows={[
          { label: "Service", value: service },
          { label: "Budget", value: formatBudget(budget) },
          { label: "Priority", value: `${priorityOf(score)} (${score}/100)` },
        ]}
      />

      <EmailSectionTitle>Client message</EmailSectionTitle>
      <EmailClientMessage message={message} />

      <EmailActions>
        <EmailButton href={`mailto:${email}?subject=${replySubject}`}>Reply to {firstName}</EmailButton>
        <span>&nbsp;&nbsp;</span>
        <EmailButton href={`${getAppUrl()}/admin/leads/${leadId}`} secondary>
          Open in admin
        </EmailButton>
      </EmailActions>

      <Text style={{ color: emailColors.muted, fontSize: "12px", lineHeight: "1.5", margin: "20px 0 0" }}>Lead ID: {leadId}</Text>
    </EmailBaseLayout>
  );
}
