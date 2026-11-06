-- These tables were added to schema.prisma without a migration, so fresh databases never received them.
-- Every statement is safe to re-run, because databases updated with `prisma db push` already have them.

-- CreateTable
CREATE TABLE IF NOT EXISTS "media" (
    "id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "bucket" TEXT NOT NULL DEFAULT 'webgent-media',
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "altText" TEXT,
    "folder" TEXT NOT NULL DEFAULT 'general',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "services" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "shortDescription" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT DEFAULT 'Layers',
    "coverImage" TEXT,
    "startingPrice" INTEGER,
    "priceLabel" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "showOnHome" BOOLEAN NOT NULL DEFAULT true,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "ogImage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "features" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT DEFAULT 'Check',
    "category" TEXT DEFAULT 'General',
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "showOnPublic" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "features_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "service_features" (
    "serviceId" TEXT NOT NULL,
    "featureId" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "service_features_pkey" PRIMARY KEY ("serviceId","featureId")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "media_storageKey_key" ON "media"("storageKey");
CREATE INDEX IF NOT EXISTS "media_storageKey_idx" ON "media"("storageKey");
CREATE INDEX IF NOT EXISTS "media_folder_idx" ON "media"("folder");
CREATE INDEX IF NOT EXISTS "media_createdAt_idx" ON "media"("createdAt");
CREATE UNIQUE INDEX IF NOT EXISTS "services_slug_key" ON "services"("slug");
CREATE INDEX IF NOT EXISTS "services_slug_idx" ON "services"("slug");
CREATE INDEX IF NOT EXISTS "services_published_idx" ON "services"("published");
CREATE INDEX IF NOT EXISTS "services_displayOrder_idx" ON "services"("displayOrder");
CREATE INDEX IF NOT EXISTS "services_showOnHome_idx" ON "services"("showOnHome");
CREATE INDEX IF NOT EXISTS "services_featured_idx" ON "services"("featured");
CREATE INDEX IF NOT EXISTS "features_enabled_idx" ON "features"("enabled");
CREATE INDEX IF NOT EXISTS "features_displayOrder_idx" ON "features"("displayOrder");
CREATE INDEX IF NOT EXISTS "features_category_idx" ON "features"("category");
CREATE INDEX IF NOT EXISTS "features_showOnPublic_idx" ON "features"("showOnPublic");
CREATE INDEX IF NOT EXISTS "service_features_serviceId_idx" ON "service_features"("serviceId");
CREATE INDEX IF NOT EXISTS "service_features_featureId_idx" ON "service_features"("featureId");

-- AddForeignKey
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'service_features_serviceId_fkey') THEN
    ALTER TABLE "service_features" ADD CONSTRAINT "service_features_serviceId_fkey"
      FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'service_features_featureId_fkey') THEN
    ALTER TABLE "service_features" ADD CONSTRAINT "service_features_featureId_fkey"
      FOREIGN KEY ("featureId") REFERENCES "features"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
