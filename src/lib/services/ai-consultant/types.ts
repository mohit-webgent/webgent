import type { ProjectEstimateResult } from "./calculator";

export interface ChatHistoryMessage {
  role: "user" | "assistant";
  content: string;
}

export interface VisitorInfo {
  name?: string;
  email?: string;
}

export interface ProjectState {
  categoryKey?: string;
  pageCount?: number;
  userBudgetINR?: number;
  deliverySpeed?: "standard" | "express";
  selectedFeatureIds?: string[];
  architecture?: "static" | "dynamic";
  isActivelyQuoting?: boolean;
}

export interface ConsultantResponse {
  messageText: string;
  estimate?: ProjectEstimateResult;
  followUpSuggestions: string[];
  categoryKey?: string;
  updatedProjectState?: ProjectState;
}

export type VisitorLanguage = "hinglish" | "english";

/** Prices quoted in conversation, read from the admin-managed pricing so replies can never drift from it. */
export interface PricingFacts {
  startingPriceINR: number;
  dynamicAddOnINR: number;
  expressPercent: number;
}
