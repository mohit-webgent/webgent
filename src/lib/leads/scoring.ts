export interface LeadScoringInput {
  name: string;
  email: string;
  phone?: string | null;
  company?: string | null;
  service?: string | null;
  budget?: string | null;
  message: string;
}

/**
 * Calculates a lead qualification score (0 - 100) based on inquiry parameters.
 */
export function calculateLeadScore(input: LeadScoringInput): number {
  let score = 10; // Base score for valid form submission

  // Budget indication (+30 points)
  if (input.budget && input.budget.trim() !== "" && input.budget !== "not_specified") {
    score += 30;
  }

  // Company affiliation (+20 points)
  if (input.company && input.company.trim().length > 1) {
    score += 20;
  }

  // Direct phone contact provided (+15 points)
  if (input.phone && input.phone.trim().length >= 7) {
    score += 15;
  }

  // High-value service request (+15 points)
  if (
    input.service &&
    ["web_development", "mobile_app", "full_stack", "enterprise", "custom_software"].includes(
      input.service.toLowerCase().replace(/[- ]/g, "_")
    )
  ) {
    score += 15;
  }

  // Detailed description length (+10 points for > 100 chars)
  if (input.message && input.message.trim().length >= 100) {
    score += 10;
  }

  return Math.min(100, Math.max(0, score));
}
