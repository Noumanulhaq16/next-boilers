-- CreateEnum
CREATE TYPE "ReportType" AS ENUM ('GENERAL', 'USER');

-- CreateEnum
CREATE TYPE "ReportReason" AS ENUM ('SCAM', 'OTHER');

-- CreateTable
CREATE TABLE "Report" (
    "id" SERIAL NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "reporterId" INTEGER NOT NULL,
    "reportedUserId" INTEGER,
    "type" "ReportType" NOT NULL DEFAULT 'GENERAL',
    "reason" "ReportReason" NOT NULL DEFAULT 'OTHER',
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMPTZ,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_reportedUserId_fkey" FOREIGN KEY ("reportedUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
