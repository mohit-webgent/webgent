import * as React from "react";
import { Body, Button, Container, Head, Heading, Hr, Html, Link, Preview, Section, Text } from "@react-email/components";
import { parseClientMessage } from "./email-format";

export const emailColors = {
  text: "#18181b",
  body: "#3f3f46",
  muted: "#71717a",
  rule: "#e4e4e7",
  link: "#b84a0c",
  accent: "#f26a1f",
  accentText: "#140802",
};

const fontFamily = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

export function getAppUrl() {
  return (process.env.NEXT_PUBLIC_APP_URL || "https://webgent.vercel.app").replace(/\/$/, "");
}

export interface EmailBaseLayoutProps {
  previewText: string;
  heading?: string;
  subheading?: string;
  unsubscribeUrl?: string;
  children: React.ReactNode;
}

export function EmailBaseLayout({ previewText, heading, subheading, unsubscribeUrl, children }: EmailBaseLayoutProps) {
  const appUrl = getAppUrl();

  return (
    <Html lang="en">
      <Head>
        {/* Asks mail apps to keep these colours rather than inverting them in dark mode. */}
        <meta name="color-scheme" content="light only" />
        <meta name="supported-color-schemes" content="light only" />
      </Head>
      <Preview>{previewText}</Preview>
      <Body style={{ backgroundColor: "#ffffff", color: emailColors.text, fontFamily, margin: 0, padding: 0 }}>
        <Container style={{ maxWidth: "600px", margin: "0 auto", padding: "32px 24px" }}>
          <Link href={appUrl} style={{ textDecoration: "none" }}>
            <table role="presentation" border={0} cellPadding={0} cellSpacing={0}>
              <tbody>
                <tr>
                  <td
                    width={28}
                    height={28}
                    align="center"
                    style={{ backgroundColor: emailColors.accent, borderRadius: "6px", color: emailColors.accentText, fontSize: "15px", fontWeight: 700, lineHeight: "28px" }}
                  >
                    W
                  </td>
                  <td style={{ paddingLeft: "10px", color: emailColors.text, fontSize: "16px", fontWeight: 700 }}>Webgent</td>
                </tr>
              </tbody>
            </table>
          </Link>

          <Hr style={{ borderColor: emailColors.rule, margin: "20px 0 28px" }} />

          {heading && (
            <Heading as="h1" style={{ color: emailColors.text, fontSize: "24px", fontWeight: 700, lineHeight: "1.3", margin: "0 0 8px" }}>
              {heading}
            </Heading>
          )}
          {subheading && <Text style={{ color: emailColors.body, fontSize: "15px", lineHeight: "1.6", margin: "0 0 24px" }}>{subheading}</Text>}

          {children}

          <Hr style={{ borderColor: emailColors.rule, margin: "32px 0 16px" }} />

          <Text style={{ color: emailColors.muted, fontSize: "12px", lineHeight: "1.6", margin: 0 }}>
            Websites, online stores and web apps by Mohit Verma.
            <br />
            <Link href={appUrl} style={footerLink}>
              Website
            </Link>
            {" · "}
            <Link href={`${appUrl}/work`} style={footerLink}>
              Work
            </Link>
            {" · "}
            <Link href={`${appUrl}/contact`} style={footerLink}>
              Contact
            </Link>
            {unsubscribeUrl && (
              <>
                {" · "}
                <Link href={unsubscribeUrl} style={footerLink}>
                  Unsubscribe
                </Link>
              </>
            )}
          </Text>
          <Text style={{ color: emailColors.muted, fontSize: "12px", lineHeight: "1.6", margin: "4px 0 0" }}>
            &copy; {new Date().getFullYear()} Webgent. All rights reserved.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const footerLink: React.CSSProperties = { color: emailColors.muted, textDecoration: "underline" };

export const emailText: React.CSSProperties = { color: emailColors.body, fontSize: "15px", lineHeight: "1.6", margin: "0 0 16px" };

export const emailLink: React.CSSProperties = { color: emailColors.link, textDecoration: "underline" };

export function EmailSectionTitle({ children }: { children: React.ReactNode }) {
  return <Text style={{ color: emailColors.text, fontSize: "15px", fontWeight: 700, lineHeight: "1.4", margin: "28px 0 10px" }}>{children}</Text>;
}

export interface EmailDetail {
  label: string;
  value: React.ReactNode;
}

/** Two-column details table. Empty rows are left out. */
export function EmailDetails({ rows }: { rows: EmailDetail[] }) {
  const visible = rows.filter((row) => row.value !== null && row.value !== undefined && row.value !== "");
  return (
    <table role="presentation" width="100%" border={0} cellPadding={0} cellSpacing={0} style={{ borderTop: `1px solid ${emailColors.rule}` }}>
      <tbody>
        {visible.map((row) => (
          <tr key={row.label}>
            <td width="34%" valign="top" style={{ borderBottom: `1px solid ${emailColors.rule}`, color: emailColors.muted, fontSize: "14px", lineHeight: "1.5", padding: "9px 12px 9px 0" }}>
              {row.label}
            </td>
            <td valign="top" style={{ borderBottom: `1px solid ${emailColors.rule}`, color: emailColors.text, fontSize: "14px", lineHeight: "1.5", padding: "9px 0", wordBreak: "break-word" }}>
              {row.value}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/** Tables rather than a list element, because mail apps disagree about list spacing and bullets. */
export function EmailPoints({ points, numbered = false }: { points: Array<{ label?: string; text: string }>; numbered?: boolean }) {
  return (
    <table role="presentation" width="100%" border={0} cellPadding={0} cellSpacing={0}>
      <tbody>
        {points.map((point, index) => (
          <tr key={`${index}-${point.text.slice(0, 24)}`}>
            <td width={22} valign="top" style={{ color: emailColors.link, fontSize: "14px", fontWeight: 700, lineHeight: "1.6", padding: "3px 0" }}>
              {numbered ? `${index + 1}.` : "•"}
            </td>
            <td valign="top" style={{ color: emailColors.body, fontSize: "14px", lineHeight: "1.6", padding: "3px 0", wordBreak: "break-word" }}>
              {point.label && <strong style={{ color: emailColors.text }}>{point.label}: </strong>}
              {point.text}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function EmailClientMessage({ message }: { message?: string | null }) {
  const groups = parseClientMessage(message);
  if (groups.length === 0) return <Text style={{ ...emailText, color: emailColors.muted, margin: 0 }}>No message was included.</Text>;

  return (
    <>
      {groups.map((group, index) => (
        <div key={`${index}-${group.heading ?? "points"}`} style={{ marginTop: index === 0 ? 0 : "14px" }}>
          {group.heading && <Text style={{ color: emailColors.text, fontSize: "14px", fontWeight: 600, lineHeight: "1.5", margin: "0 0 4px" }}>{group.heading}</Text>}
          {group.points.length > 0 && <EmailPoints points={group.points} />}
        </div>
      ))}
    </>
  );
}

export function EmailButton({ href, children, secondary = false }: { href: string; children: React.ReactNode; secondary?: boolean }) {
  return (
    <Button
      href={href}
      style={{
        backgroundColor: secondary ? "#ffffff" : emailColors.accent,
        border: `1px solid ${secondary ? emailColors.rule : emailColors.accent}`,
        borderRadius: "8px",
        color: secondary ? emailColors.text : emailColors.accentText,
        display: "inline-block",
        fontSize: "14px",
        fontWeight: 600,
        padding: "11px 20px",
        textDecoration: "none",
      }}
    >
      {children}
    </Button>
  );
}

export function EmailActions({ children }: { children: React.ReactNode }) {
  return <Section style={{ margin: "26px 0 0" }}>{children}</Section>;
}
