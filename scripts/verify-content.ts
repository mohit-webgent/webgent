async function main() {
  const urls = [
    { name: "Home", url: "http://localhost:3000" },
    { name: "Pricing", url: "http://localhost:3000/pricing" },
    { name: "Testimonials", url: "http://localhost:3000/testimonials", expectRedirect: true },
    { name: "Work", url: "http://localhost:3000/work" },
    { name: "Blog", url: "http://localhost:3000/blog" },
  ];

  for (const item of urls) {
    try {
      const res = await fetch(item.url, { redirect: "manual" });
      console.log(`[HTTP ${res.status}] ${item.name} (${item.url})`);
      if (res.status === 307 || res.status === 302 || res.status === 308) {
        console.log(`   -> Redirect location: ${res.headers.get("location")}`);
      } else if (res.status === 200) {
        const text = await res.text();
        // Check for placeholder names that shouldn't appear
        const forbiddenNames = ["Alex Vance", "Marcus Sterling", "Elena Rostova", "Olivia Rhye", "Phoenix Baker", "HIPAA-compliant", "Zero hidden charges"];
        const foundForbidden = forbiddenNames.filter((fn) => text.includes(fn));
        if (foundForbidden.length > 0) {
          console.error(`   ⚠️ Found forbidden/placeholder copy: ${foundForbidden.join(", ")}`);
          for (const fn of foundForbidden) {
            const idx = text.indexOf(fn);
            console.log(`      Snippet for "${fn}":`, text.slice(Math.max(0, idx - 100), idx + fn.length + 100));
          }
        } else {
          console.log(`   ✅ Zero placeholder content detected`);
        }

        // Check for specific required content on pages
        if (item.name === "Pricing") {
          console.log(`   Launch Pricing badge present: ${text.includes("Launch Pricing")}`);
          console.log(`   Terms of Engagement present: ${text.includes("Terms of Engagement")}`);
          console.log(`   100% Source Code Ownership badge present: ${text.includes("100% Source Code Ownership")}`);
          console.log(`   Disabled badges absent (Escrow/SLA): ${!text.includes("Milestone Escrow") && !text.includes("Guaranteed SLA")}`);
        }
        if (item.name === "Work") {
          console.log(`   Live Client Work present: ${text.includes("Live Client Work")}`);
          console.log(`   Concept Project present: ${text.includes("Concept Project")}`);
        }
      }
    } catch (err: any) {
      console.error(`[FAIL] ${item.name}: ${err.message}`);
    }
  }
}

main().catch(console.error);
