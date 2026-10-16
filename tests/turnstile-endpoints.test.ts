import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "fs";
import path from "path";
import { NextRequest } from "next/server";
import { POST as contactRoute } from "../src/app/api/contact/route";
import { POST as newsletterRoute } from "../src/app/api/newsletter/subscribe/route";
import { POST as chatStartRoute } from "../src/app/api/chat/start/route";
import { prisma } from "../src/lib/db";

describe("Protected Form Endpoints & Database Isolation Suite", () => {
  const originalEnv = { ...process.env };

  // ---------------------------------------------------------------------------
  // 1. Contact Route Protection
  // ---------------------------------------------------------------------------
  describe("Contact Form Endpoint (/api/contact)", () => {
    it("rejects contact submission when Turnstile verification fails in production without creating a lead", async () => {
      (process.env as any).NODE_ENV = "production";
      process.env.TURNSTILE_SECRET_KEY = "test-secret";

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

        const testEmail = `bot_contact_${Date.now()}@example-spam.com`;

        const req = new NextRequest("http://localhost:3000/api/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "Spam Bot",
            email: testEmail,
            message: "Automated spam inquiry that must be rejected by Turnstile.",
            turnstileToken: "bad-token",
          }),
        });

        const res = await contactRoute(req);
        const data = await res.json();

        assert.equal(res.status, 400);
        assert.equal(data.success, false);
        assert.match(data.error?.message || "", /security|captcha/i);

        // Verify NO lead was created in database
        const lead = await prisma.lead.findFirst({
          where: { email: testEmail },
        });
        assert.equal(lead, null, "No lead should be created when Turnstile fails");
      } finally {
        globalThis.fetch = originalFetch;
        process.env = { ...originalEnv };
      }
    });
  });

  // ---------------------------------------------------------------------------
  // 2. Newsletter Route Protection
  // ---------------------------------------------------------------------------
  describe("Newsletter Subscription Endpoint (/api/newsletter/subscribe)", () => {
    it("rejects subscription when Turnstile verification fails in production without creating subscriber", async () => {
      (process.env as any).NODE_ENV = "production";
      process.env.TURNSTILE_SECRET_KEY = "test-secret";

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

        const testEmail = `bot_sub_${Date.now()}@example-spam.com`;

        const req = new NextRequest("http://localhost:3000/api/newsletter/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: testEmail,
            name: "Spam Subscriber",
            turnstileToken: "bad-token",
          }),
        });

        const res = await newsletterRoute(req);
        const data = await res.json();

        assert.equal(res.status, 400);
        assert.equal(data.success, false);
        assert.match(data.error?.message || "", /security|turnstile/i);

        // Verify NO subscriber was created in database
        const subscriber = await prisma.subscriber.findUnique({
          where: { email: testEmail },
        });
        assert.equal(subscriber, null, "No subscriber should be created when Turnstile fails");
      } finally {
        globalThis.fetch = originalFetch;
        process.env = { ...originalEnv };
      }
    });
  });

  // ---------------------------------------------------------------------------
  // 3. Chat Start Endpoint Protection
  // ---------------------------------------------------------------------------
  describe("Chat Start Endpoint (/api/chat/start)", () => {
    it("rejects chat start when turnstileToken is completely missing in production without creating session or lead", async () => {
      (process.env as any).NODE_ENV = "production";
      process.env.TURNSTILE_SECRET_KEY = "test-secret";

      const testEmail = `bot_missing_token_${Date.now()}@example-spam.com`;

      const req = new NextRequest("http://localhost:3000/api/chat/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Missing Token Visitor",
          email: testEmail,
          initialMessage: "Inbound message with no token",
          // turnstileToken omitted
        }),
      });

      const res = await chatStartRoute(req);
      const data = await res.json();

      assert.equal(res.status, 400);
      assert.equal(data.success, false);
      assert.match(data.error || "", /missing/i);
      assert.equal(
        data.error,
        "Turnstile security token is missing. Please complete the verification challenge.",
      );

      // Verify NO lead was created in database
      const lead = await prisma.lead.findFirst({
        where: { email: testEmail },
      });
      assert.equal(lead, null, "No lead should be created when Turnstile token is missing on chat start");

      // Verify NO chat session was created
      const session = await prisma.chatSession.findFirst({
        where: { metadata: { contains: testEmail } },
      });
      assert.equal(session, null, "No chat session should be created when Turnstile token is missing");

      process.env = { ...originalEnv };
    });

    it("rejects chat start when Turnstile verification fails in production without creating session or lead", async () => {
      (process.env as any).NODE_ENV = "production";
      process.env.TURNSTILE_SECRET_KEY = "test-secret";

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

        const testEmail = `bot_chat_${Date.now()}@example-spam.com`;

        const req = new NextRequest("http://localhost:3000/api/chat/start", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "Spam Visitor",
            email: testEmail,
            initialMessage: "Inbound bot message",
            turnstileToken: "bad-token",
          }),
        });

        const res = await chatStartRoute(req);
        const data = await res.json();

        assert.equal(res.status, 400);
        assert.equal(data.success, false);
        assert.match(data.error || "", /security|turnstile/i);

        // Verify NO lead was created in database
        const lead = await prisma.lead.findFirst({
          where: { email: testEmail },
        });
        assert.equal(lead, null, "No lead should be created when Turnstile fails on chat start");
      } finally {
        globalThis.fetch = originalFetch;
        process.env = { ...originalEnv };
      }
    });
  });

  // ---------------------------------------------------------------------------
  // 4. Source Audit: Frontend Forms Dispatching turnstileToken
  // ---------------------------------------------------------------------------
  describe("Frontend Form Source Code Integrity", () => {
    const rootDir = path.resolve(__dirname, "..");

    it("ensures contact-form.tsx dispatches turnstileToken in POST payload", () => {
      const content = fs.readFileSync(
        path.join(rootDir, "src/components/contact/contact-form.tsx"),
        "utf-8",
      );
      assert.ok(
        content.includes("turnstileToken"),
        "Contact form must include turnstileToken in state/payload",
      );
      assert.ok(
        content.includes("<Turnstile"),
        "Contact form must render the Turnstile widget",
      );
    });

    it("ensures pricing-view.tsx dispatches turnstileToken in POST payload", () => {
      const content = fs.readFileSync(
        path.join(rootDir, "src/components/pricing/pricing-view.tsx"),
        "utf-8",
      );
      assert.ok(
        content.includes("turnstileToken"),
        "Pricing plan modal must include turnstileToken in request body",
      );
      assert.ok(
        content.includes("<Turnstile"),
        "Pricing view must render Turnstile in modal",
      );
    });

    it("ensures newsletter-form.tsx dispatches turnstileToken in POST payload", () => {
      const content = fs.readFileSync(
        path.join(rootDir, "src/components/newsletter/newsletter-form.tsx"),
        "utf-8",
      );
      assert.ok(
        content.includes("turnstileToken"),
        "Newsletter form must include turnstileToken in payload",
      );
      assert.ok(
        content.includes("<Turnstile"),
        "Newsletter form must render Turnstile widget",
      );
    });

    it("ensures chat-widget.tsx dispatches turnstileToken in POST payload and enforces validation before submit", () => {
      const content = fs.readFileSync(
        path.join(rootDir, "src/components/chat/chat-widget.tsx"),
        "utf-8",
      );
      assert.ok(
        content.includes("turnstileToken: activeToken || undefined"),
        "Chat widget must include turnstileToken in start payload",
      );
      assert.ok(
        content.includes("<Turnstile"),
        "Chat widget must render Turnstile in details drawer",
      );
      assert.ok(
        content.includes("disabled={!turnstileToken || initializing}"),
        "Chat widget must disable submit action until a valid token is available",
      );
      assert.ok(
        !content.includes("if (nextOpen && !sessionId) {\n      await initSession();\n    }"),
        "Chat widget must NOT fire /api/chat/start prematurely upon opening the widget",
      );
    });
  });
});
