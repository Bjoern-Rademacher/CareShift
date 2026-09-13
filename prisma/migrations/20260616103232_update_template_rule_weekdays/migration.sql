/*
  Warnings:

  - You are about to drop the column `count` on the `TemplateRule` table. All the data in the column will be lost.
  - You are about to drop the column `endTime` on the `TemplateRule` table. All the data in the column will be lost.
  - You are about to drop the column `startTime` on the `TemplateRule` table. All the data in the column will be lost.
  - You are about to drop the column `weekday` on the `TemplateRule` table. All the data in the column will be lost.
  - Added the required column `endTimeLocal` to the `TemplateRule` table without a default value. This is not possible if the table is not empty.
  - Added the required column `slots` to the `TemplateRule` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startTimeLocal` to the `TemplateRule` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Weekday" AS ENUM ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY');

-- AlterTable
ALTER TABLE "TemplateRule" DROP COLUMN "count",
DROP COLUMN "endTime",
DROP COLUMN "startTime",
DROP COLUMN "weekday",
ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "endTimeLocal" TEXT NOT NULL,
ADD COLUMN     "slots" INTEGER NOT NULL,
ADD COLUMN     "startTimeLocal" TEXT NOT NULL,
ADD COLUMN     "weekdays" "Weekday"[];
