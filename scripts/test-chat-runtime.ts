
import { POST as startRoute } from "../src/app/api/chat/start/route";
import { POST as messageRoute } from "../src/app/api/chat/message/route";
import { NextRequest } from "next/server";
import { prisma } from "../src/lib/db";

async function run() {
  console.log("=== Testing 6 User Messages Pipeline ===");

  // 1. Create a fresh session
  const startReq = new NextRequest("http://localhost:3000/api/chat/start", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      turnstileToken: "dev-mock-turnstile-token",
    }),
  });

  const startRes = await startRoute(startReq);
  const startData = await startRes.json();
  const sessionId = startData.sessionId;
  console.log(`Initialized Session ID: ${sessionId}`);

  const testPrompts = [
    { prompt: "Hi", expectEstimate: false, desc: "Normal English greeting" },
    { prompt: "Kaise ho?", expectEstimate: false, desc: "Hinglish greeting" },
    { prompt: "Webgent ke baare mein batao", expectEstimate: false, desc: "General company overview" },
    { 
      prompt: "Mujhe gym website banwani hai, budget ₹15,000 hai", 
      expectEstimate: true, 
      expectedCategory: "gym", 
      expectedCost: 11999, 
      expectedTimeline: "5–7 Business Days",
      desc: "Gym Starter project scoping with ₹15,000 budget" 
    },
    { 
      prompt: "Ok, ₹11,999 wala proposal final karte hain", 
      expectEstimate: false, 
      desc: "Accepting Phase 1 proposal without re-pitching card" 
    },
    { 
      prompt: "Can online booking be added later?", 
      expectEstimate: false, 
      desc: "Feature inquiry: online booking in Phase 2 without switching category or overwriting Phase 1" 
    },
    { 
      prompt: "Kya clients advance deposit bhi pay kar sakte hain?", 
      expectEstimate: false, 
      desc: "Feature inquiry: advance deposits with payment gateway without overwriting Phase 1" 
    },
    { 
      prompt: "Tumhare price aur market price mein kya difference hai?", 
      expectEstimate: false, 
      desc: "Market comparison question" 
    },
    { 
      prompt: "Mohit ki education aur skills kya hain?", 
      expectEstimate: false, 
      desc: "Founder biography inquiry from verified profile" 
    },
    { 
      prompt: "Mujhe jewellery store banwani hai", 
      expectEstimate: true, 
      expectedCategory: "ecommerce", 
      expectedCost: 28999,
      desc: "Explicit project switch from Gym to Jewellery Store" 
    },
    { 
      prompt: "Iska budget ₹25,000 hai", 
      expectEstimate: true, 
      expectedCategory: "ecommerce", 
      expectedCost: 28999,
      desc: "Budget update for new jewellery project" 
    },
  ];

  for (let i = 0; i < testPrompts.length; i++) {
    const item = testPrompts[i];
    console.log(`\n--------------------------------------------------`);
    console.log(`Turn ${i + 1}: "${item.prompt}" (${item.desc})`);

    const msgReq = new NextRequest("http://localhost:3000/api/chat/message", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId,
        message: item.prompt,
      }),
    });

    const msgRes = await messageRoute(msgReq);
    const msgData = await msgRes.json();

    console.log(`Status: ${msgRes.status}`);
    console.log(`Reply: "${msgData.message?.slice(0, 150)}..."`);
    console.log(`Estimate attached?: ${Boolean(msgData.estimate)}`);

    if (item.expectEstimate) {
      if (!msgData.estimate) {
        console.error(`❌ FAILED: Expected estimate card, but got none!`);
        process.exit(1);
      }
      console.log(`Estimate Category: "${msgData.estimate.categoryDisplayName}" (${msgData.estimate.categoryKey})`);
      console.log(`Calculated Cost: ₹${msgData.estimate.cost.oneTimeTotalINR}`);
      console.log(`Timeline: "${msgData.estimate.estimatedTimeline}"`);

      if (item.expectedCategory && msgData.estimate.categoryKey !== item.expectedCategory) {
        console.error(`❌ FAILED: Expected category "${item.expectedCategory}", got "${msgData.estimate.categoryKey}"`);
        process.exit(1);
      }
      if (item.expectedCost && msgData.estimate.cost.oneTimeTotalINR !== item.expectedCost) {
        console.error(`❌ FAILED: Expected cost ₹${item.expectedCost}, got ₹${msgData.estimate.cost.oneTimeTotalINR}`);
        process.exit(1);
      }
      if (item.expectedTimeline && msgData.estimate.estimatedTimeline !== item.expectedTimeline) {
        console.error(`❌ FAILED: Expected timeline "${item.expectedTimeline}", got "${msgData.estimate.estimatedTimeline}"`);
        process.exit(1);
      }
      if (msgData.estimate.budgetAnalysis) {
        console.log(`Budget Analysis: Target ₹${msgData.estimate.budgetAnalysis.userBudgetINR}, Fits: ${msgData.estimate.budgetAnalysis.fitsBudget}`);
      }
    } else {
      if (msgData.estimate) {
        console.error(`❌ FAILED: Did NOT expect estimate card on "${item.prompt}", but one was attached!`);
        process.exit(1);
      }
    }
  }

  // Cleanup session from DB
  await prisma.chatMessage.deleteMany({ where: { sessionId } });
  await prisma.chatSession.delete({ where: { id: sessionId } });

  console.log(`\n==================================================`);
  console.log(`🎉 ALL ${testPrompts.length} TURNS PASSED PERFECTLY!`);
  console.log(`==================================================`);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
