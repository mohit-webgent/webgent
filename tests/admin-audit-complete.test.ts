import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import { setAuthSessionResolver } from "@/lib/auth-utils";
import { prisma } from "@/lib/db";
import { recordAuditLog, getAuditLogs } from "@/lib/services/audit-log";
import {
  getKnowledgeBaseConfig,
  saveKnowledgeBaseConfig,
} from "@/lib/services/knowledge-base-service";
import { retrieveRelevantKnowledge } from "@/lib/services/ai-consultant/knowledge-retrieval";
import { GET as getAuditLogsRoute } from "@/app/api/admin/audit-logs/route";
import { GET as getUsersRoute, POST as createUserRoute } from "@/app/api/admin/users/route";
import {
  PATCH as updateUserRoute,
  DELETE as deleteUserRoute,
} from "@/app/api/admin/users/[id]/route";
import {
  GET as getKnowledgeRoute,
  PUT as updateKnowledgeRoute,
} from "@/app/api/admin/knowledge/route";
import { GET as getDashboardStatsRoute } from "@/app/api/admin/dashboard/stats/route";
import { NextRequest } from "next/server";

describe("Webgent Admin Console — Functional Audit & Verification Suite", () => {
  const testAdminId = "admin-test-" + Date.now();
  const testAdminEmail = `admin-${Date.now()}@webgent.com`;
  let createdUserId: string | null = null;
  const createdUserEmail = `staff-${Date.now()}@webgent.com`;

  const adminSession = {
    user: {
      id: testAdminId,
      name: "Test Admin Auditor",
      email: testAdminEmail,
      role: "ADMIN",
      status: "ACTIVE",
    },
    expires: new Date(Date.now() + 86400000).toISOString(),
  };

  const editorSession = {
    user: {
      id: "editor-test-" + Date.now(),
      name: "Test Editor",
      email: `editor-${Date.now()}@webgent.com`,
      role: "EDITOR",
      status: "ACTIVE",
    },
    expires: new Date(Date.now() + 86400000).toISOString(),
  };

  const regularUserSession = {
    user: {
      id: "user-test-" + Date.now(),
      name: "Test Regular User",
      email: `user-${Date.now()}@webgent.com`,
      role: "USER",
      status: "ACTIVE",
    },
    expires: new Date(Date.now() + 86400000).toISOString(),
  };

  before(async () => {
    // Clean any prior test user with this email
    await prisma.user.deleteMany({
      where: { email: { in: [testAdminEmail, createdUserEmail] } },
    });

    // Create the test admin in the database
    await prisma.user.create({
      data: {
        id: testAdminId,
        email: testAdminEmail,
        name: "Test Admin Auditor",
        role: "ADMIN",
        status: "ACTIVE",
        passwordHash: "$2a$10$abcdefghijklmnopqrstuvwxyz1234567890",
      },
    });
  });

  after(async () => {
    // Restore default auth resolver
    setAuthSessionResolver(null);

    // Clean up created test user
    if (createdUserId) {
      await prisma.user.deleteMany({ where: { id: createdUserId } });
    }
    await prisma.user.deleteMany({
      where: { id: { in: [testAdminId] } },
    });
    await prisma.user.deleteMany({
      where: { email: { in: [testAdminEmail, createdUserEmail] } },
    });
  });

  // =========================================================================
  // 1. System Audit Logs Suite
  // =========================================================================
  describe("Audit Logs Service & API", () => {
    it("records system audit logs and retrieves them with pagination", async () => {
      const testAction = "AUDIT_TEST_ACTION_" + Date.now();
      await recordAuditLog(testAction, {
        actorId: testAdminId,
        actorEmail: testAdminEmail,
        target: "AuditSystemVerification",
        verified: true,
      });

      const result = await getAuditLogs({ action: testAction });
      assert.ok(result.logs.length >= 1, "Should find the recorded audit event");
      const found = result.logs.find((l) => l.action === testAction);
      assert.ok(found, "Found recorded log");
      assert.equal(found?.metadata?.target, "AuditSystemVerification");
    });

    it("enforces strict ADMIN access on GET /api/admin/audit-logs", async () => {
      // Unauthenticated
      setAuthSessionResolver(async () => null);
      const req = new NextRequest("http://localhost:3000/api/admin/audit-logs");
      const unauthRes = await getAuditLogsRoute(req);
      assert.equal(unauthRes.status, 401);

      // EDITOR role (Forbidden for security logs)
      setAuthSessionResolver(async () => editorSession as any);
      const editorRes = await getAuditLogsRoute(req);
      assert.equal(editorRes.status, 403);

      // ADMIN role (Allowed)
      setAuthSessionResolver(async () => adminSession as any);
      const adminRes = await getAuditLogsRoute(req);
      assert.equal(adminRes.status, 200);
      const json = await adminRes.json();
      assert.equal(json.success, true);
      assert.ok(Array.isArray(json.data));
    });
  });

  // =========================================================================
  // 2. Users & Roles Management & Safeguards Suite
  // =========================================================================
  describe("Users & Roles Security & CRUD", () => {
    it("rejects unauthorized and non-admin requests to /api/admin/users", async () => {
      setAuthSessionResolver(async () => null);
      const unauthReq = new NextRequest("http://localhost:3000/api/admin/users");
      const unauthRes = await getUsersRoute(unauthReq);
      assert.equal(unauthRes.status, 401);

      setAuthSessionResolver(async () => editorSession as any);
      const editorRes = await getUsersRoute(unauthReq);
      assert.equal(editorRes.status, 403);
    });

    it("creates a new staff account with bcrypt hashing and validation", async () => {
      setAuthSessionResolver(async () => adminSession as any);

      const createReq = new NextRequest("http://localhost:3000/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Test Junior Editor",
          email: createdUserEmail,
          role: "EDITOR",
          status: "ACTIVE",
          password: "SecurePassword123!",
        }),
      });

      const res = await createUserRoute(createReq);
      assert.equal(res.status, 201);
      const json = await res.json();
      assert.equal(json.success, true);
      assert.equal(json.data.email, createdUserEmail);
      assert.equal(json.data.role, "EDITOR");
      createdUserId = json.data.id;
      assert.ok(createdUserId);

      // Verify password was hashed with bcrypt
      const dbUser = await prisma.user.findUnique({ where: { id: createdUserId } });
      assert.ok(dbUser);
      assert.notEqual(dbUser?.passwordHash, "SecurePassword123!");
      assert.ok(dbUser?.passwordHash.startsWith("$2"));
    });

    it("prevents duplicate user email creation", async () => {
      setAuthSessionResolver(async () => adminSession as any);

      const duplicateReq = new NextRequest("http://localhost:3000/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Duplicate User",
          email: createdUserEmail,
          role: "USER",
          status: "ACTIVE",
          password: "AnotherPassword123!",
        }),
      });

      const res = await createUserRoute(duplicateReq);
      assert.equal(res.status, 409);
    });

    it("enforces self-protection: admin cannot demote or suspend own account", async () => {
      setAuthSessionResolver(async () => adminSession as any);

      // Attempt to demote self
      const selfDemoteReq = new NextRequest(
        `http://localhost:3000/api/admin/users/${testAdminId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role: "EDITOR" }),
        },
      );
      const demoteRes = await updateUserRoute(selfDemoteReq, {
        params: { id: testAdminId },
      });
      assert.equal(demoteRes.status, 400);
      const demoteJson = await demoteRes.json();
      assert.ok(demoteJson.error.message.includes("cannot remove your own administrative role"));

      // Attempt to suspend self
      const selfSuspendReq = new NextRequest(
        `http://localhost:3000/api/admin/users/${testAdminId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "SUSPENDED" }),
        },
      );
      const suspendRes = await updateUserRoute(selfSuspendReq, {
        params: { id: testAdminId },
      });
      assert.equal(suspendRes.status, 400);

      // Attempt to delete self
      const selfDeleteReq = new NextRequest(
        `http://localhost:3000/api/admin/users/${testAdminId}`,
        { method: "DELETE" },
      );
      const deleteRes = await deleteUserRoute(selfDeleteReq, {
        params: { id: testAdminId },
      });
      assert.equal(deleteRes.status, 400);
      const deleteJson = await deleteRes.json();
      assert.ok(deleteJson.error.message.includes("cannot delete your own active administrator"));
    });

    it("allows updating another user's role and status", async () => {
      assert.ok(createdUserId);
      setAuthSessionResolver(async () => adminSession as any);

      const updateReq = new NextRequest(
        `http://localhost:3000/api/admin/users/${createdUserId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "Updated Staff Name",
            status: "INACTIVE",
          }),
        },
      );

      const res = await updateUserRoute(updateReq, { params: { id: createdUserId! } });
      assert.equal(res.status, 200);
      const json = await res.json();
      assert.equal(json.data.name, "Updated Staff Name");
      assert.equal(json.data.status, "INACTIVE");
    });

    it("allows deleting non-admin user safely and logs audit event", async () => {
      assert.ok(createdUserId);
      setAuthSessionResolver(async () => adminSession as any);

      const deleteReq = new NextRequest(
        `http://localhost:3000/api/admin/users/${createdUserId}`,
        { method: "DELETE" },
      );

      const res = await deleteUserRoute(deleteReq, { params: { id: createdUserId! } });
      assert.equal(res.status, 200);

      // Verify user was deleted
      const check = await prisma.user.findUnique({ where: { id: createdUserId! } });
      assert.equal(check, null);
      createdUserId = null;
    });
  });

  // =========================================================================
  // 3. AI Consultant Knowledge Base Suite
  // =========================================================================
  describe("AI Consultant Knowledge Base & Prompt Rules", () => {
    it("loads knowledge base config and updates SiteSetting with cache invalidation", async () => {
      setAuthSessionResolver(async () => adminSession as any);

      const initialConfig = await getKnowledgeBaseConfig();
      assert.ok(initialConfig.knowledge.length >= 1);
      assert.ok(initialConfig.rules.length >= 1);

      // Add a test fact
      const customFactId = `test_fact_${Date.now()}`;
      const updatedKnowledge = [
        ...initialConfig.knowledge,
        {
          id: customFactId,
          title: "Custom ISO Certification Fact",
          category: "policy" as const,
          content: "Webgent maintains high data privacy compliance across all microservices.",
          keywords: ["privacy", "iso", "compliance"],
          enabled: true,
          updatedAt: new Date().toISOString(),
        },
      ];

      const putReq = new NextRequest("http://localhost:3000/api/admin/knowledge", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          knowledge: updatedKnowledge,
          rules: initialConfig.rules,
        }),
      });

      const res = await updateKnowledgeRoute(putReq);
      assert.equal(res.status, 200);

      // Verify knowledge document is dynamically indexed into AI Consultant
      const retrieved = await retrieveRelevantKnowledge("compliance and privacy", 5);
      const found = retrieved.find(
        (r) =>
          r.doc.id === `custom_${customFactId}` ||
          r.doc.title === "Custom ISO Certification Fact",
      );
      assert.ok(found, "Custom knowledge document is actively retrieved by AI Consultant");
    });
  });

  // =========================================================================
  // 4. Dashboard Stats Resilient Query Suite
  // =========================================================================
  describe("Admin Dashboard Stats Route", () => {
    it("returns correct metrics without crashing on empty tables", async () => {
      setAuthSessionResolver(async () => adminSession as any);

      const res = await getDashboardStatsRoute();
      assert.equal(res.status, 200);
      const json = await res.json();
      assert.equal(json.success, true);
      assert.ok(json.data.leads !== undefined);
      assert.ok(json.data.content !== undefined);
      assert.ok(json.data.analytics !== undefined);
      assert.equal(typeof json.data.leads.conversionRate, "number");
      assert.equal(typeof json.data.leads.averageScore, "number");
    });

    it("allows EDITOR role to view dashboard statistics", async () => {
      setAuthSessionResolver(async () => editorSession as any);

      const res = await getDashboardStatsRoute();
      assert.equal(res.status, 200);
      const json = await res.json();
      assert.equal(json.success, true);
    });

    it("rejects unauthorized access with 401 and regular USER with 403", async () => {
      setAuthSessionResolver(async () => null);
      const unauth = await getDashboardStatsRoute();
      assert.equal(unauth.status, 401);

      setAuthSessionResolver(async () => regularUserSession as any);
      const forbidden = await getDashboardStatsRoute();
      assert.equal(forbidden.status, 403);
    });
  });
});
