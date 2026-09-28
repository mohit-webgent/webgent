-- AlterEnum
ALTER TYPE "LeadStatus" RENAME TO "LeadStatus_old";
CREATE TYPE "LeadStatus" AS ENUM ('NEW', 'CONTACTED', 'PROPOSAL_SENT', 'WON', 'LOST', 'ON_HOLD');
ALTER TABLE "leads" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "leads" ALTER COLUMN "status" TYPE "LeadStatus" USING ("status"::text::"LeadStatus");
ALTER TABLE "leads" ALTER COLUMN "status" SET DEFAULT 'NEW';
DROP TYPE "LeadStatus_old";

-- AlterTable
ALTER TABLE "leads" ADD COLUMN "score" INTEGER NOT NULL DEFAULT 0,
                    ADD COLUMN "followUpDate" TIMESTAMP(3),
                    ADD COLUMN "ipAddress" TEXT,
                    ADD COLUMN "userAgent" TEXT;

-- CreateIndex
CREATE INDEX "leads_score_idx" ON "leads"("score");
