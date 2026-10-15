import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { verifyTurnstileToken } from "../src/lib/turnstile";
import { contactFormSchema } from "../src/lib/validations/contact";
import { newsletterSubscribeSchema } from "../src/lib/validations/newsletter";

describe("Cloudflare Turnstile Verification Suite", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    // Restore global fetch if it was mocked
    if ((globalThis.fetch as any)?._isMocked) {
      delete (globalThis.fetch as any)._isMocked;
    }
  });

  // ---------------------------------------------------------------------------
  // 1. Missing Token Handling
  // ---------------------------------------------------------------------------
  describe("Missing or Invalid Token Format", () => {
    it("rejects undefined token", async () => {
      process.env.TURNSTILE_SECRET_KEY = "1x0000000000000000000000000000000AA";
      const res = await verifyTurnstileToken(undefined);
      assert.equal(res.success, false);
      assert.match(res.error || "", /missing/i);
    });

    it("rejects empty or whitespace-only token", async () => {
      process.env.TURNSTILE_SECRET_KEY = "1x0000000000000000000000000000000AA";
      const res = await verifyTurnstileToken("   ");
      assert.equal(res.success, false);
      assert.match(res.error || "", /missing/i);
    });
  });

  // ---------------------------------------------------------------------------
  // 2. Local Dev Bypass vs Production Fail-Closed
  // ---------------------------------------------------------------------------
  describe("Environment Configuration & Fail-Closed Safety", () => {
    it("allows bypass in non-production when TURNSTILE_SECRET_KEY is absent", async () => {
      (process.env as any).NODE_ENV = "development";
      delete process.env.TURNSTILE_SECRET_KEY;

      const res = await verifyTurnstileToken(undefined);
      assert.equal(res.success, true);
    });

    it("accepts dev-mock-turnstile-token in non-production", async () => {
      (process.env as any).NODE_ENV = "development";
      process.env.TURNSTILE_SECRET_KEY = "dummy-secret";

      const res = await verifyTurnstileToken("dev-mock-turnstile-token");
      assert.equal(res.success, true);
    });

    it("FAILS CLOSED in production when TURNSTILE_SECRET_KEY is missing", async () => {
      (process.env as any).NODE_ENV = "production";
      delete process.env.TURNSTILE_SECRET_KEY;

      const res = await verifyTurnstileToken("any-token-sample");
      assert.equal(res.success, false);
      assert.match(res.error || "", /unconfigured/i);
    });

    it("does NOT accept dev-mock-turnstile-token in production", async () => {
      (process.env as any).NODE_ENV = "production";
      process.env.TURNSTILE_SECRET_KEY = "real-or-test-secret";

      // Mock fetch to reject or verify it doesn't bypass
      const originalFetch = globalThis.fetch;
      try {
        globalThis.fetch = async () =>
          new Response(
            JSON.stringify({
              success: false,
              "error-codes": ["invalid-input-response"],
            }),
            { status: 200, headers: { "Content-Type": "application/json" } },
          );
        (globalThis.fetch as any)._isMocked = true;

        const res = await verifyTurnstileToken("dev-mock-turnstile-token");
        assert.equal(res.success, false);
      } finally {
        globalThis.fetch = originalFetch;
      }
    });
  });

  // ---------------------------------------------------------------------------
  // 3. Cloudflare Verification Response Handling
  // ---------------------------------------------------------------------------
  describe("Cloudflare Siteverify Responses", () => {
    it("handles valid Cloudflare token successfully", async () => {
      (process.env as any).NODE_ENV = "development";
      process.env.TURNSTILE_SECRET_KEY = "1x0000000000000000000000000000000AA";

      const originalFetch = globalThis.fetch;
      try {
        globalThis.fetch = async () =>
          new Response(
            JSON.stringify({
              success: true,
              challenge_ts: new Date().toISOString(),
              hostname: "webgent.vercel.app",
            }),
            { status: 200, headers: { "Content-Type": "application/json" } },
          );
        (globalThis.fetch as any)._isMocked = true;

        const res = await verifyTurnstileToken("valid-cf-token", "203.0.113.1");
        assert.equal(res.success, true);
        assert.equal(res.hostname, "webgent.vercel.app");
      } finally {
        globalThis.fetch = originalFetch;
      }
    });

    it("handles timeout-or-duplicate error codes safely", async () => {
      process.env.TURNSTILE_SECRET_KEY = "3x0000000000000000000000000000000AA";

      const originalFetch = globalThis.fetch;
      try {
        globalThis.fetch = async () =>
          new Response(
            JSON.stringify({
              success: false,
              "error-codes": ["timeout-or-duplicate"],
            }),
            { status: 200, headers: { "Content-Type": "application/json" } },
          );
        (globalThis.fetch as any)._isMocked = true;

        const res = await verifyTurnstileToken("expired-token");
        assert.equal(res.success, false);
        assert.match(res.error || "", /expired|already used/i);
      } finally {
        globalThis.fetch = originalFetch;
      }
    });

    it("handles invalid-input-response error codes safely", async () => {
      process.env.TURNSTILE_SECRET_KEY = "2x0000000000000000000000000000000AA";

      const originalFetch = globalThis.fetch;
      try {
        globalThis.fetch = async () =>
          new Response(
            JSON.stringify({
              success: false,
              "error-codes": ["invalid-input-response"],
            }),
            { status: 200, headers: { "Content-Type": "application/json" } },
          );
        (globalThis.fetch as any)._isMocked = true;

        const res = await verifyTurnstileToken("invalid-token");
        assert.equal(res.success, false);
        assert.match(res.error || "", /invalid/i);
      } finally {
        globalThis.fetch = originalFetch;
      }
    });

    it("handles HTTP error status safely", async () => {
      process.env.TURNSTILE_SECRET_KEY = "valid-secret";

      const originalFetch = globalThis.fetch;
      try {
        globalThis.fetch = async () =>
          new Response("Internal Server Error", { status: 500 });
        (globalThis.fetch as any)._isMocked = true;

        const res = await verifyTurnstileToken("some-token");
        assert.equal(res.success, false);
        assert.match(res.error || "", /unable to verify/i);
      } finally {
        globalThis.fetch = originalFetch;
      }
    });

    it("handles network fetch exception safely without returning success", async () => {
      process.env.TURNSTILE_SECRET_KEY = "valid-secret";

      const originalFetch = globalThis.fetch;
      try {
        globalThis.fetch = async () => {
          throw new Error("DNS resolution failed");
        };
        (globalThis.fetch as any)._isMocked = true;

        const res = await verifyTurnstileToken("some-token");
        assert.equal(res.success, false);
        assert.match(res.error || "", /network error/i);
      } finally {
        globalThis.fetch = originalFetch;
      }
    });

    it("handles timeout abort safely without returning success", async () => {
      process.env.TURNSTILE_SECRET_KEY = "valid-secret";

      const originalFetch = globalThis.fetch;
      try {
        globalThis.fetch = async () => {
          const abortErr = new Error("The operation was aborted");
          abortErr.name = "AbortError";
          throw abortErr;
        };
        (globalThis.fetch as any)._isMocked = true;

        const res = await verifyTurnstileToken("some-token");
        assert.equal(res.success, false);
        assert.match(res.error || "", /timed out/i);
      } finally {
        globalThis.fetch = originalFetch;
      }
    });
  });

  // ---------------------------------------------------------------------------
  // 4. Production Hostname Validation
  // ---------------------------------------------------------------------------
  describe("Production Hostname Verification", () => {
    it("accepts authorized hostname in production", async () => {
      (process.env as any).NODE_ENV = "production";
      process.env.TURNSTILE_SECRET_KEY = "test-secret";

      const originalFetch = globalThis.fetch;
      try {
        globalThis.fetch = async () =>
          new Response(
            JSON.stringify({
              success: true,
              hostname: "webgent.vercel.app",
            }),
            { status: 200, headers: { "Content-Type": "application/json" } },
          );
        (globalThis.fetch as any)._isMocked = true;

        const res = await verifyTurnstileToken("valid-token");
        assert.equal(res.success, true);
      } finally {
        globalThis.fetch = originalFetch;
      }
    });

    it("rejects unauthorized attacker hostname in production", async () => {
      (process.env as any).NODE_ENV = "production";
      process.env.TURNSTILE_SECRET_KEY = "test-secret";

      const originalFetch = globalThis.fetch;
      try {
        globalThis.fetch = async () =>
          new Response(
            JSON.stringify({
              success: true,
              hostname: "evil-phishing-domain.com",
            }),
            { status: 200, headers: { "Content-Type": "application/json" } },
          );
        (globalThis.fetch as any)._isMocked = true;

        const res = await verifyTurnstileToken("valid-token-wrong-host");
        assert.equal(res.success, false);
        assert.match(res.error || "", /hostname mismatch/i);
      } finally {
        globalThis.fetch = originalFetch;
      }
    });
  });

  // ---------------------------------------------------------------------------
  // 5. Schema Validation for Form Payloads
  // ---------------------------------------------------------------------------
  describe("Form Schema Integration", () => {
    it("validates contact form with turnstileToken", () => {
      const parsed = contactFormSchema.safeParse({
        name: "Test User",
        email: "test@webgent.com",
        message: "This is a comprehensive test message of at least 20 chars.",
        turnstileToken: "cf_turnstile_valid_token_123",
      });

      assert.equal(parsed.success, true);
      if (parsed.success) {
        assert.equal(parsed.data.turnstileToken, "cf_turnstile_valid_token_123");
      }
    });

    it("validates newsletter form with turnstileToken", () => {
      const parsed = newsletterSubscribeSchema.safeParse({
        email: "subscriber@webgent.com",
        turnstileToken: "cf_turnstile_newsletter_token_456",
      });

      assert.equal(parsed.success, true);
      if (parsed.success) {
        assert.equal(parsed.data.turnstileToken, "cf_turnstile_newsletter_token_456");
      }
    });
  });
});
