import * as React from "react";
import { Img, Link, Text } from "@react-email/components";
import { EmailActions, EmailBaseLayout, EmailButton, EmailSectionTitle, emailColors, getAppUrl } from "./base-layout";

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

export function NewsletterDigestEmail({ editionTitle, featuredArticle, recentArticles = [], unsubscribeUrl }: NewsletterDigestEmailProps) {
  const appUrl = getAppUrl();

  return (
    <EmailBaseLayout previewText={`${editionTitle}: ${featuredArticle.title}`} heading={editionTitle} unsubscribeUrl={unsubscribeUrl}>
      {featuredArticle.coverImageUrl && (
        <Img
          src={featuredArticle.coverImageUrl}
          alt={featuredArticle.title}
          width="100%"
          style={{ borderRadius: "8px", display: "block", margin: "0 0 16px", maxHeight: "260px", objectFit: "cover" }}
        />
      )}

      <Text style={{ color: emailColors.text, fontSize: "19px", fontWeight: 700, lineHeight: "1.35", margin: "0 0 6px" }}>{featuredArticle.title}</Text>
      {featuredArticle.readTime && <Text style={metaStyle}>{featuredArticle.readTime} min read</Text>}
      <Text style={{ color: emailColors.body, fontSize: "15px", lineHeight: "1.6", margin: 0 }}>{featuredArticle.excerpt}</Text>

      <EmailActions>
        <EmailButton href={`${appUrl}/blog/${featuredArticle.slug}`}>Read the article</EmailButton>
      </EmailActions>

      {recentArticles.length > 0 && (
        <>
          <EmailSectionTitle>More articles</EmailSectionTitle>
          {recentArticles.map((article) => (
            <div key={article.slug} style={{ borderTop: `1px solid ${emailColors.rule}`, padding: "12px 0" }}>
              <Link href={`${appUrl}/blog/${article.slug}`} style={{ color: emailColors.text, fontSize: "15px", fontWeight: 600, lineHeight: "1.4", textDecoration: "none" }}>
                {article.title}
              </Link>
              <Text style={{ color: emailColors.body, fontSize: "14px", lineHeight: "1.5", margin: "4px 0 0" }}>{article.excerpt}</Text>
              {article.readTime && <Text style={{ ...metaStyle, margin: "4px 0 0" }}>{article.readTime} min read</Text>}
            </div>
          ))}
        </>
      )}

      <Text style={{ color: emailColors.muted, fontSize: "12px", lineHeight: "1.5", margin: "20px 0 0" }}>You received this because you subscribed to the Webgent newsletter.</Text>
    </EmailBaseLayout>
  );
}

const metaStyle: React.CSSProperties = { color: emailColors.muted, fontSize: "13px", lineHeight: "1.5", margin: "0 0 10px" };
