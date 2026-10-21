import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { invalidateKnowledgeRetrievalCache } from "./ai-consultant/knowledge-retrieval";
import { recordAuditLog } from "./audit-log";

export interface ApprovedKnowledgeItem {
  id: string;
  title: string;
  category: "about" | "credentials" | "pricing" | "tech_stack" | "policy" | "custom";
  content: string;
  keywords: string[];
  enabled: boolean;
  updatedAt: string;
}

export interface CustomRuleItem {
  id: string;
  rule: string;
  enabled: boolean;
  severity: "strict" | "preference";
}

export interface KnowledgeBaseConfig {
  knowledge: ApprovedKnowledgeItem[];
  rules: CustomRuleItem[];
}

export const DEFAULT_APPROVED_KNOWLEDGE: ApprovedKnowledgeItem[] = [
  {
    id: "company_overview",
    title: "Webgent Company Overview & Business Model",
    category: "about",
    content:
      "Webgent is a next-generation web solutions and digital engineering agency based in Gurugram / Noida, India. We specialize in Next.js 14, React, PostgreSQL, and custom web applications. Milestone payments: 50% upfront, 50% upon final launch review. Clients receive 100% full source code ownership with zero platform lock-in.",
    keywords: ["company", "webgent", "overview", "payments", "milestones", "ownership"],
    enabled: true,
    updatedAt: new Date().toISOString(),
  },
  {
    id: "founder_credentials",
    title: "Founder & Lead Architect: Mohit Verma",
    category: "credentials",
    content:
      "Mohit Verma is the founder and lead developer behind Webgent. Verified education: Master of Computer Applications (MCA) from Dr. A.P.J. Abdul Kalam Technical University (AKTU) / HIMT College (2022–2024), and Bachelor of Science in Computer Science (B.Sc CS) from Chaudhary Charan Singh University (CCSU) / IIMT College (2019–2022). Currently Software Developer at DBA Lounge. The AI consultant is an AI agent, not a human, and does not claim these personal degrees.",
    keywords: ["mohit verma", "founder", "education", "mca", "b.sc", "aktu", "ccsu", "credentials"],
    enabled: true,
    updatedAt: new Date().toISOString(),
  },
  {
    id: "engineering_stack",
    title: "Core Production Engineering Stack",
    category: "tech_stack",
    content:
      "Webgent builds modern web platforms using Next.js 14 App Router, React 18, TypeScript, TailwindCSS, PostgreSQL on Supabase, Prisma ORM, Redis for rate-limiting/caching, and Cloudflare Turnstile for bot protection. All projects feature responsive mobile layouts, SEO metadata, and sub-second performance.",
    keywords: ["tech stack", "next.js", "react", "typescript", "postgresql", "prisma", "database"],
    enabled: true,
    updatedAt: new Date().toISOString(),
  },
  {
    id: "warranty_and_sla",
    title: "Warranty & Post-Launch Bug Fix SLA",
    category: "policy",
    content:
      "Every custom project delivered by Webgent includes 15 days of free post-launch bug-fix warranty. Any defects or deviations from agreed scope are repaired promptly without additional charge. Ongoing maintenance and support packages are available on request.",
    keywords: ["warranty", "sla", "support", "maintenance", "bug fixes", "post launch"],
    enabled: true,
    updatedAt: new Date().toISOString(),
  },
  {
    id: "ecommerce_scoping_rules",
    title: "E-Commerce Architecture & Scoping Boundaries",
    category: "pricing",
    content:
      "E-commerce websites require dynamic backend infrastructure, secure payment gateways (Razorpay, Stripe), product databases, and real-time inventory. The AI Consultant must never suggest static-site architecture or static page-reduction cost savings for e-commerce requirements.",
    keywords: ["ecommerce", "online store", "pricing", "scoping", "razorpay", "dynamic"],
    enabled: true,
    updatedAt: new Date().toISOString(),
  },
];

