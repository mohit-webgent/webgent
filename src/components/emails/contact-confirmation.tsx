import * as React from "react";
import { Text } from "@react-email/components";
import {
  EmailActions,
  EmailBaseLayout,
  EmailButton,
  EmailClientMessage,
  EmailDetails,
  EmailPoints,
  EmailSectionTitle,
  emailColors,
  emailText,
  getAppUrl,
} from "./base-layout";
import { formatBudget } from "./email-format";

export interface ContactConfirmationEmailProps {
  name: string;
  service?: string | null;
  budget?: string | null;
  message?: string;
}

const NEXT_STEPS = [
  { text: "Mohit reads your inquiry personally." },
  { text: "You get a reply within 24 business hours, with recommendations and any questions." },
  { text: "Once the scope is clear, you receive the timeline and a clear price before any work starts." },
];

export function ContactConfirmationEmail({ name, service, budget, message }: ContactConfirmationEmailProps) {
  const firstName = name.trim().split(/\s+/)[0] || name;
  const budgetLabel = formatBudget(budget);

  return (
    <EmailBaseLayout
      previewText={`Thanks ${firstName}, we've received your inquiry and will reply within 24 business hours.`}
      heading={`Thanks, ${firstName}. We've received your inquiry.`}
    >
      <Text style={emailText}>Thank you for contacting Webgent. Here is what happens next and a copy of what you sent.</Text>

      <EmailSectionTitle>What happens next</EmailSectionTitle>
      <EmailPoints points={NEXT_STEPS} numbered />

      {(service || budgetLabel) && (
        <>
          <EmailSectionTitle>Your request</EmailSectionTitle>
          <EmailDetails
            rows={[
              { label: "Service", value: service },
              { label: "Budget", value: budgetLabel },
            ]}
          />
        </>
      )}

      {message && (
        <>
          <EmailSectionTitle>Your message</EmailSectionTitle>
          <EmailClientMessage message={message} />
        </>
      )}

      <EmailActions>
        <EmailButton href={`${getAppUrl()}/work`}>See recent work</EmailButton>
      </EmailActions>

      <Text style={{ color: emailColors.muted, fontSize: "13px", lineHeight: "1.6", margin: "20px 0 0" }}>
        Need to add something? Just reply to this email.
      </Text>
    </EmailBaseLayout>
  );
}
