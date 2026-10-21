import { NextRequest } from "next/server";
import { z } from "zod";
import { ApiResponse } from "@/lib/api/response";
import { verifyAdminApiAccess } from "@/lib/auth-utils";
import {
  getKnowledgeBaseConfig,
  saveKnowledgeBaseConfig,
  KnowledgeBaseConfig,
} from "@/lib/services/knowledge-base-service";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

const knowledgeItemSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(2, "Title must be at least 2 characters"),
  category: z.enum(["about", "credentials", "pricing", "tech_stack", "policy", "custom"]),
  content: z.string().min(10, "Content must be at least 10 characters"),
  keywords: z.array(z.string()).default([]),
  enabled: z.boolean().default(true),
  updatedAt: z.string().optional(),
});

const customRuleSchema = z.object({
  id: z.string().min(1),
  rule: z.string().min(5, "Rule must be at least 5 characters"),
  enabled: z.boolean().default(true),
  severity: z.enum(["strict", "preference"]).default("strict"),
});

const updateKnowledgeBaseSchema = z.object({
  knowledge: z.array(knowledgeItemSchema),
  rules: z.array(customRuleSchema),
});

export async function GET() {
  try {
    const authGuard = await verifyAdminApiAccess();
    if (authGuard instanceof Response) {
      return authGuard;
    }

    const config = await getKnowledgeBaseConfig();
    return ApiResponse.success(config);
  } catch (error) {
    logger.error("[Admin Knowledge API] Error fetching knowledge base", { error });
    return ApiResponse.internalError("Failed to retrieve knowledge base configuration.");
  }
}

export async function PUT(req: NextRequest) {
  try {
    const authGuard = await verifyAdminApiAccess();
    if (authGuard instanceof Response) {
      return authGuard;
    }

    const body = await req.json().catch(() => ({}));
    const validation = updateKnowledgeBaseSchema.safeParse(body);

    if (!validation.success) {
      return ApiResponse.validationError(
        "Invalid knowledge base parameters.",
        validation.error.flatten().fieldErrors,
      );
    }

    const payload: KnowledgeBaseConfig = {
      knowledge: validation.data.knowledge.map((k) => ({
        ...k,
        updatedAt: new Date().toISOString(),
      })),
      rules: validation.data.rules,
    };

    const saved = await saveKnowledgeBaseConfig(payload, {
      id: authGuard.session.user.id,
      email: authGuard.session.user.email || "admin@webgent.com",
    });

    return ApiResponse.success(saved, 200, {
      message: "AI Consultant knowledge base and behavioral rules saved successfully.",
    });
  } catch (error) {
    logger.error("[Admin Knowledge API] Error saving knowledge base", { error });
    return ApiResponse.internalError("Failed to save knowledge base configuration.");
  }
}
