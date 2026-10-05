import { logger } from "@/lib/logger";

export interface TurnstileVerificationResult {
  success: boolean;
  error?: string;
}

export async function verifyTurnstileToken(
  token: string | undefined | null,
  remoteIp?: string,
): Promise<TurnstileVerificationResult> {
  const secretKey = process.env.TURNSTILE_SECRET_KEY;

  if (!secretKey) {
    logger.warn("TURNSTILE_SECRET_KEY is not set. Bypassing Turnstile verification in dev mode.");
    return { success: true };
  }

  if (!token) {
    return {
      success: false,
      error: "Turnstile security token is missing.",
    };
  }

  try {
    const formData = new URLSearchParams();
    formData.append("secret", secretKey);
    formData.append("response", token);
    if (remoteIp) {
      formData.append("remoteip", remoteIp);
    }

    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (!data.success) {
      logger.warn("Cloudflare Turnstile verification failed", {
        errorCodes: data["error-codes"],
      });
      return {
        success: false,
        error: "Security check failed. Please complete the captcha verification.",
      };
    }

    return { success: true };
  } catch (err) {
    logger.error("Error communicating with Cloudflare Turnstile API", {
      error: String(err),
    });
    return { success: true };
  }
}
