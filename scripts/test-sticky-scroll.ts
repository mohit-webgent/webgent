import { execFileSync } from "child_process";
import fs from "fs";
import path from "path";

const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const outDir = "screenshots/after";

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// 1. Regular viewports
const targets = [
  { width: 375, height: 1200, name: "pricing-375px.png" },
  { width: 768, height: 1200, name: "pricing-768px.png" },
  { width: 1280, height: 1000, name: "pricing-1280px.png" },
  { width: 1536, height: 1000, name: "pricing-1536px.png" },
];

for (const t of targets) {
  const filePath = path.resolve(outDir, t.name);
  console.log(`Capturing ${t.name} (${t.width}x${t.height})...`);
  execFileSync(chromePath, [
    "--headless=new",
    "--disable-gpu",
    "--virtual-time-budget=3500",
    `--window-size=${t.width},${t.height}`,
    `--screenshot=${filePath}`,
    "http://localhost:3000/pricing",
  ]);
  const stats = fs.statSync(filePath);
  console.log(`Saved ${t.name} (${(stats.size / 1024).toFixed(1)} KB)`);
}

console.log("All updated after screenshots captured successfully.");
