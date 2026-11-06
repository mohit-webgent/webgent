import { GoogleGenAI } from "@google/genai";
import { logger } from "@/lib/logger";

export interface GeminiMessage {
  role: "user" | "assistant";
  content: string;
}

/** Each model gets a short window, and the whole chain stays inside the route's time limit. */
const PER_MODEL_TIMEOUT_MS = 10_000;
const TOTAL_BUDGET_MS = 22_000;

export function getSupportedGeminiModels(): string[] {
  const configured = process.env.GEMINI_MODEL?.trim();
  return Array.from(
    new Set(
      [configured, "gemini-flash-latest", "gemini-flash-lite-latest", "gemini-3.5-flash"].filter(
        (model): model is string => Boolean(model),
      ),
    ),
  );
}

export function detectPromptAbuse(text: string): {
  isAbusive: boolean;
  reason?: string;
} {
  const lower = text.toLowerCase();

  const suspiciousPatterns = [
    "ignore all previous instructions",
    "ignore previous instructions",
    "disregard all previous",
    "forget all previous instructions",
    "reveal your system prompt",
    "print your system prompt",
    "what is your system prompt",
    "system instructions:",
    "you are now in developer mode",
    "dan mode",
    "jailbreak",
    "bypass safety filters",
    "act as an unfiltered",
  ];

  for (const pattern of suspiciousPatterns) {
    if (lower.includes(pattern)) {
      return { isAbusive: true, reason: "injection_attempt" };
    }
  }

  const words = lower.trim().split(/\s+/);
  if (words.length > 25) {
    const wordCounts = new Map<string, number>();
    for (const w of words) {
      wordCounts.set(w, (wordCounts.get(w) || 0) + 1);
    }
    const maxRepetition = Math.max(...Array.from(wordCounts.values()));
    if (maxRepetition / words.length > 0.7) {
      return { isAbusive: true, reason: "repetitive_flood" };
    }
  }

  return { isAbusive: false };
}

export type GeminiClientInstance = {
  models: {
    generateContent: (params: unknown) => Promise<{ text?: string | null }>;
  };
};

let clientFactory: ((apiKey: string) => GeminiClientInstance) | null = null;

/** Lets tests replace the Gemini SDK. */
export function setGeminiClientFactory(factory: ((apiKey: string) => GeminiClientInstance) | null) {
  clientFactory = factory;
}

function getGeminiClient(apiKey: string): GeminiClientInstance {
  if (clientFactory) {
    return clientFactory(apiKey);
  }
  return new GoogleGenAI({ apiKey }) as unknown as GeminiClientInstance;
}

function getApiKey(): string | null {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey || apiKey.startsWith("your_") || apiKey.startsWith("sk-") || apiKey === "placeholder") {
    return null;
  }
  return apiKey;
}

export function isGeminiConfigured(): boolean {
  return getApiKey() !== null || clientFactory !== null;
}

function isRetryableError(message: string): boolean {
  const lower = message.toLowerCase();
  return ["503", "404", "429", "unavailable", "not found", "demand", "timed out", "resource_exhausted", "rate limit", "quota"].some(
    (term) => lower.includes(term),
  );
}

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

/**
 * Asks Gemini for a reply, trying the next model on temporary failures.
 * Returns null when no model produced text, so the caller can use its own fallback.
 */
export async function generateGeminiReply({
  messages,
  systemInstruction,
  temperature = 0.5,
}: {
  messages: GeminiMessage[];
  systemInstruction: string;
  temperature?: number;
}): Promise<string | null> {
  const apiKey = getApiKey() ?? (clientFactory ? "test-key" : null);
  if (!apiKey) {
    return null;
  }

  const formatted: { role: "user" | "model"; content: string }[] = [];
  for (const message of messages) {
    if (!message.content?.trim()) continue;
    const role = message.role === "assistant" ? ("model" as const) : ("user" as const);
    const last = formatted[formatted.length - 1];
    if (last && last.role === role) {
      last.content += `\n\n${message.content.trim()}`;
    } else {
      formatted.push({ role, content: message.content.trim() });
    }
  }

  if (formatted.length === 0 || formatted[0].role !== "user") {
    formatted.unshift({ role: "user", content: "Hello" });
  }

  const contents = formatted.map((m) => ({ role: m.role, parts: [{ text: m.content }] }));
  const client = getGeminiClient(apiKey);
  const deadline = Date.now() + TOTAL_BUDGET_MS;

  for (const model of getSupportedGeminiModels()) {
    const remaining = deadline - Date.now();
    if (remaining <= 0) break;

    try {
      const response = await withTimeout(
        client.models.generateContent({
          model,
          contents,
          config: { systemInstruction, temperature, maxOutputTokens: 900 },
        }),
        Math.min(PER_MODEL_TIMEOUT_MS, remaining),
        `Gemini model ${model}`,
      );
      const text = response.text?.trim();
      if (text) {
        return text;
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (!isRetryableError(message)) {
        logger.error(`[Gemini] Request failed on model ${model}`, { error: message });
        return null;
      }
      logger.warn(`[Gemini] Model ${model} unavailable, trying next: ${message}`);
    }
  }

  return null;
}
