import * as React from "react";
import { Section, Text, Button, Hr, Img, Link } from "@react-email/components";
import { EmailBaseLayout } from "./base-layout";

export interface DigestArticle {
  title: string;
  excerpt: string;
  slug: string;
  coverImageUrl?: string | null;
  readTime?: number | null;
}

export interface NewsletterDigestEmailProps {
  editionTitle: string;
  featuredArticle: DigestArticle;
  recentArticles?: DigestArticle[];
  unsubscribeUrl?: string;
}

export function NewsletterDigestEmail({
  editionTitle,
  featuredArticle,
  recentArticles = [],
  unsubscribeUrl,
}: NewsletterDigestEmailProps) {
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://webgent.com").replace(/\/$/, "");

  return (
    <EmailBaseLayout
      previewText={`${editionTitle}: ${featuredArticle.title}`}
      heading={editionTitle}
      subheading="Curated technical deep-dives, modern cloud architectures, and digital systems insights."
      unsubscribeUrl={unsubscribeUrl}
    >
      <Section style={featuredCardStyle}>
        <Text style={featuredBadgeStyle}>FEATURED INSIGHT</Text>

        {featuredArticle.coverImageUrl && (
          <Img
            src={featuredArticle.coverImageUrl}
            alt={featuredArticle.title}
            width="100%"
            style={featuredImgStyle}
          />
        )}

        <Text style={featuredTitleStyle}>{featuredArticle.title}</Text>

        {featuredArticle.readTime && (
          <Text style={readTimeStyle}>⏱️ {featuredArticle.readTime} min read</Text>
        )}

        <Text style={excerptStyle}>{featuredArticle.excerpt}</Text>

        <Section style={{ marginTop: "16px" }}>
          <Button href={`${appUrl}/blog/${featuredArticle.slug}`} style={primaryBtnStyle}>
            Read Full Article &rarr;
          </Button>
        </Section>
      </Section>

      {recentArticles.length > 0 && (
        <>
          <Text style={sectionHeaderStyle}>MORE ARTICLES IN THIS EDITION</Text>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {recentArticles.map((article, idx) => (
              <Section key={idx} style={recentCardStyle}>
                <Link href={`${appUrl}/blog/${article.slug}`} style={{ textDecoration: "none" }}>
                  <Text style={recentTitleStyle}>{article.title}</Text>
                </Link>
                <Text style={recentExcerptStyle}>{article.excerpt}</Text>
                {article.readTime && (
                  <Text style={recentReadTimeStyle}>⏱️ {article.readTime} min read</Text>
                )}
              </Section>
            ))}
          </div>
        </>
      )}

      <Hr style={hrStyle} />

      <Text style={digestFooterTextStyle}>
        You received this email because you are a verified subscriber to the Webgent Newsletter.
      </Text>
    </EmailBaseLayout>
  );
}

const featuredCardStyle: React.CSSProperties = {
  backgroundColor: "#090d16",
  border: "1px solid #1e293b",
  borderRadius: "14px",
  padding: "20px",
  marginBottom: "24px",
};

const featuredBadgeStyle: React.CSSProperties = {
  color: "#818cf8",
  fontSize: "11px",
  fontWeight: 700,
  letterSpacing: "1px",
  margin: "0 0 12px 0",
};

const featuredImgStyle: React.CSSProperties = {
  borderRadius: "10px",
  maxHeight: "220px",
  objectFit: "cover",
  marginBottom: "14px",
};

const featuredTitleStyle: React.CSSProperties = {
  color: "#ffffff",
  fontSize: "18px",
  fontWeight: 700,
  lineHeight: "1.4",
  margin: "0 0 6px 0",
};

const readTimeStyle: React.CSSProperties = {
  color: "#94a3b8",
  fontSize: "12px",
  margin: "0 0 12px 0",
};

const excerptStyle: React.CSSProperties = {
  color: "#cbd5e1",
  fontSize: "13px",
  lineHeight: "1.6",
  margin: "0 0 16px 0",
};

const primaryBtnStyle: React.CSSProperties = {
  backgroundColor: "#4f46e5",
  color: "#ffffff",
  fontWeight: 600,
  fontSize: "13px",
  textDecoration: "none",
  padding: "10px 22px",
  borderRadius: "8px",
  display: "inline-block",
};

const sectionHeaderStyle: React.CSSProperties = {
  color: "#94a3b8",
  fontSize: "12px",
  fontWeight: 700,
  letterSpacing: "0.5px",
  margin: "24px 0 12px 0",
};

const recentCardStyle: React.CSSProperties = {
  backgroundColor: "#0c1322",
  border: "1px solid #1e293b",
  borderRadius: "10px",
  padding: "14px 16px",
  marginBottom: "12px",
};

const recentTitleStyle: React.CSSProperties = {
  color: "#f1f5f9",
  fontSize: "15px",
  fontWeight: 600,
  margin: "0 0 6px 0",
};

const recentExcerptStyle: React.CSSProperties = {
  color: "#94a3b8",
  fontSize: "12px",
  lineHeight: "1.5",
  margin: "0 0 8px 0",
};

const recentReadTimeStyle: React.CSSProperties = {
  color: "#64748b",
  fontSize: "11px",
  margin: 0,
};

const hrStyle: React.CSSProperties = {
  borderColor: "#1e293b",
  margin: "24px 0 16px 0",
};

const digestFooterTextStyle: React.CSSProperties = {
  color: "#64748b",
  fontSize: "11px",
  textAlign: "center",
  margin: 0,
};
