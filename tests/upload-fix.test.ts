import test, { describe } from "node:test";
import assert from "node:assert/strict";
import { storageService } from "../src/lib/services/storage";
import { POST as mediaPost } from "../src/app/api/admin/media/route";
import { setAuthSessionResolver } from "../src/lib/auth-utils";
import { NextRequest } from "next/server";

describe("Supabase Storage Key Format & Upload Fix Suite", () => {
  const pngBase64 =
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
  const pngBuffer = Buffer.from(pngBase64, "base64");

  test("storageService.uploadFile succeeds end-to-end and cleans up without JWS errors", async () => {
    const uploadResult = await storageService.uploadFile(pngBuffer, {
      originalName: "test-auth-fix.png",
      mimeType: "image/png",
      folder: "general",
      altText: "Test auth header fix",
    });

    assert.ok(uploadResult);
    assert.ok(uploadResult.id);
    assert.ok(uploadResult.url.includes("webgent-media"));
    assert.ok(uploadResult.key.startsWith("images/general/"));
    assert.equal(uploadResult.mimeType, "image/png");

    // Clean up
    const deleted = await storageService.deleteFile(uploadResult.key, true);
    assert.equal(deleted, true);
  });

  test("POST /api/admin/media route successfully uploads image with admin authorization", async () => {
    setAuthSessionResolver(async () => ({
      user: {
        id: "admin-test-id",
        email: "admin@webgent.com",
        name: "Admin User",
        role: "ADMIN" as any,
        status: "ACTIVE" as any,
      },
      expires: new Date(Date.now() + 86400000).toISOString(),
    }));

    const formData = new FormData();
    formData.append(
      "file",
      new Blob([pngBuffer], { type: "image/png" }),
      "test-route-upload.png",
    );
    formData.append("folder", "blog");
    formData.append("altText", "Route test alt");

    const req = new NextRequest("http://localhost:3000/api/admin/media", {
      method: "POST",
      body: formData,
    });

    const res = await mediaPost(req);
    const body = await res.json();

    assert.equal(res.status, 201);
    assert.equal(body.success, true);
    assert.ok(body.data.id);
    assert.ok(body.data.url);
    assert.ok(body.data.key.startsWith("images/blog/"));

    // Clean up
    const deleted = await storageService.deleteFile(body.data.key, true);
    assert.equal(deleted, true);

    setAuthSessionResolver(null);
  });
});
