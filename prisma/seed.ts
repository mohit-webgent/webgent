import { PrismaClient, UserRole, UserStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting development seed...");

  const adminEmail = process.env.SEED_ADMIN_EMAIL || "admin@webgent.com";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || "ChangeMeInProduction123!";

  // Check if admin user already exists
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash(adminPassword, 10);
    const admin = await prisma.user.create({
      data: {
        email: adminEmail,
        name: "System Admin",
        passwordHash,
        role: UserRole.ADMIN,
        status: UserStatus.ACTIVE,
      },
    });

    console.log(`✅ Created minimal dev admin user: ${admin.email}`);
  } else {
    console.log(`ℹ️ Admin user (${adminEmail}) already exists. Skipping creation.`);
  }

  // Seed default public site settings if missing
  const defaultSettings = [
    { key: "site_name", value: "Webgent", description: "Official Site Name", isPublic: true },
    { key: "site_tagline", value: "Next-Gen Web Solutions & Engineering", description: "Hero Tagline", isPublic: true },
    { key: "contact_email", value: "hello@webgent.com", description: "Primary Contact Email", isPublic: true },
  ];

  for (const setting of defaultSettings) {
    await prisma.siteSetting.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    });
  }

  console.log("✅ Seed completed successfully.");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
