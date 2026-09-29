/**
 * Phase 11 Verification Script: Real-Time Lead Notifications
 *
 * Verifies:
 * 1. notificationService.sendNewLeadNotification() abstraction
 * 2. Primary: Twilio WhatsApp notification provider (concise message, auth, recipient, simulated mode)
 * 3. Alternative: WhatsApp Business Cloud API provider
 * 4. Optional: Slack Incoming Webhook provider (Block kit payload, concise fields)
 * 5. Admin email notification integration (Resend)
 * 6. Message content: concise lead info (name, service, budget, lead score, timeline) and NO sensitive info
 * 7. Failure isolation: notification errors are logged and DO NOT corrupt the lead record in DB
 * 8. Extensibility: registering custom future notification providers
 * 9. Environment variables and credentials security (no hardcoded secrets or phone numbers)
 */

import { prisma } from "../src/lib/db";
import {
  notificationService,
  formatLeadMessage,
  TwilioWhatsAppProvider,
  WhatsAppCloudProvider,
  SlackWebhookProvider,
  EmailNotificationProvider,
  NotificationProvider,
  LeadNotificationPayload,
} from "../src/lib/services/notifications";

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string, details?: any) {
  if (condition) {
    console.log(`  ✓ ${testName}`);
    passed++;
  } else {
    console.error(`  ✗ ${testName}`, details || "");
    failed++;
  }
}

