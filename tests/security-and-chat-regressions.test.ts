import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import bcrypt from "bcryptjs";
import { NextRequest } from "next/server";
import { prisma } from "../src/lib/db";
import {
  extractConsultantParams,
  isProposalAcceptance,
  isScopingOrBudgetQuery,
  processConsultantMessage,
} from "../src/lib/services/ai-consultant/orchestrator";
import { calculatePhase2Upgrade, calculateProjectEstimate } from "../src/lib/services/ai-consultant/calculator";
import { getPricingCalculationConfig, DEFAULT_BACKEND_PRICING_DATA } from "../src/lib/services/pricing";
import { setGeminiClientFactory } from "../src/lib/services/gemini";
import { escapeCsvCell } from "../src/lib/leads/csv";
import {
  authorizeCredentials,
  computeSessionFingerprint,
  refreshSessionToken,
} from "../src/lib/auth-credentials";
import { POST as startChat } from "../src/app/api/chat/start/route";
import { POST as sendMessage } from "../src/app/api/chat/message/route";
import { GET as unsubscribeGet, POST as unsubscribePost } from "../src/app/api/newsletter/unsubscribe/route";
import { GET as confirmGet, POST as confirmPost } from "../src/app/api/newsletter/confirm/route";
import { POST as recordView } from "../src/app/api/blog/[slug]/view/route";

const uid = () => `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
const jsonRequest = (path: string, body: unknown, ip = `198.51.100.${Math.floor(Math.random() * 250) + 1}`) =>
  new NextRequest(`http://localhost:3000${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-forwarded-for": ip },
    body: JSON.stringify(body),
  });

describe("Chat intent matching", () => {
  it("no longer mistakes words containing 'rs' or 'under' for a budget", () => {
    for (const text of ["what are your hours?", "I don't understand", "do you have users guides?", "maximum effort"]) {
      assert.equal(isScopingOrBudgetQuery(text), false, text);
    }
  });

  it("still recognises genuine budget messages", () => {
    for (const text of ["my budget is 20000", "under ₹15,000", "rs 25000", "I can do 20k", "within 30000"]) {
      assert.equal(isScopingOrBudgetQuery(text), true, text);
    }
  });

  it("does not treat counts of things as money", () => {
    const parse = (content: string) => extractConsultantParams([{ role: "user", content }]).userBudgetINR;
    assert.equal(parse("I have 2000 products to sell"), undefined);
    assert.equal(parse("we have 5000 customers"), undefined);
    assert.equal(parse("under 2000 users"), undefined);
  });

  it("parses real budgets in English and Hinglish", () => {
    const parse = (content: string) => extractConsultantParams([{ role: "user", content }]).userBudgetINR;
    assert.equal(parse("Mera budget ₹15,000 hai"), 15000);
    assert.equal(parse("I have ₹50,000"), 50000);
    assert.equal(parse("I have 20k"), 20000);
    assert.equal(parse("around 1 lakh"), 100000);
    assert.equal(parse("20k budget"), 20000);
  });

  it("only treats explicit agreement as acceptance", () => {
    assert.equal(isProposalAcceptance("do you accept UPI?"), false);
    assert.equal(isProposalAcceptance("I accept"), true);
    assert.equal(isProposalAcceptance("₹9,999 wala proposal final karte hain"), true);
  });

  it("does not charge the express fee for wanting a fast website", () => {
    const fast = extractConsultantParams([{ role: "user", content: "I want a fast website" }]);
    assert.equal(fast.deliverySpeed, "standard");
    const urgent = extractConsultantParams([{ role: "user", content: "I need it urgently" }]);
    assert.equal(urgent.deliverySpeed, "express");
  });

  it("does not quote a price for an unrelated question", async () => {
    const reply = await processConsultantMessage({
      messages: [{ role: "user", content: "what are your hours?" }],
    });
    assert.equal(reply.estimate, undefined);
  });
});

