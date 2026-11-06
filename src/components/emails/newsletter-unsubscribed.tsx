import * as React from "react";
import { Text } from "@react-email/components";
import { EmailActions, EmailBaseLayout, EmailButton, emailColors, emailText, getAppUrl } from "./base-layout";

export interface NewsletterUnsubscribedEmailProps {
  email: string;
  resubscribeUrl?: string;
}

export function NewsletterUnsubscribedEmail({ email, resubscribeUrl }: NewsletterUnsubscribedEmailProps) {
  return (
    <EmailBaseLayout previewText={`${email} has been unsubscribed from the Webgent newsletter.`} heading="You've been unsubscribed">
      <Text style={emailText}>
        <strong style={{ color: emailColors.text }}>{email}</strong> has been removed from the Webgent newsletter. You won&apos;t receive any more newsletter emails.
      </Text>
      <Text style={emailText}>Changed your mind? You can subscribe again at any time.</Text>

      <EmailActions>
        <EmailButton href={resubscribeUrl || `${getAppUrl()}/#newsletter`} secondary>
          Subscribe again
        </EmailButton>
      </EmailActions>
    </EmailBaseLayout>
  );
}
