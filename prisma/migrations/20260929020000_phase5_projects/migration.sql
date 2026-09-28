-- AlterTable
ALTER TABLE "projects" ADD COLUMN "screenshots" TEXT,
                        ADD COLUMN "published" BOOLEAN NOT NULL DEFAULT true,
                        ADD COLUMN "order" INTEGER NOT NULL DEFAULT 0,
                        ADD COLUMN "seoTitle" TEXT,
                        ADD COLUMN "seoDescription" TEXT;

-- CreateIndex
CREATE INDEX "projects_published_idx" ON "projects"("published");
CREATE INDEX "projects_order_idx" ON "projects"("order");