describe("Chat replies use the visitor's actual project", () => {
  const replyTo = (content: string, categoryKey: string, extra = {}) =>
    processConsultantMessage({
      messages: [{ role: "user", content }],
      priorProjectState: { categoryKey, isActivelyQuoting: true, ...extra },
    });

  it("a restaurant acceptance names the restaurant project and its calculated price", async () => {
    const { messageText } = await replyTo("I accept, let's go with this", "restaurant");
    const expected = calculateProjectEstimate(
      { categoryKey: "restaurant", selectedFeatureIds: [] },
      getPricingCalculationConfig(DEFAULT_BACKEND_PRICING_DATA),
    );
    assert.ok(!/gym/i.test(messageText), messageText);
    assert.ok(messageText.includes(expected.categoryDisplayName), messageText);
    assert.ok(messageText.includes(`₹${expected.cost.oneTimeTotalINR.toLocaleString("en-IN")}`), messageText);
  });

  it("acceptance never claims the deal is confirmed or demands payment", async () => {
    const { messageText } = await replyTo("I accept", "ecommerce");
    assert.ok(!/jewell?ery/i.test(messageText), messageText);
    assert.ok(!/confirmed at/i.test(messageText), messageText);
    assert.ok(/estimate/i.test(messageText), messageText);
    assert.ok(/Mohit/.test(messageText), messageText);
  });

  it("acceptance with no scoped project asks about the project instead", async () => {
    const reply = await processConsultantMessage({ messages: [{ role: "user", content: "I accept" }] });
    assert.ok(/haven't scoped/i.test(reply.messageText), reply.messageText);
  });

  it("a feature question keeps the visitor's project and budget", async () => {
    const { messageText } = await replyTo("can online booking be added later?", "portfolio", {
      userBudgetINR: 50000,
    });
    assert.ok(!/gym|15,000/i.test(messageText), messageText);
    assert.ok(messageText.includes("₹50,000"), messageText);
  });

  it("upgrade prices come from admin-managed pricing", () => {
    const config = getPricingCalculationConfig({
      ...DEFAULT_BACKEND_PRICING_DATA,
      features: DEFAULT_BACKEND_PRICING_DATA.features.map((f) =>
        f.id === "booking_calendar" ? { ...f, price: 7777 } : f,
      ),
    });
    const upgrade = calculatePhase2Upgrade({ currentTotalINR: 10000, pricingConfig: config, alreadyDynamic: true });
    assert.equal(upgrade.upgradeCostINR, 7777);
    assert.equal(upgrade.newProjectTotalINR, 17777);
  });
});

describe("Chat routes", () => {
  it("sends the most recent messages to the model in long conversations", async () => {
    let sentContents: { parts: { text: string }[] }[] = [];
    setGeminiClientFactory(() => ({
      models: {
        generateContent: async (params) => {
          sentContents = (params as { contents: typeof sentContents }).contents;
          return { text: "ok" };
        },
      },
    }));

    try {
      const session = await prisma.chatSession.create({ data: { visitorId: `v_${uid()}` } });
      const base = Date.now() - 100_000;
      await prisma.chatMessage.createMany({
        data: Array.from({ length: 30 }, (_, i) => ({
          sessionId: session.id,
          sender: i % 2 === 0 ? "visitor" : "assistant",
          content: `history message ${i}`,
          createdAt: new Date(base + i * 1000),
        })),
      });

      const res = await sendMessage(jsonRequest("/api/chat/message", { sessionId: session.id, message: "latest question" }));
      assert.equal(res.status, 200);

      const sentText = sentContents.flatMap((c) => c.parts.map((p) => p.text)).join("\n");
      assert.ok(sentText.includes("history message 29"), "newest history must be included");
      assert.ok(sentText.includes("latest question"));
      assert.ok(!sentText.includes("history message 0\n"), "oldest history should be dropped");

      await prisma.chatSession.delete({ where: { id: session.id } });
    } finally {
      setGeminiClientFactory(null);
    }
  });

  it("does not let another chat session overwrite an existing lead", async () => {
    const email = `victim_${uid()}@example.com`;
    const lead = await prisma.lead.create({
      data: { name: "Real Customer", email, message: "Original message", budget: "₹1,00,000", notes: "Original notes" },
    });

    const startRes = await startChat(
      jsonRequest("/api/chat/start", { turnstileToken: "dev-mock-turnstile-token" }),
    );
    const { sessionId } = await startRes.json();

    const res = await sendMessage(
      jsonRequest("/api/chat/message", {
        sessionId,
        message: "I want a gym website",
        visitorInfo: { name: "Attacker", email },
      }),
    );
    assert.equal(res.status, 200);

    const after = await prisma.lead.findUniqueOrThrow({ where: { id: lead.id } });
    assert.equal(after.name, "Real Customer");
    assert.equal(after.message, "Original message");
    assert.equal(after.budget, "₹1,00,000");
    assert.ok(after.notes?.startsWith("Original notes"));
    assert.ok(after.notes?.includes(sessionId));
    assert.equal(await prisma.lead.count({ where: { email } }), 1);

    await prisma.lead.delete({ where: { id: lead.id } });
  });

  it("lets a session keep updating the lead it created", async () => {
    const email = `owner_${uid()}@example.com`;
    const startRes = await startChat(
      jsonRequest("/api/chat/start", { turnstileToken: "dev-mock-turnstile-token", name: "Owner", email }),
    );
    const { sessionId } = await startRes.json();

    await sendMessage(
      jsonRequest("/api/chat/message", {
        sessionId,
        message: "I want a gym website",
        visitorInfo: { name: "Owner Updated", email },
      }),
    );

    const leads = await prisma.lead.findMany({ where: { email } });
    assert.equal(leads.length, 1);
    assert.equal(leads[0].name, "Owner Updated");
    assert.ok(leads[0].message.includes("I want a gym website"));

    await prisma.lead.deleteMany({ where: { email } });
  });

  it("ignores estimates and project state injected by the browser", async () => {
    const res = await startChat(
      jsonRequest("/api/chat/start", {
        turnstileToken: "dev-mock-turnstile-token",
        metadata: { latestEstimate: { cost: { oneTimeTotalINR: 1 } }, projectState: { categoryKey: "forged" } },
      }),
    );
    const { sessionId } = await res.json();
    const session = await prisma.chatSession.findUniqueOrThrow({ where: { id: sessionId } });
    const metadata = JSON.parse(session.metadata || "{}");
    assert.equal(metadata.latestEstimate, undefined);
    assert.equal(metadata.projectState, undefined);
    await prisma.chatSession.delete({ where: { id: sessionId } });
  });
});

describe("Lead CSV export", () => {
  it("neutralises spreadsheet formulas", () => {
    for (const payload of ['=HYPERLINK("http://evil","x")', "+SUM(A1)", "-2+3", "@cmd", "\t=1"]) {
      assert.ok(escapeCsvCell(payload).startsWith(`"'`), payload);
    }
  });

  it("leaves ordinary values and phone numbers readable", () => {
    assert.equal(escapeCsvCell("Jane Doe"), '"Jane Doe"');
    assert.equal(escapeCsvCell("+91 88002 41462"), '"+91 88002 41462"');
    assert.equal(escapeCsvCell('He said "hi"'), '"He said ""hi"""');
    assert.equal(escapeCsvCell(null), '""');
  });
});

describe("Login and sessions", () => {
  const email = `auth_${uid()}@example.com`;
  const password = "correct-horse-battery";
  let userId = "";
  let passwordHash = "";

  const attempt = (pw: string, ip: string) =>
    authorizeCredentials(
      { email, password: pw },
      new Request("http://localhost/api/auth", { headers: { "x-forwarded-for": ip } }),
    );

  before(async () => {
    passwordHash = await bcrypt.hash(password, 4);
    const user = await prisma.user.create({
      data: { email, name: "Auth Test", passwordHash, role: "ADMIN", status: "ACTIVE" },
    });
    userId = user.id;
  });

  after(async () => {
    await prisma.user.delete({ where: { id: userId } }).catch(() => {});
  });

  it("accepts correct credentials and rejects wrong ones", async () => {
    assert.equal((await attempt(password, "203.0.113.1"))?.id, userId);
    assert.equal(await attempt("wrong", "203.0.113.2"), null);
  });

  it("blocks repeated guesses from the same address", async () => {
    const ip = "203.0.113.3";
    for (let i = 0; i < 5; i += 1) {
      assert.equal(await attempt("wrong", ip), null);
    }
    await assert.rejects(attempt(password, ip), (error: { code?: string }) => error.code === "rate_limited");
  });

  it("hides account status from anyone without the password", async () => {
    await prisma.user.update({ where: { id: userId }, data: { status: "SUSPENDED" } });
    assert.equal(await attempt("wrong", "203.0.113.4"), null);
    await assert.rejects(attempt(password, "203.0.113.5"), (error: { code?: string }) => error.code === "account_inactive");
    await prisma.user.update({ where: { id: userId }, data: { status: "ACTIVE" } });
  });

  const token = () => ({ id: userId, sessionFingerprint: computeSessionFingerprint(passwordHash) });

  it("keeps a valid session and picks up role changes immediately", async () => {
    await prisma.user.update({ where: { id: userId }, data: { role: "EDITOR" } });
    assert.equal((await refreshSessionToken(token()))?.role, "EDITOR");
    await prisma.user.update({ where: { id: userId }, data: { role: "ADMIN" } });
  });

  it("ends the session as soon as an account is suspended", async () => {
    await prisma.user.update({ where: { id: userId }, data: { status: "SUSPENDED" } });
    assert.equal(await refreshSessionToken(token()), null);
    await prisma.user.update({ where: { id: userId }, data: { status: "ACTIVE" } });
  });

  it("ends old sessions when the password changes", async () => {
    const oldToken = token();
    const newHash = await bcrypt.hash("a-new-password-value", 4);
    await prisma.user.update({ where: { id: userId }, data: { passwordHash: newHash } });
    assert.equal(await refreshSessionToken(oldToken), null);
    await prisma.user.update({ where: { id: userId }, data: { passwordHash } });
  });

  it("ends the session when the account is gone", async () => {
    assert.equal(await refreshSessionToken({ id: "missing-user", sessionFingerprint: "x" }), null);
  });
});

describe("Newsletter links resist email scanners", () => {
  const html = { accept: "text/html" };

  it("opening an unsubscribe link changes nothing until the button is pressed", async () => {
    const unsubscribeToken = `unsub_${uid()}`;
    const email = `sub_${uid()}@example.com`;
    await prisma.subscriber.create({ data: { email, status: "ACTIVE", isActive: true, unsubscribeToken } });
    const url = `http://localhost:3000/api/newsletter/unsubscribe?token=${unsubscribeToken}`;

    const page = await unsubscribeGet(new NextRequest(url, { headers: html }));
    assert.ok((await page.text()).includes('method="post"'));
    assert.equal((await prisma.subscriber.findUniqueOrThrow({ where: { email } })).status, "ACTIVE");

    const done = await unsubscribePost(new NextRequest(url, { method: "POST", headers: html }));
    assert.equal(done.status, 200);
    assert.equal((await prisma.subscriber.findUniqueOrThrow({ where: { email } })).status, "UNSUBSCRIBED");

    await prisma.subscriber.delete({ where: { email } });
  });

  it("opening a confirmation link does not subscribe anyone", async () => {
    const confirmationToken = `conf_${uid()}`;
    const email = `pending_${uid()}@example.com`;
    await prisma.subscriber.create({
      data: { email, confirmationToken, unsubscribeToken: `u_${uid()}`, tokenExpiresAt: new Date(Date.now() + 60_000) },
    });
    const url = `http://localhost:3000/api/newsletter/confirm?token=${confirmationToken}`;

    await confirmGet(new NextRequest(url, { headers: html }));
    assert.equal((await prisma.subscriber.findUniqueOrThrow({ where: { email } })).status, "PENDING");

    const done = await confirmPost(new NextRequest(url, { method: "POST", headers: html }));
    assert.equal(done.status, 200);
    assert.equal((await prisma.subscriber.findUniqueOrThrow({ where: { email } })).status, "ACTIVE");

    await prisma.subscriber.delete({ where: { email } });
  });

  it("escapes values placed into the page", async () => {
    const res = await unsubscribeGet(
      new NextRequest(`http://localhost:3000/api/newsletter/unsubscribe?token=${encodeURIComponent('"><script>')}`, {
        headers: html,
      }),
    );
    assert.ok(!(await res.text()).includes("<script>"));
  });
});

describe("Blog view counting", () => {
  it("counts one read per visitor in the window", async () => {
    const author = await prisma.user.create({
      data: { email: `author_${uid()}@example.com`, name: "Author", passwordHash: "x" },
    });
    const slug = `view-test-${uid()}`;
    await prisma.blogPost.create({
      data: { title: "View Test", slug, content: "Body", status: "PUBLISHED", authorId: author.id },
    });

    const view = () =>
      recordView(
        new NextRequest(`http://localhost:3000/api/blog/${slug}/view`, {
          method: "POST",
          headers: { "x-forwarded-for": "198.51.100.77" },
        }),
        { params: Promise.resolve({ slug }) },
      );

    await view();
    await view();
    assert.equal((await prisma.blogPost.findUniqueOrThrow({ where: { slug } })).views, 1);

    await prisma.user.delete({ where: { id: author.id } });
  });
});
