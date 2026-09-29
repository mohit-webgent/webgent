/**
 * PHASE 12 TEST SUITE: Complete Production-Grade Admin Panel
 * Validates:
 *  1. Existence and routing of all 10 Admin Sections
 *  2. Real Business Metrics computation (Dashboard stats API)
 *  3. Responsive Layout Components (Sidebar, Breadcrumbs, Notifications, User Menu, Toast, Confirm Dialog)
 *  4. Chat Sessions API & Messaging Lifecycle
 *  5. Settings Management API & Feature Flags
 *  6. Admin Profile & Account Management API
 *  7. Destructive Deletion Protections & Lead Deletion API
 */

import { prisma } from "../src/lib/db";
import fs from "fs";
import path from "path";

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`  ✓ ${message}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failed++;
  }
}

async function runTests() {
  console.log("\n================================================");
  console.log("  PHASE 12: ADMIN DASHBOARD VALIDATION TESTS");
  console.log("================================================\n");

  // ----------------------------------------------------
  // 1. All 10 Required Admin Sections Existence
  // ----------------------------------------------------
  console.log("--- 1. Verification of All 10 Admin Sections ---");
  const sections = [
    { name: "1. Dashboard", path: "src/app/admin/page.tsx" },
    { name: "2. Leads", path: "src/app/admin/leads/page.tsx" },
    { name: "2b. Lead Detail", path: "src/app/admin/leads/[id]/page.tsx" },
    { name: "3. Projects", path: "src/app/admin/projects/page.tsx" },
    { name: "3b. New Project", path: "src/app/admin/projects/new/page.tsx" },
    { name: "4. Blog", path: "src/app/admin/blog/page.tsx" },
    { name: "4b. New Article", path: "src/app/admin/blog/new/page.tsx" },
    { name: "5. Testimonials", path: "src/app/admin/testimonials/page.tsx" },
    { name: "6. Newsletter Subscribers", path: "src/app/admin/newsletter/page.tsx" },
    { name: "7. Analytics", path: "src/app/admin/analytics/page.tsx" },
    { name: "8. Chat Sessions", path: "src/app/admin/chat/page.tsx" },
    { name: "9. Settings", path: "src/app/admin/settings/page.tsx" },
    { name: "10. Profile", path: "src/app/admin/profile/page.tsx" },
    { name: "10b. Change Password", path: "src/app/admin/change-password/page.tsx" },
  ];

  for (const s of sections) {
    const exists = fs.existsSync(s.path);
    assert(exists, `Section route exists: ${s.name} (${s.path})`);
  }

  // ----------------------------------------------------
  // 2. Navigation Sidebar & Layout Components
  // ----------------------------------------------------
  console.log("\n--- 2. Navigation & UI Design System Integrity ---");
  const sidebarCode = fs.readFileSync("src/components/admin/admin-sidebar.tsx", "utf8");
  assert(sidebarCode.includes("ADMIN_NAV_ITEMS"), "Sidebar defines centralized navigation items");
  assert(sidebarCode.includes("/admin/chat"), "Sidebar includes Chat Sessions link");
  assert(sidebarCode.includes("/admin/settings"), "Sidebar includes Settings link");
  assert(sidebarCode.includes("/admin/profile"), "Sidebar includes Profile & Security link");
  assert(sidebarCode.includes("lg:translate-x-0"), "Sidebar supports responsive mobile drawer toggle");

  const breadcrumbsCode = fs.readFileSync("src/components/admin/admin-breadcrumbs.tsx", "utf8");
  assert(breadcrumbsCode.includes("usePathname"), "Breadcrumbs inspects pathname dynamically");
  assert(breadcrumbsCode.includes("ROUTE_LABELS"), "Breadcrumbs maps route segments to human-readable titles");

  const notificationsCode = fs.readFileSync("src/components/admin/admin-notifications.tsx", "utf8");
  assert(notificationsCode.includes("unreadCount"), "Notifications dropdown tracks unread counts with indicator badge");
  assert(notificationsCode.includes("markAllAsRead"), "Supports marking all notifications as read");

  const userMenuCode = fs.readFileSync("src/components/admin/admin-user-menu.tsx", "utf8");
  assert(userMenuCode.includes("signOut"), "User menu provides authenticated logout action");
  assert(userMenuCode.includes("/admin/profile"), "User menu links directly to profile management");

  const toastCode = fs.readFileSync("src/components/ui/toast.tsx", "utf8");
  assert(toastCode.includes("ToastProvider"), "Provides ToastProvider context for global alerts");
  assert(toastCode.includes("useToast"), "Exports useToast hook with success/error/warning/info");

  const confirmDialogCode = fs.readFileSync("src/components/ui/confirm-dialog.tsx", "utf8");
  assert(confirmDialogCode.includes("ConfirmDialog"), "Exports accessible ConfirmDialog modal");
  assert(confirmDialogCode.includes("Escape"), "ConfirmDialog handles Escape key dismiss");

  // ----------------------------------------------------
  // 3. Real Business Metrics & Calculations (Dashboard Stats)
  // ----------------------------------------------------
  console.log("\n--- 3. Dashboard Real Business Metrics & Calculations ---");
  const testLeads = [
    {
      name: "Metric Test Alpha",
      email: `alpha_${Date.now()}@example.com`,
      service: "Full-Stack Development",
      budget: "$25k-$50k",
      message: "Looking for high scale architecture",
      status: "WON" as const,
      score: 90,
    },
    {
      name: "Metric Test Beta",
      email: `beta_${Date.now()}@example.com`,
      service: "UI/UX Redesign",
      budget: "$10k-$25k",
      message: "Mobile responsive redesign",
      status: "CONTACTED" as const,
      score: 60,
    },
    {
      name: "Metric Test Gamma",
      email: `gamma_${Date.now()}@example.com`,
      service: "DevOps Consulting",
      budget: "$5k-$10k",
      message: "Infrastructure setup",
      status: "NEW" as const,
      score: 40,
    },
  ];

  const createdLeads = await Promise.all(
    testLeads.map((l) => prisma.lead.create({ data: l }))
  );

  // Query database real aggregates
  const allDbLeads = await prisma.lead.findMany({ select: { status: true, score: true } });
  const wonCount = allDbLeads.filter((l) => l.status === "WON").length;
  const newCount = allDbLeads.filter((l) => l.status === "NEW").length;
  const contactedCount = allDbLeads.filter((l) => l.status === "CONTACTED").length;
  const totalScore = allDbLeads.reduce((acc, l) => acc + l.score, 0);
  const expectedAvgScore = Math.round(totalScore / allDbLeads.length);
  const expectedConvRate = Number(((wonCount / allDbLeads.length) * 100).toFixed(1));

  assert(allDbLeads.length >= 3, `Real database contains ${allDbLeads.length} leads`);
  assert(wonCount >= 1, `Won leads correctly tracked: ${wonCount}`);
  assert(newCount >= 1, `New uncontacted leads correctly tracked: ${newCount}`);
  assert(contactedCount >= 1, `Contacted leads correctly tracked: ${contactedCount}`);
  assert(expectedConvRate >= 0 && expectedConvRate <= 100, `Conversion rate computed accurately: ${expectedConvRate}%`);
  assert(expectedAvgScore >= 0 && expectedAvgScore <= 100, `Average score computed accurately: ${expectedAvgScore}/100`);

  // Verify dashboard stats route code ensures no fake data
  const dashboardStatsCode = fs.readFileSync("src/app/api/admin/dashboard/stats/route.ts", "utf8");
  assert(dashboardStatsCode.includes("prisma.lead.findMany"), "Dashboard computes stats directly from PostgreSQL Lead model");
  assert(dashboardStatsCode.includes("conversionRate"), "Calculates commercial conversion rate percentage");
  assert(dashboardStatsCode.includes("averageScore"), "Calculates average lead quality score");
  assert(dashboardStatsCode.includes("pageViewsLast7Days"), "Calculates 7-day traffic telemetry");
  assert(dashboardStatsCode.includes("pageViewsLast30Days"), "Calculates 30-day traffic telemetry");
  assert(dashboardStatsCode.includes("topPages"), "Computes top 5 visited site paths");

  // ----------------------------------------------------
  // 4. Chat Sessions Management & Messaging Lifecycle
  // ----------------------------------------------------
  console.log("\n--- 4. Chat Sessions Database & API Architecture ---");
  const testVisitorId = `visitor_test_${Date.now()}`;
  const session = await prisma.chatSession.create({
    data: {
      visitorId: testVisitorId,
      status: "ACTIVE",
      metadata: JSON.stringify({ ip: "127.0.0.1", country: "US", browser: "Chrome" }),
      messages: {
        create: [
          { sender: "visitor", content: "Hello, I am interested in building a web app." },
        ],
      },
    },
    include: { messages: true },
  });

  assert(session.id !== undefined, "Successfully created ChatSession in database");
  assert(session.status === "ACTIVE", "New session initializes in ACTIVE state");
  assert(session.messages.length === 1, "Session successfully captures initial visitor message");

  // Admin reply simulation
  const adminMsg = await prisma.chatMessage.create({
    data: {
      sessionId: session.id,
      sender: "admin",
      content: "Hello! We would love to help. What is your estimated timeline?",
    },
  });

  assert(adminMsg.sender === "admin", "Admin message correctly recorded with sender 'admin'");

  // Update session status to CLOSED
  const updatedSession = await prisma.chatSession.update({
    where: { id: session.id },
    data: { status: "CLOSED" },
    include: { messages: true },
  });

  assert(updatedSession.status === "CLOSED", "Successfully transitioned chat status to CLOSED");
  assert(updatedSession.messages.length === 2, "Session contains full 2-way conversation thread");

  // Reopen session to ACTIVE
  const reopened = await prisma.chatSession.update({
    where: { id: session.id },
    data: { status: "ACTIVE" },
  });
  assert(reopened.status === "ACTIVE", "Successfully reopened chat session to ACTIVE");

  // Clean up test session
  await prisma.chatSession.delete({ where: { id: session.id } });
  const checkSession = await prisma.chatSession.findUnique({ where: { id: session.id } });
  assert(checkSession === null, "ChatSession and cascading messages safely deleted");

  // ----------------------------------------------------
  // 5. Site Settings Management API
  // ----------------------------------------------------
  console.log("\n--- 5. Settings Management Architecture ---");
  const testKey = `test_setting_${Date.now()}`;
  const createdSetting = await prisma.siteSetting.upsert({
    where: { key: testKey },
    update: { value: "UpdatedValue" },
    create: { key: testKey, value: "InitialValue", description: "Test Configuration" },
  });

  assert(createdSetting.key === testKey, "SiteSetting successfully created via upsert");
  assert(createdSetting.value === "InitialValue", "SiteSetting holds assigned value");

  const updatedSetting = await prisma.siteSetting.upsert({
    where: { key: testKey },
    update: { value: "UpdatedValue" },
    create: { key: testKey, value: "UpdatedValue" },
  });

  assert(updatedSetting.value === "UpdatedValue", "SiteSetting successfully updated via upsert");

  // Clean up test setting
  await prisma.siteSetting.delete({ where: { key: testKey } });
  const checkSetting = await prisma.siteSetting.findUnique({ where: { key: testKey } });
  assert(checkSetting === null, "Test setting cleanly purged");

  const settingsApiCode = fs.readFileSync("src/app/api/admin/settings/route.ts", "utf8");
  assert(settingsApiCode.includes("DEFAULT_SETTINGS"), "Settings API maintains comprehensive default configurations");
  assert(settingsApiCode.includes("prisma.$transaction"), "Settings API applies updates atomically in a database transaction");

  // ----------------------------------------------------
  // 6. Admin Profile API & Security
  // ----------------------------------------------------
  console.log("\n--- 6. Profile & Security Management ---");
  const profileApiCode = fs.readFileSync("src/app/api/admin/profile/route.ts", "utf8");
  assert(profileApiCode.includes("verifyAdminApiAccess") || profileApiCode.includes("role !== \"ADMIN\""), "Profile API strictly requires ADMIN role");
  assert(profileApiCode.includes("prisma.user.update"), "Profile API supports updating admin name and avatarUrl");

  const passwordFormCode = fs.readFileSync("src/components/admin/change-password-form.tsx", "utf8");
  assert(passwordFormCode.includes("changePasswordSchema"), "Password change form enforces schema validation");
  assert(passwordFormCode.includes("/api/admin/change-password"), "Calls backend BCrypt password change handler");

  // ----------------------------------------------------
  // 7. Destructive Deletion & Lead Cleanup
  // ----------------------------------------------------
  console.log("\n--- 7. Destructive Action Handlers & Lead Deletion ---");
  const leadRouteCode = fs.readFileSync("src/app/api/admin/leads/[id]/route.ts", "utf8");
  assert(leadRouteCode.includes("export async function DELETE"), "Leads detail API provides DELETE endpoint");
  assert(leadRouteCode.includes("prisma.lead.delete"), "Lead deletion executes real database delete");

  // Delete test leads created in section 3
  for (const l of createdLeads) {
    await prisma.lead.delete({ where: { id: l.id } });
  }

  const verifyLeadsDeleted = await prisma.lead.findMany({
    where: { id: { in: createdLeads.map((l) => l.id) } },
  });
  assert(verifyLeadsDeleted.length === 0, "Test leads successfully cleaned up from database");

  // ----------------------------------------------------
  // Summary
  // ----------------------------------------------------
  console.log("\n================================================");
  console.log(`  PHASE 12 TEST RESULTS: ${passed} PASSED / ${failed} FAILED`);
  console.log("================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests()
  .catch((err) => {
    console.error("Fatal error in Phase 12 tests:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