export const DEFAULT_CUSTOM_RULES: CustomRuleItem[] = [
  {
    id: "rule_truth_grounding",
    rule: "Never hallucinate founder degrees or company background. Always attribute MCA and B.Sc qualifications directly to human founder Mohit Verma.",
    enabled: true,
    severity: "strict",
  },
  {
    id: "rule_bilingual_adaptation",
    rule: "Adapt tone seamlessly: respond in natural conversational Hinglish when prospective clients greet or inquire in Hindi/Hinglish, and clear English when approached in English.",
    enabled: true,
    severity: "preference",
  },
  {
    id: "rule_cost_transparency",
    rule: "Always break down estimated website investment into clear scope line items, including UI design, engineering, database setup, and payment gateway integration.",
    enabled: true,
    severity: "strict",
  },
];

/**
 * Loads the current approved knowledge entries and custom prompt rules from PostgreSQL SiteSetting.
 */
export async function getKnowledgeBaseConfig(): Promise<KnowledgeBaseConfig> {
  try {
    const [knowledgeSetting, rulesSetting] = await Promise.all([
      prisma.siteSetting.findUnique({ where: { key: "ai_approved_knowledge" } }),
      prisma.siteSetting.findUnique({ where: { key: "ai_custom_rules" } }),
    ]);

    let knowledge: ApprovedKnowledgeItem[] = DEFAULT_APPROVED_KNOWLEDGE;
    if (knowledgeSetting && knowledgeSetting.value) {
      try {
        const parsed = JSON.parse(knowledgeSetting.value);
        if (Array.isArray(parsed) && parsed.length > 0) {
          knowledge = parsed;
        }
      } catch {
        // Fallback to defaults
      }
    }

    let rules: CustomRuleItem[] = DEFAULT_CUSTOM_RULES;
    if (rulesSetting && rulesSetting.value) {
      try {
        const parsed = JSON.parse(rulesSetting.value);
        if (Array.isArray(parsed) && parsed.length > 0) {
          rules = parsed;
        }
      } catch {
        // Fallback to defaults
      }
    }

    return { knowledge, rules };
  } catch (error) {
    logger.error("[KnowledgeBaseService] Failed to load knowledge base config", { error });
    return {
      knowledge: DEFAULT_APPROVED_KNOWLEDGE,
      rules: DEFAULT_CUSTOM_RULES,
    };
  }
}

/**
 * Saves approved knowledge items and custom prompt rules to PostgreSQL SiteSetting
 * and purges the AI Consultant in-memory knowledge retrieval index.
 */
export async function saveKnowledgeBaseConfig(
  config: KnowledgeBaseConfig,
  actor?: { id: string; email: string },
): Promise<KnowledgeBaseConfig> {
  await prisma.$transaction([
    prisma.siteSetting.upsert({
      where: { key: "ai_approved_knowledge" },
      update: {
        value: JSON.stringify(config.knowledge),
        description: "AI Consultant Approved Knowledge Documents",
        isPublic: false,
      },
      create: {
        key: "ai_approved_knowledge",
        value: JSON.stringify(config.knowledge),
        description: "AI Consultant Approved Knowledge Documents",
        isPublic: false,
      },
    }),
    prisma.siteSetting.upsert({
      where: { key: "ai_custom_rules" },
      update: {
        value: JSON.stringify(config.rules),
        description: "AI Consultant Custom Prompt Rules and Guardrails",
        isPublic: false,
      },
      create: {
        key: "ai_custom_rules",
        value: JSON.stringify(config.rules),
        description: "AI Consultant Custom Prompt Rules and Guardrails",
        isPublic: false,
      },
    }),
  ]);

  // Immediately invalidate AI consultant in-memory cache
  invalidateKnowledgeRetrievalCache();

  if (actor) {
    await recordAuditLog("KNOWLEDGE_UPDATED", {
      actorId: actor.id,
      actorEmail: actor.email,
      knowledgeCount: config.knowledge.length,
      rulesCount: config.rules.length,
    });
  }

  return config;
}
