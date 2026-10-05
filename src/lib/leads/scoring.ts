export interface LeadScoringInput {
  name: string;
  email: string;
  phone?: string | null;
  company?: string | null;
  service?: string | null;
  budget?: string | null;
  message: string;
}

export function calculateLeadScore(input: LeadScoringInput): number {
  let score = 10;

  if (input.budget && input.budget.trim() !== "" && input.budget !== "not_specified") {
    score += 30;
  }

  if (input.company && input.company.trim().length > 1) {
    score += 20;
  }

  if (input.phone && input.phone.trim().length >= 7) {
    score += 15;
  }

  if (
    input.service &&
    ["web_development", "mobile_app", "full_stack", "enterprise", "custom_software"].includes(
      input.service.toLowerCase().replace(/[- ]/g, "_"),
    )
  ) {
    score += 15;
  }

  if (input.message && input.message.trim().length >= 100) {
    score += 10;
  }

  return Math.min(100, Math.max(0, score));
}
