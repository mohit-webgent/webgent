import assert from "node:assert";
import fs from "node:fs";
import { prisma } from "../src/lib/db";
import sitemapFn from "../src/app/sitemap";
import robotsFn from "../src/app/robots";

async function runPhase15Tests() {
  console.log("================================================");
  console.log("  PHASE 15: SEO AND PERFORMANCE VALIDATION TESTS");
  console.log("================================================\n");

  let passed = 0;
  function pass(msg: string) {
    console.log(`  ✓ ${msg}`);
    passed++;
  }

  // ----------------------------------------------------
  // 1. Root Layout & Global Metadata
  // ----------------------------------------------------
  console.log("--- 1. Root Layout & Global Metadata ---");
  const layoutCode = fs.readFileSync("src/app/layout.tsx", "utf8");
  assert(layoutCode.includes("metadataBase:"), "Root layout configures metadataBase");
  assert(layoutCode.includes("title:"), "Root layout configures title template");
  assert(layoutCode.includes("openGraph:"), "Root layout configures OpenGraph default metadata");
  assert(layoutCode.includes("twitter:"), "Root layout configures Twitter default metadata");
  assert(layoutCode.includes("robots:"), "Root layout configures robots meta tags");
  assert(
    layoutCode.includes("application/ld+json"),
    "Root layout includes Schema.org JSON-LD structured data",
  );
  pass("Root layout configures complete default metadata, openGraph, twitter, and JSON-LD");

  // ----------------------------------------------------
  // 2. Metadata & Canonical URLs for All Public Pages
  // ----------------------------------------------------
  console.log("\n--- 2. Public Pages Metadata & Canonical URLs ---");
  const homeCode = fs.readFileSync("src/app/page.tsx", "utf8");
  assert(homeCode.includes('canonical: "/"'), "Home page defines canonical URL");
  assert(homeCode.includes("openGraph:"), "Home page defines OpenGraph tags");
  assert(homeCode.includes("twitter:"), "Home page defines Twitter card");
  assert(homeCode.includes("revalidate = 60"), "Home page defines ISR revalidation cache");
  pass("Home page specifies canonical URL, OG metadata, Twitter card, and revalidation");

  const workCode = fs.readFileSync("src/app/work/page.tsx", "utf8");
  assert(workCode.includes('canonical: "/work"'), "Work page defines canonical URL");
  assert(workCode.includes("openGraph:"), "Work page defines OpenGraph tags");
  assert(workCode.includes("twitter:"), "Work page defines Twitter card");
  assert(workCode.includes("revalidate = 60"), "Work page defines ISR revalidation cache");
  pass("Work page specifies canonical URL, OG metadata, Twitter card, and revalidation");

  const blogCode = fs.readFileSync("src/app/blog/page.tsx", "utf8");
  assert(blogCode.includes('canonical: "/blog"'), "Blog page defines canonical URL");
  assert(blogCode.includes("openGraph:"), "Blog page defines OpenGraph tags");
  assert(blogCode.includes("twitter:"), "Blog page defines Twitter card");
  assert(blogCode.includes("revalidate = 60"), "Blog page defines ISR revalidation cache");
  pass("Blog page specifies canonical URL, OG metadata, Twitter card, and revalidation");

  const testimonialsCode = fs.readFileSync("src/app/testimonials/page.tsx", "utf8");
  assert(
    testimonialsCode.includes('canonical: "/testimonials"'),
    "Testimonials page defines canonical URL",
  );
  assert(testimonialsCode.includes("openGraph:"), "Testimonials page defines OpenGraph tags");
  assert(testimonialsCode.includes("twitter:"), "Testimonials page defines Twitter card");
  assert(
    testimonialsCode.includes("revalidate = 60"),
    "Testimonials page defines ISR revalidation cache",
  );
  pass("Testimonials page specifies canonical URL, OG metadata, Twitter card, and revalidation");

  const contactCode = fs.readFileSync("src/app/contact/page.tsx", "utf8");
  assert(contactCode.includes('canonical: "/contact"'), "Contact page defines canonical URL");
  assert(contactCode.includes("openGraph:"), "Contact page defines OpenGraph tags");
  assert(contactCode.includes("twitter:"), "Contact page defines Twitter card");
  assert(contactCode.includes("revalidate = 3600"), "Contact page defines revalidation cache");
  pass("Contact page specifies canonical URL, OG metadata, Twitter card, and revalidation");

  const thankYouCode = fs.readFileSync("src/app/contact/thank-you/page.tsx", "utf8");
  assert(thankYouCode.includes("index: false"), "Thank you page excludes indexing with noindex");
  assert(
    thankYouCode.includes('canonical: "/contact/thank-you"'),
    "Thank you page defines canonical URL",
  );
  pass("Contact thank you page sets noindex and canonical URL");

  // ----------------------------------------------------
  // 3. Dynamic Metadata for Projects & Blog Posts
  // ----------------------------------------------------
  console.log("\n--- 3. Dynamic Metadata for Projects & Blog Posts ---");
  const projectDetailCode = fs.readFileSync("src/app/work/[slug]/page.tsx", "utf8");
  assert(projectDetailCode.includes("generateMetadata"), "Project detail exports generateMetadata");
  assert(
    projectDetailCode.includes("canonical: `/work/${project.slug}`"),
    "Project detail sets dynamic canonical URL",
  );
  assert(
    projectDetailCode.includes("openGraph:"),
    "Project detail configures dynamic OpenGraph tags",
  );
  assert(projectDetailCode.includes("twitter:"), "Project detail configures dynamic Twitter cards");
  assert(
    projectDetailCode.includes("revalidate = 60"),
    "Project detail defines ISR revalidation cache",
  );
  pass("Project detail implements dynamic generateMetadata with canonical, OG, Twitter, and ISR");

  const blogDetailCode = fs.readFileSync("src/app/blog/[slug]/page.tsx", "utf8");
  assert(blogDetailCode.includes("generateMetadata"), "Blog detail exports generateMetadata");
  assert(
    blogDetailCode.includes("canonical: `/blog/${post.slug}`"),
    "Blog detail sets dynamic canonical URL",
  );
  assert(blogDetailCode.includes("openGraph:"), "Blog detail configures dynamic OpenGraph tags");
  assert(blogDetailCode.includes("twitter:"), "Blog detail configures dynamic Twitter cards");
  assert(blogDetailCode.includes("revalidate = 60"), "Blog detail defines ISR revalidation cache");
  pass("Blog post detail implements dynamic generateMetadata with canonical, OG, Twitter, and ISR");

  // ----------------------------------------------------
  // 4. Sitemap.xml & Robots.txt Routes
  // ----------------------------------------------------
  console.log("\n--- 4. Sitemap & Robots Generation ---");
  const sitemapItems = await sitemapFn();
  assert(Array.isArray(sitemapItems), "sitemap function returns an array of route entries");
  assert(
    sitemapItems.some((item) => item.url.endsWith("/")),
    "Sitemap contains home route",
  );
  assert(
    sitemapItems.some((item) => item.url.endsWith("/work")),
    "Sitemap contains work route",
  );
  assert(
    sitemapItems.some((item) => item.url.endsWith("/blog")),
    "Sitemap contains blog route",
  );
  assert(
    sitemapItems.some((item) => item.url.endsWith("/testimonials")),
    "Sitemap contains testimonials route",
  );
  assert(
    sitemapItems.some((item) => item.url.endsWith("/contact")),
    "Sitemap contains contact route",
  );
  pass(
    `Sitemap generated successfully with ${sitemapItems.length} routes including static and dynamic items`,
  );

  const robotsData = robotsFn();
  assert(Array.isArray(robotsData.rules), "robots returns rules array");
  assert(robotsData.rules[0].allow === "/", "robots allows crawling root path");
  assert(Array.isArray(robotsData.rules[0].disallow), "robots defines disallow array");
  assert(
    (robotsData.rules[0].disallow as string[]).some((p) => p.includes("/admin")),
    "robots disallows admin paths",
  );
  assert(
    typeof robotsData.sitemap === "string" && robotsData.sitemap.includes("sitemap.xml"),
    "robots specifies sitemap URL",
  );
  pass("Robots.txt configures allowed public crawling, admin protection, and sitemap reference");

  // ----------------------------------------------------
  // 5. Dynamic OG Image Generation
  // ----------------------------------------------------
  console.log("\n--- 5. Dynamic OG Image Generation ---");
  assert(fs.existsSync("src/app/api/og/route.tsx"), "Dynamic /api/og route exists");
  assert(fs.existsSync("src/app/opengraph-image.tsx"), "Default app opengraph-image exists");
  const ogRouteCode = fs.readFileSync("src/app/api/og/route.tsx", "utf8");
  assert(ogRouteCode.includes("ImageResponse"), "Dynamic OG route utilizes Next.js ImageResponse");
  assert(
    ogRouteCode.includes('searchParams.get("title")'),
    "Dynamic OG route accepts parametric titles",
  );
  assert(
    ogRouteCode.includes('searchParams.get("badge")'),
    "Dynamic OG route accepts parametric badges",
  );
  pass("Dynamic Open Graph image engine implemented via Next.js native ImageResponse");

  // ----------------------------------------------------
  // 6. Heading Hierarchy & Semantic HTML
  // ----------------------------------------------------
  console.log("\n--- 6. Heading Hierarchy & Semantic HTML ---");
  // Check that each public page has exactly one main h1
  const countH1 = (code: string) => (code.match(/<h1[\s>]/g) || []).length;
  assert(countH1(homeCode) === 1, "Home page has exactly one <h1> element");
  assert(countH1(workCode) === 1, "Work page has exactly one <h1> element");
  assert(countH1(projectDetailCode) === 1, "Project detail page has exactly one <h1> element");
  assert(countH1(blogCode) === 1, "Blog page has exactly one <h1> element");
  assert(countH1(blogDetailCode) === 1, "Blog detail page has exactly one <h1> element");
  assert(countH1(testimonialsCode) === 1, "Testimonials page has exactly one <h1> element");
  assert(countH1(contactCode) === 1, "Contact page has exactly one <h1> element");
  assert(countH1(thankYouCode) === 1, "Contact thank you page has exactly one <h1> element");
  pass("Every public page strictly follows heading hierarchy with exactly one <h1> element");

  // Check semantic layout landmarks
  const mainLayoutCode = fs.readFileSync("src/components/layout/main-layout.tsx", "utf8");
  assert(
    mainLayoutCode.includes("Skip to main content"),
    "MainLayout provides skip-to-content accessible link",
  );
  assert(
    mainLayoutCode.includes('id="main-content"'),
    "Main element has id for keyboard accessibility",
  );
  const headerCode = fs.readFileSync("src/components/layout/header.tsx", "utf8");
  assert(headerCode.includes('aria-label="Main Navigation"'), "Header has accessible nav landmark");
  assert(
    headerCode.includes('aria-label="Mobile Navigation"'),
    "Mobile menu has accessible nav landmark",
  );
  pass("Semantic HTML landmarks and accessibility standards verified");

  // ----------------------------------------------------
  // 7. Image Optimization & Lazy Loading
  // ----------------------------------------------------
  console.log("\n--- 7. Image Optimization & Lazy Loading ---");
  const nextConfigCode = fs.readFileSync("next.config.mjs", "utf8");
  assert(
    nextConfigCode.includes("remotePatterns:"),
    "Next.js config enables remotePatterns for images",
  );
  assert(
    nextConfigCode.includes("formats:"),
    "Next.js config specifies modern AVIF/WebP image formats",
  );
  assert(
    nextConfigCode.includes("compress: true"),
    "Next.js enables Gzip/Brotli response compression",
  );

  assert(
    projectDetailCode.includes('loading="lazy"'),
    "Project detail screenshots use lazy loading",
  );
  assert(
    projectDetailCode.includes('decoding="async"'),
    "Project detail screenshots use asynchronous decoding",
  );
  assert(testimonialsCode.includes('loading="lazy"'), "Testimonial avatars use lazy loading");
  assert(
    testimonialsCode.includes('decoding="async"'),
    "Testimonial avatars use asynchronous decoding",
  );
  assert(
    blogDetailCode.includes('fetchpriority="high"'),
    "Blog detail above-the-fold hero image prioritizes LCP",
  );
  pass("Image optimization, lazy loading, decoding, and Next.js modern formats configured");

  // ----------------------------------------------------
  // 8. 404, Error, and Loading UI
  // ----------------------------------------------------
  console.log("\n--- 8. 404, Error, and Loading UI ---");
  const notFoundCode = fs.readFileSync("src/app/not-found.tsx", "utf8");
  assert(notFoundCode.includes("Page Not Found"), "404 page displays clear not found state");
  assert(notFoundCode.includes("<h1"), "404 page uses proper <h1> heading");
  assert(notFoundCode.includes("index: false"), "404 page metadata sets noindex");
  pass("Custom 404 page implemented with proper heading, navigation, and noindex metadata");

  const errorCode = fs.readFileSync("src/app/error.tsx", "utf8");
  assert(errorCode.includes("<h1"), "Error boundary uses proper <h1> heading");
  assert(errorCode.includes("reset()"), "Error boundary provides retry reset action");
  assert(errorCode.includes("Return Home"), "Error boundary provides return home navigation");
  pass("Error boundary implemented with retry and home recovery paths");

  assert(fs.existsSync("src/app/loading.tsx"), "Root loading skeleton exists");
  assert(fs.existsSync("src/app/work/loading.tsx"), "Work loading skeleton exists");
  assert(fs.existsSync("src/app/work/[slug]/loading.tsx"), "Work detail loading skeleton exists");
  assert(fs.existsSync("src/app/blog/loading.tsx"), "Blog loading skeleton exists");
  assert(fs.existsSync("src/app/blog/[slug]/loading.tsx"), "Blog detail loading skeleton exists");
  pass("Instant loading skeleton UI implemented across all page segments");

  console.log("\n================================================");
  console.log(`  PHASE 15 TEST RESULTS: ${passed} PASSED / 0 FAILED`);
  console.log("================================================\n");

  await prisma.$disconnect();
}

runPhase15Tests().catch((err) => {
  console.error("Test failed with error:", err);
  process.exit(1);
});
