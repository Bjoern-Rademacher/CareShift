/*
  Warnings:

  - You are about to drop the column `department` on the `Employee` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Employee" DROP COLUMN "department",
ADD COLUMN     "departments" "Department"[];
