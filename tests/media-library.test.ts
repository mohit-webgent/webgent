import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { NextRequest } from "next/server";
import {
  detectImageMimeType,
  isValidObjectKey,
  SupabaseStorageService,
  MAX_FILE_SIZE,
} from "../src/lib/services/storage";
import { GET as getMediaRoute, POST as postMediaRoute } from "../src/app/api/admin/media/route";
import {
  GET as getMediaByIdRoute,
  PATCH as patchMediaRoute,
  DELETE as deleteMediaRoute,
} from "../src/app/api/admin/media/[id]/route";
import { POST as postUploadRoute, DELETE as deleteUploadRoute } from "../src/app/api/admin/upload/route";
import { setAuthSessionResolver } from "../src/lib/auth-utils";
import { prisma } from "../src/lib/db";

describe("Media Library & Supabase Storage Suite", () => {
  const originalEnv = { ...process.env };

  const adminSession = {
    user: {
      id: "admin-test-user-id",
      email: "admin@webgent.com",
      name: "Admin User",
      role: "ADMIN" as any,
      status: "ACTIVE" as any,
    },
    expires: new Date(Date.now() + 3600000).toISOString(),
  };

  afterEach(() => {
    process.env = { ...originalEnv };
    setAuthSessionResolver(null);
  });

  // =========================================================================
  // 1. Authorization Controls
  // =========================================================================
  describe("Admin Authorization & Protection", () => {
    it("rejects unauthorized GET /api/admin/media with 401", async () => {
      setAuthSessionResolver(async () => null);

      const req = new NextRequest("http://localhost:3000/api/admin/media");
      const res = await getMediaRoute(req);
      assert.equal(res.status, 401);
    });

    it("rejects unauthorized POST /api/admin/media with 401", async () => {
      setAuthSessionResolver(async () => null);

      const req = new NextRequest("http://localhost:3000/api/admin/media", {
        method: "POST",
      });
      const res = await postMediaRoute(req);
      assert.equal(res.status, 401);
    });

    it("rejects unauthorized DELETE /api/admin/media/[id] with 401", async () => {
      setAuthSessionResolver(async () => null);

      const req = new NextRequest("http://localhost:3000/api/admin/media/test-id", {
        method: "DELETE",
      });
      const res = await deleteMediaRoute(req, { params: { id: "test-id" } });
      assert.equal(res.status, 401);
    });
  });

  // =========================================================================
  // 2. Magic Bytes & File Signature Detection
  // =========================================================================
  describe("Magic Bytes & File Signature Validation", () => {
    it("accepts valid JPEG magic bytes (FF D8 FF)", () => {
      const jpegBuffer = Buffer.from([
        0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01, 0x01,
      ]);
      const mime = detectImageMimeType(jpegBuffer);
      assert.equal(mime, "image/jpeg");
    });

    it("accepts valid PNG magic bytes (89 50 4E 47 0D 0A 1A 0A)", () => {
      const pngBuffer = Buffer.from([
        0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
      ]);
      const mime = detectImageMimeType(pngBuffer);
      assert.equal(mime, "image/png");
    });

    it("accepts valid WebP magic bytes (RIFF....WEBP)", () => {
      const webpBuffer = Buffer.from([
        0x52, 0x49, 0x46, 0x46, 0x24, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50,
      ]);
      const mime = detectImageMimeType(webpBuffer);
      assert.equal(mime, "image/webp");
    });

    it("accepts valid AVIF magic bytes (ftypavif)", () => {
      const avifBuffer = Buffer.from([
        0x00, 0x00, 0x00, 0x1c, 0x66, 0x74, 0x79, 0x70, 0x61, 0x76, 0x69, 0x66,
      ]);
      const mime = detectImageMimeType(avifBuffer);
      assert.equal(mime, "image/avif");
    });

    it("explicitly rejects SVG files with malicious script tags", () => {
      const svgBuffer = Buffer.from(
        '<svg xmlns="http://www.w3.org/2000/svg"><script>alert("xss")</script></svg>',
        "utf8",
      );
      const mime = detectImageMimeType(svgBuffer);
      assert.equal(mime, null, "SVG files must be rejected by magic bytes detector");
    });

    it("rejects plain text files pretending to be images", () => {
      const textBuffer = Buffer.from("Hello world this is not an image file at all", "utf8");
      const mime = detectImageMimeType(textBuffer);
      assert.equal(mime, null);
    });

    it("rejects windows executables (MZ header)", () => {
      const exeBuffer = Buffer.from([0x4d, 0x5a, 0x90, 0x00, 0x03, 0x00, 0x00, 0x00, 0x04, 0x00, 0x00, 0x00]);
      const mime = detectImageMimeType(exeBuffer);
      assert.equal(mime, null);
    });
  });

  // =========================================================================
  // 3. Object Key Safety & Path Traversal Prevention
  // =========================================================================
  describe("Object Key Safety & Format Validation", () => {
    it("validates legitimate keys with allowed prefixes", () => {
      assert.equal(isValidObjectKey("images/projects/123-hero.jpg"), true);
      assert.equal(isValidObjectKey("images/blog/1729471200-article.webp"), true);
      assert.equal(isValidObjectKey("images/testimonials/avatar.png"), true);
      assert.equal(isValidObjectKey("images/general/site-og.jpg"), true);
    });

    it("rejects directory traversal attempts", () => {
      assert.equal(isValidObjectKey("images/projects/../../etc/passwd"), false);
      assert.equal(isValidObjectKey("images/blog/..\\windows\\win.ini"), false);
    });

    it("rejects unauthorized folders or root paths", () => {
      assert.equal(isValidObjectKey("/images/projects/photo.jpg"), false);
      assert.equal(isValidObjectKey("documents/contracts/invoice.pdf"), false);
      assert.equal(isValidObjectKey("images/users/avatar.jpg"), false);
    });

    it("rejects null bytes and control characters in keys", () => {
      assert.equal(isValidObjectKey("images/projects/malicious\0file.png"), false);
      assert.equal(isValidObjectKey("images/projects/bad\r\nname.jpg"), false);
    });
  });

  // =========================================================================
  // 4. File Size & Destination Validation
  // =========================================================================
  describe("File Size & Payload Validation", () => {
    it("rejects oversized file buffer (> 5MB)", async () => {
      setAuthSessionResolver(async () => adminSession as any);
      process.env.SUPABASE_SERVICE_ROLE_KEY = "test-service-key";

      const storage = new SupabaseStorageService();
      const largeBuffer = Buffer.alloc(MAX_FILE_SIZE + 1024);

      await assert.rejects(
        async () => {
          await storage.uploadFile(largeBuffer, {
            originalName: "large.jpg",
            mimeType: "image/jpeg",
            folder: "projects",
          });
        },
        {
          message: /exceeds maximum allowed size of 5 MB/i,
        },
      );
    });

    it("rejects invalid folder destination in storage service", async () => {
      const storage = new SupabaseStorageService();
      const validJpeg = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01]);

      await assert.rejects(
        async () => {
          await storage.uploadFile(validJpeg, {
            originalName: "test.jpg",
            mimeType: "image/jpeg",
            folder: "unauthorized_folder" as any,
          });
        },
        {
          message: /Invalid folder prefix/i,
        },
      );
    });
  });

  // =========================================================================
  // 5. Missing Configuration Resilience
  // =========================================================================
  describe("Configuration & Credentials Resilience", () => {
    it("honestly throws when SUPABASE_SERVICE_ROLE_KEY is absent without pretending upload succeeded", async () => {
      delete process.env.SUPABASE_SERVICE_ROLE_KEY;
      delete process.env.SUPABASE_STORAGE_KEY;

      const storage = new SupabaseStorageService();
      const validJpeg = Buffer.from([
        0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01, 0x01,
      ]);

      await assert.rejects(
        async () => {
          await storage.uploadFile(validJpeg, {
            originalName: "test.jpg",
            mimeType: "image/jpeg",
            folder: "general",
          });
        },
        {
          message: /SUPABASE_SERVICE_ROLE_KEY.*are not configured/i,
        },
      );
    });
  });

  // =========================================================================
  // 6. Cross-Content Referenced-Media Deletion Protection
  // =========================================================================
  describe("Referenced-Media Deletion Protection", () => {
    it("detects when an image is referenced in a Project and blocks unforced deletion", async () => {
      process.env.SUPABASE_SERVICE_ROLE_KEY = "mock-service-key";
      const storage = new SupabaseStorageService();

      const testImageKey = `images/projects/ref_test_${Date.now()}.webp`;
      const testImageUrl = storage.getPublicUrl(testImageKey);

      // Create a temporary project referencing this image
      const tempProject = await prisma.project.create({
        data: {
          title: "Temporary Reference Project",
          slug: `temp-ref-${Date.now()}`,
          description: "Testing deletion safety",
          imageUrl: testImageUrl,
          published: true,
        },
      });

      try {
        // Reference check should find the project
        const refs = await storage.checkReferences(testImageKey);
        assert.ok(refs.length >= 1, "Should find at least 1 active reference");
        assert.equal(refs[0].type, "project");
        assert.equal(refs[0].id, tempProject.id);

        // Deletion without force should throw descriptive error
        await assert.rejects(
          async () => {
            await storage.deleteFile(testImageKey, false);
          },
          {
            message: /Cannot delete asset: It is currently referenced in 1 place\(s\)/i,
          },
        );
      } finally {
        await prisma.project.delete({ where: { id: tempProject.id } });
      }
    });

    it("detects when an image is referenced in a BlogPost and blocks deletion", async () => {
      process.env.SUPABASE_SERVICE_ROLE_KEY = "mock-service-key";
      const storage = new SupabaseStorageService();

      const testImageKey = `images/blog/article_ref_${Date.now()}.png`;
      const testImageUrl = storage.getPublicUrl(testImageKey);

      // Fetch an existing author for foreign key
      const user = await prisma.user.findFirst();
      if (!user) return; // Skip if no user seeded

      const tempPost = await prisma.blogPost.create({
        data: {
          title: "Temporary Reference Article",
          slug: `temp-post-${Date.now()}`,
          content: "Content referencing nothing",
          coverImage: testImageUrl,
          authorId: user.id,
        },
      });

      try {
        const refs = await storage.checkReferences(testImageKey);
        assert.ok(refs.length >= 1);
        assert.equal(refs[0].type, "blog");
        assert.equal(refs[0].id, tempPost.id);

        await assert.rejects(
          async () => {
            await storage.deleteFile(testImageKey, false);
          },
          {
            message: /Cannot delete asset: It is currently referenced/i,
          },
        );
      } finally {
        await prisma.blogPost.delete({ where: { id: tempPost.id } });
      }
    });

    it("detects inline images referenced inside blog markdown content", async () => {
      const storage = new SupabaseStorageService();
      const testImageKey = `images/blog/inline_${Date.now()}.jpg`;
      const testImageUrl = storage.getPublicUrl(testImageKey);

      const user = await prisma.user.findFirst();
      if (!user) return;

      const tempPost = await prisma.blogPost.create({
        data: {
          title: "Markdown Inline Image Test",
          slug: `temp-inline-${Date.now()}`,
          content: `Here is an inline diagram: ![Architecture Diagram](${testImageUrl})\n\nEnd of section.`,
          authorId: user.id,
        },
      });

      try {
        const refs = await storage.checkReferences(testImageKey);
        assert.ok(refs.length >= 1);
        assert.equal(refs[0].field, "content");
      } finally {
        await prisma.blogPost.delete({ where: { id: tempPost.id } });
      }
    });
  });

  // =========================================================================
  // 7. URL Key Extraction and Public CDN URL Formatting
  // =========================================================================
  describe("URL Key Extraction & Format Helpers", () => {
    it("extracts clean storage keys from Supabase public URLs", () => {
      const storage = new SupabaseStorageService();
      const key = "images/projects/12345-demo.jpg";
      const fullUrl = `https://foprklanpxjxvuramabk.supabase.co/storage/v1/object/public/webgent-media/${key}`;

      const extracted = storage.extractKeyFromUrl(fullUrl);
      assert.equal(extracted, key);
    });

    it("formats public CDN URLs strictly with webgent-media bucket", () => {
      const storage = new SupabaseStorageService();
      const key = "images/general/hero.webp";
      const publicUrl = storage.getPublicUrl(key);

      assert.match(publicUrl, /^https:\/\/[a-z0-9]+\.supabase\.co\/storage\/v1\/object\/public\/webgent-media\/images\/general\/hero\.webp$/);
    });
  });
});
