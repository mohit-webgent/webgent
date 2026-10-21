import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  WHATSAPP_CONFIG,
  buildWhatsAppUrl,
  getServiceWhatsAppUrl,
} from "../src/config/whatsapp";
import { siteConfig } from "../src/config/site";

describe("Webgent WhatsApp Click-to-Chat Integration Suite", () => {
  it("should have correct centralized configuration and phone number", () => {
    assert.equal(WHATSAPP_CONFIG.number, "918800241462");
    assert.equal(WHATSAPP_CONFIG.displayNumber, "+91 8800241462");
    assert.equal(
      WHATSAPP_CONFIG.defaultMessage,
      "Hi Webgent! I visited your website and would like to know more about your services.",
    );
  });

  it("should generate the exact required default WhatsApp click-to-chat URL", () => {
    const url = buildWhatsAppUrl();
    const expected =
      "https://wa.me/918800241462?text=Hi%20Webgent!%20I%20visited%20your%20website%20and%20would%20like%20to%20know%20more%20about%20your%20services.";
    assert.equal(url, expected);
  });

  it("should support contextual pre-filled messages for service pages", () => {
    const serviceUrl = getServiceWhatsAppUrl("Custom Web Applications");
    assert.match(serviceUrl, /^https:\/\/wa\.me\/918800241462\?text=/);
    assert.ok(serviceUrl.includes("Custom%20Web%20Applications"));

    const urlObj = new URL(serviceUrl);
    assert.equal(urlObj.origin, "https://wa.me");
    assert.equal(urlObj.pathname, "/918800241462");
    assert.equal(
      urlObj.searchParams.get("text"),
      "Hi Webgent! I visited your website and would like to know more about your Custom Web Applications service.",
    );
  });

  it("should sanitize phone numbers with formatting (+91 88002-41462 -> 918800241462)", () => {
    const url = buildWhatsAppUrl({ phone: "+91 88002 41462" });
    assert.match(url, /^https:\/\/wa\.me\/918800241462\?text=/);

    const customPhoneUrl = buildWhatsAppUrl({ phone: "+1 (555) 123-4567" });
    assert.match(customPhoneUrl, /^https:\/\/wa\.me\/15551234567\?text=/);
  });

  it("should allow custom messages while keeping URL encoding intact", () => {
    const customText = "Hello! Looking for Next.js consultancy & audit.";
    const url = buildWhatsAppUrl({ message: customText });
    const urlObj = new URL(url);
    assert.equal(urlObj.searchParams.get("text"), customText);
  });

  it("should be exposed in siteConfig with both direct link and chat url", () => {
    assert.equal(siteConfig.links.whatsapp, "https://wa.me/918800241462");
    assert.ok(siteConfig.links.whatsappChat.startsWith("https://wa.me/918800241462?text="));
    assert.equal(siteConfig.whatsapp.number, "918800241462");
  });
});
