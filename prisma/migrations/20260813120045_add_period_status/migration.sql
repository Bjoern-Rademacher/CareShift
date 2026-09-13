/*
  Warnings:

  - You are about to drop the column `published` on the `SchedulePeriod` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "PeriodStatus" AS ENUM ('DRAFT', 'VALIDATED', 'PUBLISHED');

-- AlterTable
ALTER TABLE "SchedulePeriod" DROP COLUMN "published",
ADD COLUMN     "status" "PeriodStatus" NOT NULL DEFAULT 'DRAFT';
