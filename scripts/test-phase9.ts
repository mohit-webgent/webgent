import {
  storageService,
  detectImageMimeType,
  isValidObjectKey,
  MAX_FILE_SIZE,
  AllowedFolder,
} from "../src/lib/services/storage";

let passedTests = 0;
let totalTests = 0;

function assert(condition: boolean, testName: string) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✅ PASS: ${testName}`);
  } else {
    console.error(`  ❌ FAIL: ${testName}`);
    throw new Error(`Test failed: ${testName}`);
  }
}

async function runTests() {
  console.log("\n📦 Running Phase 9 Cloudflare R2 Storage Test Suite...\n");

  // Helper generators for valid image buffers with proper binary magic numbers
  const createValidJpegBuffer = (): Buffer => {
    // JPEG header: FF D8 FF E0
    const buf = Buffer.alloc(100);
    buf[0] = 0xff;
    buf[1] = 0xd8;
    buf[2] = 0xff;
    buf[3] = 0xe0;
    return buf;
  };

  const createValidPngBuffer = (): Buffer => {
    // PNG header: 89 50 4E 47 0D 0A 1A 0A
    const buf = Buffer.alloc(100);
    buf[0] = 0x89;
    buf[1] = 0x50;
    buf[2] = 0x4e;
    buf[3] = 0x47;
    buf[4] = 0x0d;
    buf[5] = 0x0a;
    buf[6] = 0x1a;
    buf[7] = 0x0a;
    return buf;
  };

  const createValidWebpBuffer = (): Buffer => {
    // WEBP header: "RIFF" .... "WEBP"
    const buf = Buffer.alloc(100);
    buf.write("RIFF", 0);
    buf.write("WEBP", 8);
    return buf;
  };

  // -------------------------------------------------------------
  // 1. Binary Magic Numbers & MIME Detection Tests
  // -------------------------------------------------------------
  console.log("▶ [1/6] Testing MIME Detection & Binary Magic Numbers...");

  const jpegMime = detectImageMimeType(createValidJpegBuffer());
  assert(jpegMime === "image/jpeg", "Correctly identifies valid JPEG magic bytes (FF D8 FF)");

  const pngMime = detectImageMimeType(createValidPngBuffer());
  assert(pngMime === "image/png", "Correctly identifies valid PNG magic bytes (89 50 4E 47 0D 0A 1A 0A)");

  const webpMime = detectImageMimeType(createValidWebpBuffer());
  assert(webpMime === "image/webp", "Correctly identifies valid WEBP magic bytes (RIFF ... WEBP)");

  // -------------------------------------------------------------
  // 2. Invalid MIME Type Tests
  // -------------------------------------------------------------
  console.log("\n▶ [2/6] Testing Invalid MIME Types & Corrupted / Disguised Files...");

  const textBuffer = Buffer.from("Hello world! This is plain text disguised as an image.");
  assert(detectImageMimeType(textBuffer) === null, "Rejects plain text file");

  const pdfBuffer = Buffer.from("%PDF-1.4 simulated pdf document content");
  assert(detectImageMimeType(pdfBuffer) === null, "Rejects PDF document upload");

  const exeBuffer = Buffer.from("MZ\x90\x00\x03\x00\x00\x00 simulated windows executable binary");
  assert(detectImageMimeType(exeBuffer) === null, "Rejects executable binary file disguised as image");

  const emptyBuffer = Buffer.alloc(0);
  assert(detectImageMimeType(emptyBuffer) === null, "Rejects empty 0-byte buffer");

  // -------------------------------------------------------------
  // 3. Oversized File Handling Tests (5MB Limit)
  // -------------------------------------------------------------
  console.log("\n▶ [3/6] Testing Oversized File (Max 5MB) Guardrails...");

  assert(MAX_FILE_SIZE === 5 * 1024 * 1024, "MAX_FILE_SIZE is strictly set to 5,242,880 bytes (5MB)");

  // Create an oversized 5.1MB buffer with JPEG magic header
  const oversizedBuffer = Buffer.alloc(5 * 1024 * 1024 + 1024);
  oversizedBuffer[0] = 0xff;
  oversizedBuffer[1] = 0xd8;
  oversizedBuffer[2] = 0xff;

  let oversizedErrorCaught = false;
  try {
    await storageService.uploadFile(oversizedBuffer, {
      originalName: "large-banner.jpg",
      mimeType: "image/jpeg",
      folder: "projects",
    });
  } catch (err) {
    oversizedErrorCaught = true;
    const msg = err instanceof Error ? err.message : String(err);
    assert(msg.includes("exceeds maximum allowed size"), "Throws informative error for files exceeding 5MB");
  }
  assert(oversizedErrorCaught, "Strictly rejects oversized file (> 5MB)");

  // -------------------------------------------------------------
  // 4. Valid Upload Tests across All Predictable Prefixes
  // -------------------------------------------------------------
  console.log("\n▶ [4/6] Testing Valid Uploads under Predictable Prefixes...");

  const folders: AllowedFolder[] = ["projects", "blog", "testimonials"];
  for (const folder of folders) {
    const uploadRes = await storageService.uploadFile(createValidWebpBuffer(), {
      originalName: `showcase-sample-${folder}.webp`,
      mimeType: "image/webp",
      folder,
    });

    assert(uploadRes.key.startsWith(`images/${folder}/`), `Asset uploaded under predictable prefix "images/${folder}/"`);
    assert(uploadRes.key.endsWith(".webp"), "Asset filename ends with correct detected extension");
    assert(uploadRes.url.includes(`images/${folder}/`), "Public URL contains correct folder path");
    assert(uploadRes.mimeType === "image/webp", "Upload result reflects valid MIME type");
    assert(storageService.isValidKey(uploadRes.key), "Generated object key satisfies strict key validation");
  }

  // -------------------------------------------------------------
  // 5. Safe Object Deletion Tests
  // -------------------------------------------------------------
  console.log("\n▶ [5/6] Testing Safe Object Deletion...");

  const testKey = "images/projects/1727654000-a1b2c3d4-hero-banner.jpg";
  const deleteResult = await storageService.deleteFile(testKey);
  assert(deleteResult === true, "deleteFile succeeds for valid authorized key");

  // Deletion from full URL extraction
  const fullUrl = `https://cdn.webgent.com/${testKey}`;
  const extractedKey = storageService.extractKeyFromUrl(fullUrl);
  assert(extractedKey === testKey, "extractKeyFromUrl correctly parses key from full CDN URL");

  const deleteUrlResult = await storageService.deleteFile(fullUrl);
  assert(deleteUrlResult === true, "deleteFile succeeds when provided full CDN URL");

  // Batch deletion
  const batchResult = await storageService.deleteFiles([
    "images/blog/1727654000-sample-1.webp",
    "images/testimonials/1727654000-sample-2.png",
  ]);
  assert(batchResult === true, "deleteFiles batch deletion succeeds for valid keys");

  // -------------------------------------------------------------
  // 6. Invalid Object Key & Arbitrary Deletion Prevention Tests
  // -------------------------------------------------------------
  console.log("\n▶ [6/6] Testing Path Traversal & Unauthorized Key Rejection...");

  // Path traversal attempts
  const pathTraversalKeys = [
    "../../etc/passwd",
    "images/projects/../../secret.env",
    "images/blog/../config.json",
    "/images/projects/leading-slash.jpg",
    "images\\projects\\windows-backslash.jpg",
    "images/projects/null\0byte.jpg",
  ];

  for (const maliciousKey of pathTraversalKeys) {
    const isAllowed = isValidObjectKey(maliciousKey);
    assert(!isAllowed, `Strictly rejects path traversal / dangerous key: "${maliciousKey}"`);
    const deleteAttempt = await storageService.deleteFile(maliciousKey);
    assert(deleteAttempt === false, `deleteFile safely refuses deletion for path traversal: "${maliciousKey}"`);
  }

  // Unauthorized prefixes outside allowed media directories
  const unauthorizedPrefixes = [
    "users/avatars/user-123.jpg",
    "backups/database-dump.sql",
    "system/audit-logs.json",
    "images/other/asset.png",
    "documents/contract.pdf",
  ];

  for (const unauthKey of unauthorizedPrefixes) {
    const isAllowed = isValidObjectKey(unauthKey);
    assert(!isAllowed, `Strictly rejects object key outside authorized prefixes: "${unauthKey}"`);
    const deleteAttempt = await storageService.deleteFile(unauthKey);
    assert(deleteAttempt === false, `deleteFile refuses arbitrary deletion for key outside authorized directories: "${unauthKey}"`);
  }

  // Null and empty checks
  assert(isValidObjectKey("") === false, "Rejects empty string object key");
  assert(storageService.extractKeyFromUrl("") === null, "extractKeyFromUrl returns null for empty string");

  console.log(`\n======================================================`);
  console.log(`🎉 ALL ${passedTests}/${totalTests} PHASE 9 TESTS PASSED!`);
  console.log(`======================================================\n`);
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
