import * as React from "react";
import { Text } from "@react-email/components";
import { EmailActions, EmailBaseLayout, EmailButton, emailText, getAppUrl } from "./base-layout";

export interface NewsletterWelcomeEmailProps {
  name?: string | null;
  unsubscribeUrl: string;
}

export function NewsletterWelcomeEmail({ name, unsubscribeUrl }: NewsletterWelcomeEmailProps) {
  return (
    <EmailBaseLayout
      previewText="Your subscription to the Webgent newsletter is confirmed."
      heading="You're subscribed"
      subheading={`${name ? `Hello ${name}` : "Hello"}, your subscription is confirmed.`}
      unsubscribeUrl={unsubscribeUrl}
    >
      <Text style={emailText}>You&apos;ll now receive new articles on web development, performance and running a website that works.</Text>

      <EmailActions>
        <EmailButton href={`${getAppUrl()}/blog`}>Read the latest articles</EmailButton>
      </EmailActions>
    </EmailBaseLayout>
  );
}
