import { execFileSync } from "child_process";
import fs from "fs";
import path from "path";

const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const outDir = "screenshots/after";

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const allFeatures = [
  "contact_form",
  "payment_gateway",
  "whatsapp_chat",
  "whatsapp_alerts",
  "booking_calendar",
  "ecommerce_cart",
  "user_login",
  "admin_dashboard",
  "blog",
  "gallery_showcase",
  "email_notifications",
  "seo_basic",
  "speed_optimization",
  "animations_smooth",
  "multilanguage",
  "ai_chatbot",
].join(",");

const targets = [
  { width: 375, height: 1200, name: "pricing-375px.png", url: "http://localhost:3000/pricing" },
  { width: 768, height: 1200, name: "pricing-768px.png", url: "http://localhost:3000/pricing" },
  { width: 1280, height: 1000, name: "pricing-1280px.png", url: "http://localhost:3000/pricing" },
  { width: 1536, height: 1000, name: "pricing-1536px.png", url: "http://localhost:3000/pricing" },
  // Edge cases
  { width: 1280, height: 1000, name: "pricing-0-features-1280px.png", url: "http://localhost:3000/pricing?feat=" },
  { width: 1280, height: 1000, name: "pricing-all-16-features-1280px.png", url: `http://localhost:3000/pricing?feat=${allFeatures}&type=dynamic` },
  { width: 375, height: 1200, name: "pricing-0-features-375px.png", url: "http://localhost:3000/pricing?feat=" },
  { width: 375, height: 1200, name: "pricing-all-16-features-375px.png", url: `http://localhost:3000/pricing?feat=${allFeatures}&type=dynamic` },
];

for (const t of targets) {
  const filePath = path.resolve(outDir, t.name);
  console.log(`Capturing ${t.name} (${t.width}x${t.height})...`);
  execFileSync(chromePath, [
    "--headless=new",
    "--disable-gpu",
    "--virtual-time-budget=4000",
    `--window-size=${t.width},${t.height}`,
    `--screenshot=${filePath}`,
    t.url,
  ]);
  const stats = fs.statSync(filePath);
  console.log(`Saved ${t.name} (${(stats.size / 1024).toFixed(1)} KB)`);
}

console.log("All after screenshots captured successfully.");
