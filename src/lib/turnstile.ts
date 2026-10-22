import { logger } from "@/lib/logger";

export interface TurnstileVerificationResult {
  success: boolean;
  error?: string;
  hostname?: string;
  action?: string;
  cdata?: string;
}

interface CloudflareSiteverifyResponse {
  success: boolean;
  "error-codes"?: string[];
  challenge_ts?: string;
  hostname?: string;
  action?: string;
  cdata?: string;
}

const DEFAULT_TIMEOUT_MS = 10000;
const CLOUDFLARE_SITEVERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

/**
 * Hardened server-side Cloudflare Turnstile token verification.
 * 
 * - In non-production: allows bypass only when keys are intentionally absent or dev mock token is used.
 * - In production: fails closed if secret key is missing.
 * - Enforces timeout, HTTP status checks, response schema validation, and hostname matching.
 * - Strictly avoids logging tokens, secrets, or personal data.
 */
export async function verifyTurnstileToken(
  token: string | undefined | null,
  remoteIp?: string,
): Promise<TurnstileVerificationResult> {
  const isProduction = process.env.NODE_ENV === "production";
  const secretKey = process.env.TURNSTILE_SECRET_KEY?.trim();

  // 1. Missing secret key handling
  if (!secretKey) {
    if (!isProduction) {
      logger.warn(
        "[Turnstile] TURNSTILE_SECRET_KEY is not set. Bypassing Turnstile verification in non-production mode.",
      );
      return { success: true };
    }

    logger.error(
      "[Turnstile] TURNSTILE_SECRET_KEY is missing in production environment. Failing closed for protected form.",
    );
    return {
      success: false,
      error: "Security verification service is unconfigured. Protected form submissions are disabled.",
    };
  }

  // 2. Token presence and format check
  if (!token || typeof token !== "string" || !token.trim()) {
    return {
      success: false,
      error: "Turnstile security token is missing. Please complete the verification challenge.",
    };
  }

  const trimmedToken = token.trim();

  // 3. Allow test mock token strictly in non-production environment
  if (!isProduction && trimmedToken === "dev-mock-turnstile-token") {
    logger.info("[Turnstile] Accepted dev-mock-turnstile-token in non-production environment.");
    return { success: true, hostname: "localhost" };
  }

  try {
    const formData = new URLSearchParams();
    formData.append("secret", secretKey);
    formData.append("response", trimmedToken);
    if (remoteIp && remoteIp !== "127.0.0.1" && remoteIp !== "::1") {
      formData.append("remoteip", remoteIp);
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

    let response: Response;
    try {
      response = await fetch(CLOUDFLARE_SITEVERIFY_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData,
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeoutId);
    }

    if (!response.ok) {
      logger.error("[Turnstile] Cloudflare siteverify HTTP error status", {
        status: response.status,
      });
      return {
        success: false,
        error: "Unable to verify security challenge at this time. Please try again.",
      };
    }

    const data = (await response.json()) as CloudflareSiteverifyResponse;

    if (!data || typeof data.success !== "boolean") {
      logger.error("[Turnstile] Malformed response payload received from Cloudflare siteverify");
      return {
        success: false,
        error: "Malformed response received from security verification provider. Please try again.",
      };
    }

    if (!data.success) {
      const errorCodes = data["error-codes"] || [];
      logger.warn("[Turnstile] Cloudflare Turnstile verification rejected", {
        errorCodes,
      });

      if (errorCodes.includes("timeout-or-duplicate")) {
        return {
          success: false,
          error: "Security verification token expired or was already used. Please refresh and retry.",
        };
      }

      if (errorCodes.includes("invalid-input-response")) {
        return {
          success: false,
          error: "Invalid security verification token. Please complete the captcha challenge again.",
        };
      }

      return {
        success: false,
        error: "Security check failed. Please complete the captcha verification.",
      };
    }

    // 4. Validate hostname in production
    if (isProduction && data.hostname) {
      const allowedHostnames = [
        "webgent.vercel.app",
        "webgent.online",
        "www.webgent.online",
        "webgent.com",
        "www.webgent.com",
      ];

      const configuredSiteUrl =
        process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL;
      if (configuredSiteUrl) {
        try {
          const parsed = new URL(configuredSiteUrl).hostname.toLowerCase();
          if (!allowedHostnames.includes(parsed)) {
            allowedHostnames.push(parsed);
          }
        } catch {
          // Ignore invalid URL parsing
        }
      }

      const receivedHostname = data.hostname.toLowerCase();
      const isAllowed = allowedHostnames.some(
        (allowed) => receivedHostname === allowed || receivedHostname.endsWith(`.${allowed}`),
      );

      if (!isAllowed) {
        logger.error("[Turnstile] Hostname mismatch in production Turnstile verification", {
          receivedHostname,
        });
        return {
          success: false,
          error: "Security verification hostname mismatch. Form submission rejected.",
        };
      }
    }

    return {
      success: true,
      hostname: data.hostname,
      action: data.action,
      cdata: data.cdata,
    };
  } catch (err: unknown) {
    const isAbort =
      err instanceof Error && (err.name === "AbortError" || err.message.includes("aborted"));

    if (isAbort) {
      logger.error("[Turnstile] Cloudflare siteverify timed out after 10 seconds");
      return {
        success: false,
        error: "Security verification timed out. Please try again.",
      };
    }

    logger.error("[Turnstile] Error communicating with Cloudflare Turnstile API", {
      error: err instanceof Error ? err.message : String(err),
    });
    return {
      success: false,
      error: "Network error during security verification. Please try again.",
    };
  }
}
