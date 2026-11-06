import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { formatBudget, parseClientMessage } from "../src/components/emails/email-format";

describe("Client message formatting for emails", () => {
  it("turns a plain paragraph into one point per sentence", () => {
    const [group] = parseClientMessage("I need a website for my gym. It should have online booking! Can you start soon?");
    assert.deepEqual(group.points.map((point) => point.text), [
      "I need a website for my gym.",
      "It should have online booking!",
      "Can you start soon?",
    ]);
  });

  it("does not split a sentence at a common abbreviation", () => {
    const [group] = parseClientMessage("I want payments, e.g. Razorpay and UPI. Please advise.");
    assert.deepEqual(group.points.map((point) => point.text), ["I want payments, e.g. Razorpay and UPI.", "Please advise."]);
  });

  it("keeps sentences together inside a single bullet", () => {
    const [group] = parseClientMessage("- First part. Second part.\n- Next point");
    assert.deepEqual(group.points.map((point) => point.text), ["First part. Second part.", "Next point"]);
  });

  it("groups the pricing page message under headings with labels", () => {
    const groups = parseClientMessage(
      "Webgent Project Configuration:\n- Build Mode: Package Only\n- Base Package: Business (₹20,000)\n\nSelected Add-ons (1):\n• Extra Pages (Qty: 2): ₹2,000\n\nNote: Third-party charges are not included.",
    );
    assert.equal(groups[0].heading, "Webgent Project Configuration");
    assert.deepEqual(groups[0].points[0], { label: "Build Mode", text: "Package Only" });
    assert.equal(groups[1].heading, "Selected Add-ons (1)");
    assert.deepEqual(groups[1].points[0], { label: "Extra Pages (Qty: 2)", text: "₹2,000" });
    assert.equal(groups[1].points.length, 1);
    assert.equal(groups[2].heading, undefined);
    assert.deepEqual(groups[2].points[0], { label: "Note", text: "Third-party charges are not included." });
  });

  it("does not treat a long sentence or a web address as a label", () => {
    const [group] = parseClientMessage("Here is the thing that we would really like to discuss with you: a store\nSee https://example.com/page");
    assert.equal(group.points[0].label, undefined);
    assert.equal(group.points[1].text, "See https://example.com/page");
    assert.equal(group.points[1].label, undefined);
  });

  it("removes the quotes around chat messages", () => {
    const [group] = parseClientMessage('Latest chat inquiry: "Need a store"');
    assert.deepEqual(group.points[0], { label: "Latest chat inquiry", text: "Need a store" });
  });

  it("returns nothing for an empty message", () => {
    assert.deepEqual(parseClientMessage("  \n "), []);
    assert.deepEqual(parseClientMessage(null), []);
  });

  it("shows budget codes as readable ranges and leaves other text alone", () => {
    assert.equal(formatBudget("under_5k"), "Under ₹15,000");
    assert.equal(formatBudget("₹50,000 - ₹1,50,000"), "₹50,000 - ₹1,50,000");
    assert.equal(formatBudget(""), null);
  });
});
