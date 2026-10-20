import test, { describe } from "node:test";
import assert from "node:assert/strict";
import { resolveConnectionLimit, getRuntimeDatabaseUrl, prisma } from "../src/lib/db/prisma";

describe("Prisma Connection Pool Configuration Suite", () => {
  const originalEnv = { ...process.env };

  test.afterEach(() => {
    process.env = { ...originalEnv };
  });

  describe("resolveConnectionLimit()", () => {
    test("defaults to 10 in development when PRISMA_CONNECTION_LIMIT is not set", () => {
      delete process.env.PRISMA_CONNECTION_LIMIT;
      (process.env as Record<string, string | undefined>).NODE_ENV = "development";
      assert.equal(resolveConnectionLimit(), 10);
    });

    test("defaults to 5 in production when PRISMA_CONNECTION_LIMIT is not set", () => {
      delete process.env.PRISMA_CONNECTION_LIMIT;
      (process.env as Record<string, string | undefined>).NODE_ENV = "production";
      assert.equal(resolveConnectionLimit(), 5);
    });

    test("honors valid positive integer in PRISMA_CONNECTION_LIMIT", () => {
      process.env.PRISMA_CONNECTION_LIMIT = "12";
      assert.equal(resolveConnectionLimit(), 12);

      process.env.PRISMA_CONNECTION_LIMIT = "1";
      assert.equal(resolveConnectionLimit(), 1);
    });

    test("rejects non-numeric PRISMA_CONNECTION_LIMIT and falls back safely", () => {
      (process.env as Record<string, string | undefined>).NODE_ENV = "development";
      process.env.PRISMA_CONNECTION_LIMIT = "invalid-limit";
      assert.equal(resolveConnectionLimit(), 10);
    });

    test("rejects zero or negative integer in PRISMA_CONNECTION_LIMIT and falls back safely", () => {
      (process.env as Record<string, string | undefined>).NODE_ENV = "development";
      process.env.PRISMA_CONNECTION_LIMIT = "0";
      assert.equal(resolveConnectionLimit(), 10);

      process.env.PRISMA_CONNECTION_LIMIT = "-5";
      assert.equal(resolveConnectionLimit(), 10);
    });

    test("rejects empty or whitespace PRISMA_CONNECTION_LIMIT and falls back safely", () => {
      (process.env as Record<string, string | undefined>).NODE_ENV = "development";
      process.env.PRISMA_CONNECTION_LIMIT = "   ";
      assert.equal(resolveConnectionLimit(), 10);
    });
  });

  describe("getRuntimeDatabaseUrl()", () => {
    test("returns undefined if DATABASE_URL is not set", () => {
      delete process.env.DATABASE_URL;
      assert.equal(getRuntimeDatabaseUrl(), undefined);
    });

    test("preserves existing query parameters and does not duplicate keys", () => {
      process.env.DATABASE_URL =
        "postgresql://user:pass@aws-0-ap-southeast-2.pooler.supabase.com:6543/postgres?sslmode=require&custom_param=active";
      (process.env as Record<string, string | undefined>).NODE_ENV = "development";
      delete process.env.PRISMA_CONNECTION_LIMIT;

      const urlStr = getRuntimeDatabaseUrl();
      assert.ok(urlStr);
      const parsed = new URL(urlStr);

      assert.equal(parsed.searchParams.get("sslmode"), "require");
      assert.equal(parsed.searchParams.get("custom_param"), "active");
      assert.equal(parsed.searchParams.get("pgbouncer"), "true");
      assert.equal(parsed.searchParams.get("connection_limit"), "10");
      assert.equal(parsed.searchParams.get("connect_timeout"), "15");
      assert.equal(parsed.searchParams.get("pool_timeout"), "30");

      // Verify no duplicate keys in query string
      const keys = [...parsed.searchParams.keys()];
      const uniqueKeys = new Set(keys);
      assert.equal(keys.length, uniqueKeys.size, "No duplicate query parameters should exist");
    });

    test("preserves explicit connection_limit if already valid in URL", () => {
      process.env.DATABASE_URL =
        "postgresql://user:pass@aws-0-ap-southeast-2.pooler.supabase.com:6543/postgres?connection_limit=7";
      const urlStr = getRuntimeDatabaseUrl();
      assert.ok(urlStr);
      const parsed = new URL(urlStr);
      assert.equal(parsed.searchParams.get("connection_limit"), "7");
    });

    test("overwrites invalid connection_limit in URL with safe resolved limit", () => {
      process.env.DATABASE_URL =
        "postgresql://user:pass@aws-0-ap-southeast-2.pooler.supabase.com:6543/postgres?connection_limit=-1";
      (process.env as Record<string, string | undefined>).NODE_ENV = "development";
      delete process.env.PRISMA_CONNECTION_LIMIT;

      const urlStr = getRuntimeDatabaseUrl();
      assert.ok(urlStr);
      const parsed = new URL(urlStr);
      assert.equal(parsed.searchParams.get("connection_limit"), "10");
    });

    test("switches Supabase pooler from session port 5432 to transaction port 6543", () => {
      process.env.DATABASE_URL =
        "postgresql://user:pass@aws-0-ap-southeast-2.pooler.supabase.com:5432/postgres";
      const urlStr = getRuntimeDatabaseUrl();
      assert.ok(urlStr);
      const parsed = new URL(urlStr);
      assert.equal(parsed.port, "6543");
      assert.equal(parsed.searchParams.get("pgbouncer"), "true");
    });

    test("preserves explicit pool_timeout if already provided in URL", () => {
      process.env.DATABASE_URL =
        "postgresql://user:pass@aws-0-ap-southeast-2.pooler.supabase.com:6543/postgres?pool_timeout=45";
      const urlStr = getRuntimeDatabaseUrl();
      assert.ok(urlStr);
      const parsed = new URL(urlStr);
      assert.equal(parsed.searchParams.get("pool_timeout"), "45");
    });
  });

  describe("Concurrent Queries Execution (Live Pooler Verification)", () => {
    test("successfully resolves 10+ concurrent queries in Promise.all without pool timeout", async () => {
      const queries = [
        prisma.lead.count(),
        prisma.lead.findMany({ take: 2, select: { id: true, status: true } }),
        prisma.project.count(),
        prisma.project.count({ where: { published: true } }),
        prisma.blogPost.count({ where: { deletedAt: null } }),
        prisma.blogPost.count({ where: { status: "PUBLISHED", deletedAt: null } }),
        prisma.testimonial.count({ where: { deletedAt: null } }),
        prisma.subscriber.count(),
        prisma.chatSession.count(),
        prisma.pageView.count(),
        prisma.event.count(),
      ];

      const start = Date.now();
      const results = await Promise.all(queries);
      const elapsed = Date.now() - start;

      assert.equal(results.length, 11);
      assert.ok(
        elapsed < 30000,
        `Queries should resolve comfortably within pool_timeout (elapsed: ${elapsed}ms)`,
      );
    });
  });
});
