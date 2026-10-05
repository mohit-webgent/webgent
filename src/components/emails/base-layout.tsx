import * as React from "react";
import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Heading,
  Text,
  Link,
  Preview,
} from "@react-email/components";

export interface EmailBaseLayoutProps {
  previewText: string;
  heading?: string;
  subheading?: string;
  unsubscribeUrl?: string;
  children: React.ReactNode;
}

export function EmailBaseLayout({
  previewText,
  heading,
  subheading,
  unsubscribeUrl,
  children,
}: EmailBaseLayoutProps) {
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://webgent.com").replace(/\/$/, "");

  return (
    <Html lang="en">
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={mainStyle}>
        <Container style={containerStyle}>
          <Section style={headerStyle}>
            <Link href={appUrl} style={{ textDecoration: "none" }}>
              <table align="center" border={0} cellPadding={0} cellSpacing={0}>
                <tr>
                  <td style={brandLogoBadge}>W</td>
                  <td style={{ paddingLeft: "10px", verticalAlign: "middle" }}>
                    <Text style={brandTextStyle}>WEBGENT</Text>
                  </td>
                </tr>
              </table>
            </Link>
          </Section>

          <Section style={cardStyle}>
            {heading && <Heading style={headingStyle}>{heading}</Heading>}
            {subheading && <Text style={subheadingStyle}>{subheading}</Text>}
            {children}
          </Section>

          <Section style={footerStyle}>
            <Text style={footerTextStyle}>
              &copy; {new Date().getFullYear()} Webgent Technologies Inc. All rights reserved.
            </Text>
            <Text style={footerSubTextStyle}>
              High-performance web architecture, enterprise SaaS engineering, and AI digital
              systems.
            </Text>
            <Text style={footerLinksStyle}>
              <Link href={`${appUrl}`} style={footerLink}>
                Website
              </Link>
              {" • "}
              <Link href={`${appUrl}/work`} style={footerLink}>
                Portfolio
              </Link>
              {" • "}
              <Link href={`${appUrl}/blog`} style={footerLink}>
                Blog
              </Link>
              {" • "}
              <Link href={`${appUrl}/contact`} style={footerLink}>
                Contact
              </Link>
              {unsubscribeUrl && (
                <>
                  {" • "}
                  <Link href={unsubscribeUrl} style={footerLinkUnsubscribe}>
                    Unsubscribe
                  </Link>
                </>
              )}
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const mainStyle: React.CSSProperties = {
  backgroundColor: "#070a12",
  color: "#f8fafc",
  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  margin: 0,
  padding: "40px 16px",
};

const containerStyle: React.CSSProperties = {
  maxWidth: "580px",
  margin: "0 auto",
};

const headerStyle: React.CSSProperties = {
  textAlign: "center",
  paddingBottom: "24px",
};

const brandLogoBadge: React.CSSProperties = {
  backgroundColor: "#4f46e5",
  color: "#ffffff",
  fontWeight: 900,
  fontSize: "18px",
  width: "36px",
  height: "36px",
  borderRadius: "10px",
  textAlign: "center",
  lineHeight: "36px",
};

const brandTextStyle: React.CSSProperties = {
  color: "#ffffff",
  fontSize: "20px",
  fontWeight: 800,
  letterSpacing: "1.5px",
  margin: 0,
};

const cardStyle: React.CSSProperties = {
  backgroundColor: "#0f172a",
  border: "1px solid #1e293b",
  borderRadius: "20px",
  padding: "36px 32px",
  boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5)",
};

const headingStyle: React.CSSProperties = {
  color: "#ffffff",
  fontSize: "22px",
  fontWeight: 700,
  letterSpacing: "-0.5px",
  marginTop: 0,
  marginBottom: "8px",
};

const subheadingStyle: React.CSSProperties = {
  color: "#94a3b8",
  fontSize: "15px",
  lineHeight: "1.6",
  marginTop: 0,
  marginBottom: "24px",
};

const footerStyle: React.CSSProperties = {
  textAlign: "center",
  paddingTop: "24px",
};

const footerTextStyle: React.CSSProperties = {
  color: "#64748b",
  fontSize: "12px",
  margin: "0 0 4px 0",
};

const footerSubTextStyle: React.CSSProperties = {
  color: "#475569",
  fontSize: "11px",
  margin: "0 0 12px 0",
  lineHeight: "1.5",
};

const footerLinksStyle: React.CSSProperties = {
  color: "#475569",
  fontSize: "12px",
  margin: 0,
};

const footerLink: React.CSSProperties = {
  color: "#818cf8",
  textDecoration: "none",
};

const footerLinkUnsubscribe: React.CSSProperties = {
  color: "#ef4444",
  textDecoration: "underline",
};
