/*
  Warnings:

  - The values [MONDAY,TUESDAY,WEDNESDAY,THURSDAY,FRIDAY,SATURDAY,SUNDAY] on the enum `Weekday` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Weekday_new" AS ENUM ('MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN');
ALTER TABLE "TemplateRule" ALTER COLUMN "weekdays" TYPE "Weekday_new"[] USING ("weekdays"::text::"Weekday_new"[]);
ALTER TYPE "Weekday" RENAME TO "Weekday_old";
ALTER TYPE "Weekday_new" RENAME TO "Weekday";
DROP TYPE "public"."Weekday_old";
COMMIT;
