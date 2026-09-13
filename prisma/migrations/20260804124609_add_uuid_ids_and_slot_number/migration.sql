/*
  Warnings:

  - The primary key for the `Employee` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `SchedulePeriod` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `ShiftSlot` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `employeeId` column on the `ShiftSlot` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `TemplateRule` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[department,startDate]` on the table `SchedulePeriod` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `id` on the `Employee` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `SchedulePeriod` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `slotNumber` to the `ShiftSlot` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `id` on the `ShiftSlot` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `periodId` on the `ShiftSlot` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `id` on the `TemplateRule` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "ShiftSlot" DROP CONSTRAINT "ShiftSlot_employeeId_fkey";

-- DropForeignKey
ALTER TABLE "ShiftSlot" DROP CONSTRAINT "ShiftSlot_periodId_fkey";

-- AlterTable
ALTER TABLE "Employee" DROP CONSTRAINT "Employee_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
ADD CONSTRAINT "Employee_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "SchedulePeriod" DROP CONSTRAINT "SchedulePeriod_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
ADD CONSTRAINT "SchedulePeriod_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "ShiftSlot" DROP CONSTRAINT "ShiftSlot_pkey",
ADD COLUMN     "slotNumber" INTEGER NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
DROP COLUMN "periodId",
ADD COLUMN     "periodId" UUID NOT NULL,
DROP COLUMN "employeeId",
ADD COLUMN     "employeeId" UUID,
ADD CONSTRAINT "ShiftSlot_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "TemplateRule" DROP CONSTRAINT "TemplateRule_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
ADD CONSTRAINT "TemplateRule_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE UNIQUE INDEX "SchedulePeriod_department_startDate_key" ON "SchedulePeriod"("department", "startDate");

-- CreateIndex
CREATE INDEX "ShiftSlot_periodId_idx" ON "ShiftSlot"("periodId");

-- CreateIndex
CREATE INDEX "ShiftSlot_employeeId_idx" ON "ShiftSlot"("employeeId");

-- CreateIndex
CREATE INDEX "ShiftSlot_startTime_idx" ON "ShiftSlot"("startTime");

-- AddForeignKey
ALTER TABLE "ShiftSlot" ADD CONSTRAINT "ShiftSlot_periodId_fkey" FOREIGN KEY ("periodId") REFERENCES "SchedulePeriod"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShiftSlot" ADD CONSTRAINT "ShiftSlot_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;
