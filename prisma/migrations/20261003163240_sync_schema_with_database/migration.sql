/*
  Warnings:

  - A unique constraint covering the columns `[confirmationToken]` on the table `subscribers` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[unsubscribeToken]` on the table `subscribers` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "TestimonialStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "SubscriberStatus" AS ENUM ('PENDING', 'ACTIVE', 'UNSUBSCRIBED');

-- AlterTable
ALTER TABLE "blog_posts" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "ogImage" TEXT,
ADD COLUMN     "readTime" INTEGER DEFAULT 1,
ADD COLUMN     "seoDescription" TEXT,
ADD COLUMN     "seoTitle" TEXT;

-- AlterTable
ALTER TABLE "events" ADD COLUMN     "country" TEXT,
ADD COLUMN     "device" TEXT,
ADD COLUMN     "path" TEXT;

-- AlterTable
ALTER TABLE "page_views" ADD COLUMN     "sessionId" TEXT;

-- AlterTable
ALTER TABLE "subscribers" ADD COLUMN     "confirmationToken" TEXT,
ADD COLUMN     "status" "SubscriberStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "tokenExpiresAt" TIMESTAMP(3),
ADD COLUMN     "unsubscribeToken" TEXT,
ALTER COLUMN "isActive" SET DEFAULT false,
ALTER COLUMN "subscribedAt" DROP NOT NULL,
ALTER COLUMN "subscribedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "testimonials" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "status" "TestimonialStatus" NOT NULL DEFAULT 'APPROVED';

-- CreateIndex
CREATE INDEX "blog_posts_deletedAt_idx" ON "blog_posts"("deletedAt");

-- CreateIndex
CREATE INDEX "events_path_idx" ON "events"("path");

-- CreateIndex
CREATE INDEX "events_sessionId_idx" ON "events"("sessionId");

-- CreateIndex
CREATE INDEX "page_views_sessionId_idx" ON "page_views"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "subscribers_confirmationToken_key" ON "subscribers"("confirmationToken");

-- CreateIndex
CREATE UNIQUE INDEX "subscribers_unsubscribeToken_key" ON "subscribers"("unsubscribeToken");

-- CreateIndex
CREATE INDEX "subscribers_status_idx" ON "subscribers"("status");

-- CreateIndex
CREATE INDEX "subscribers_confirmationToken_idx" ON "subscribers"("confirmationToken");

-- CreateIndex
CREATE INDEX "subscribers_unsubscribeToken_idx" ON "subscribers"("unsubscribeToken");

-- CreateIndex
CREATE INDEX "subscribers_createdAt_idx" ON "subscribers"("createdAt");

-- CreateIndex
CREATE INDEX "testimonials_status_idx" ON "testimonials"("status");

-- CreateIndex
CREATE INDEX "testimonials_deletedAt_idx" ON "testimonials"("deletedAt");
