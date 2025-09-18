-- DropForeignKey
ALTER TABLE "Report" DROP CONSTRAINT "Report_reporterId_fkey";

-- DropForeignKey
ALTER TABLE "Report" DROP CONSTRAINT "Report_reportedUserId_fkey";

-- DropTable
DROP TABLE "Report";

-- DropEnum
DROP TYPE "ReportType";

-- DropEnum
DROP TYPE "ReportReason";

