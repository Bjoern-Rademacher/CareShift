-- CreateTable
CREATE TABLE "TemplateRule" (
    "id" TEXT NOT NULL,
    "department" "Department" NOT NULL,
    "position" "Position" NOT NULL,
    "weekday" INTEGER NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "count" INTEGER NOT NULL,

    CONSTRAINT "TemplateRule_pkey" PRIMARY KEY ("id")
);
