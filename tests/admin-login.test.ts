import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { NextRequest } from "next/server";
import { encode } from "next-auth/jwt";
import { proxy } from "../src/proxy";
import { resolveAdminCallback } from "../src/lib/auth-redirect";
import { getApiErrorMessage } from "../src/lib/api/client-error";

const SECRET = "admin-login-test-secret-0123456789-abcdefghij";

async function requestWithSession(cookieName: string, role = "ADMIN") {
  process.env.AUTH_SECRET = SECRET;
  const token = await encode({
    token: { id: "user-1", role, status: "ACTIVE" },
    secret: SECRET,
    salt: cookieName,
  });
  return new NextRequest("https://webgent.example/admin/leads?page=2", {
    headers: { cookie: `${cookieName}=${token}` },
  });
}

describe("admin proxy session cookie", () => {
  it("accepts the secure cookie issued over HTTPS", async () => {
    const res = await proxy(await requestWithSession("__Secure-authjs.session-token"));
    assert.equal(res.status, 200);
  });

  it("accepts the plain cookie issued over HTTP", async () => {
    const res = await proxy(await requestWithSession("authjs.session-token"));
    assert.equal(res.status, 200);
  });

  it("sends a signed-out visitor to login and keeps the query in the callback", async () => {
    const res = await proxy(new NextRequest("https://webgent.example/admin/leads?page=2"));
    assert.equal(res.status, 307);
    const location = new URL(res.headers.get("location") as string);
    assert.equal(location.pathname, "/admin/login");
    assert.equal(location.searchParams.get("callbackUrl"), "/admin/leads?page=2");
  });

  it("rejects a session whose role cannot use the console", async () => {
    const res = await proxy(await requestWithSession("__Secure-authjs.session-token", "USER"));
    assert.equal(res.status, 307);
  });
});

describe("resolveAdminCallback", () => {
  it("allows console pages", () => {
    assert.equal(resolveAdminCallback("/admin/leads?page=2"), "/admin/leads?page=2");
    assert.equal(resolveAdminCallback("/admin"), "/admin");
  });

  it("falls back to the dashboard for anything else", () => {
    for (const value of [
      null,
      undefined,
      "",
      "https://evil.example",
      "//evil.example",
      "/\\evil.example",
      "/administrator",
      "/admin/login",
      "/admin/login?callbackUrl=/admin",
      "/pricing",
    ]) {
      assert.equal(resolveAdminCallback(value), "/admin", String(value));
    }
  });
});

describe("getApiErrorMessage", () => {
  it("reads every error shape the admin API returns", () => {
    assert.equal(getApiErrorMessage({ error: "Plain" }, "fallback"), "Plain");
    assert.equal(getApiErrorMessage({ error: { code: "X", message: "Nested" } }, "fallback"), "Nested");
    assert.equal(getApiErrorMessage({ message: "Top" }, "fallback"), "Top");
  });

  it("always returns a string, never an object React cannot render", () => {
    assert.equal(getApiErrorMessage({ error: { code: "X" } }, "fallback"), "fallback");
    assert.equal(getApiErrorMessage(null, "fallback"), "fallback");
  });
});