async function runTests() {
  console.log("\n================================================");
  console.log("  PHASE 11: REAL-TIME NOTIFICATIONS TEST SUITE  ");
  console.log("================================================\n");

  const sampleLead: LeadNotificationPayload = {
    id: `lead_test_${Date.now()}`,
    name: "Alex Morgan",
    email: "alex.morgan@enterprise.com",
    phone: "+1-555-0199",
    company: "Morgan Financial Tech",
    service: "Custom Software Architecture",
    budget: "$25,000 - $50,000",
    score: 85,
    timeline: "Next 30 Days",
    message: "We need high performance microservices architecture and cloud migration.",
  };

  // ----------------------------------------------------
  // TEST GROUP 1: Concise Information & Privacy Safety
  // ----------------------------------------------------
  console.log("--- 1. Message Formatting & Privacy Safety ---");

  const formattedMsg = formatLeadMessage(sampleLead);
  assert(formattedMsg.includes("Alex Morgan"), "Message contains lead name");
  assert(formattedMsg.includes("Custom Software Architecture"), "Message contains requested service");
  assert(formattedMsg.includes("$25,000 - $50,000"), "Message contains budget");
  assert(formattedMsg.includes("85/100"), "Message contains numeric lead score");
  assert(formattedMsg.includes("High Priority"), "Message contains lead score priority category");
  assert(formattedMsg.includes("Next 30 Days"), "Message contains timeline");

  // Privacy verification: no unnecessary sensitive data
  assert(!formattedMsg.includes("password"), "Never leaks password field");
  assert(!formattedMsg.includes("token"), "Never leaks token field");
  assert(!formattedMsg.includes("secret"), "Never leaks secret keys");
  assert(!formattedMsg.includes("127.0.0.1"), "Never leaks internal IP addresses");
  assert(!formattedMsg.includes("Mozilla"), "Never leaks raw User-Agent strings");

  // ----------------------------------------------------
  // TEST GROUP 2: Primary: Twilio WhatsApp Notification Provider
  // ----------------------------------------------------
  console.log("\n--- 2. Twilio WhatsApp Provider ---");
  const twilioProvider = new TwilioWhatsAppProvider();
  assert(twilioProvider.name === "twilio_whatsapp", "Twilio provider registered as 'twilio_whatsapp'");

  // Test simulation / dev mode (safe execution when unconfigured)
  const twilioResult = await twilioProvider.send(sampleLead);
  assert(twilioResult.provider === "twilio_whatsapp", "Returns twilio_whatsapp provider result");
  assert(twilioResult.success === true, "Twilio provider succeeds (simulated mode when unconfigured)");
  assert(typeof twilioResult.messageId === "string", "Generates message tracking ID");

  // ----------------------------------------------------
  // TEST GROUP 3: Alternative: WhatsApp Business Cloud API Provider
  // ----------------------------------------------------
  console.log("\n--- 3. WhatsApp Business Cloud API Provider ---");
  const waCloudProvider = new WhatsAppCloudProvider();
  assert(waCloudProvider.name === "whatsapp_cloud", "Cloud API provider registered as 'whatsapp_cloud'");

  const waCloudResult = await waCloudProvider.send(sampleLead);
  assert(waCloudResult.provider === "whatsapp_cloud", "Returns whatsapp_cloud provider result");
  assert(waCloudResult.success === true, "WhatsApp Cloud API gracefully handles unconfigured state");

  // ----------------------------------------------------
  // TEST GROUP 4: Optional: Slack Webhook Provider
  // ----------------------------------------------------
  console.log("\n--- 4. Slack Incoming Webhook Provider ---");
  const slackProvider = new SlackWebhookProvider();
  assert(slackProvider.name === "slack_webhook", "Slack provider registered as 'slack_webhook'");

  // When unconfigured, returns success in simulated mode
  const slackResult = await slackProvider.send(sampleLead);
  assert(slackResult.provider === "slack_webhook", "Returns slack_webhook provider result");
  assert(slackResult.success === true, "Slack provider gracefully simulates when URL unconfigured");

  // ----------------------------------------------------
  // TEST GROUP 5: Admin Email Notification Integration (Resend)
  // ----------------------------------------------------
  console.log("\n--- 5. Admin Email Notification Provider (Resend) ---");
  const emailProvider = new EmailNotificationProvider();
  assert(emailProvider.name === "email", "Email provider registered as 'email'");
  assert(emailProvider.isEnabled() === true, "Email provider is permanently enabled");

  const emailResult = await emailProvider.send(sampleLead);
  assert(emailResult.provider === "email", "Returns email provider result");
  assert(emailResult.success === true, "Email provider dispatches admin & client notifications");

  // ----------------------------------------------------
  // TEST GROUP 6: NotificationService Central Abstraction
  // ----------------------------------------------------
  console.log("\n--- 6. NotificationService Central Dispatcher ---");

  // Test dispatch across all providers
  const dispatchResult = await notificationService.sendNewLeadNotification(sampleLead);
  assert(dispatchResult.success === true, "sendNewLeadNotification() reports overall success = true");
  assert(dispatchResult.leadId === sampleLead.id, "Returns matching leadId");
  assert(Array.isArray(dispatchResult.results), "Returns array of provider results");
  assert(dispatchResult.results.length >= 4, "Dispatched across all 4 built-in channels (Twilio, WA Cloud, Slack, Email)");

  // ----------------------------------------------------
  // TEST GROUP 7: Extensibility & Future Providers
  // ----------------------------------------------------
  console.log("\n--- 7. Provider Extensibility & Custom Registration ---");

  let customProviderCalled = false;
  const customWebhookProvider: NotificationProvider = {
    name: "discord_webhook",
    isEnabled: () => true,
    async send(payload) {
      customProviderCalled = true;
      return {
        provider: "discord_webhook",
        success: true,
        messageId: `discord_${payload.id}`,
      };
    },
  };

  notificationService.registerProvider(customWebhookProvider);
  const customDispatch = await notificationService.sendNewLeadNotification(sampleLead);
  assert(Boolean(customProviderCalled), "Successfully invokes newly registered future provider (e.g. Discord)");
  const discordResult = customDispatch.results.find((r) => r.provider === "discord_webhook");
  assert(discordResult !== undefined && discordResult.success === true, "Custom provider result included in dispatch summary");

  // Cleanup custom provider
  notificationService.unregisterProvider("discord_webhook");
  const unregisterCheck = notificationService.getProviders().some((p) => p.name === "discord_webhook");
  assert(!unregisterCheck, "Successfully unregisters provider");

  // ----------------------------------------------------
  // TEST GROUP 8: Database Integrity & Failure Isolation
  // ----------------------------------------------------
  console.log("\n--- 8. Database Integrity & Failure Isolation ---");

  // 1. Create a real lead in PostgreSQL
  const dbLead = await prisma.lead.create({
    data: {
      name: "Jordan Lee",
      email: `jordan_${Date.now()}@example.com`,
      phone: "+1-555-0988",
      company: "Apex Innovations",
      service: "web_development",
      budget: "$10,000 - $25,000",
      message: "Urgent project inquiry. Looking for full stack development team immediately.",
      status: "NEW",
      score: 75,
      ipAddress: "192.0.2.1",
    },
  });

  assert(typeof dbLead.id === "string", "Lead successfully persisted to database first");

  // Register a failing provider that throws an unexpected error
  const failingProvider: NotificationProvider = {
    name: "failing_mock_provider",
    isEnabled: () => true,
    async send() {
      throw new Error("Simulated downstream external network crash 503");
    },
  };

  notificationService.registerProvider(failingProvider);

  // Dispatch notifications - must NOT throw, must NOT corrupt lead
  let threwError = false;
  try {
    const res = await notificationService.sendNewLeadNotification(dbLead);
    const failEntry = res.results.find((r) => r.provider === "failing_mock_provider");
    assert(failEntry !== undefined && failEntry.success === false, "Failing provider failure safely captured without throwing");
    assert(Boolean(failEntry?.error?.includes("Simulated downstream")), "Captures provider error message");
  } catch {
    threwError = true;
  }

  assert(!threwError, "Notification service never throws unhandled errors to the caller");

  // Verify DB record is completely intact and uncorrupted
  const recheckedLead = await prisma.lead.findUnique({ where: { id: dbLead.id } });
  assert(recheckedLead !== null, "Lead record exists in database");
  assert(recheckedLead?.name === "Jordan Lee", "Lead record name remains intact");
  assert(recheckedLead?.score === 75, "Lead record score remains intact");
  assert(recheckedLead?.status === "NEW", "Lead status remains uncorrupted");

  notificationService.unregisterProvider("failing_mock_provider");

  // Clean up test lead
  await prisma.lead.delete({ where: { id: dbLead.id } });

  // ----------------------------------------------------
  // TEST GROUP 9: Environment Variable Safety
  // ----------------------------------------------------
  console.log("\n--- 9. Credentials & Phone Security ---");
  const fs = await import("fs");
  const envExample = fs.readFileSync(".env.example", "utf8");

  assert(envExample.includes("TWILIO_ACCOUNT_SID="), ".env.example includes TWILIO_ACCOUNT_SID");
  assert(envExample.includes("TWILIO_AUTH_TOKEN="), ".env.example includes TWILIO_AUTH_TOKEN");
  assert(envExample.includes("TWILIO_WHATSAPP_FROM="), ".env.example includes TWILIO_WHATSAPP_FROM");
  assert(envExample.includes("ADMIN_WHATSAPP_TO="), ".env.example includes ADMIN_WHATSAPP_TO");
  assert(envExample.includes("SLACK_WEBHOOK_URL="), ".env.example includes SLACK_WEBHOOK_URL");

  // Check no real hardcoded private keys or real personal phone numbers in code
  const notificationsCode = fs.readFileSync("src/lib/services/notifications.ts", "utf8");
  assert(!/AC[a-fA-F0-9]{32}/.test(notificationsCode), "No hardcoded Twilio Account SID in source");
  assert(!notificationsCode.includes("sk_live_"), "No live secret keys hardcoded");

  // Summary
  console.log("\n================================================");
  console.log(`  PHASE 11 TEST RESULTS: ${passed} PASSED / ${failed} FAILED`);
  console.log("================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Test execution failed with fatal error:", err);
  process.exit(1);
});
